import fetch, { RequestInit, Response } from "node-fetch";

export interface RetryOptions {
  /** Max total attempts (default 3) */
  attempts?: number;
  /** Initial backoff in ms, doubles each retry (default 500) */
  baseDelayMs?: number;
  /** Per-request timeout in ms (default 15 000) */
  timeoutMs?: number;
  /** HTTP status codes that should NOT be retried (default: 400–499) */
  noRetryStatuses?: number[];
}

const DEFAULT_NO_RETRY = [400, 401, 403, 404, 422];

export async function fetchWithRetry(
  url: string,
  init: RequestInit = {},
  options: RetryOptions = {},
): Promise<Response> {
  const {
    attempts = 3,
    baseDelayMs = 500,
    timeoutMs = 15_000,
    noRetryStatuses = DEFAULT_NO_RETRY,
  } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        ...init,
        signal: controller.signal as any,
      });

      // Don't retry on client errors (bad request, auth, etc.)
      if (!res.ok && noRetryStatuses.includes(res.status)) {
        return res;
      }

      if (res.ok || attempt === attempts) return res;

      lastError = new Error(`HTTP ${res.status}`);
    } catch (err: unknown) {
      lastError = err;
      // AbortError = timeout — still retriable
    } finally {
      clearTimeout(timer);
    }

    if (attempt < attempts) {
      await sleep(baseDelayMs * 2 ** (attempt - 1));
    }
  }

  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}