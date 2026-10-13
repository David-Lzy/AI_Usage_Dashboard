import { normalizeSnapshotTimestamp } from "./snapshot-freshness";

export const COMMUNITY_RESET_STORAGE_KEY = "ai-usage-dashboard.community-reset-feeds.v1";
export const COMMUNITY_RESET_ALARM = "ai-usage-dashboard.community-reset-feeds.v1";
export const COMMUNITY_RESET_INTERVAL_MS = 5 * 60_000;
export const COMMUNITY_RESET_SOURCES = ["codex-resets", "codex-reset"] as const;
export type CommunityResetSource = typeof COMMUNITY_RESET_SOURCES[number];
export type CommunityResetMode = "off" | "in_app" | "desktop";
export const COMMUNITY_RESET_CONFIG = {
  "codex-resets": { label: "codex-resets.com", url: "https://codex-resets.com/", origin: "https://codex-resets.com/*" },
  "codex-reset": { label: "codex-reset.com", url: "https://codex-reset.com/", origin: "https://codex-reset.com/*" },
} as const;
export const COMMUNITY_RESET_ENDPOINTS = {
  status: { source: "codex-resets", url: "https://codex-resets.com/api/v1/status" },
  resets: { source: "codex-resets", url: "https://codex-resets.com/api/v1/resets?limit=20" },
  timeline: { source: "codex-reset", url: "https://codex-reset.com/api/timeline" },
  forecast: { source: "codex-reset", url: "https://codex-reset.com/api/forecast" },
} as const;
export type CommunityResetEndpoint = keyof typeof COMMUNITY_RESET_ENDPOINTS;
export type CommunityResetPreferences = { mode: CommunityResetMode; sources: CommunityResetSource[] };
export type CommunityResetEvent = {
  source: CommunityResetSource;
  id: string;
  kind: "reset" | "grant" | "credits" | "other";
  state: "reported" | "scheduled" | "announced" | "unknown";
  announcedAt: string;
  scheduledFor: string | null;
  originalUrl: string | null;
  traceable: boolean;
  summary: string;
};
export type CommunityResetForecast = {
  source: CommunityResetSource;
  capturedAt: string;
  expiresAt: string | null;
  percent24h: number | null;
  percent48h: number | null;
  watchPercent: number | null;
  confidence: "low" | "medium" | "high" | "unknown";
  lastResetAt: string | null;
};
export type CommunityResetFragment = {
  events: CommunityResetEvent[];
  forecasts: CommunityResetForecast[];
  generatedAt: string | null;
};
export type CommunityResetCache = {
  fragment: CommunityResetFragment | null;
  etag: string | null;
  checkedAt: string | null;
  capturedAt: string | null;
  expiresAt: string | null;
  retryAt: string | null;
  failures: number;
  failure: "permission" | "offline" | "timeout" | "http" | "rate_limited" | "invalid" | null;
};
export type CommunityResetStore = {
  schemaVersion: 1;
  revision: number;
  preferences: CommunityResetPreferences;
  caches: Partial<Record<CommunityResetEndpoint, CommunityResetCache>>;
};
export type CommunityResetMergedEvent = {
  key: string;
  entries: CommunityResetEvent[];
  conflict: boolean;
};

