/**
 * Exchange Maintenance Detector
 * Detects when Bybit or Binance are in scheduled maintenance
 * and prevents useless retries during that window.
 */

// Known error codes from exchanges during maintenance
const BYBIT_MAINTENANCE_CODES = [10004, 10005, 10006, 10010];
const BINANCE_MAINTENANCE_CODES = [-1001, -1003];

const MAINTENANCE_MESSAGES = [
  'system maintenance',
  'server busy',
  'service unavailable',
  'system error',
  'under maintenance',
  'system upgrade',
];

// Track maintenance state per exchange
const maintenanceState: Record<string, { active: boolean; detectedAt: number; cooldownUntil: number }> = {
  bybit: { active: false, detectedAt: 0, cooldownUntil: 0 },
  binance: { active: false, detectedAt: 0, cooldownUntil: 0 },
};

const COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes

export function isMaintenanceError(err: any, exchange: 'bybit' | 'binance'): boolean {
  const retCode = err.retCode || err.code;
  const message = (err.message || err.retMsg || '').toLowerCase();

  const codes = exchange === 'bybit' ? BYBIT_MAINTENANCE_CODES : BINANCE_MAINTENANCE_CODES;

  if (codes.includes(retCode)) return true;
  if (MAINTENANCE_MESSAGES.some(m => message.includes(m))) return true;

  return false;
}

export function setMaintenanceMode(exchange: 'bybit' | 'binance') {
  const now = Date.now();
  maintenanceState[exchange] = {
    active: true,
    detectedAt: now,
    cooldownUntil: now + COOLDOWN_MS,
  };
  console.warn(`[Maintenance] ${exchange.toUpperCase()} maintenance detected. Cooldown until ${new Date(now + COOLDOWN_MS).toISOString()}`);
}

export function isInMaintenance(exchange: 'bybit' | 'binance'): boolean {
  const state = maintenanceState[exchange];
  if (!state.active) return false;

  if (Date.now() > state.cooldownUntil) {
    // Cooldown expired — resume normal operations
    state.active = false;
    console.info(`[Maintenance] ${exchange.toUpperCase()} cooldown expired. Resuming operations.`);
    return false;
  }

  return true;
}

export function getMaintenanceStatus(): Record<string, { active: boolean; cooldownRemaining: number }> {
  const now = Date.now();
  return {
    bybit: {
      active: maintenanceState.bybit.active && now < maintenanceState.bybit.cooldownUntil,
      cooldownRemaining: Math.max(0, maintenanceState.bybit.cooldownUntil - now),
    },
    binance: {
      active: maintenanceState.binance.active && now < maintenanceState.binance.cooldownUntil,
      cooldownRemaining: Math.max(0, maintenanceState.binance.cooldownUntil - now),
    },
  };
}
