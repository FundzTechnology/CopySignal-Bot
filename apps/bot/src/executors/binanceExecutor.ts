import BinancePkg from 'binance-api-node';
const Binance = BinancePkg.default || BinancePkg;
import { decrypt } from '../utils/crypto.js';
import { calculatePositionSize, isSafeToTrade } from '../utils/riskCalc.js';
import type { ParsedSignal } from '../parser/signalParser.js';
import type { ExecutionResult, ApiKeyDoc } from './bybitExecutor.js';

export async function executeBinance(
  apiKeyDoc: ApiKeyDoc,
  signal: ParsedSignal,
  riskPercent: number,
  multiTpPercent: number = 0
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

    // ── Step 3.5: If useMarketPrice is true, fetch current market price ──
    if (signal.useMarketPrice || !signal.entry) {
      const ticker = await client.futuresMarkPrice({ symbol: signal.symbol! });
      const lastPrice = parseFloat(ticker.markPrice || '0');
      if (lastPrice <= 0) throw new Error(`Could not fetch market price for ${signal.symbol}`);
      signal.entry = lastPrice;
    }

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

    // ── Step 6: Place order (LIMIT or MARKET) ──
    const orderType = signal.useMarketPrice ? 'MARKET' : 'LIMIT';
    const orderOptions: any = {
      symbol: signal.symbol!,
      side: signal.side === 'Buy' ? 'BUY' : 'SELL',
      type: orderType,
      quantity: String(qty),
    };
    if (orderType === 'LIMIT') {
      orderOptions.price = String(signal.entry!);
      orderOptions.timeInForce = 'GTC';
    }

    const order: any = await client.futuresOrder(orderOptions);

    const closeSide = signal.side === 'Buy' ? 'SELL' : 'BUY';

    // ── Step 7: Place Take Profit order(s) ──
    if (signal.take_profits.length > 0) {
      if (multiTpPercent > 0 && signal.take_profits.length > 1) {
        // Split TP
        const tp1Qty = parseFloat((qty * (multiTpPercent / 100)).toFixed(qtyPrecision));
        const tp2Qty = parseFloat((qty - tp1Qty).toFixed(qtyPrecision));

        if (tp1Qty > 0) {
          await client.futuresOrder({
            symbol: signal.symbol!,
            side: closeSide,
            type: 'TAKE_PROFIT_MARKET',
            stopPrice: String(signal.take_profits[0]),
            quantity: String(tp1Qty),
            reduceOnly: 'true',
            timeInForce: 'GTE_GTC',
          });
        }
        
        if (tp2Qty > 0) {
          await client.futuresOrder({
            symbol: signal.symbol!,
            side: closeSide,
            type: 'TAKE_PROFIT_MARKET',
            stopPrice: String(signal.take_profits[1]),
            quantity: String(tp2Qty),
            reduceOnly: 'true',
            timeInForce: 'GTE_GTC',
          });
        }
      } else {
        // Single TP
        await client.futuresOrder({
          symbol: signal.symbol!,
          side: closeSide,
          type: 'TAKE_PROFIT_MARKET',
          stopPrice: String(signal.take_profits[0]),
          closePosition: 'true',
          timeInForce: 'GTE_GTC',
        });
      }
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

export async function closePositionBinance(apiKeyDoc: ApiKeyDoc, symbol: string) {
  const clientOptions: any = {
    apiKey: decrypt(apiKeyDoc.api_key),
    apiSecret: decrypt(apiKeyDoc.api_secret),
  };

  if (apiKeyDoc.testnet) {
    clientOptions.httpFutures = 'https://testnet.binancefuture.com';
  }

  const client = (Binance as any)(clientOptions);

  // 1. Cancel all open orders for this symbol
  await client.futuresCancelAllOpenOrders({ symbol }).catch(() => null);

  // 2. Fetch position
  const account = await client.futuresAccount();
  const pos = account.positions?.find((p: any) => p.symbol === symbol);

  if (pos) {
    const positionAmt = parseFloat(pos.positionAmt);
    if (positionAmt !== 0) {
      const side = positionAmt > 0 ? 'SELL' : 'BUY';
      const qty = Math.abs(positionAmt);
      await client.futuresOrder({
        symbol,
        side,
        type: 'MARKET',
        quantity: String(qty),
        reduceOnly: 'true',
      });
    }
  }
}