export function communityRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
export function communityTimestamp(value: unknown): string | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(value)) return null;
  const day = value.slice(0, 10);
  const midnight = Date.parse(`${day}T00:00:00Z`);
  return Number.isFinite(midnight) && new Date(midnight).toISOString().startsWith(day)
    ? normalizeSnapshotTimestamp(value) : null;
}
function summary(value: unknown): string {
  return typeof value === "string" ? value.replace(/<[^>]*>/g, "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 360) : "";
}
function identifier(value: unknown): string | null {
  return typeof value === "string" && /^[A-Za-z0-9_-]{1,80}$/.test(value) ? value : null;
}
function percent(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100 ? value : null;
}
/** Canonical post identity is independent of host aliases, username and tracking parameters. */
export function canonicalCommunityOriginalUrl(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 1024) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (host === "x.com" || host === "twitter.com") {
      const match = /^\/(?:[A-Za-z0-9_]{1,30}|i\/web)\/status\/(\d{12,22})(?:\/)?$/.exec(url.pathname);
      return match ? `https://x.com/i/web/status/${match[1]}` : null;
    }
    if (host !== "openai.com" && host !== "help.openai.com") return null;
    return `https://${host}${url.pathname}`;
  } catch { return null; }
}
export function communityEventKey(event: CommunityResetEvent): string {
  return event.originalUrl ?? `${event.source}:${event.id}`;
}
export function createDefaultCommunityResetPreferences(): CommunityResetPreferences {
  return { mode: "off", sources: [...COMMUNITY_RESET_SOURCES] };
}
export function normalizeCommunityResetPreferences(value: unknown): CommunityResetPreferences {
  if (!communityRecord(value)) return createDefaultCommunityResetPreferences();
  const selected = value.sources;
  return {
    mode: value.mode === "in_app" || value.mode === "desktop" ? value.mode : "off",
    sources: Array.isArray(selected) ? COMMUNITY_RESET_SOURCES.filter((source) => selected.includes(source)) : [...COMMUNITY_RESET_SOURCES],
  };
}
function event(source: CommunityResetSource, value: unknown, kind: CommunityResetEvent["kind"], state: CommunityResetEvent["state"], observed = false): CommunityResetEvent | null {
  if (!communityRecord(value)) return null;
  const id = identifier(value.id), announcedAt = communityTimestamp(value.announced_at);
  if (!id || !announcedAt) return null;
  const rawSource = communityRecord(value.source) ? value.source : {};
  const originalUrl = canonicalCommunityOriginalUrl(source === "codex-resets" ? rawSource.url : value.url);
  return { source, id, kind, state, announcedAt,
    scheduledFor: state === "scheduled" ? communityTimestamp(value.scheduled_for) : null,
    originalUrl, traceable: originalUrl !== null && !observed,
    summary: summary(source === "codex-resets" ? value.text : value.summary) };
}
export function parseCommunityResetPayload(endpoint: CommunityResetEndpoint, payload: unknown): CommunityResetFragment | null {
  if (!communityRecord(payload)) return null;
  const events: CommunityResetEvent[] = [], forecasts: CommunityResetForecast[] = [];
  let generatedAt: string | null = null;
  if (endpoint === "status" || endpoint === "resets") {
    const meta = communityRecord(payload.meta) ? payload.meta : {};
    if (meta.api_version !== "v1" || !(generatedAt = communityTimestamp(meta.generated_at))) return null;
    const data = endpoint === "status" && communityRecord(payload.data) ? payload.data : null;
    if (endpoint === "status" && !data || endpoint === "resets" && !Array.isArray(payload.data)) return null;
    const rows = endpoint === "resets" ? (payload.data as unknown[]).slice(0, 100) : [data?.latest_reset, data?.scheduled_reset];
    for (const row of rows) {
      if (!communityRecord(row) || row.reset_type !== "regular" && row.reset_type !== "banked") continue;
      const source = communityRecord(row.source) ? row.source : {};
      if (source.type !== "x_post" && source.type !== "observed") continue;
      const state = row.status === "scheduled" ? "scheduled" : row.status === undefined ? "reported" : "unknown";
      const item = event("codex-resets", row, row.reset_type === "banked" ? "grant" : "reset", state,
        source.type === "observed" || source.author !== "thsottiaux");
      if (item) events.push(item);
    }
    const watch = data && communityRecord(data.active_watch) ? data.active_watch : null;
    if (watch && communityTimestamp(watch.observed_at)) forecasts.push({
      source: "codex-resets", capturedAt: communityTimestamp(watch.observed_at)!, expiresAt: communityTimestamp(watch.expires_at),
      watchPercent: percent(watch.reset_chance_percent), percent24h: null, percent48h: null,
      confidence: "unknown", lastResetAt: null,
    });
  } else if (endpoint === "timeline") {
    if (!Array.isArray(payload.events)) return null;
    for (const row of payload.events.slice(0, 100)) {
      if (!communityRecord(row)) continue;
      const banked = row.group === "credits" && typeof row.banked_state === "string" && ["announced", "arriving", "available", "unknown"].includes(row.banked_state);
      const kind = row.group === "reset" ? "reset" : banked ? "grant" : row.group === "credits" ? "credits" : "other";
      const state = kind === "reset" && row.announcement_state === "announced" || banked && row.banked_state === "available" ? "reported"
        : banked && (row.banked_state === "announced" || row.banked_state === "arriving") ? "announced" : "unknown";
      const item = event("codex-reset", row, kind, state);
      if (item) events.push(item);
    }
  } else {
    const probabilities = communityRecord(payload.probabilities) ? payload.probabilities : {};
    const capturedAt = communityTimestamp(payload.updated_at);
    if (!capturedAt) return null;
    generatedAt = capturedAt;
    forecasts.push({ source: "codex-reset", capturedAt, expiresAt: null,
      percent24h: percent(probabilities.rounded_24h), percent48h: percent(probabilities.rounded_48h), watchPercent: null,
      confidence: payload.confidence === "low" || payload.confidence === "medium" || payload.confidence === "high" ? payload.confidence : "unknown",
      lastResetAt: communityTimestamp(payload.last_reset_at) });
  }
  return { events, forecasts, generatedAt };
}

