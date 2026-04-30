/**
 * Signal Parser Test Script
 * Run: npx ts-node --esm src/scripts/testParser.ts
 *
 * Add more real signals from Telegram to TEST_SIGNALS before running.
 * Target: 80%+ pass rate before moving to Phase 3.
 */
import { parseSignal, scoreSignal, classifyConfidence } from '../parser/signalParser.js';
const TEST_SIGNALS = [
    // Format 1 — Clean short format
    `BTC Long $97,200 TP $98,500 SL $96,800`,
    // Format 2 — Multi TP with bar separator
    `🚨 SIGNAL\nSOLUSDT LONG x20\nEntry: 185\nTP: 195 | 200 | 210\nSL: 178`,
    // Format 3 — Range entry
    `ETH SHORT\nEntry: 3,450 - 3,480\nTP1: 3,400\nTP2: 3,350\nSL: 3,520`,
    // Format 4 — Informal / degen style with "k" shorthand
    `Ape into BTC calls now around 96800, target 99k, stop 95k`,
    // Format 5 — Structured with zone entry
    `#BTCUSDT\nDirection: LONG\nEntry Zone: 96,500–97,000\nTargets: 98,000 / 100,000\nInvalidation: 95,800\nLeverage: 10x`,
    // Format 6 — With emoji and leverage
    `🔥 ETHUSDT SHORT 10x\nEntry: 3500\nTP: 3400\nSL: 3600`,
    // Format 7 — Telegram call style
    `#SOLUSDT\n📈 LONG\nEntry: 180 - 182\nTarget 1: 190\nTarget 2: 200\nTarget 3: 215\nStop Loss: 172`,
    // Format 8 — Minimal (should score 'low')
    `buy BTC now`,
    // Format 9 — Should fail (no signal data)
    `Good morning everyone! Market opens in 30 minutes.`,
    // Format 10 — Binance style
    `📊 BNBUSDT LONG\nEntry: 580\nTP1: 600 | TP2: 620 | TP3: 650\nSL: 565\nLeverage: 20x`,
];
console.log("=== Signal Parser Test Results ===\n");
let passed = 0;
let highConf = 0;
TEST_SIGNALS.forEach((sig, i) => {
    const parsed = parseSignal(sig);
    const score = scoreSignal(parsed);
    const confidence = classifyConfidence(score);
    parsed.confidence_score = score;
    parsed.confidence = confidence;
    const ok = confidence !== 'failed' && parsed.symbol && parsed.side;
    if (ok)
        passed++;
    if (confidence === 'high')
        highConf++;
    const status = ok ? '✅' : '❌';
    console.log(`Signal ${i + 1}: ${status} [${confidence.toUpperCase()}] score=${score}`);
    console.log(`  Symbol: ${parsed.symbol ?? 'null'} | Side: ${parsed.side ?? 'null'} | Entry: ${parsed.entry ?? 'null'}`);
    console.log(`  TPs: [${parsed.take_profits.join(', ')}] | SL: ${parsed.stop_loss ?? 'null'} | Leverage: ${parsed.leverage}x`);
    console.log(`  Raw: "${sig.substring(0, 70).replace(/\n/g, ' ')}..."\n`);
});
const total = TEST_SIGNALS.length;
const pct = Math.round((passed / total) * 100);
console.log("══════════════════════════════════");
console.log(`✅ PASSED:       ${passed}/${total} signals (${pct}%)`);
console.log(`🔥 High confidence: ${highConf}/${total}`);
console.log(`📊 Target: 80%+ — You are at ${pct}%`);
console.log(pct >= 80 ? "\n🚀 PASS — Ready for Phase 3!" : "\n⚠️  FAIL — Add more patterns to patterns.ts and re-run.");
console.log("══════════════════════════════════");
//# sourceMappingURL=testParser.js.map