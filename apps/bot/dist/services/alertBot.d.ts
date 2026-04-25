interface TradeAlertParams {
    symbol: string;
    side: string;
    qty: number;
    entry_price: number;
    take_profit?: number;
    stop_loss?: number;
    status: string;
    exchange: string;
}
export declare function sendTradeAlert(telegramUserId: string, trade: TradeAlertParams): Promise<void>;
export {};
//# sourceMappingURL=alertBot.d.ts.map