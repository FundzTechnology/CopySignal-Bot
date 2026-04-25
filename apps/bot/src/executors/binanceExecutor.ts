import BinancePkg from 'binance-api-node';
const Binance = BinancePkg.default || BinancePkg;
import { decrypt } from '../utils/crypto.js';
import { calculatePositionSize, isSafeToTrade } from '../utils/riskCalc.js';
import type { ParsedSignal } from '../parser/signalParser.js';
import type { ExecutionResult, ApiKeyDoc } from './bybitExecutor.js';

export async function executeBinance(
  apiKeyDoc: ApiKeyDoc,
  signal: ParsedSignal,
  riskPercent: number
): Promise<ExecutionResult> {

  const clientOptions: any = {
    apiKey: decrypt(apiKeyDoc.api_key),
    apiSecret: decrypt(apiKeyDoc.api_secret),
  };

  if (apiKeyDoc.testnet) {
    clientOptions.httpFutures = 'https://testnet.binancefuture.com';
  }

  const client = (Binance as any)(clientOptions);

  try {
    // ── Step 1: Change margin type to ISOLATED ──
    try {
      await client.futuresMarginType({ symbol: signal.symbol!, marginType: 'ISOLATED' });
    } catch (_) { /* already isolated — ignore */ }

    // ── Step 2: Set leverage ──
    await client.futuresLeverage({ symbol: signal.symbol!, leverage: signal.leverage });

    // ── Step 3: Get USDT balance ──
    const account = await client.futuresAccountBalance();
    const usdtBal = account.find((b: any) => b.asset === 'USDT');
    const balance = parseFloat(usdtBal?.availableBalance || '0');
    if (balance <= 0) throw new Error('Insufficient USDT balance');

    // ── Step 4: Get symbol precision ──
    const info = await client.futuresExchangeInfo();
    const symbolInfo = info.symbols.find((s: any) => s.symbol === signal.symbol);
    const qtyPrecision = symbolInfo?.quantityPrecision || 3;

    // ── Step 5: Calculate position size ──
    const sizing = calculatePositionSize({
      accountBalance: balance,
      riskPercent,
      entryPrice: signal.entry!,
      stopLossPrice: signal.stop_loss!,
      leverage: signal.leverage
    });

    if (!isSafeToTrade(sizing, balance)) {
      throw new Error('Trade would use excessive margin');
    }

    const qty = parseFloat(sizing.qty.toFixed(qtyPrecision));

    // ── Step 6: Place market order ──
    const order: any = await client.futuresOrder({
      symbol: signal.symbol!,
      side: signal.side === 'Buy' ? 'BUY' : 'SELL',
      type: 'MARKET',
      quantity: String(qty),
    });

    const closeSide = signal.side === 'Buy' ? 'SELL' : 'BUY';

    // ── Step 7: Place Take Profit order ──
    if (signal.take_profits.length > 0) {
      await client.futuresOrder({
        symbol: signal.symbol!,
        side: closeSide,
        type: 'TAKE_PROFIT_MARKET',
        stopPrice: String(signal.take_profits[0]),
        closePosition: 'true',
        timeInForce: 'GTE_GTC',
      });
    }

    // ── Step 8: Place Stop Loss order ──
    if (signal.stop_loss) {
      await client.futuresOrder({
        symbol: signal.symbol!,
        side: closeSide,
        type: 'STOP_MARKET',
        stopPrice: String(signal.stop_loss),
        closePosition: 'true',
        timeInForce: 'GTE_GTC',
      });
    }

    return { success: true, qty, orderId: order.orderId, entryPrice: signal.entry! };

  } catch (err: any) {
    return { success: false, qty: 0, orderId: '', entryPrice: 0, error: err.message };
  }
}
