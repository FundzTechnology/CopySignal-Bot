export interface ParsedSignal {
    symbol: string | null;
    side: 'Buy' | 'Sell' | null;
    entry: number | null;
    entryHigh: number | null;
    take_profits: number[];
    stop_loss: number | null;
    leverage: number;
    confidence: 'high' | 'medium' | 'low' | 'failed';
    confidence_score: number;
    raw: string;
}
export declare function parseSignal(rawText: string): ParsedSignal;
//# sourceMappingURL=signalParser.d.ts.map