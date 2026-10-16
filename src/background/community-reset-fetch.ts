import {
  COMMUNITY_RESET_ENDPOINTS, COMMUNITY_RESET_INTERVAL_MS, parseCommunityResetPayload,
  type CommunityResetCache, type CommunityResetEndpoint, communityTimestamp,
} from "../shared/community-reset-feeds";

export const COMMUNITY_RESET_MAX_BYTES = 512 * 1024;
export const COMMUNITY_RESET_TIMEOUT_MS = 8_000;
export type CommunityResetFetch = (url: string, init: RequestInit) => Promise<Response>;

function retryDelay(headers: Headers | null, now: number, failures: number): number {
  const raw = headers?.get("retry-after");
  const seconds = raw && /^\d+$/.test(raw) ? Number(raw) * 1000 : null;
  const date = raw && seconds === null ? Date.parse(raw) : NaN;
  const requested = seconds ?? (Number.isFinite(date) ? date - now : 0);
  return Math.max(COMMUNITY_RESET_INTERVAL_MS * 2 ** Math.min(failures, 4), Math.min(24 * 60 * 60_000, requested));
}
function expiry(headers: Headers, now: number): string {
  const maxAge = /(?:^|,)\s*max-age=(\d+)/i.exec(headers.get("cache-control") ?? "");
  const age = Number(headers.get("age") ?? "0");
  const ttl = Math.max(0, Math.min(300, maxAge ? Number(maxAge[1]) : 60) - (Number.isFinite(age) ? age : 0)) * 1000;
  const published = communityTimestamp(headers.get("x-published-expires-at"));
  return new Date(published ? Math.min(now + ttl, Date.parse(published)) : now + ttl).toISOString();
}
async function boundedBody(response: Response): Promise<unknown> {
  const length = Number(response.headers.get("content-length"));
  if (Number.isFinite(length) && length > COMMUNITY_RESET_MAX_BYTES) throw new Error("size");
  if (!response.body) throw new Error("body");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > COMMUNITY_RESET_MAX_BYTES) throw new Error("size");
      chunks.push(value);
    }
  } catch (error) { await reader.cancel().catch(() => undefined); throw error; }
  finally { reader.releaseLock(); }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)) as unknown;
}
export async function fetchCommunityResetEndpoint(
  endpoint: CommunityResetEndpoint, previous: CommunityResetCache, now: number,
  parentSignal: AbortSignal, fetcher: CommunityResetFetch = fetch,
): Promise<CommunityResetCache> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  parentSignal.addEventListener("abort", abort, { once: true });
  if (parentSignal.aborted) controller.abort();
  let timedOut = false;
  const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, COMMUNITY_RESET_TIMEOUT_MS);
  let received = false;
  const failed = (failure: CommunityResetCache["failure"], headers: Headers | null = null): CommunityResetCache => ({
    ...previous, checkedAt: new Date(now).toISOString(), failure, failures: Math.min(10, previous.failures + 1),
    retryAt: new Date(now + retryDelay(headers, now, previous.failures)).toISOString(),
  });
  try {
    const response = await fetcher(COMMUNITY_RESET_ENDPOINTS[endpoint].url, {
      method: "GET", credentials: "omit", referrerPolicy: "no-referrer", redirect: "error", cache: "no-store",
      headers: { Accept: "application/json", ...(previous.etag ? { "If-None-Match": previous.etag } : {}) },
      signal: controller.signal,
    });
    received = true;
    if (controller.signal.aborted) return failed(timedOut ? "timeout" : "offline");
    if (response.status === 304) return previous.fragment
      ? { ...previous, checkedAt: new Date(now).toISOString(), expiresAt: expiry(response.headers, now), failure: null, failures: 0, retryAt: null }
      : failed("invalid");
    if (!response.ok) return failed(response.status === 429 || response.status === 503 ? "rate_limited" : "http", response.headers);
    const fragment = parseCommunityResetPayload(endpoint, await boundedBody(response));
    if (!fragment) return failed("invalid");
    const published = communityTimestamp(response.headers.get("x-published-checked-at"));
    const generatedAt = published ?? fragment.generatedAt;
    const expiresAt = expiry(response.headers, now);
    if (generatedAt && (Date.parse(generatedAt) > now + 60_000 || now - Date.parse(generatedAt) > 10 * 60_000)
      || Date.parse(expiresAt) <= now) return failed("invalid");
    const etag = response.headers.get("etag");
    return { fragment, etag: etag && etag.length <= 160 && !/[\r\n]/.test(etag) ? etag : null,
      checkedAt: new Date(now).toISOString(), capturedAt: new Date(now).toISOString(), expiresAt,
      failure: null, failures: 0, retryAt: null };
  } catch {
    return failed(timedOut ? "timeout" : !received || controller.signal.aborted ? "offline" : "invalid");
  } finally { clearTimeout(timeout); parentSignal.removeEventListener("abort", abort); }
}
