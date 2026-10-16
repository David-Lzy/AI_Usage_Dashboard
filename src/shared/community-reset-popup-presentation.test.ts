import { beforeEach, describe, expect, it, vi } from "vitest";
import { emptyCommunityResetCache, normalizeCommunityResetStore, type CommunityResetCache, type CommunityResetEvent } from "./community-reset-feeds";
import { formatCommunityPopupDate, getCommunityResetPopupPresentation } from "./community-reset-popup-presentation";
import { getCommunityResetPopupCopy } from "./community-reset-popup-copy";
import { SUPPORTED_APP_LOCALES } from "./i18n";

const now = Date.parse("2026-10-14T05:40:00Z");
const capturedAt = new Date(now).toISOString();
const entry: CommunityResetEvent = { source: "codex-resets", id: "synthetic", kind: "reset", state: "unknown", announcedAt: "2026-10-13T05:06:00Z", scheduledFor: null,
  originalUrl: "https://x.com/i/web/status/2100000000000000001", traceable: true, summary: "Synthetic reset" };
const cache = (events: CommunityResetEvent[] = [entry]): CommunityResetCache => ({ ...emptyCommunityResetCache(), capturedAt, expiresAt: new Date(now + 600_000).toISOString(), fragment: { events, forecasts: [], generatedAt: capturedAt } });
function store() {
  const result = normalizeCommunityResetStore(undefined);
  result.preferences = { mode: "in_app", sources: ["codex-resets"] };
  result.caches = { status: cache(), resets: cache() };
  return result;
}

describe("Popup community presentation", () => {
  beforeEach(() => vi.useRealTimers());
  it("keeps one latest merged event and one attribution without changing source state", () => {
    const input = store(), before = JSON.stringify(input);
    const result = getCommunityResetPopupPresentation(input, now);
    expect(result.health).toBe("fresh"); expect(result.event?.entries).toHaveLength(1);
    expect(result.event?.entries[0].state).toBe("unknown"); expect(result.attributions).toHaveLength(1);
    expect(JSON.stringify(input)).toBe(before);
  });
  it("does not use a fresh forecast or unrelated status to freshen an old event", () => {
    const input = store(); input.preferences.sources = ["codex-reset"];
    input.caches = { timeline: { ...cache([{ ...entry, source: "codex-reset" }]), expiresAt: new Date(now - 1).toISOString() }, forecast: cache([]) };
    expect(getCommunityResetPopupPresentation(input, now).health).toBe("stale");
    input.preferences.sources = ["codex-resets"];
    input.caches = { status: cache([]), resets: { ...cache(), expiresAt: new Date(now - 1).toISOString() } };
    expect(getCommunityResetPopupPresentation(input, now).health).toBe("stale");
  });
  it("keeps permission, transport failure, partial sources and stale data distinct", () => {
    const input = store(); input.caches.status!.failure = "permission";
    expect(getCommunityResetPopupPresentation(input, now).health).toBe("permission");
    input.caches.status!.failure = "offline";
    expect(getCommunityResetPopupPresentation(input, now).health).toBe("partial");
    input.caches.resets!.failure = "timeout";
    expect(getCommunityResetPopupPresentation(input, now).health).toBe("unavailable");
    input.caches = {};
    expect(getCommunityResetPopupPresentation(input, now).health).toBe("unavailable");
    input.caches = { status: cache() };
    expect(getCommunityResetPopupPresentation(input, now).health).toBe("partial");
  });
  it("retains both conflicting attributions, including a failed non-event source", () => {
    const input = store(); input.preferences.sources.push("codex-reset");
    input.caches.timeline = cache([{ ...entry, source: "codex-reset", state: "reported" }]);
    let result = getCommunityResetPopupPresentation(input, now);
    expect(result.event?.conflict).toBe(true); expect(result.attributions).toHaveLength(2);
    input.caches.timeline = { ...emptyCommunityResetCache(), failure: "offline" };
    result = getCommunityResetPopupPresentation(input, now);
    expect(result.health).toBe("partial"); expect(result.attributions.map((source) => source.health)).toEqual(["fresh", "unavailable"]);
  });
  it("ignores a disabled source and forecasts never become events", () => {
    const input = store(); input.caches.status = cache([]); input.caches.resets = cache([]);
    input.caches.forecast = cache([{ ...entry, source: "codex-reset" }]);
    expect(getCommunityResetPopupPresentation(input, now).event).toBeNull();
    input.preferences.sources.push("codex-reset");
    expect(getCommunityResetPopupPresentation(input, now).event).toBeNull();
    input.preferences.mode = "off";
    expect(getCommunityResetPopupPresentation(input, now).event).toBeNull();
  });
  it("formats short UTC dates, adds a year across years and rejects invalid dates", () => {
    expect(formatCommunityPopupDate("2026-10-13T23:59:00Z", "en", now)).toBe("Oct 13");
    expect(formatCommunityPopupDate("2025-10-13T23:59:00Z", "en", now)).toContain("2025");
    expect(formatCommunityPopupDate("invalid", "en", now)).toBeNull();
  });
  it("has complete distinct event-kind and account-boundary copy in all 14 locales", () => {
    for (const locale of SUPPORTED_APP_LOCALES) {
      const copy = getCommunityResetPopupCopy(locale);
      expect(Object.values(copy).every((text) => text.trim().length > 0)).toBe(true);
      expect(new Set([copy.reset, copy.grant, copy.credits, copy.other]).size).toBe(4);
    }
  });
});
