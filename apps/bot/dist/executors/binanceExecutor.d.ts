import type { ParsedSignal } from '../parser/signalParser.js';
import type { ExecutionResult, ApiKeyDoc } from './bybitExecutor.js';
export declare function executeBinance(apiKeyDoc: ApiKeyDoc, signal: ParsedSignal, riskPercent: number, multiTpPercent?: number): Promise<ExecutionResult>;
export declare function closePositionBinance(apiKeyDoc: ApiKeyDoc, symbol: string): Promise<void>;
//# sourceMappingURL=binanceExecutor.d.ts.map