function normalizeFragment(value: unknown, source: CommunityResetSource): CommunityResetFragment | null {
  if (!communityRecord(value) || !Array.isArray(value.events) || !Array.isArray(value.forecasts)) return null;
  const events = value.events.slice(0, 100).flatMap((raw) => {
    if (!communityRecord(raw) || !identifier(raw.id) || !communityTimestamp(raw.announcedAt)
      || typeof raw.kind !== "string" || !["reset", "grant", "credits", "other"].includes(raw.kind)
      || typeof raw.state !== "string" || !["reported", "scheduled", "announced", "unknown"].includes(raw.state)) return [];
    const originalUrl = canonicalCommunityOriginalUrl(raw.originalUrl);
    return [{ source, id: raw.id as string, announcedAt: communityTimestamp(raw.announcedAt)!, kind: raw.kind as CommunityResetEvent["kind"],
      state: raw.state as CommunityResetEvent["state"], scheduledFor: communityTimestamp(raw.scheduledFor), originalUrl,
      traceable: originalUrl !== null && raw.traceable === true, summary: summary(raw.summary) }];
  });
  const forecasts: CommunityResetForecast[] = value.forecasts.slice(0, 2).flatMap((raw): CommunityResetForecast[] => {
    if (!communityRecord(raw) || !communityTimestamp(raw.capturedAt)) return [];
    return [{ source, capturedAt: communityTimestamp(raw.capturedAt)!, expiresAt: communityTimestamp(raw.expiresAt),
      percent24h: percent(raw.percent24h), percent48h: percent(raw.percent48h), watchPercent: percent(raw.watchPercent),
      confidence: raw.confidence === "low" || raw.confidence === "medium" || raw.confidence === "high" ? raw.confidence : "unknown",
      lastResetAt: communityTimestamp(raw.lastResetAt) }];
  });
  return { events, forecasts, generatedAt: communityTimestamp(value.generatedAt) };
}
export function emptyCommunityResetCache(): CommunityResetCache {
  return { fragment: null, etag: null, checkedAt: null, capturedAt: null, expiresAt: null, retryAt: null, failures: 0, failure: null };
}
export function normalizeCommunityResetStore(value: unknown): CommunityResetStore {
  const raw = communityRecord(value) && value.schemaVersion === 1 ? value : {};
  const caches: CommunityResetStore["caches"] = {};
  if (communityRecord(raw.caches)) for (const endpoint of Object.keys(COMMUNITY_RESET_ENDPOINTS) as CommunityResetEndpoint[]) {
    const cache = raw.caches[endpoint];
    if (!communityRecord(cache)) continue;
    caches[endpoint] = { fragment: normalizeFragment(cache.fragment, COMMUNITY_RESET_ENDPOINTS[endpoint].source),
      etag: typeof cache.etag === "string" && cache.etag.length <= 160 && !/[\r\n]/.test(cache.etag) ? cache.etag : null,
      checkedAt: communityTimestamp(cache.checkedAt), capturedAt: communityTimestamp(cache.capturedAt),
      expiresAt: communityTimestamp(cache.expiresAt), retryAt: communityTimestamp(cache.retryAt),
      failures: typeof cache.failures === "number" && Number.isSafeInteger(cache.failures) ? Math.max(0, Math.min(10, cache.failures)) : 0,
      failure: typeof cache.failure === "string" && ["permission", "offline", "timeout", "http", "rate_limited", "invalid"].includes(cache.failure) ? cache.failure as CommunityResetCache["failure"] : null };
  }
  return { schemaVersion: 1, revision: typeof raw.revision === "number" && Number.isSafeInteger(raw.revision) && raw.revision >= 0 ? raw.revision : 0,
    preferences: normalizeCommunityResetPreferences(raw.preferences), caches };
}
export function isCommunityResetCacheFresh(cache: CommunityResetCache, now: number): boolean {
  return cache.fragment !== null && cache.failure === null && cache.capturedAt !== null
    && Date.parse(cache.capturedAt) <= now + 60_000 && cache.expiresAt !== null && Date.parse(cache.expiresAt) > now;
}
export function mergeCommunityResetEvents(store: CommunityResetStore): CommunityResetMergedEvent[] {
  if (store.preferences.mode === "off") return [];
  const grouped = new Map<string, CommunityResetEvent[]>();
  for (const [endpoint, cache] of Object.entries(store.caches)) {
    if (!store.preferences.sources.includes(COMMUNITY_RESET_ENDPOINTS[endpoint as CommunityResetEndpoint].source)) continue;
    for (const event of cache?.fragment?.events ?? []) {
      const key = communityEventKey(event), entries = grouped.get(key) ?? [];
      if (!entries.some((entry) => JSON.stringify(entry) === JSON.stringify(event))) entries.push(event);
      grouped.set(key, entries);
    }
  }
  return [...grouped].map(([key, entries]) => ({ key, entries,
    conflict: new Set(entries.map((entry) => `${entry.kind}:${entry.state}`)).size > 1 }))
    .sort((a, b) => Math.max(...b.entries.map((entry) => Date.parse(entry.announcedAt))) - Math.max(...a.entries.map((entry) => Date.parse(entry.announcedAt))))
    .slice(0, 100);
}
