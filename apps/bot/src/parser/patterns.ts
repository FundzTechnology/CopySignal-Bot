// All regex patterns in one file — easy to add new ones

export const PATTERNS = {
  // Coin symbols — extend this list as needed
  symbols: [
    'BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'AVAX', 'MATIC',
    'LINK', 'ADA', 'DOT', 'PEPE', 'WIF', 'BONK', 'SHIB', 'OP',
    'ARB', 'LTC', 'NEAR', 'ATOM', 'APT', 'SUI', 'INJ', 'TIA',
    'TON', 'RENDER', 'FET', 'JUP', 'PYTH', 'W', 'ENA', 'SEI',
  ],

  // Direction patterns
  long: /\b(LONG|BUY|CALLS?|BULL|BULLISH|UP)\b/i,
  short: /\b(SHORT|SELL|PUTS?|BEAR|BEARISH|DOWN)\b/i,

  // Entry price patterns (ordered by specificity, most specific first)
  // Note: [kK] suffix is optionally captured so cleanNumber() can expand "99k" → 99000
  entry: [
    /ENTRY\s*(?:ZONE\s*)?[:\-]?\s*\$?([\d,]+\.?\d*[kK]?)\s*[-–]\s*\$?([\d,]+\.?\d*[kK]?)/i, // range
    /ENTRY\s*[:\-]?\s*\$?([\d,]+\.?\d*[kK]?)/i,
    /ENTER\s*(?:AT\s*)?[:\-]?\s*\$?([\d,]+\.?\d*[kK]?)/i,
    /PRICE\s*[:\-]?\s*\$?([\d,]+\.?\d*[kK]?)/i,
    /NOW\s*(?:AT\s*)?(?:AROUND\s*)?\$?([\d,]+\.?\d*[kK]?)/i,
    /(?:LONG|SHORT)\s*(?:@|AT)?\s*\$?([\d,]+\.?\d*[kK]?)/i,
    /\bAPE\s+(?:IN\s+)?(?:AT\s+)?(?:AROUND\s+)?\$?([\d,]+\.?\d*[kK]?)/i,
    /AROUND\s+\$?([\d,]+\.?\d*[kK]?)/i,
  ],

  // Take profit patterns — capture optional K/k suffix for shorthand like "99k"
  // Note: TARGET has two forms: "TARGET 1: 190" (numbered) and "TARGET 99K" (direct price)
  takeProfit: [
    /TP\d?\s*[:\-]?\s*\$?([\d,]+\.?\d*[kK]?)/gi,
    /TAKE\s*PROFIT\s*\d?\s*[:\-]?\s*\$?([\d,]+\.?\d*[kK]?)/gi,
    /TARGET\s*\d\s*[:\-]\s*\$?([\d,]+\.?\d*[kK]?)/gi,   // "TARGET 1: 190" — digit + separator required
    /TARGET\s+\$?([\d,]+\.?\d*[kK]?)/gi,                  // "TARGET 99K" — direct price after space
    /T\/P\d?\s*[:\-]?\s*\$?([\d,]+\.?\d*[kK]?)/gi,
  ],

  // Target list pattern (e.g., "Targets: 98000 / 100000 / 105000" or "target 99k")
  targetList: /TARGETS?\s*[:\-]?\s*([\d,\s\/\|\.\-kK]+)/i,

  // Stop loss patterns — capture optional K/k suffix
  stopLoss: [
    /S\.?L\.?\s*\d*\s*[:\-]?\s*\$?([\d,]+\.?\d*[kK]?)/i,
    /STOP\s*(?:LOSS\s*)?(?:AT\s*)?[:\-]?\s*\$?([\d,]+\.?\d*[kK]?)/i,
    /INVALIDATION\s*[:\-]?\s*\$?([\d,]+\.?\d*[kK]?)/i,
    /CUT\s*(?:AT\s*)?[:\-]?\s*\$?([\d,]+\.?\d*[kK]?)/i,
    /STOPLOSS\s*[:\-]?\s*\$?([\d,]+\.?\d*[kK]?)/i,
  ],

  // Leverage patterns — matches "x20", "20x", "×10", "LEVERAGE: 10"
  leverage: /(?:X|x|×|LEVERAGE[:\s]+)(\d+)(?:X|x|×)?|(\d+)(?:X|x|×)/,
};
