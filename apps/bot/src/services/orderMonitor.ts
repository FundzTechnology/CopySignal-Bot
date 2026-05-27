import { RestClientV5 } from 'bybit-api';
import { decrypt } from '../utils/crypto.js';
import { notify } from './notificationService.js';
import { db } from '../db/cocobase.js';
import type { ApiKeyDoc } from '../executors/bybitExecutor.js';

export interface MonitorParams {
  userId: string;
  symbol: string;
  orderId: string;
  exchange: string;
  side: string;
  entryPrice: number;
  qty: number;
  takeProfit?: number;
  stopLoss?: number;
  apiKeyDoc: ApiKeyDoc;
  isMarketOrder?: boolean; // If true, skip Phase 1 (order is already filled at market price)
  channelName?: string;    // For richer Telegram notifications
  firstTarget?: number;    // Used to move SL to Entry when crossed
}

/**
 * Creates a Bybit RestClientV5 from an API key doc.
 * Centralised so both helper functions share the same config.
 */
function buildBybitClient(apiKeyDoc: ApiKeyDoc): RestClientV5 {
  const opts: any = {
    key: decrypt(apiKeyDoc.api_key),
    secret: decrypt(apiKeyDoc.api_secret),
    testnet: apiKeyDoc.testnet && !apiKeyDoc.demo_mode,
    syncTime: true,
  };
  if (apiKeyDoc.demo_mode) {
    opts.baseUrl = 'https://api-demo.bybit.com';
  }
  return new RestClientV5(opts);
}

/**
 * Phase 1 — wait for a LIMIT order to actually be filled on Bybit.
 * Returns true once filled, false if cancelled/rejected/timed-out.
 *
 * Strategy: Check order history FIRST (before sleeping), because a fast-moving
 * market may fill the order before the first poll. Then sleep and poll every 10s.
 * Max wait: 8 hours (a signal that never fills is abandoned).
 */
async function waitForOrderFill(
  client: RestClientV5,
  symbol: string,
  orderId: string,
): Promise<boolean> {
  const MAX_WAIT_MS = 8 * 60 * 60 * 1000;  // 8 hours
  const POLL_MS     = 10_000;               // 10 seconds
  const startTime   = Date.now();

  console.log(`[OrderMonitor] ⏳ Waiting for order ${orderId} (${symbol}) to fill...`);

  while (Date.now() - startTime < MAX_WAIT_MS) {
    try {
      // ── Check order history FIRST (handles already-filled orders without delay) ──
      const histRes = await client.getHistoricOrders({
        category: 'linear',
        symbol,
        orderId,
      }).catch(() => null);

      const histOrder = histRes?.result?.list?.[0];
      if (histOrder) {
        const orderStatus = histOrder.orderStatus;
        console.log(`[OrderMonitor] 📋 Historical order ${orderId} status: ${orderStatus}`);

        if (orderStatus === 'Filled') return true;
        if (['Cancelled', 'Rejected', 'Deactivated'].includes(orderStatus)) {
          console.log(`[OrderMonitor] ❌ Order ${orderId} was ${orderStatus} — abandoning monitor.`);
          return false;
        }
      }

      // ── If not in history yet, check active orders ──
      const openRes = await client.getActiveOrders({
        category: 'linear',
        symbol,
        orderId,
      }).catch(() => null);

      const openOrder = openRes?.result?.list?.[0];
      if (openOrder) {
        const orderStatus = openOrder.orderStatus;
        console.log(`[OrderMonitor] 📋 Active order ${orderId} status: ${orderStatus}`);

        if (orderStatus === 'Filled') return true;
        if (['Cancelled', 'Rejected', 'Deactivated'].includes(orderStatus)) {
          console.log(`[OrderMonitor] ❌ Order ${orderId} was ${orderStatus} — abandoning monitor.`);
          return false;
        }
        // PartiallyFilled or New/Untriggered: keep waiting
      }
    } catch (err: any) {
      console.warn(`[OrderMonitor] Poll error waiting for fill on ${symbol}:`, err.message || err);
    }

    // Sleep between polls
    await sleep(POLL_MS);
  }

  console.log(`[OrderMonitor] ⏰ Timed out waiting for ${orderId} to fill after 8h — giving up.`);
  return false;
}

