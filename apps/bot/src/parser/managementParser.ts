export type ManagementAction =
  | { type: 'HOLD_TO_TP'; tpIndex: number }        // Move TP to TP2/TP3
  | { type: 'SET_BREAKEVEN' }                       // Move SL to entry price
  | { type: 'HOLD_AND_BREAKEVEN'; tpIndex: number } // Both at once
  | { type: 'CLOSE_NOW' }                           // Close immediately
  | { type: 'UPDATE_SL'; newSL: number }            // Move SL to new price
  | { type: 'UPDATE_TP'; newTP: number }            // Move TP to new price
  | null;

export function parseManagementCommand(
  text: string,
  channelTriggerKeyword: string
): { symbol: string | null; action: ManagementAction } {

  const upper = text.toUpperCase();

  // Management commands need the trigger keyword too
  if (channelTriggerKeyword && channelTriggerKeyword.trim() !== '') {
    if (!upper.includes(channelTriggerKeyword.toUpperCase())) {
      return { symbol: null, action: null };
    }
  }

  // Extract symbol
  const symbolMatch = upper.match(/\b([A-Z]{2,8})USDT\b/);
  const symbol = symbolMatch ? symbolMatch[0] : null;

  // ── Pattern: "hold to TP2, set break-even" ──
  const holdBreakevenMatch = upper.match(/HOLD\s+TO\s+TP(\d)/);
  const breakevenMentioned = /BREAK[\s-]?EVEN/.test(upper);

  if (holdBreakevenMatch && breakevenMentioned) {
    return {
      symbol,
      action: {
        type: 'HOLD_AND_BREAKEVEN',
        tpIndex: parseInt(holdBreakevenMatch[1]) - 1  // Convert to 0-based index
      }
    };
  }

  // ── Pattern: "hold to TP3" ──
  if (holdBreakevenMatch) {
    return {
      symbol,
      action: {
        type: 'HOLD_TO_TP',
        tpIndex: parseInt(holdBreakevenMatch[1]) - 1
      }
    };
  }

  // ── Pattern: "set break-even" ──
  if (breakevenMentioned && !holdBreakevenMatch) {
    return { symbol, action: { type: 'SET_BREAKEVEN' } };
  }

  // ── Pattern: "close now" / "exit" / "close trade" ──
  if (/\b(CLOSE|EXIT|STOP|CANCEL)\b/.test(upper)) {
    return { symbol, action: { type: 'CLOSE_NOW' } };
  }

  // ── Pattern: "update SL to 96900" ──
  const updateSLMatch = upper.match(/UPDATE\s+SL\s+TO\s+\$?([\d,]+)/);
  if (updateSLMatch) {
    return {
      symbol,
      action: {
        type: 'UPDATE_SL',
        newSL: parseFloat(updateSLMatch[1].replace(/,/g, ''))
      }
    };
  }

  // ── Pattern: "update TP to 99000" ──
  const updateTPMatch = upper.match(/UPDATE\s+TP\s+TO\s+\$?([\d,]+)/);
  if (updateTPMatch) {
    return {
      symbol,
      action: {
        type: 'UPDATE_TP',
        newTP: parseFloat(updateTPMatch[1].replace(/,/g, ''))
      }
    };
  }

  return { symbol, action: null };
}
