import { RestClientV5 } from 'bybit-api';
import { decrypt } from '../utils/crypto.js';
import { calculatePositionSize, isSafeToTrade } from '../utils/riskCalc.js';
import type { ParsedSignal } from '../parser/signalParser.js';

export interface ApiKeyDoc {
  api_key: string;          // encrypted
  api_secret: string;       // encrypted
  testnet: boolean;
}

export interface ExecutionResult {
  success: boolean;
  qty: number;
  orderId: string;
  entryPrice: number;
  error?: string;
}

export async function executeBybit(
  apiKeyDoc: ApiKeyDoc,
  signal: ParsedSignal,
  riskPercent: number
): Promise<ExecutionResult> {

  const client = new RestClientV5({
    key: decrypt(apiKeyDoc.api_key),
    secret: decrypt(apiKeyDoc.api_secret),
    testnet: apiKeyDoc.testnet,
    syncTime: true, // Forces time synchronization to prevent ECONNRESET
  } as any);

  const MAX_RETRIES = 3;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      // ── Step 1: Get account balance ──
      const balanceRes = await client.getWalletBalance({ accountType: 'UNIFIED', coin: 'USDT' });
      const balance = parseFloat(
        balanceRes.result?.list?.[0]?.coin?.find((c: any) => c.coin === 'USDT')?.availableToWithdraw || '0'
      );
      if (balance <= 0) throw new Error('Insufficient USDT balance');

      // ── Step 2: Calculate position size ──
      const sizing = calculatePositionSize({
        accountBalance: balance,
        riskPercent,
        entryPrice: signal.entry!,
        stopLossPrice: signal.stop_loss!,
        leverage: signal.leverage
      });

      if (!isSafeToTrade(sizing, balance)) {
        throw new Error(`Trade would use excessive margin: ${(sizing.margin / balance * 100).toFixed(1)}%`);
      }

      // ── Step 3: Set leverage ──
      try {
        await client.setLeverage({
          category: 'linear',
          symbol: signal.symbol!,
          buyLeverage: String(signal.leverage),
          sellLeverage: String(signal.leverage),
        });
      } catch (e: any) {
        // Ignore "leverage not modified" error, throw others
        if (!e.message?.includes('not modified')) {
          throw e;
        }
      }

      // ── Step 4: Place market order ──
      const orderRes = await client.submitOrder({
        category: 'linear',
        symbol: signal.symbol!,
        side: signal.side as 'Buy' | 'Sell',
        orderType: 'Market',
        qty: String(sizing.qty),
        takeProfit: signal.take_profits.length ? String(signal.take_profits[0]) : undefined,
        stopLoss: signal.stop_loss ? String(signal.stop_loss) : undefined,
        tpTriggerBy: 'LastPrice',
        slTriggerBy: 'LastPrice',
        timeInForce: 'IOC',
        positionIdx: 0,
      });

      if (orderRes.retCode !== 0) {
        throw new Error(`Bybit error: ${orderRes.retMsg}`);
      }

      return {
        success: true,
        qty: sizing.qty,
        orderId: orderRes.result.orderId,
        entryPrice: signal.entry!,
      };

    } catch (err: any) {
      // Check if it's a network/connection error (like ECONNRESET)
      if (err.code === 'ECONNRESET' || err.message?.includes('ECONNRESET')) {
        attempt++;
        if (attempt >= MAX_RETRIES) {
          return { success: false, qty: 0, orderId: '', entryPrice: 0, error: 'Network error: Connection repeatedly reset by Bybit (ECONNRESET).' };
        }
        console.warn(`[Bybit] Network connection dropped (ECONNRESET). Retrying attempt ${attempt}...`);
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Exponential backoff
        continue;
      }

      return {
        success: false,
        qty: 0,
        orderId: '',
        entryPrice: 0,
        error: err.message || JSON.stringify(err)
      };
    }
  }

  return { success: false, qty: 0, orderId: '', entryPrice: 0, error: 'Unknown execution failure' };
}