/**
 * Phase 2 — monitor an OPEN position for TP / SL closure.
 * Only called after Phase 1 confirms the order is filled (or skipped for market orders).
 *
 * Strategy:
 *   - Wait a minimum of 30 seconds before first position check.
 *     Bybit's backend takes a moment to propagate a newly-filled position,
 *     and polling too fast causes a false "size=0 → closed" detection.
 *   - Poll getPositionInfo every 15s, filtering by side for accuracy.
 *   - When posSize drops to 0, the position was closed.
 *   - Fetch closed-PnL, filter entries from AFTER monitorStartTime to avoid
 *     matching a previous trade's PnL record.
 *   - Update DB + send Telegram notification.
 *
 * Auto-stops after 72 hours of no closure.
 */
async function monitorOpenPosition(
  client: RestClientV5,
  params: MonitorParams,
): Promise<void> {
  const { userId, symbol, orderId, side, takeProfit, stopLoss, entryPrice, qty, channelName, firstTarget } = params;
  const MAX_DURATION_MS     = 72 * 60 * 60 * 1000;  // 72 hours
  const MIN_INITIAL_WAIT_MS = 30_000;                // 30 seconds — let Bybit propagate position
  const POLL_MS             = 15_000;                // 15 seconds between polls
  const monitorStartTime    = Date.now();

  console.log(`[OrderMonitor] 🔍 Position monitor started for ${symbol} (order: ${orderId}, side: ${side})`);
  console.log(`[OrderMonitor] ⏳ Waiting ${MIN_INITIAL_WAIT_MS / 1000}s for position to propagate on Bybit...`);

  // Mandatory initial wait — prevents false "already closed" detection
  await sleep(MIN_INITIAL_WAIT_MS);

  // Determine positionIdx: Bybit one-way mode uses 0. 
  // Buy = Long (index 1 in hedge mode, 0 in one-way). We use 0 for one-way (default).
  // We still filter by side string just in case list has multiple entries.
  const sideLower = side.toLowerCase();
  
  let slMovedToEntry = false;

  while (Date.now() - monitorStartTime < MAX_DURATION_MS) {
    try {
      // ── Check if position is still open ──
      const posRes = await client.getPositionInfo({
        category: 'linear',
        symbol,
      }).catch(() => null);

      const positions = posRes?.result?.list || [];

      // Find our position by side (handles both one-way and hedge mode)
      let position = positions.find((p: any) => {
        const pSide = (p.side || '').toLowerCase();
        // In one-way mode, Bybit returns 'Buy' for Long and 'Sell' for Short
        if (sideLower === 'buy' || sideLower === 'long') return pSide === 'buy';
        if (sideLower === 'sell' || sideLower === 'short') return pSide === 'sell';
        return false;
      });

      // Fallback: if no side match, take the first entry (one-way mode)
      if (!position && positions.length > 0) {
        position = positions[0];
      }

      const posSize = parseFloat(position?.size || '0');
      const unrealisedPnl = parseFloat(position?.unrealisedPnl || '0');

      if (posSize > 0) {
        // Position still open — log and continue
        console.log(`[OrderMonitor] 📊 ${symbol} ${side} position open — size: ${posSize}, unrealised PnL: ${unrealisedPnl}`);

        // Break-even logic: If current price crossed firstTarget, move SL to entry
        if (firstTarget && !slMovedToEntry) {
          const tickerRes = await client.getTickers({ category: 'linear', symbol }).catch(() => null);
          const currentPrice = parseFloat(tickerRes?.result?.list?.[0]?.lastPrice || '0');
          if (currentPrice > 0) {
            const crossed = sideLower === 'buy' || sideLower === 'long'
              ? currentPrice >= firstTarget
              : currentPrice <= firstTarget;
            
            if (crossed) {
              console.log(`[OrderMonitor] 🎯 ${symbol} crossed Target 1 (${firstTarget}). Moving SL to Entry (${entryPrice}).`);
              await client.setTradingStop({
                category: 'linear',
                symbol,
                stopLoss: String(entryPrice),
                slTriggerBy: 'LastPrice',
                positionIdx: 0,
              }).catch(err => {
                console.warn(`[OrderMonitor] Failed to move SL for ${symbol}:`, err.message || err);
              });
              slMovedToEntry = true;
            }
          }
        }

        await sleep(POLL_MS);
        continue;
      }

      // posSize === 0 → position closed
      console.log(`[OrderMonitor] ✅ ${symbol} position closed — fetching P&L...`);

      // ── Fetch closed PnL history ──
      // IMPORTANT: Filter by time — only look at entries from AFTER monitorStartTime
      // to avoid matching a previous (unrelated) trade's PnL record.
      const monitorStartSec = Math.floor(monitorStartTime / 1000);

      const pnlRes = await client.getClosedPnL({
        category: 'linear',
        symbol,
        limit: 20,
        // startTime is in milliseconds for Bybit API
        startTime: monitorStartTime,
      }).catch(() => null);

      const closedList = pnlRes?.result?.list || [];

      console.log(`[OrderMonitor] 📋 Found ${closedList.length} closed PnL entries since monitor start.`);

      // Try to match by orderId (entry order) or closeOrderId (TP/SL close order)
      let matchedClose = closedList.find((entry: any) =>
        entry.orderId === orderId || entry.closeOrderId === orderId
      );

      // Fallback: use the most recent entry in our filtered time window
      if (!matchedClose && closedList.length > 0) {
        matchedClose = closedList[0]; // closedList is sorted newest-first
        console.log(`[OrderMonitor] ⚠️ orderId not matched — using most recent entry in time window.`);
        console.log(`[OrderMonitor]    Entry time: ${matchedClose.createdTime || matchedClose.updatedTime}`);
      }

      // If absolutely no PnL data found (edge case), still update DB as 'closed'
      if (!matchedClose) {
        console.log(`[OrderMonitor] ⚠️ No closed PnL data found — marking as 'closed' with P&L=$0`);
      }

      const pnl = matchedClose ? parseFloat(matchedClose.closedPnl || '0') : 0;
      const execType = matchedClose ? matchedClose.execType : 'Unknown';

      console.log(`[OrderMonitor] 💰 Closed PnL for ${symbol}: ${pnl} (matched: ${!!matchedClose}, execType: ${execType})`);

      // ── Determine outcome ──
      let outcome: 'tp_hit' | 'sl_hit' | 'closed' | 'manual_close';
      if (execType === 'TakeProfit' || execType === 'PartialTakeProfit') {
        outcome = 'tp_hit';
      } else if (execType === 'StopLoss') {
        // If slMovedToEntry is true, this is a break-even hit (will be recorded as closed/sl_hit with ~0 PNL).
        outcome = slMovedToEntry && Math.abs(pnl) < Math.abs(entryPrice * qty * 0.005) ? 'closed' : 'sl_hit';
      } else if (execType === 'Trade') {
        outcome = 'manual_close';
      } else {
        // Fallback to PNL based detection
        if (pnl > 0) {
          outcome = 'tp_hit';
        } else if (pnl < 0) {
          outcome = 'sl_hit';
        } else {
          outcome = 'closed';
        }
      }

      console.log(`[OrderMonitor] 🏁 Outcome: ${outcome}, PnL: ${pnl}`);

      // ── Update DB trade log ──
      await updateTradeLog(orderId, outcome === 'manual_close' ? 'closed' : outcome, pnl);

      // ── Send Telegram alert ──
      await sendClosedNotification({
        userId,
        symbol,
        side,
        entryPrice,
        qty,
        outcome,
        pnl,
        takeProfit,
        stopLoss,
        channelName,
      });

      return; // Done monitoring this trade
    } catch (err: any) {
      console.warn(`[OrderMonitor] Poll error for ${symbol}:`, err.message || err);
      await sleep(POLL_MS);
    }
  }

  console.log(`[OrderMonitor] ⏰ Position monitor for ${symbol} timed out after 72h — stopping.`);
}

