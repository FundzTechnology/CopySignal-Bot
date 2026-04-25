export function calculatePositionSize(params) {
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
export function isSafeToTrade(sizing, balance) {
    const marginPercent = (sizing.margin / balance) * 100;
    return marginPercent <= 5;
}
//# sourceMappingURL=riskCalc.js.map