export type TPRule = 'TP1' | 'TP2' | 'TP3' | 'LAST' | 'MIDDLE';

export interface TPSelection {
  initialTP: number;          // The TP placed on the exchange for the opening order
  allTPs: number[];           // All TPs for reference / dynamic management
  activeTPIndex: number;      // Which index is currently active (0-based)
}

export function selectTP(
  takeProfits: number[],
  rule: TPRule,
  side: 'Buy' | 'Sell'
): TPSelection {

  if (takeProfits.length === 0) {
    throw new Error('No take profits found in signal');
  }

  // Sort TPs correctly by trade direction
  const sorted = [...takeProfits].sort((a, b) =>
    side === 'Buy' ? a - b : b - a
  );

  let selectedIndex: number;

  switch (rule) {
    case 'TP1':
      selectedIndex = 0;
      break;
    case 'TP2':
      selectedIndex = sorted.length >= 2 ? 1 : 0;
      break;
    case 'TP3':
      selectedIndex = sorted.length >= 3 ? 2 : sorted.length - 1;
      break;
    case 'LAST':
      selectedIndex = sorted.length - 1;
      break;
    case 'MIDDLE':
      selectedIndex = Math.floor(sorted.length / 2);
      break;
    default:
      selectedIndex = 0;
  }

  return {
    initialTP: sorted[selectedIndex],
    allTPs: sorted,
    activeTPIndex: selectedIndex
  };
}

export function getDefaultTPSelection(
  takeProfits: number[],
  side: 'Buy' | 'Sell'
): TPSelection {
  if (takeProfits.length === 1) {
    return selectTP(takeProfits, 'TP1', side);
  }
  if (takeProfits.length === 2) {
    return selectTP(takeProfits, 'TP1', side);
  }
  if (takeProfits.length >= 3) {
    return selectTP(takeProfits, 'TP1', side);
  }
  return selectTP(takeProfits, 'TP1', side);
}
