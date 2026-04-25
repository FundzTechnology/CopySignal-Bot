export interface RiskParams {
    accountBalance: number;
    riskPercent: number;
    entryPrice: number;
    stopLossPrice: number;
    leverage: number;
}
export interface PositionSizing {
    qty: number;
    riskAmount: number;
    positionValue: number;
    margin: number;
}
export declare function calculatePositionSize(params: RiskParams): PositionSizing;
export declare function isSafeToTrade(sizing: PositionSizing, balance: number): boolean;
//# sourceMappingURL=riskCalc.d.ts.map