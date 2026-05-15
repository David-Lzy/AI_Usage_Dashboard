import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AppSettings } from "../providers/types";
import { SAMPLE_APP_STATE } from "../shared/constants";
import {
  ACTION_BADGE_ROTATION_ALARM,
  ensureActionBadgeRotationAlarm,
  ensurePeriodicSyncAlarm,
  getPeriodicSyncInitialDelayMinutes,
  INITIAL_PERIODIC_SYNC_DELAY_MINUTES,
  LEGACY_PERIODIC_SYNC_ALARMS,
  PERIODIC_SYNC_INITIAL_JITTER_MAX_MINUTES,
  PERIODIC_SYNC_ALARM,
} from "./alarms";

const baseSettings: AppSettings = {
  ...SAMPLE_APP_STATE.settings,
  syncIntervalMinutes: 30,
};

function stubChromeAlarms(currentAlarm?: chrome.alarms.Alarm) {
  const get = vi.fn(async (alarmName: string) =>
    alarmName === PERIODIC_SYNC_ALARM || alarmName === ACTION_BADGE_ROTATION_ALARM
      ? currentAlarm
      : undefined,
  );
  const create = vi.fn(async () => undefined);
  const clear = vi.fn(async () => true);

  vi.stubGlobal("chrome", {
    alarms: {
      get,
      create,
      clear,
    },
  });

  return {
    get,
    create,
    clear,
  };
}

describe("ensurePeriodicSyncAlarm", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("creates the periodic sync alarm with a short initial delay", async () => {
    const alarms = stubChromeAlarms();
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);

    await ensurePeriodicSyncAlarm(baseSettings);

    expect(alarms.clear).toHaveBeenCalledWith(LEGACY_PERIODIC_SYNC_ALARMS[0]);
    expect(alarms.get).toHaveBeenCalledWith(PERIODIC_SYNC_ALARM);
    expect(alarms.create).toHaveBeenCalledWith(PERIODIC_SYNC_ALARM, {
      delayInMinutes: INITIAL_PERIODIC_SYNC_DELAY_MINUTES,
      periodInMinutes: 30,
    });
    randomSpy.mockRestore();
  });

  it("keeps an existing current alarm when the period already matches", async () => {
    const alarms = stubChromeAlarms({
      name: PERIODIC_SYNC_ALARM,
      periodInMinutes: 30,
      scheduledTime: Date.now() + 60_000,
    });

    await ensurePeriodicSyncAlarm(baseSettings);

    expect(alarms.create).not.toHaveBeenCalled();
  });

  it("normalizes too-small settings to the supported three-minute period", async () => {
    const alarms = stubChromeAlarms();
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);

    await ensurePeriodicSyncAlarm({
      ...baseSettings,
      syncIntervalMinutes: 2,
    });

    expect(alarms.create).toHaveBeenCalledWith(PERIODIC_SYNC_ALARM, {
      delayInMinutes: INITIAL_PERIODIC_SYNC_DELAY_MINUTES,
      periodInMinutes: 3,
    });
    randomSpy.mockRestore();
  });

  it("adds bounded startup jitter to the initial periodic delay", () => {
    expect(getPeriodicSyncInitialDelayMinutes(30, 1)).toBe(
      INITIAL_PERIODIC_SYNC_DELAY_MINUTES +
        PERIODIC_SYNC_INITIAL_JITTER_MAX_MINUTES,
    );
    expect(getPeriodicSyncInitialDelayMinutes(3, 1)).toBe(3);
  });
});

describe("ensureActionBadgeRotationAlarm", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("creates a thirty-second rotation alarm when multiple badges are selected", async () => {
    const alarms = stubChromeAlarms();

    await ensureActionBadgeRotationAlarm({
      ...baseSettings,
      actionBadgeSelections: ["attention", "quota:codex:primary"],
      actionBadgeRotationIntervalSeconds: 30,
    });

    expect(alarms.get).toHaveBeenCalledWith(ACTION_BADGE_ROTATION_ALARM);
    expect(alarms.create).toHaveBeenCalledWith(ACTION_BADGE_ROTATION_ALARM, {
      delayInMinutes: 0.5,
      periodInMinutes: 0.5,
    });
  });

  it("clears the rotation alarm when one or zero badges are selected", async () => {
    const alarms = stubChromeAlarms();

    await ensureActionBadgeRotationAlarm({
      ...baseSettings,
      actionBadgeSelections: ["attention"],
    });

    expect(alarms.clear).toHaveBeenCalledWith(ACTION_BADGE_ROTATION_ALARM);
  });
});
