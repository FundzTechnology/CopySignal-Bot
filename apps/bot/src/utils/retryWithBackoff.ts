/**
 * Retry with Exponential Backoff
 * Wraps any async function with retry logic.
 * Skips retries on permanent errors that won't resolve.
 */

const PERMANENT_ERRORS = [
  'insufficient balance',
  'insufficient margin',
  'invalid symbol',
  'invalid api key',
  'invalid api-key',
  'api key expired',
  'permission denied',
  'order not found',
  'position not found',
  'account has been banned',
];

export async function executeWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 1000,
  label = 'operation'
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const message = (err.message || '').toLowerCase();

      // Do not retry on permanent errors — they will never resolve with a retry
      if (PERMANENT_ERRORS.some(e => message.includes(e))) {
        console.error(`[Retry] Permanent error on ${label} — not retrying: ${err.message}`);
        throw err;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelayMs * Math.pow(2, attempt);
      console.warn(`[Retry] ${label} — attempt ${attempt + 1}/${maxRetries} failed, retrying in ${delay}ms: ${err.message}`);
      await new Promise(r => setTimeout(r, delay));
    }
  }

  console.error(`[Retry] ${label} — all ${maxRetries} attempts exhausted`);
  throw lastError;
}
