/**
 * Signal Deduplication Lock
 * Fast in-memory lock to prevent race conditions when
 * duplicate Telegram messages arrive within milliseconds.
 *
 * Works alongside the DB-level dedup check as a first line of defense.
 */

const processingLock = new Set<string>();

/**
 * Attempt to acquire a lock for a specific signal.
 * @returns true if lock was acquired (proceed with processing), false if already locked (duplicate).
 */
export function acquireSignalLock(channelId: string, messageId: string): boolean {
  const lockKey = `${channelId}:${messageId}`;

  if (processingLock.has(lockKey)) {
    console.log(`[Dedup] Lock hit — duplicate processing blocked: ${lockKey}`);
    return false;
  }

  processingLock.add(lockKey);

  // Auto-release after 60 seconds to prevent memory leaks
  setTimeout(() => {
    processingLock.delete(lockKey);
  }, 60_000);

  return true;
}

/**
 * Manually release a lock (call in finally block if needed).
 */
export function releaseSignalLock(channelId: string, messageId: string): void {
  processingLock.delete(`${channelId}:${messageId}`);
}

/**
 * Get the current number of active locks (for monitoring).
 */
export function getActiveLockCount(): number {
  return processingLock.size;
}
