import { describe, expect, it } from "vitest";
import { DEFAULT_APP_STATE } from "./constants";
import { evaluateResetNotifications, normalizeResetNotificationStore, applyResetNotificationChange, isResetNotificationCurrent, type ResetNotificationStore } from "./reset-notifications";
import { normalizeCommunityResetStore, emptyCommunityResetCache, parseCommunityResetPayload, type CommunityResetStore } from "./community-reset-feeds";
import type { AppState } from "../providers/types";
import type { CodexResetCapture } from "./codex-reset-capture";

const now = Date.parse("2026-10-13T06:00:00Z"), at = (delta = 0) => new Date(now + delta).toISOString();
const accountKey = JSON.stringify(["codex-personal-page", "default"]);
const post = (id = "2100000000000000001") => `https://x.com/thsottiaux/status/${id}`;
const entry = (state: "scheduled" | "reported", id = "2100000000000000001") => ({
  id, reset_type: "regular", announced_at: at(-60_000), text: "Synthetic report", ...(state === "scheduled" ? { status: "scheduled", scheduled_for: at(-1000) } : {}),
  source: { type: "x_post", author: "thsottiaux", url: post(id) },
});
function feed(state: "scheduled" | "reported" = "reported", id = "2100000000000000001"): CommunityResetStore {
  const next = normalizeCommunityResetStore(undefined);
  next.preferences = { mode: "desktop", sources: ["codex-resets"] };
  next.caches.status = { ...emptyCommunityResetCache(), capturedAt: at(), checkedAt: at(), expiresAt: at(60_000),
    fragment: parseCommunityResetPayload("status", { meta: { api_version: "v1", generated_at: at() }, data: { latest_reset: state === "reported" ? entry(state, id) : null,
      scheduled_reset: state === "scheduled" ? entry(state, id) : null, active_watch: null } }) };
  return next;
}
function account(count: number | null, delta = 0, identity = "a".repeat(64)): { state: AppState; capture: CodexResetCapture } {
  return { state: { ...DEFAULT_APP_STATE, providerSettings: DEFAULT_APP_STATE.providerSettings.map((setting) => setting.id === "codex-personal-page" ? { ...setting, displayEnabled: true, status: "granted" } : setting),
    providers: DEFAULT_APP_STATE.providers.map((provider) => provider.providerId === "codex-personal-page" ? { ...provider,
      syncStatus: "ok", syncSource: "local_companion", lastSuccessAt: at(delta), lastAttemptAt: at(delta),
      codexLocal: { accountVerified: true, availableResetCount: count, estimates: [] } } : provider) },
    capture: { accountKey, identity, pairingTag: "b".repeat(64), capturedAt: at(delta) } };
}
const evaluate = (feeds: CommunityResetStore, store: ResetNotificationStore, time = now) =>
  evaluateResetNotifications(DEFAULT_APP_STATE, feeds, store, null, time);
