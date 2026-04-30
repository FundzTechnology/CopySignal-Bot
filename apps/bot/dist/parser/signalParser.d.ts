export interface ParsedSignal {
    symbol: string | null;
    side: 'Buy' | 'Sell' | null;
    entry: number | null;
    entryHigh: number | null;
    take_profits: number[];
    stop_loss: number | null;
    leverage: number;
    confidence?: 'high' | 'medium' | 'low' | 'failed';
    confidence_score?: number;
    raw: string;
}
export interface ChannelRules {
    trigger_keyword?: string;
    buffer_window_seconds?: number;
    tp_rule?: 'TP1' | 'TP2' | 'TP3' | 'LAST' | 'MIDDLE';
    allow_medium_confidence?: boolean;
    management_commands_enabled?: boolean;
}
export declare function containsTriggerKeyword(rawText: string, triggerKeyword: string): boolean;
export declare function parseSignal(rawText: string): ParsedSignal;
export declare function scoreSignal(parsed: ParsedSignal, channelRules?: ChannelRules): number;
export declare function classifyConfidence(score: number): 'high' | 'medium' | 'low' | 'failed';
//# sourceMappingURL=signalParser.d.ts.map