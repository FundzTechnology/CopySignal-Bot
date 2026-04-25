import type { ParsedSignal } from '../parser/signalParser.js';
export interface ApiKeyDoc {
    api_key: string;
    api_secret: string;
    testnet: boolean;
}
export interface ExecutionResult {
    success: boolean;
    qty: number;
    orderId: string;
    entryPrice: number;
    error?: string;
}
export declare function executeBybit(apiKeyDoc: ApiKeyDoc, signal: ParsedSignal, riskPercent: number): Promise<ExecutionResult>;
//# sourceMappingURL=bybitExecutor.d.ts.map