/**
 * Finds the trade log document matching the given orderId and updates its status + pnl.
 */
async function updateTradeLog(
  orderId: string,
  outcome: 'tp_hit' | 'sl_hit' | 'closed',
  pnl: number,
): Promise<void> {
  try {
    // Fetch ALL trade logs and filter by orderId (handles Cocobase .data nesting)
    const allTrades = await db.listDocuments('trade_logs', {}) as any[];
    const tradeDoc = allTrades.find((t: any) => {
      const d = t.data || t;
      return (d.order_id || t.order_id) === orderId;
    });

    if (!tradeDoc) {
      console.warn(`[OrderMonitor] ⚠️ No trade_log found for orderId ${orderId}`);
      return;
    }

    const tradeId = tradeDoc.id || tradeDoc._id;
    await db.updateDocument('trade_logs', tradeId, {
      status: outcome,
      pnl: pnl,
      closed_at: new Date().toISOString(),
    });
    console.log(`[OrderMonitor] 📝 Trade log ${tradeId} → ${outcome}, pnl: ${pnl}`);
  } catch (dbErr: any) {
    console.error(`[OrderMonitor] Failed to update trade log for orderId ${orderId}:`, dbErr.message || dbErr);
  }
}

interface ClosedNotificationParams {
  userId: string;
  symbol: string;
  side: string;
  entryPrice: number;
  qty: number;
  outcome: 'tp_hit' | 'sl_hit' | 'closed' | 'manual_close';
  pnl: number;
  takeProfit?: number;
  stopLoss?: number;
  channelName?: string;
}

