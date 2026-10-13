import { describe, expect, it } from "vitest";
import {
  canonicalCommunityOriginalUrl, mergeCommunityResetEvents, normalizeCommunityResetStore,
  parseCommunityResetPayload, emptyCommunityResetCache, type CommunityResetFragment,
} from "./community-reset-feeds";

const at = "2026-10-13T06:00:00.000Z";
const meta = { api_version: "v1", generated_at: at };
const post = "https://x.com/thsottiaux/status/2100000000000000001";
const row = { id: "2100000000000000001", reset_type: "regular", announced_at: at, text: "<b>Reset</b> reported",
  source: { type: "x_post", author: "thsottiaux", url: post } };
function combined(a: CommunityResetFragment, b: CommunityResetFragment) {
  const store = normalizeCommunityResetStore(undefined);
  store.preferences.mode = "in_app";
  store.caches.status = { ...emptyCommunityResetCache(), fragment: a };
  store.caches.timeline = { ...emptyCommunityResetCache(), fragment: b };
  return store;
}
describe("community reset contracts", () => {
  it("defaults off and keeps all machine state outside provider snapshots", () => {
    expect(normalizeCommunityResetStore(undefined)).toEqual({ schemaVersion: 1, revision: 0,
      preferences: { mode: "off", sources: ["codex-resets", "codex-reset"] }, caches: {} });
  });
  it("canonicalizes aliases/tracking but rejects executable, credential and unexpected origins", () => {
    expect(canonicalCommunityOriginalUrl(`${post}?s=20#x`)).toBe("https://x.com/i/web/status/2100000000000000001");
    expect(canonicalCommunityOriginalUrl("https://twitter.com/other/status/2100000000000000001/")).toBe(canonicalCommunityOriginalUrl(post));
    for (const url of ["http://x.com/test/status/2100000000000000001", "javascript:alert(1)", "https://user:pass@x.com/test/status/2100000000000000001", "https://evil.test/", "https://x.com:1234/test/status/2100000000000000001"]) expect(canonicalCommunityOriginalUrl(url)).toBeNull();
  });
  it("elapsed scheduled time does not become executed and unrelated keys are discarded", () => {
    const parsed = parseCommunityResetPayload("status", { data: { latest_reset: null,
      scheduled_reset: { ...row, status: "scheduled", scheduled_for: "2026-10-12T06:00:00Z" }, active_watch: null }, meta, account: "secret" })!;
    expect(parsed.events[0]).toMatchObject({ state: "scheduled", scheduledFor: "2026-10-12T06:00:00.000Z", summary: "Reset reported" });
    expect(JSON.stringify(parsed)).not.toContain("secret");
  });
  it("merges the same original post without counting sources as independent confirmation", () => {
    const a = parseCommunityResetPayload("resets", { data: [row], meta })!;
    const b = parseCommunityResetPayload("timeline", { events: [{ id: row.id, announced_at: at, group: "reset", type: "reset", announcement_state: "announced", summary: "Reset", url: `${post}?tracking=yes` }] })!;
    expect(mergeCommunityResetEvents(combined(a, b))).toMatchObject([{ conflict: false, entries: [{ source: "codex-resets" }, { source: "codex-reset" }] }]);
    b.events[0].state = "unknown";
    expect(mergeCommunityResetEvents(combined(a, b))[0].conflict).toBe(true);
    b.events[0].kind = "grant";
    expect(mergeCommunityResetEvents(combined(a, b))[0].conflict).toBe(true);
  });
  it("does not fuzzy-merge text, unknown credits, or untraceable observations", () => {
    const parsed = parseCommunityResetPayload("timeline", { events: [
      { id: "one", announced_at: at, group: "credits", type: "credits", summary: "banked reset free credits", url: null },
      { id: "two", announced_at: at, group: "credits", banked_state: "available", summary: "Same", url: null },
    ] })!;
    expect(parsed.events).toMatchObject([{ kind: "credits", state: "unknown", traceable: false }, { kind: "grant", state: "reported", traceable: false }]);
    const observed = parseCommunityResetPayload("resets", { data: [{ ...row, source: { type: "observed", url: post } }], meta })!;
    expect(observed.events[0].traceable).toBe(false);
    expect(mergeCommunityResetEvents(combined(parsed, observed))).toHaveLength(3);
  });
  it("retains documented forecast probabilities without classifier scores or quota values", () => {
    const forecast = parseCommunityResetPayload("forecast", { updated_at: at, confidence: "low", last_reset_at: at,
      probabilities: { rounded_24h: 19, rounded_48h: 34 }, signal_score: 83, quota: 99 })!;
    expect(forecast).toMatchObject({ events: [], forecasts: [{ percent24h: 19, percent48h: 34, confidence: "low" }] });
    expect(JSON.stringify(forecast)).not.toMatch(/83|99|quota|signal_score/);
  });
  it("rejects malformed contracts/dates, bounds events and handles hostile unknown enums", () => {
    expect(parseCommunityResetPayload("resets", { data: [], meta: { ...meta, generated_at: "2026-02-30T00:00:00Z" } })).toBeNull();
    expect(parseCommunityResetPayload("forecast", { probabilities: {} })).toBeNull();
    const rows = Array.from({ length: 150 }, (_, id) => ({ ...row, id: `synthetic-${id}` }));
    expect(parseCommunityResetPayload("resets", { data: rows, meta })!.events).toHaveLength(100);
    expect(() => parseCommunityResetPayload("timeline", { events: [{ id: "bad", announced_at: at, group: "credits", banked_state: Object.create(null) }] })).not.toThrow();
    const input = { schemaVersion: 1, caches: { status: { fragment: { events: [{ kind: Object.create(null) }], forecasts: [] } } } };
    expect(() => normalizeCommunityResetStore(input)).not.toThrow();
  });
});
