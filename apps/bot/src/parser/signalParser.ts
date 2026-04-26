import { PATTERNS } from './patterns.js';

export interface ParsedSignal {
  symbol: string | null;
  side: 'Buy' | 'Sell' | null;
  entry: number | null;
  entryHigh: number | null;     // For range entries — use midpoint
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

function cleanNumber(str: string): number {
  // Handle shorthand like "99k" or "99K" => 99000
  const cleaned = str.replace(/,/g, '').trim();
  if (/^\d+\.?\d*[kK]$/.test(cleaned)) {
    return parseFloat(cleaned) * 1000;
  }
  return parseFloat(cleaned);
}

export function containsTriggerKeyword(
  rawText: string,
  triggerKeyword: string
): boolean {
  if (!triggerKeyword || triggerKeyword.trim() === '') return true; 
  return rawText.toUpperCase().includes(triggerKeyword.toUpperCase());
}

export function parseSignal(rawText: string): ParsedSignal {
  const text = rawText.toUpperCase().trim();

  const result: ParsedSignal = {
    symbol: null,
    side: null,
    entry: null,
    entryHigh: null,
    take_profits: [],
    stop_loss: null,
    leverage: 10,  // sensible default
    raw: rawText
  };

  // ─── 1. SYMBOL DETECTION ─────────────────────────────────
  const usdtMatch = text.match(/\b([A-Z]{2,8})USDT\b/);
  if (usdtMatch) {
    result.symbol = usdtMatch[1] + 'USDT';
  } else {
    for (const sym of PATTERNS.symbols) {
      if (new RegExp(`\\b${sym}\\b`).test(text)) {
        result.symbol = sym + 'USDT';
        break;
      }
    }
  }

  // ─── 2. DIRECTION DETECTION ──────────────────────────────
  if (PATTERNS.long.test(text)) result.side = 'Buy';
  else if (PATTERNS.short.test(text)) result.side = 'Sell';

  // ─── 3. ENTRY PRICE ──────────────────────────────────────
  for (const pattern of PATTERNS.entry) {
    const match = text.match(pattern);
    if (match) {
      if (match[2]) {
        const low = cleanNumber(match[1]);
        const high = cleanNumber(match[2]);
        result.entry = parseFloat(((low + high) / 2).toFixed(2));
        result.entryHigh = high;
      } else {
        result.entry = cleanNumber(match[1]);
      }
        break;
    }
  }

  // ─── 4. TAKE PROFITS ─────────────────────────────────────
  for (const pattern of PATTERNS.takeProfit) {
    const regex = new RegExp(pattern.source, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      const val = cleanNumber(match[1]);
      if (!isNaN(val) && val >= 10 && !result.take_profits.includes(val)) {
        result.take_profits.push(val);
      }
    }
  }

  if (result.take_profits.length === 0) {
    const listMatch = text.match(PATTERNS.targetList);
    if (listMatch) {
      const tps = listMatch[1]
        .split(/[\/\|\s]+/)
        .map(s => cleanNumber(s.trim()))
        .filter(n => !isNaN(n) && n > 0);
      result.take_profits = tps;
    }
  }

  if (result.take_profits.length > 1) {
    result.take_profits.sort((a, b) =>
      result.side === 'Buy' ? a - b : b - a
    );
  }

  // ─── 5. STOP LOSS ────────────────────────────────────────
  for (const pattern of PATTERNS.stopLoss) {
    const match = text.match(pattern);
    if (match) {
      result.stop_loss = cleanNumber(match[1]);
      break;
    }
  }

  // ─── 6. LEVERAGE ─────────────────────────────────────────
  const levMatch = text.match(PATTERNS.leverage);
  if (levMatch) {
    result.leverage = parseInt(levMatch[1] || levMatch[2]);
    result.leverage = Math.min(result.leverage, 50);
  }

  return result;
}

export function scoreSignal(parsed: ParsedSignal, channelRules?: ChannelRules): number {
  let score = 0;

  // ── Mandatory fields (signal cannot fire without these) ──
  if (!parsed.symbol) return 0;     // No symbol = definitely not a signal
  if (!parsed.side) return 0;       // No direction = cannot trade
  if (!parsed.entry) return 0;      // No entry = cannot size position

  score += 3; // Base score for having all mandatory fields

  // ── Strongly recommended fields ──
  if (parsed.stop_loss) {
    score += 3; 
  }

  if (parsed.take_profits.length > 0) {
    score += 2;
  }

  // ── Quality indicators ──
  if (parsed.leverage && parsed.leverage !== 10) {
    score += 1; 
  }

  // ── Sanity checks — these detect false signals ──
  if (parsed.symbol === 'BTCUSDT' && parsed.entry) {
    if (parsed.entry < 1000 || parsed.entry > 10_000_000) {
      return 0; // Clearly wrong price for BTC
    }
  }

  if (parsed.stop_loss && parsed.entry) {
    const slOnWrongSide = (
      (parsed.side === 'Buy' && parsed.stop_loss >= parsed.entry) ||
      (parsed.side === 'Sell' && parsed.stop_loss <= parsed.entry)
    );
    if (slOnWrongSide) {
      score -= 3; // Strong penalty — SL above entry for a long is wrong
    }
  }

  if (parsed.take_profits.length > 0 && parsed.entry) {
    const primaryTP = parsed.take_profits[0];
    const tpOnWrongSide = (
      (parsed.side === 'Buy' && primaryTP <= parsed.entry) ||
      (parsed.side === 'Sell' && primaryTP >= parsed.entry)
    );
    if (tpOnWrongSide) {
      score -= 2;
    }
  }

  // Check: Risk/reward ratio is reasonable (at least 1:1)
  if (parsed.entry && parsed.stop_loss && parsed.take_profits.length > 0) {
    const risk = Math.abs(parsed.entry - parsed.stop_loss);
    const reward = Math.abs(parsed.take_profits[0] - parsed.entry);
    if (risk > 0) {
      const rrRatio = reward / risk;

      if (rrRatio < 0.5) {
        score -= 2; // Terrible R:R is suspicious
      } else if (rrRatio >= 1.5) {
        score += 1; // Good R:R confirms intent
      }
    }
  }

  return Math.max(0, score);
}

export function classifyConfidence(score: number): 'high' | 'medium' | 'low' | 'failed' {
  if (score >= 8) return 'high';
  if (score >= 5) return 'medium';
  if (score >= 3) return 'low';
  return 'failed';
}
