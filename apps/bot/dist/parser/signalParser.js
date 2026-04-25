import { PATTERNS } from './patterns.js';
function cleanNumber(str) {
    // Handle shorthand like "99k" or "99K" => 99000
    const cleaned = str.replace(/,/g, '').trim();
    if (/^\d+\.?\d*[kK]$/.test(cleaned)) {
        return parseFloat(cleaned) * 1000;
    }
    return parseFloat(cleaned);
}
export function parseSignal(rawText) {
    const text = rawText.toUpperCase().trim();
    const result = {
        symbol: null,
        side: null,
        entry: null,
        entryHigh: null,
        take_profits: [],
        stop_loss: null,
        leverage: 10, // sensible default
        confidence: 'failed',
        confidence_score: 0,
        raw: rawText
    };
    // ─── 1. SYMBOL DETECTION ─────────────────────────────────
    // Check for "BTCUSDT" style first, then bare "BTC"
    const usdtMatch = text.match(/\b([A-Z]{2,8})USDT\b/);
    if (usdtMatch) {
        result.symbol = usdtMatch[1] + 'USDT';
    }
    else {
        for (const sym of PATTERNS.symbols) {
            if (new RegExp(`\\b${sym}\\b`).test(text)) {
                result.symbol = sym + 'USDT';
                break;
            }
        }
    }
    // ─── 2. DIRECTION DETECTION ──────────────────────────────
    if (PATTERNS.long.test(text))
        result.side = 'Buy';
    else if (PATTERNS.short.test(text))
        result.side = 'Sell';
    // ─── 3. ENTRY PRICE ──────────────────────────────────────
    for (const pattern of PATTERNS.entry) {
        const match = text.match(pattern);
        if (match) {
            // If it's a range (e.g., 96500–97000), take midpoint
            if (match[2]) {
                const low = cleanNumber(match[1]);
                const high = cleanNumber(match[2]);
                result.entry = parseFloat(((low + high) / 2).toFixed(2));
                result.entryHigh = high;
            }
            else {
                result.entry = cleanNumber(match[1]);
            }
            break;
        }
    }
    // ─── 4. TAKE PROFITS ─────────────────────────────────────
    // Try individual TP patterns first
    for (const pattern of PATTERNS.takeProfit) {
        const regex = new RegExp(pattern.source, 'gi');
        let match;
        while ((match = regex.exec(text)) !== null) {
            const val = cleanNumber(match[1]);
            // Filter out tiny values (likely target indices like "Target 1", not prices)
            if (!isNaN(val) && val >= 10 && !result.take_profits.includes(val)) {
                result.take_profits.push(val);
            }
        }
    }
    // If still empty, try the "Targets: x / y / z" pattern
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
    // Sort TPs correctly by direction
    if (result.take_profits.length > 1) {
        result.take_profits.sort((a, b) => result.side === 'Buy' ? a - b : b - a);
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
        // Cap leverage at 50x for safety
        result.leverage = Math.min(result.leverage, 50);
    }
    // ─── 7. CONFIDENCE SCORING ───────────────────────────────
    let score = 0;
    if (result.symbol)
        score += 2; // Symbol is essential
    if (result.side)
        score += 2; // Direction is essential
    if (result.entry)
        score += 2; // Entry is essential
    if (result.take_profits.length)
        score += 1;
    if (result.stop_loss)
        score += 2; // SL is critical for risk management
    if (result.leverage !== 10)
        score += 1; // Explicit leverage found
    result.confidence_score = score;
    result.confidence =
        score >= 8 ? 'high' :
            score >= 5 ? 'medium' :
                score >= 3 ? 'low' :
                    'failed';
    return result;
}
//# sourceMappingURL=signalParser.js.map