import type { AppState, ProviderId } from "../providers/types";
import { isProviderId } from "../providers/provider-definitions";
import { getActiveProviderAccountId } from "./provider-accounts";
import { MAX_NOTIFICATION_CAPTURE_AGE_MS } from "./quota-notifications";
import type { CodexResetCapture } from "./codex-reset-capture";
import {
  COMMUNITY_RESET_ENDPOINTS, COMMUNITY_RESET_SOURCES, communityEventKey, communityRecord, communityTimestamp,
  isCommunityResetCacheFresh, mergeCommunityResetEvents,
  type CommunityResetEndpoint, type CommunityResetSource, type CommunityResetStore,
} from "./community-reset-feeds";

export const RESET_NOTIFICATION_STORAGE_KEY = "ai-usage-dashboard.reset-notifications.v1";
export type ResetNotificationPreferences = { communityPaused: boolean; accountPaused: boolean; grantAccountKeys: string[] };
export type ResetNotificationChange =
  | { type: "community-paused" | "account-paused"; value: boolean }
  | { type: "account-grants"; accountKey: string; value: boolean };
type CreditBaseline = { identity: string; capturedAt: string; availableCount: number | null };
export type ResetNotificationTarget = { kind: "community"; source: CommunityResetSource } | { kind: "account"; providerId: ProviderId; accountKey: string };
export type ResetNotificationStore = {
  schemaVersion: 1;
  preferences: ResetNotificationPreferences;
  community: { configuration: string | null; ready: CommunityResetEndpoint[]; seen: Record<string, { notified: boolean; seenAt: string }> };
  grants: Record<string, CreditBaseline>;
  clicks: Record<string, { target: ResetNotificationTarget; createdAt: string }>;
};
export type ResetNotificationEvent =
  | { kind: "community_report"; keys: string[]; types: ("reset" | "grant")[]; sources: CommunityResetSource[]; target: ResetNotificationTarget }
  | { kind: "account_grant"; accountKey: string; identity: string; capturedAt: string; target: ResetNotificationTarget };