/**
 * Sends the appropriate Telegram notification for a closed trade.
 */
async function sendClosedNotification(params: ClosedNotificationParams): Promise<void> {
  const { userId, symbol, side, entryPrice, qty, outcome, pnl, takeProfit, stopLoss, channelName } = params;

  try {
    if (outcome === 'tp_hit') {
      await notify({
        type: 'TP_HIT',
        userId,
        payload: {
          symbol,
          side,
          entryPrice,
          qty,
          tpLevel: 1,
          pnl,
          channelName,
        },
      });
    } else if (outcome === 'sl_hit') {
      await notify({
        type: 'SL_HIT',
        userId,
        payload: {
          symbol,
          side,
          entryPrice,
          qty,
          loss: pnl,
          stopLoss,
          channelName,
        },
      });
    } else if (outcome === 'manual_close') {
      await notify({
        type: 'MANUAL_CLOSE',
        userId,
        payload: {
          symbol,
          side,
          entryPrice,
          qty,
          pnl,
          channelName,
        },
      });
    } else {
      // Break-even
      await notify({
        type: 'TRADE_CLOSED',
        userId,
        payload: {
          symbol,
          side,
          entryPrice,
          qty,
          pnl,
          channelName,
        },
      });
    }
  } catch (notifyErr: any) {
    console.error(`[OrderMonitor] Failed to send ${outcome} notification:`, notifyErr.message || notifyErr);
  }
}

/** Simple sleep helper */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * PUBLIC ENTRY POINT
 *
 * Starts monitoring for a new trade. Two phases:
 *   Phase 1: Wait for the order to be filled (LIMIT orders only — skipped for market orders)
 *   Phase 2: Monitor the open position for TP / SL closure (30s initial delay to let position propagate)
 *
 * Runs entirely in the background — does not block the orchestrator.
 */
export function startOrderMonitor(params: MonitorParams): void {
  const { symbol, orderId, exchange, isMarketOrder } = params;

  // Only Bybit is supported for now
  if (exchange !== 'bybit') {
    console.log(`[OrderMonitor] Exchange "${exchange}" monitoring not yet implemented. Skipping.`);
    return;
  }

  // Run in background — deliberately not awaited
  (async () => {
    try {
      const client = buildBybitClient(params.apiKeyDoc);

      if (isMarketOrder) {
        // Market orders are filled instantly — skip Phase 1 entirely
        console.log(`[OrderMonitor] ⚡ Market order ${orderId} — skipping Phase 1 (order already filled), starting position monitor.`);
      } else {
        // Phase 1: Wait for the LIMIT order to be filled
        const filled = await waitForOrderFill(client, symbol, orderId);
        if (!filled) {
          console.log(`[OrderMonitor] Order ${orderId} never filled — monitor stopping.`);
          // Update DB to cancelled status
          await updateTradeLog(orderId, 'closed', 0);
          return;
        }

        console.log(`[OrderMonitor] ✅ Order ${orderId} confirmed FILLED — starting position monitor.`);
      }

      // Phase 2: Monitor the open position for closure
      await monitorOpenPosition(client, params);
    } catch (err: any) {
      console.error(`[OrderMonitor] Fatal error in background monitor for ${symbol}:`, err.message || err);
    }
  })();
}
