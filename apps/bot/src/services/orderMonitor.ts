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
}

/**
 * Starts a background polling loop for a filled order.
 * Polls Bybit every 15 seconds to check for TP/SL hits.
 * Auto-stops after 72 hours (max trade lifetime) or when closed.
 */
export function startOrderMonitor(params: MonitorParams): void {
  const { userId, symbol, orderId, exchange, side, entryPrice, qty, takeProfit, stopLoss, apiKeyDoc } = params;

  // Only supports Bybit for now
  if (exchange !== 'bybit') {
    console.log(`[OrderMonitor] Exchange "${exchange}" monitoring not yet implemented. Skipping.`);
    return;
  }

  const baseUrl = apiKeyDoc.demo_mode ? 'https://api-demo.bybit.com' : undefined;
  const client = new RestClientV5({
    key: decrypt(apiKeyDoc.api_key),
    secret: decrypt(apiKeyDoc.api_secret),
    testnet: apiKeyDoc.testnet && !apiKeyDoc.demo_mode,
    syncTime: true,
    ...(baseUrl ? { baseUrl } : {}),
  } as any);

  const POLL_INTERVAL_MS = 15_000;   // 15 seconds
  const MAX_DURATION_MS = 72 * 60 * 60 * 1000; // 72 hours
  const startTime = Date.now();

  console.log(`[OrderMonitor] 🔍 Watching ${symbol} order ${orderId} for TP/SL hits...`);

  const intervalId = setInterval(async () => {
    // Safety timeout — stop polling after 72 hours
    if (Date.now() - startTime > MAX_DURATION_MS) {
      console.log(`[OrderMonitor] ⏰ ${symbol} monitor timed out after 72h — stopping.`);
      clearInterval(intervalId);
      return;
    }

    try {
      // Query open positions for this symbol
      const posRes = await client.getPositionInfo({ category: 'linear', symbol }).catch(() => null);
      const position = posRes?.result?.list?.[0];
      const posSize = parseFloat(position?.size || '0');

      // If position is gone, the trade is closed (TP or SL hit)
      if (posSize === 0) {
        clearInterval(intervalId);
        console.log(`[OrderMonitor] ✅ ${symbol} position closed — determining outcome...`);

        // Look at recent closed PnL
        const pnlRes = await client.getClosedPnL({ category: 'linear', symbol, limit: 5 }).catch(() => null);
        const lastClose = pnlRes?.result?.list?.[0];
        const pnl = parseFloat(lastClose?.closedPnl || '0');

        // Update the trade log in the database
        try {
          const allTrades = await db.listDocuments('trade_logs', {}) as any[];
          const tradeDoc = allTrades.find((t: any) => {
            const d = t.data || t;
            return (d.order_id || t.order_id) === orderId;
          });

          if (tradeDoc) {
            const tradeId = tradeDoc.id || tradeDoc._id;
            const outcome = pnl >= 0 ? 'tp_hit' : 'sl_hit';
            await db.updateDocument('trade_logs', tradeId, {
              status: outcome,
              pnl: pnl,
              closed_at: new Date().toISOString(),
            });
            console.log(`[OrderMonitor] 📝 Updated trade ${tradeId} → status: ${outcome}, pnl: ${pnl}`);
          }
        } catch (dbErr) {
          console.error(`[OrderMonitor] Failed to update trade log:`, dbErr);
        }

        // Send Telegram notification
        if (pnl >= 0) {
          await notify({
            type: 'TP_HIT',
            userId,
            payload: { symbol, tpLevel: 1, pnl },
          });
        } else {
          await notify({
            type: 'SL_HIT',
            userId,
            payload: { symbol, loss: pnl },
          });
        }
      }
    } catch (err: any) {
      // Don't crash the monitor on transient errors, just log and continue
      console.warn(`[OrderMonitor] Poll error for ${symbol}:`, err.message || err);
    }
  }, POLL_INTERVAL_MS);
}
