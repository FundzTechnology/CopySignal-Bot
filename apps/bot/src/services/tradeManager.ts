import { db } from '../db/cocobase.js';
import { ManagementAction } from '../parser/managementParser.js';

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
