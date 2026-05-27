import { db } from '../db/cocobase.js';
import { parseSignal, scoreSignal, classifyConfidence, containsTriggerKeyword } from '../parser/signalParser.js';
import { parseManagementCommand } from '../parser/managementParser.js';
import { getDefaultTPSelection } from '../parser/tpSelector.js';
import { executeManagementAction } from './tradeManager.js';
import { executeBybit } from '../executors/bybitExecutor.js';
import { executeBinance } from '../executors/binanceExecutor.js';
import { notify } from './notificationService.js';
export async function handleSignal(rawMessage, messageId, channelDoc, replyToMsgId) {
    const userId = channelDoc.user_id;
    console.log(`[Orchestrator] 📨 Signal received from channel "${channelDoc.name}" for user ${userId}`);
    console.log(`[Orchestrator] Raw message (first 200 chars): ${rawMessage.substring(0, 200)}`);
    // ── GATE 1: Deduplication ──────────────────────────────────
    try {
        const existing = await db.listDocuments("signals", {
            filters: { channel_id: channelDoc.id, telegram_message_id: messageId }
        });
        if (existing.length > 0) {
            console.log(`[Orchestrator] ⏭️ Duplicate signal — skipping`);
            return;
        }
    }
    catch {
        // signals collection may not exist — proceed
    }
    // ── GATE 1.5: Reply-based Close Command ─────────────────────
    if (replyToMsgId && /\b(CLOSE|EXIT|CANCEL)\b/i.test(rawMessage)) {
        console.log(`[Orchestrator] 🛑 Received close command as reply to ${replyToMsgId}`);
        try {
            const originalSignals = await db.listDocuments("signals", {
                filters: { telegram_message_id: replyToMsgId, channel_id: channelDoc.id }
            });
            if (originalSignals.length > 0) {
                const sigDoc = originalSignals[0].data || originalSignals[0];
                const signalId = sigDoc.id || sigDoc._id || originalSignals[0].id || originalSignals[0]._id;
                const activeTrades = await db.listDocuments("trade_logs", {
                    filters: { signal_id: signalId, status: 'filled', user_id: userId }
                });
                if (activeTrades.length > 0) {
                    const { closeTradeByReply } = await import('./tradeManager.js');
                    // Handle the case where there might be multiple trades (e.g. multiple users if channelDoc was shared, but user_id is filtered)
                    for (const tradeRaw of activeTrades) {
                        const trade = tradeRaw.data || tradeRaw;
                        // Inject the ID since we unwrapped it
                        trade.id = trade.id || trade._id || tradeRaw.id || tradeRaw._id;
                        await closeTradeByReply(userId, trade, channelDoc);
                    }
                }
                else {
                    console.log(`[Orchestrator] No active trades found for signal ${signalId}`);
                }
            }
        }
        catch (err) {
            console.error(`[Orchestrator] Error processing reply-to-close:`, err);
        }
        return; // Done processing this reply message
    }
    // ── GATE 2: Trigger Keyword Filtering ───────────────────────
    const keyword = channelDoc.trigger_keyword;
    if (!containsTriggerKeyword(rawMessage, keyword)) {
        // Check if it's a management command (e.g., "HOLD TO TP2") before discarding entirely
        const mgmt = parseManagementCommand(rawMessage, keyword);
        if (mgmt.action) {
            await executeManagementAction(userId, mgmt.symbol, mgmt.action, channelDoc);
        }
        console.log(`[Orchestrator] ⏭️ No trigger keyword match — skipping`);
        return; // Discard non-signals
    }
    // ── GATE 3: Initial Parsing ─────────────────────────────────
    const parsed = parseSignal(rawMessage);
    console.log(`[Orchestrator] 📊 Parsed: ${parsed.symbol} ${parsed.side} entry=${parsed.entry} SL=${parsed.stop_loss} TPs=${parsed.take_profits.join(',')}`);
    // Check if it is actually a management command with the trigger keyword included
    const mgmt = parseManagementCommand(rawMessage, keyword);
    if (mgmt.action && !parsed.entry) {
        await executeManagementAction(userId, mgmt.symbol, mgmt.action, channelDoc);
        return;
    }
    // ── GATE 4: Confidence Scoring ──────────────────────────────
    const score = scoreSignal(parsed, channelDoc);
    parsed.confidence_score = score;
    parsed.confidence = classifyConfidence(score);
    console.log(`[Orchestrator] 🎯 Confidence: ${parsed.confidence} (score: ${score})`);
    // Store in DB for observability
    const signalDoc = await db.createDocument("signals", {
        channel_id: channelDoc.id,
        user_id: userId,
        telegram_message_id: messageId,
        raw_message: rawMessage,
        parsed,
        status: parsed.confidence === 'failed' ? 'failed' : 'parsed',
        received_at: new Date().toISOString()
    });
    // ── GATE 5: Quality Enforcement ─────────────────────────────
    if (parsed.confidence === 'failed' || parsed.confidence === 'low') {
        await db.updateDocument("signals", signalDoc.id, { status: 'skipped_quality' });
        console.log(`[Orchestrator] ⏭️ Signal quality too low (${parsed.confidence}) — skipping`);
        return;
    }
    if (parsed.confidence === 'medium' && !channelDoc.allow_medium_confidence) {
        await db.updateDocument("signals", signalDoc.id, { status: 'skipped_quality' });
        console.log(`[Orchestrator] ⏭️ Medium confidence not allowed for this channel — skipping`);
        return;
    }
    // ── GATE 6: TP Selection Rule ───────────────────────────────
    const tpSelection = getDefaultTPSelection(parsed.take_profits, parsed.side);
    // ── GATE 7: Billing & API Check ─────────────────────────────
    let user;
    try {
        user = await db.auth.getUserById(userId);
    }
    catch {
        console.log(`[Orchestrator] ⏭️ Could not fetch user ${userId} — skipping`);
        return;
    }
    if (user?.data?.plan === 'free') {
        console.log(`[Orchestrator] ⏭️ User on free plan — skipping`);
        return;
    }
    // Fetch API keys — handle Cocobase .data nesting
    let apiKeyDoc = null;
    try {
        const apiKeys = await db.listDocuments("api_keys", {
            filters: { user_id: userId, exchange: channelDoc.exchange }
        });
        if (apiKeys.length > 0)
            apiKeyDoc = apiKeys[0];
    }
    catch { }
    // Fallback: fetch all and filter in code
    if (!apiKeyDoc) {
        try {
            const allKeys = await db.listDocuments("api_keys", {});
            apiKeyDoc = allKeys.find((k) => {
                const d = k.data || k;
                return (d.user_id || k.user_id) === userId &&
                    (d.exchange || k.exchange) === channelDoc.exchange;
            });
            if (!apiKeyDoc) {
                console.log(`[Orchestrator DB Debug] Database has ${allKeys.length} total keys.`);
                allKeys.forEach((k) => {
                    const d = k.data || k;
                    console.log(`[Orchestrator DB Debug] Found key for user: ${d.user_id || k.user_id}, Exchange: ${d.exchange || k.exchange}`);
                });
            }
        }
        catch { }
    }
    if (!apiKeyDoc) {
        console.log(`[Orchestrator] ⏭️ No API key found for ${channelDoc.exchange} for user ${userId} — skipping`);
        return;
    }
    // Unwrap .data nesting for the executor
    const unwrappedKey = {
        api_key: apiKeyDoc.data?.api_key || apiKeyDoc.api_key,
        api_secret: apiKeyDoc.data?.api_secret || apiKeyDoc.api_secret,
        testnet: apiKeyDoc.data?.testnet ?? apiKeyDoc.testnet ?? false,
        demo_mode: apiKeyDoc.data?.demo_mode ?? apiKeyDoc.demo_mode ?? false,
    };
    // ── EXECUTION ───────────────────────────────────────────────
    const multiTpPercent = user.data?.multi_tp_partial || 0;
    let result;
    try {
        console.log(`[Orchestrator] 🚀 Executing ${parsed.symbol} ${parsed.side} on ${channelDoc.exchange} (demo=${unwrappedKey.demo_mode})`);
        if (channelDoc.exchange === 'bybit') {
            result = await executeBybit(unwrappedKey, parsed, channelDoc.risk_percent, multiTpPercent);
        }
        else {
            result = await executeBinance(unwrappedKey, parsed, channelDoc.risk_percent, multiTpPercent);
        }
    }
    catch (execErr) {
        // Alert admin on critical execution failures
        await notify({
            type: 'SYSTEM_ERROR',
            payload: {
                context: `Trade Execution Failed — ${parsed.symbol} on ${channelDoc.exchange}`,
                error: execErr.message || String(execErr)
            }
        });
        result = { success: false, qty: 0, entryPrice: 0, error: execErr.message };
    }
    console.log(`[Orchestrator] ${result.success ? '✅' : '❌'} Execution result: ${JSON.stringify(result)}`);
    // ── RECORDING ───────────────────────────────────────────────
    await db.createDocument("trade_logs", {
        user_id: userId,
        signal_id: signalDoc.id,
        channel_id: channelDoc.id,
        channel_name: channelDoc.name || 'Unknown Channel',
        channel_username: channelDoc.channel_username || '',
        exchange: channelDoc.exchange,
        symbol: parsed.symbol,
        side: parsed.side,
        order_type: parsed.useMarketPrice ? 'Market' : 'Limit',
        qty: result.qty,
        entry_price: result.entryPrice,
        take_profit: tpSelection.initialTP,
        stop_loss: parsed.stop_loss,
        all_tps: tpSelection.allTPs,
        active_tp_index: tpSelection.activeTPIndex,
        order_id: result.orderId || null,
        status: result.success ? 'filled' : 'error',
        error_msg: result.error || null,
        executed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
    });
    await db.updateDocument("signals", signalDoc.id, {
        status: result.success ? 'executed' : 'failed'
    });
    // ── ALERT ───────────────────────────────────────────────────
    if (result.success) {
        await notify({
            type: 'TRADE_OPENED',
            userId,
            payload: {
                symbol: parsed.symbol,
                side: parsed.side,
                qty: result.qty,
                entry_price: result.entryPrice,
                take_profit: tpSelection.initialTP,
                stop_loss: parsed.stop_loss ?? undefined,
                exchange: channelDoc.exchange
            }
        });
        // Start monitoring this order for TP/SL hits
        if (result.orderId) {
            const { startOrderMonitor } = await import('./orderMonitor.js');
            startOrderMonitor({
                userId,
                symbol: parsed.symbol,
                orderId: result.orderId,
                exchange: channelDoc.exchange,
                side: parsed.side,
                entryPrice: result.entryPrice,
                qty: result.qty,
                takeProfit: tpSelection.initialTP,
                firstTarget: parsed.take_profits.length ? parsed.take_profits[0] : undefined,
                stopLoss: parsed.stop_loss ?? undefined,
                apiKeyDoc: unwrappedKey,
                isMarketOrder: !!parsed.useMarketPrice, // Skip Phase 1 for market fills
                channelName: channelDoc.name || channelDoc.channel_username || 'Unknown Channel',
            });
        }
    }
    else {
        // Notify the user that their trade failed
        await notify({
            type: 'TRADE_ERROR',
            userId,
            payload: {
                symbol: parsed.symbol,
                exchange: channelDoc.exchange,
                error: result.error || 'Unknown execution error'
            }
        });
    }
}
//# sourceMappingURL=orchestrator.js.map