export function normalizeResetNotificationStore(value: unknown): ResetNotificationStore {
  const raw = communityRecord(value) && value.schemaVersion === 1 ? value : {};
  const preferences = communityRecord(raw.preferences) ? raw.preferences : {};
  const community = communityRecord(raw.community) ? raw.community : {};
  const seen: ResetNotificationStore["community"]["seen"] = {};
  if (communityRecord(community.seen)) for (const [key, entry] of Object.entries(community.seen).slice(0, 300)) {
    if (key.length > 1024 || !communityRecord(entry) || !communityTimestamp(entry.seenAt)) continue;
    seen[key] = { notified: entry.notified === true, seenAt: communityTimestamp(entry.seenAt)! };
  }
  const grants: ResetNotificationStore["grants"] = {};
  if (communityRecord(raw.grants)) for (const [key, entry] of Object.entries(raw.grants).slice(0, 64)) {
    if (!validAccountKey(key) || !communityRecord(entry) || typeof entry.identity !== "string" || !/^[a-f0-9]{64}$/.test(entry.identity)
      || !communityTimestamp(entry.capturedAt) || entry.availableCount !== null && (!Number.isSafeInteger(entry.availableCount) || Number(entry.availableCount) < 0)) continue;
    grants[key] = { identity: entry.identity, capturedAt: communityTimestamp(entry.capturedAt)!, availableCount: entry.availableCount as number | null };
  }
  const clicks: ResetNotificationStore["clicks"] = {};
  if (communityRecord(raw.clicks)) for (const [id, entry] of Object.entries(raw.clicks).slice(0, 64)) {
    if (!/^(?:ai-usage-reset|ai-usage-dashboard-quota)-[a-f0-9-]{36}$/.test(id) || !communityRecord(entry) || !communityTimestamp(entry.createdAt)) continue;
    const target = normalizeResetNotificationTarget(entry.target);
    if (target) clicks[id] = { target, createdAt: communityTimestamp(entry.createdAt)! };
  }
  const ready = community.ready;
  return { schemaVersion: 1,
    preferences: { communityPaused: preferences.communityPaused === true, accountPaused: preferences.accountPaused === true,
      grantAccountKeys: Array.isArray(preferences.grantAccountKeys) ? [...new Set(preferences.grantAccountKeys.filter(validAccountKey))].slice(0, 64) : [] },
    community: { configuration: typeof community.configuration === "string" && community.configuration.length <= 512 ? community.configuration : null,
      ready: Array.isArray(ready) ? (Object.keys(COMMUNITY_RESET_ENDPOINTS) as CommunityResetEndpoint[]).filter((key) => ready.includes(key)) : [], seen }, grants, clicks };
}
function validAccountKey(key: unknown): key is string {
  if (typeof key !== "string" || key.length > 256) return false;
  try { const parts: unknown = JSON.parse(key); return Array.isArray(parts) && parts.length === 2 && parts[0] === "codex-personal-page" && typeof parts[1] === "string"; }
  catch { return false; }
}
export function normalizeResetNotificationTarget(value: unknown): ResetNotificationTarget | null {
  if (!communityRecord(value)) return null;
  if (value.kind === "community" && (value.source === "codex-reset" || value.source === "codex-resets")) return { kind: "community", source: value.source };
  if (value.kind !== "account" || !isProviderId(value.providerId) || typeof value.accountKey !== "string" || value.accountKey.length > 256) return null;
  try {
    const parts: unknown = JSON.parse(value.accountKey);
    if (Array.isArray(parts) && parts.length === 2 && parts[0] === value.providerId && typeof parts[1] === "string") {
      return { kind: "account", providerId: value.providerId, accountKey: value.accountKey };
    }
  } catch { /* Malformed local aliases are not click targets. */ }
  return null;
}
export function applyResetNotificationChange(store: ResetNotificationStore, change: ResetNotificationChange): ResetNotificationStore {
  const next = structuredClone(store);
  if (change.type === "community-paused") { next.preferences.communityPaused = change.value === true; next.community.configuration = null; }
  if (change.type === "account-paused") { next.preferences.accountPaused = change.value === true; next.grants = {}; }
  if (change.type === "account-grants" && validAccountKey(change.accountKey)) {
    next.preferences.grantAccountKeys = change.value ? [...new Set([...next.preferences.grantAccountKeys, change.accountKey])].slice(0, 64)
      : next.preferences.grantAccountKeys.filter((key) => key !== change.accountKey);
    delete next.grants[change.accountKey];
  }
  return next;
}
function eligibleCommunityKeys(feed: CommunityResetStore, now: number, endpoints: CommunityResetEndpoint[]): Set<string> {
  const readyKeys = new Set<string>();
  for (const endpoint of endpoints) {
    const cache = feed.caches[endpoint];
    if (cache && isCommunityResetCacheFresh(cache, now)) for (const entry of cache.fragment!.events) {
      if (entry.state === "reported" && entry.traceable) readyKeys.add(communityEventKey(entry));
    }
  }
  return new Set(mergeCommunityResetEvents(feed).filter((event) => !event.conflict && readyKeys.has(event.key)
    && event.entries.some((entry) => entry.traceable && entry.state === "reported" && (entry.kind === "reset" || entry.kind === "grant")
      && Date.parse(entry.announcedAt) <= now && now - Date.parse(entry.announcedAt) <= 24 * 60 * 60_000)).map((event) => event.key));
}
export function readCurrentCreditObservation(state: AppState, capture: CodexResetCapture | null, now: number): CreditBaseline & { accountKey: string } | null {
  const snapshot = state.providers.find((provider) => provider.providerId === "codex-personal-page");
  const setting = state.providerSettings.find((provider) => provider.id === "codex-personal-page");
  const key = JSON.stringify(["codex-personal-page", getActiveProviderAccountId(state, "codex-personal-page")]);
  if (!capture || capture.accountKey !== key || !setting?.displayEnabled
    || snapshot?.syncSource !== "local_companion" || snapshot.syncStatus !== "ok" || !snapshot.codexLocal?.accountVerified
    || snapshot.lastSuccessAt !== capture.capturedAt || !communityTimestamp(capture.capturedAt)) return null;
  const time = Date.parse(capture.capturedAt);
  if (time > now || now - time > MAX_NOTIFICATION_CAPTURE_AGE_MS || snapshot.lastAttemptAt && Date.parse(snapshot.lastAttemptAt) > time) return null;
  const credits = snapshot.usageInsights?.resetCredits;
  const availableCount = credits && credits.source === "local_companion" && credits.accountVerified && credits.capturedAt === capture.capturedAt
    ? credits.availableCount : snapshot.codexLocal.availableResetCount;
  if (availableCount !== null && (!Number.isSafeInteger(availableCount) || availableCount < 0)) return null;
  return { accountKey: key, identity: capture.identity, capturedAt: capture.capturedAt, availableCount };
}
export function evaluateResetNotifications(state: AppState, feed: CommunityResetStore, store: ResetNotificationStore,
  capture: CodexResetCapture | null, now = Date.now(), permission = true): { store: ResetNotificationStore; events: ResetNotificationEvent[] } {
  const next = structuredClone(store), events: ResetNotificationEvent[] = [];
  const configuration = JSON.stringify([feed.revision, feed.preferences, store.preferences.communityPaused, permission]);
  const enabled = permission && feed.preferences.mode === "desktop" && !store.preferences.communityPaused;
  if (next.community.configuration !== configuration || !enabled) next.community = { configuration: enabled ? configuration : null, ready: [], seen: {} };
  if (enabled) {
    const freshEndpoints = (Object.keys(COMMUNITY_RESET_ENDPOINTS) as CommunityResetEndpoint[]).filter((endpoint) => {
      const cache = feed.caches[endpoint];
      return endpoint !== "forecast" && feed.preferences.sources.includes(COMMUNITY_RESET_ENDPOINTS[endpoint].source)
        && cache && isCommunityResetCacheFresh(cache, now);
    });
    const previouslyReady = [...next.community.ready];
    const eligible = eligibleCommunityKeys(feed, now, previouslyReady);
    const newlyReadReports = new Set<string>();
    for (const endpoint of freshEndpoints.filter((key) => !previouslyReady.includes(key))) {
      for (const entry of feed.caches[endpoint]!.fragment!.events) if (entry.state === "reported") newlyReadReports.add(communityEventKey(entry));
    }
    const merged = mergeCommunityResetEvents(feed);
    const keys: string[] = [], types = new Set<"reset" | "grant">(), sources = new Set<CommunityResetSource>();
    for (const event of merged) {
      const previous = next.community.seen[event.key];
      const notified = previous?.notified === true || newlyReadReports.has(event.key);
      if (!notified && eligible.has(event.key)) {
        keys.push(event.key);
        for (const entry of event.entries) {
          if (entry.kind === "reset" || entry.kind === "grant") types.add(entry.kind);
          sources.add(entry.source);
        }
      }
      next.community.seen[event.key] = { notified: notified || keys.includes(event.key), seenAt: new Date(now).toISOString() };
    }
    next.community.ready = [...new Set([...previouslyReady, ...freshEndpoints])];
    next.community.seen = Object.fromEntries(Object.entries(next.community.seen).filter(([, entry]) => now - Date.parse(entry.seenAt) <= 30 * 24 * 60 * 60_000)
      .sort((a, b) => b[1].seenAt.localeCompare(a[1].seenAt)).slice(0, 300));
    if (keys.length) events.push({ kind: "community_report", keys, types: [...types], sources: [...sources], target: { kind: "community", source: [...sources][0]! } });
  }
  const observation = readCurrentCreditObservation(state, capture, now);
  if (!permission || next.preferences.accountPaused || !observation || !next.preferences.grantAccountKeys.includes(observation.accountKey)) next.grants = {};
  else {
    const previous = next.grants[observation.accountKey];
    next.grants = { [observation.accountKey]: { identity: observation.identity, capturedAt: observation.capturedAt, availableCount: observation.availableCount } };
    if (previous && previous.identity === observation.identity && Date.parse(observation.capturedAt) > Date.parse(previous.capturedAt)
      && now - Date.parse(previous.capturedAt) <= MAX_NOTIFICATION_CAPTURE_AGE_MS
      && previous.availableCount !== null && observation.availableCount !== null && observation.availableCount > previous.availableCount) {
      events.push({ kind: "account_grant", accountKey: observation.accountKey, identity: observation.identity, capturedAt: observation.capturedAt,
        target: { kind: "account", providerId: "codex-personal-page", accountKey: observation.accountKey } });
    }
  }
  next.clicks = Object.fromEntries(Object.entries(next.clicks).filter(([, entry]) => now - Date.parse(entry.createdAt) <= 24 * 60 * 60_000));
  return { store: next, events };
}
export function isResetNotificationCurrent(event: ResetNotificationEvent, state: AppState, feed: CommunityResetStore,
  store: ResetNotificationStore, capture: CodexResetCapture | null, now: number): boolean {
  if (event.kind === "community_report") {
    const current = eligibleCommunityKeys(feed, now, store.community.ready);
    return feed.preferences.mode === "desktop" && !store.preferences.communityPaused && event.keys.every((key) => current.has(key))
      && store.community.configuration === JSON.stringify([feed.revision, feed.preferences, store.preferences.communityPaused, true])
      && event.sources.every((source) => feed.preferences.sources.includes(source));
  }
  const observation = readCurrentCreditObservation(state, capture, now);
  return !store.preferences.accountPaused && store.preferences.grantAccountKeys.includes(event.accountKey)
    && observation?.identity === event.identity && observation.capturedAt === event.capturedAt;
}
