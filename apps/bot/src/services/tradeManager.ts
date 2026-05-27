import { db } from '../db/cocobase.js';
import { ManagementAction } from '../parser/managementParser.js';
import { closePositionBybit } from '../executors/bybitExecutor.js';
import { closePositionBinance } from '../executors/binanceExecutor.js';
import { notify } from './notificationService.js';

export async function executeManagementAction(
  userId: string,
  symbol: string | null,
  action: ManagementAction,
  channelDoc: any
) {
  if (!symbol || !action) return;

  // Find active trades for this symbol and user
  const activeTrades = await db.listDocuments("trade_logs", {
    filters: {
      user_id: userId,
      symbol: symbol,
      status: 'filled' // Only manage open trades
    }
  });

  if (activeTrades.length === 0) {
    console.log(`No active trades found for ${symbol} to manage.`);
    return;
  }

  for (const trade of activeTrades) {
    const tradeDoc = trade as any;

    try {
      switch (action.type) {
        case 'CLOSE_NOW':
          // Mocking exchange API call for now
          console.log(`[EXCHANGE] Closing trade ${tradeDoc.id} at Market Price`);
          await db.updateDocument("trade_logs", tradeDoc.id, {
            status: 'closed',
            closed_at: new Date().toISOString()
          });
          break;

        case 'SET_BREAKEVEN':
          console.log(`[EXCHANGE] Moving SL for ${tradeDoc.id} to entry price ${tradeDoc.entry_price}`);
          await db.updateDocument("trade_logs", tradeDoc.id, {
            stop_loss: tradeDoc.entry_price
          });
          break;

        case 'HOLD_TO_TP':
          if (tradeDoc.all_tps && tradeDoc.all_tps[action.tpIndex]) {
            const newTp = tradeDoc.all_tps[action.tpIndex];
            console.log(`[EXCHANGE] Moving TP for ${tradeDoc.id} to ${newTp}`);
            await db.updateDocument("trade_logs", tradeDoc.id, {
              take_profit: newTp,
              active_tp_index: action.tpIndex
            });
          }
          break;

        case 'HOLD_AND_BREAKEVEN':
          if (tradeDoc.all_tps && tradeDoc.all_tps[action.tpIndex]) {
            const newTp = tradeDoc.all_tps[action.tpIndex];
            console.log(`[EXCHANGE] Moving TP to ${newTp} AND SL to ${tradeDoc.entry_price}`);
            await db.updateDocument("trade_logs", tradeDoc.id, {
              take_profit: newTp,
              stop_loss: tradeDoc.entry_price,
              active_tp_index: action.tpIndex
            });
          }
          break;

        case 'UPDATE_SL':
          console.log(`[EXCHANGE] Moving SL for ${tradeDoc.id} to ${action.newSL}`);
          await db.updateDocument("trade_logs", tradeDoc.id, {
            stop_loss: action.newSL
          });
          break;

        case 'UPDATE_TP':
          console.log(`[EXCHANGE] Moving TP for ${tradeDoc.id} to ${action.newTP}`);
          await db.updateDocument("trade_logs", tradeDoc.id, {
            take_profit: action.newTP
          });
          break;
      }
    } catch (err) {
      console.error(`Failed to execute management action on ${tradeDoc.id}:`, err);
    }
  }
}

export async function closeTradeByReply(userId: string, tradeDoc: any, channelDoc: any) {
  console.log(`[TradeManager] Executing reply-to-close for trade ${tradeDoc.id} (${tradeDoc.symbol})`);
  try {
    // 1. Fetch API Keys
    let apiKeyDoc: any = null;
    const apiKeys = await db.listDocuments("api_keys", {
      filters: { user_id: userId, exchange: channelDoc.exchange }
    }) as any[];
    if (apiKeys.length > 0) apiKeyDoc = apiKeys[0].data || apiKeys[0];
    
    if (!apiKeyDoc) {
      // Fallback: fetch all and filter in code
      const allKeys = await db.listDocuments("api_keys", {}) as any[];
      const found = allKeys.find((k: any) => {
        const d = k.data || k;
        return (d.user_id || k.user_id) === userId && (d.exchange || k.exchange) === channelDoc.exchange;
      });
      if (found) apiKeyDoc = found.data || found;
    }

    if (!apiKeyDoc) {
      console.log(`[TradeManager] No API key found for user ${userId} on ${channelDoc.exchange} to close trade.`);
      return;
    }

    // 2. Call Exchange
    if (channelDoc.exchange === 'bybit') {
      await closePositionBybit(apiKeyDoc, tradeDoc.symbol);
    } else {
      await closePositionBinance(apiKeyDoc, tradeDoc.symbol);
    }

    // 3. Mark in DB as manually closed
    await db.updateDocument("trade_logs", tradeDoc.id, {
      status: 'manual_close',
      closed_at: new Date().toISOString()
    });

    // 4. Notify user
    await notify({
      type: 'TRADE_CLOSED',
      userId,
      payload: {
        symbol: tradeDoc.symbol,
        side: tradeDoc.side,
        entryPrice: tradeDoc.entry_price,
        qty: tradeDoc.qty,
        pnl: 0, // Manual close, we don't have exact PnL immediately unless we fetch it
        channelName: channelDoc.name || 'Unknown Channel',
      }
    });
    console.log(`[TradeManager] Successfully closed trade ${tradeDoc.id} via reply command.`);
  } catch (err) {
    console.error(`[TradeManager] Failed to close trade via reply:`, err);
  }
}
