import { describe, expect, it } from "vitest";
import { SAMPLE_APP_STATE } from "../shared/demo-state";
import {
  SettingsSaveTracker,
  StateResponseFence,
} from "./settings-save-feedback";

const settings = SAMPLE_APP_STATE.settings;

describe("SettingsSaveTracker", () => {
  it("discards replaced preferences without reusing old request identities", () => {
    const tracker = new SettingsSaveTracker();
    const old = tracker.begin({ syncIntervalMinutes: 7 });
    tracker.discardThrough();
    expect(tracker.feedback.status).toBe("idle");
    const next = tracker.begin({ syncIntervalMinutes: 8 });
    expect(next).not.toBe(old);
    expect(tracker.owns(old)).toBe(false);
    tracker.finish(old, settings);
    expect(tracker.feedback.draft).toEqual({ syncIntervalMinutes: 8 });
    expect(tracker.feedback.status).toBe("pending");
  });
  it("keeps edits made after an explicit import or reset began", () => {
    const tracker = new SettingsSaveTracker();
    tracker.begin({ syncIntervalMinutes: 7 });
    const replacement = tracker.checkpoint;
    const next = tracker.begin({ warningThresholdPercent: 63 });
    tracker.discardThrough(replacement);
    expect(tracker.feedback.draft).toEqual({ warningThresholdPercent: 63 });
    expect(tracker.owns(next)).toBe(true);
  });
  it("requires acknowledgement and retains a failed draft for retry", () => {
    const tracker = new SettingsSaveTracker();
    expect(tracker.feedback.status).toBe("idle");
    const request = tracker.begin({ warningThresholdPercent: 63 });
    expect(tracker.feedback.status).toBe("pending");
    tracker.finish(request);
    expect(tracker.feedback).toEqual({
      status: "error",
      draft: { warningThresholdPercent: 63 },
      retryPatch: { warningThresholdPercent: 63 },
    });
    const retry = tracker.begin(tracker.feedback.retryPatch);
    expect(
      tracker.finish(retry, { ...settings, warningThresholdPercent: 63 }),
    ).toEqual({ warningThresholdPercent: 63 });
    expect(tracker.feedback).toEqual({
      status: "saved",
      draft: {},
      retryPatch: {},
    });
  });

  it("ignores an old failure after a newer value succeeded", () => {
    const tracker = new SettingsSaveTracker();
    const a = tracker.begin({ syncIntervalMinutes: 5 });
    const b = tracker.begin({ syncIntervalMinutes: 9 });
    tracker.finish(b, { ...settings, syncIntervalMinutes: 9 });
    tracker.finish(a);
    expect(tracker.feedback.status).toBe("saved");
  });

  it("an old success cannot clear a new pending or failed value", () => {
    const tracker = new SettingsSaveTracker();
    const a = tracker.begin({ syncIntervalMinutes: 5 });
    const b = tracker.begin({ syncIntervalMinutes: 9 });
    expect(tracker.finish(a, { ...settings, syncIntervalMinutes: 5 })).toEqual(
      {},
    );
    expect(tracker.feedback).toMatchObject({
      status: "pending",
      draft: { syncIntervalMinutes: 9 },
    });
    tracker.finish(b);
    tracker.finish(a, settings);
    expect(tracker.feedback.status).toBe("error");
  });

  it("keeps unrelated failed fields while another field saves", () => {
    const tracker = new SettingsSaveTracker();
    const a = tracker.begin({
      syncIntervalMinutes: 7,
      warningThresholdPercent: 81,
    });
    const b = tracker.begin({ warningThresholdPercent: 65 });
    tracker.finish(a);
    expect(tracker.feedback.status).toBe("pending");
    tracker.finish(b, { ...settings, warningThresholdPercent: 65 });
    expect(tracker.feedback).toEqual({
      status: "error",
      draft: { syncIntervalMinutes: 7 },
      retryPatch: { syncIntervalMinutes: 7 },
    });
  });

  it("uses normalized acknowledged values, not requested values", () => {
    const tracker = new SettingsSaveTracker();
    const request = tracker.begin({ warningThresholdPercent: 81.1 });
    expect(
      tracker.finish(request, { ...settings, warningThresholdPercent: 81 }),
    ).toEqual({ warningThresholdPercent: 81 });
  });
});

describe("StateResponseFence", () => {
  it("rejects older replies after a later one is accepted", () => {
    const fence = new StateResponseFence();
    const a = fence.begin(),
      b = fence.begin();
    expect(fence.accept(b)).toBe(true);
    expect(fence.accept(a)).toBe(false);
    expect(fence.storageUnchanged(a)).toBe(true);
  });

  it("never replaces a newer storage event with an in-flight reply", () => {
    const fence = new StateResponseFence();
    const a = fence.begin();
    fence.storageChanged();
    expect(fence.accept(a)).toBe(false);
    expect(fence.storageUnchanged(a)).toBe(false);
    expect(fence.accept(fence.begin())).toBe(true);
  });
});
