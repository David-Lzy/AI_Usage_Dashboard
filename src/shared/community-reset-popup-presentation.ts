import {
  COMMUNITY_RESET_ENDPOINTS,
  isCommunityResetCacheFresh,
  mergeCommunityResetEvents,
  type CommunityResetCache,
  type CommunityResetMergedEvent,
  type CommunityResetSource,
  type CommunityResetStore,
} from "./community-reset-feeds";
import { APP_LOCALE_METADATA, type ResolvedAppLocale } from "./i18n";

export type CommunityPopupHealth = "fresh" | "stale" | "permission" | "unavailable" | "partial";
export type CommunityPopupSource = { source: CommunityResetSource; health: CommunityPopupHealth; capturedAt: string | null };
const EVENT_ENDPOINTS = ["status", "resets", "timeline"] as const;

function sourceView(store: CommunityResetStore, source: CommunityResetSource, event: CommunityResetMergedEvent | null, now: number): CommunityPopupSource {
  const caches = EVENT_ENDPOINTS.filter((key) => COMMUNITY_RESET_ENDPOINTS[key].source === source).map((key) => store.caches[key]);
  const present = caches.filter((cache): cache is CommunityResetCache => cache !== undefined);
  const entries = event?.entries.filter((entry) => entry.source === source) ?? [];
  // A newer forecast or unrelated endpoint must not freshen this event's evidence.
  const evidence = entries.length ? present.filter((cache) => cache.fragment?.events.some((item) => entries.some((entry) => entry.id === item.id && item.source === source))) : present;
  const capturedAt = evidence.flatMap((cache) => cache.capturedAt ? [cache.capturedAt] : []).sort().at(-1) ?? null;
  let health: CommunityPopupHealth;
  if (present.some((cache) => cache.failure === "permission")) health = "permission";
  else if (!present.some((cache) => cache.fragment !== null)) health = "unavailable";
  else if (present.every((cache) => cache.failure !== null)) health = "unavailable";
  else if (present.some((cache) => cache.failure !== null) || present.length !== caches.length) health = "partial";
  else if (!evidence.length || evidence.every((cache) => !isCommunityResetCacheFresh(cache, now)) || present.some((cache) => !isCommunityResetCacheFresh(cache, now))) health = "stale";
  else health = "fresh";
  return { source, health, capturedAt };
}

export function getCommunityResetPopupPresentation(store: CommunityResetStore, now: number) {
  const event = mergeCommunityResetEvents({ ...store, caches: {
    status: store.caches.status, resets: store.caches.resets, timeline: store.caches.timeline,
  } })[0] ?? null;
  const sources = store.preferences.sources.map((source) => sourceView(store, source, event, now));
  const health: CommunityPopupHealth = !sources.length || sources.every((source) => source.health === "unavailable") ? "unavailable"
    : sources.every((source) => source.health === "permission") ? "permission"
    : sources.some((source) => ["permission", "unavailable", "partial"].includes(source.health)) ? "partial"
    : sources.some((source) => source.health === "stale") ? "stale" : "fresh";
  const attributions = sources.filter((source) => !event || source.health !== "fresh" || event.entries.some((entry) => entry.source === source.source));
  return { event, sources, attributions, health };
}

export function formatCommunityPopupDate(value: string, locale: ResolvedAppLocale, now: number): string | null {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  return new Intl.DateTimeFormat(APP_LOCALE_METADATA[locale].intlLocale, {
    month: "short", day: "numeric", timeZone: "UTC",
    ...(date.getUTCFullYear() !== new Date(now).getUTCFullYear() ? { year: "numeric" as const } : {}),
  }).format(date);
}
