import { describe, expect, it } from "vitest";
import { buildProgressMotionSample, canInterpolateProgress, type ProgressMotionSample } from "./progress-motion";
import type { ProviderSnapshot } from "../providers/types";
import type { ProviderProgressItem } from "./provider-progress-items";

const now = Date.parse("2026-10-03T00:00:00Z");
const sample: ProgressMotionSample = {
  id: "weekly", identity: "same-account-source-window", capturedAt: now - 60000,
  resetAt: now + 3600000, percent: 80, total: 100, remaining: true, successful: true,
};
const current = { ...sample, capturedAt: now, percent: 75 };

describe("continuous quota presentation", () => {
  it("animates fresh consumption without delaying real values", () => {
    expect(canInterpolateProgress(sample, current, now)).toBe(true);
    expect(canInterpolateProgress({ ...sample, remaining: false, percent: 20 }, { ...current, remaining: false, percent: 25 }, now)).toBe(true);
  });
  it.each([
    ["account or source changed", { identity: "another" }],
    ["unknown identity", { identity: null }],
    ["unknown quota", { percent: null }],
    ["failed capture", { successful: false }],
    ["cached capture", { capturedAt: sample.capturedAt }],
    ["future timestamp", { capturedAt: now + 1 }],
    ["unknown capture", { capturedAt: null }],
    ["expired window", { resetAt: now }],
    ["unknown window", { resetAt: null }],
    ["limit changed", { total: 200 }],
    ["reset before identifier update", { percent: 90 }],
  ])("does not interpolate %s", (_reason, patch) => {
    expect(canInterpolateProgress(sample, { ...current, ...patch }, now)).toBe(false);
  });
  it("requires a previous successful, fresh observation", () => {
    expect(canInterpolateProgress(undefined, current, now)).toBe(false);
    expect(canInterpolateProgress({ ...sample, successful: false }, current, now)).toBe(false);
    expect(canInterpolateProgress({ ...sample, capturedAt: now - 31 * 60000 }, current, now)).toBe(false);
  });
  it("distinguishes zero from unknown and builds all identity boundaries", () => {
    const provider = { providerId: "codex-personal-page", syncSource: "local_companion", syncStatus: "ok", lastSuccessAt: new Date(now).toISOString() } as ProviderSnapshot;
    const item = { id: "weekly", resetAt: new Date(now + 3600000).toISOString(), remaining: 0, used: 100, total: 100, quotaUnit: "percent", availability: "progress" } as ProviderProgressItem;
    const value = buildProgressMotionSample(provider, item, "A", "circle");
    expect(value.percent).toBe(0);
    expect(value.identity).not.toBe(buildProgressMotionSample(provider, item, "B", "circle").identity);
    expect(value.identity).not.toBe(buildProgressMotionSample({ ...provider, syncSource: "page_parse" }, item, "A", "circle").identity);
    expect(buildProgressMotionSample(provider, { ...item, remaining: null, used: null }, "A", "circle").percent).toBeNull();
    expect(buildProgressMotionSample(provider, item, null, "circle").identity).toBeNull();
    expect(buildProgressMotionSample(provider, { ...item, resetAt: null }, "A", "circle").identity).toBeNull();
    expect(buildProgressMotionSample(provider, { ...item, remaining: Infinity }, "A", "circle").percent).toBeNull();
  });
});