describe("reset notification evidence and baseline", () => {
  it("defaults new subscriptions off and never modifies legacy quota choices", () => {
    const store = normalizeResetNotificationStore(undefined);
    expect(store.preferences).toEqual({ communityPaused: false, accountPaused: false, grantAccountKeys: [] });
    const off = feed(); off.preferences.mode = "off";
    expect(evaluate(off, store).events).toEqual([]);
    expect(DEFAULT_APP_STATE.settings.warningThresholdPercent).toBe(80);
  });
  it("first enable is silent, a new executed post notifies once across restart", () => {
    const baseline = evaluate(feed(), normalizeResetNotificationStore(undefined));
    expect(baseline.events).toEqual([]);
    const nextFeed = feed("reported", "2100000000000000002");
    const next = evaluate(nextFeed, normalizeResetNotificationStore(baseline.store));
    expect(next.events).toMatchObject([{ kind: "community_report", types: ["reset"] }]);
    expect(evaluate(nextFeed, normalizeResetNotificationStore(next.store)).events).toEqual([]);
  });
  it("scheduled-to-executed is eligible but elapsed time or forecast changes alone are not", () => {
    const baseline = evaluate(feed("scheduled"), normalizeResetNotificationStore(undefined));
    expect(evaluate(feed("scheduled"), baseline.store).events).toEqual([]);
    expect(evaluate(feed("reported"), baseline.store).events).toHaveLength(1);
    const onlyForecast = normalizeCommunityResetStore(undefined); onlyForecast.preferences.mode = "desktop";
    onlyForecast.caches.forecast = { ...emptyCommunityResetCache(), fragment: parseCommunityResetPayload("forecast", { updated_at: at(), probabilities: { rounded_24h: 100, rounded_48h: 100 } }) };
    expect(evaluate(onlyForecast, baseline.store).events).toEqual([]);
  });
  it("duplicate sources yield one summary and conflict/untraceable/stale rows stay silent", () => {
    const baseline = evaluate(feed("scheduled"), normalizeResetNotificationStore(undefined)).store;
    const next = feed(); next.preferences.sources = ["codex-resets", "codex-reset"];
    next.caches.timeline = { ...next.caches.status!, fragment: parseCommunityResetPayload("timeline", { events: [{ id: "same", announced_at: at(-60_000), group: "reset", type: "reset", announcement_state: "announced", summary: "Synthetic", url: post() }] }) };
    // Changing selected sources establishes a baseline, then a subsequent lifecycle transition remains single.
    const first = evaluate(next, baseline);
    expect(first.events).toEqual([]);
    const newer = feed("reported", "2100000000000000002"); newer.preferences.sources = next.preferences.sources;
    newer.caches.timeline = next.caches.timeline;
    expect(evaluate(newer, first.store).events).toHaveLength(1);
    next.caches.timeline!.fragment!.events[0].state = "unknown";
    const ready: ResetNotificationStore = { ...baseline, community: { ...baseline.community, configuration: JSON.stringify([next.revision, next.preferences, false, true]), ready: ["status", "timeline"] } };
    expect(evaluate(next, ready).events).toEqual([]);
    const untraceable = feed(); untraceable.caches.status!.fragment!.events[0].traceable = false;
    expect(evaluate(untraceable, baseline).events).toEqual([]);
    const stale = feed(); stale.caches.status!.expiresAt = at(-1);
    expect(evaluate(stale, baseline).events).toEqual([]);
  });
  it("source first read after an outage is a silent baseline, not historical catch-up", () => {
    const cold = feed(); cold.caches.status!.failure = "offline";
    const initial = evaluate(cold, normalizeResetNotificationStore(undefined));
    expect(initial.events).toEqual([]);
    expect(evaluate(feed(), initial.store).events).toEqual([]);
  });
  it("historical announcements cannot notify or make a first status read a false execution transition", () => {
    const next = normalizeCommunityResetStore(undefined); next.preferences = { mode: "desktop", sources: ["codex-resets"] };
    next.caches.resets = { ...feed().caches.status!, fragment: parseCommunityResetPayload("resets", {
      meta: { api_version: "v1", generated_at: at() }, data: [entry("reported")],
    }) };
    const baseline = evaluate(next, normalizeResetNotificationStore(undefined));
    expect(baseline.events).toEqual([]);
    next.caches.status = feed().caches.status;
    const firstStatus = evaluate(next, baseline.store);
    expect(firstStatus.events).toEqual([]);
    expect(evaluate(next, firstStatus.store).events).toEqual([]);
  });
  it("old configuration revisions invalidate a late notification after off/on", () => {
    const next = feed(), baseline = evaluate(feed("scheduled"), normalizeResetNotificationStore(undefined));
    const result = evaluate(next, baseline.store), event = result.events[0]!;
    expect(isResetNotificationCurrent(event, DEFAULT_APP_STATE, next, result.store, null, now)).toBe(true);
    next.revision += 2;
    expect(isResetNotificationCurrent(event, DEFAULT_APP_STATE, next, result.store, null, now)).toBe(false);
  });
  it("recovery groups recent reports into one, ignores older than 24h, and pause/resume resets baseline", () => {
    const baseline = evaluate(feed("scheduled"), normalizeResetNotificationStore(undefined)).store;
    const next = feed(); next.caches.status!.fragment!.events.push({ ...next.caches.status!.fragment!.events[0], id: "2100000000000000002", originalUrl: "https://x.com/i/web/status/2100000000000000002" });
    expect(evaluate(next, baseline).events).toHaveLength(1);
    next.caches.status!.fragment!.events.forEach((event) => { event.announcedAt = at(-25 * 3600_000); });
    expect(evaluate(next, baseline).events).toEqual([]);
    const paused = applyResetNotificationChange(baseline, { type: "community-paused", value: true });
    expect(evaluate(feed(), paused).events).toEqual([]);
    const resumed = applyResetNotificationChange(paused, { type: "community-paused", value: false });
    expect(evaluate(feed(), resumed).events).toEqual([]);
  });
  it("known zero to increased authoritative count notifies; unknown, account switch or expired captures do not", () => {
    const initialStore = applyResetNotificationChange(normalizeResetNotificationStore(undefined), { type: "account-grants", accountKey, value: true });
    const zero = account(0), two = account(2, 60_000);
    const first = evaluateResetNotifications(zero.state, feed(), initialStore, zero.capture, now).store;
    expect(evaluateResetNotifications(two.state, feed(), first, two.capture, now + 60_000).events).toMatchObject([{ kind: "account_grant" }]);
    const unknown = account(null);
    const unobserved = evaluateResetNotifications(unknown.state, feed(), initialStore, unknown.capture, now).store;
    expect(evaluateResetNotifications(two.state, feed(), unobserved, two.capture, now + 60_000).events).toEqual([]);
    const switched = account(2, 60_000, "c".repeat(64));
    expect(evaluateResetNotifications(switched.state, feed(), first, switched.capture, now + 60_000).events).toEqual([]);
    expect(evaluateResetNotifications(two.state, feed(), first, two.capture, now + 3600_000).events).toEqual([]);
  });
  it("ambiguous usage drops, unverified account and capped offer rows do not invent grants or early resets", () => {
    const optIn = applyResetNotificationChange(normalizeResetNotificationStore(undefined), { type: "account-grants", accountKey, value: true });
    const initial = account(0), current = account(0, 60_000);
    const baseline = evaluateResetNotifications(initial.state, feed(), optIn, initial.capture, now).store;
    current.state.providers.find((provider) => provider.providerId === "codex-personal-page")!.used = 0;
    expect(evaluateResetNotifications(current.state, feed(), baseline, current.capture, now + 60_000).events).toEqual([]);
    const capped = account(null, 60_000);
    capped.state.providers.find((provider) => provider.providerId === "codex-personal-page")!.usageInsights = { resetCredits: {
      source: "local_companion", accountVerified: true, capturedAt: at(60_000), availableCount: null, detailsComplete: null,
      offers: Array.from({ length: 32 }, () => ({ kind: "codex", available: true, expiresAt: at(3600_000) })),
    } };
    expect(evaluateResetNotifications(capped.state, feed(), baseline, capped.capture, now + 60_000).events).toEqual([]);
    current.state.providers.find((provider) => provider.providerId === "codex-personal-page")!.codexLocal!.accountVerified = false;
    expect(evaluateResetNotifications(current.state, feed(), baseline, current.capture, now + 60_000).events).toEqual([]);
  });
  it("late account/state and subscription changes invalidate a pending event", () => {
    const optIn = applyResetNotificationChange(normalizeResetNotificationStore(undefined), { type: "account-grants", accountKey, value: true });
    const initial = account(0), current = account(1, 60_000);
    const baseline = evaluateResetNotifications(initial.state, feed(), optIn, initial.capture, now).store;
    const result = evaluateResetNotifications(current.state, feed(), baseline, current.capture, now + 60_000);
    const event = result.events[0]!;
    expect(isResetNotificationCurrent(event, current.state, feed(), result.store, current.capture, now + 60_000)).toBe(true);
    expect(isResetNotificationCurrent(event, current.state, feed(), applyResetNotificationChange(result.store, { type: "account-paused", value: true }), current.capture, now + 60_000)).toBe(false);
    expect(isResetNotificationCurrent(event, current.state, feed(), result.store, { ...current.capture, identity: "f".repeat(64) }, now + 60_000)).toBe(false);
  });
});
