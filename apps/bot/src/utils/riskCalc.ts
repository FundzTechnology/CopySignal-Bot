export interface RiskParams {
  accountBalance: number;   // Total USDT balance
  riskPercent: number;      // e.g., 1.5 = 1.5% risk
  entryPrice: number;
  stopLossPrice: number;
  leverage: number;
}

export interface PositionSizing {
  qty: number;              // Contracts to buy
  riskAmount: number;       // $ amount being risked
  positionValue: number;    // Total position value
  margin: number;           // Margin required at given leverage
}

export function calculatePositionSize(params: RiskParams): PositionSizing {
  const { accountBalance, riskPercent, entryPrice, stopLossPrice, leverage } = params;

  const riskAmount = accountBalance * (riskPercent / 100);
  const stopDistance = Math.abs(entryPrice - stopLossPrice);

  // How many coins can we buy with our risk amount given the stop distance?
  const qty = parseFloat((riskAmount / stopDistance).toFixed(4));

  const positionValue = qty * entryPrice;
  const margin = positionValue / leverage;

  return { qty, riskAmount, positionValue, margin };
}

// Safety check — never use more than 5% of balance as margin
export function isSafeToTrade(sizing: PositionSizing, balance: number): boolean {
  const marginPercent = (sizing.margin / balance) * 100;
  return marginPercent <= 5;
}
