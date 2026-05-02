import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AppSettings } from "../providers/types";
import { SAMPLE_APP_STATE } from "../shared/constants";
import {
  ensurePeriodicSyncAlarm,
  INITIAL_PERIODIC_SYNC_DELAY_MINUTES,
  LEGACY_PERIODIC_SYNC_ALARMS,
  PERIODIC_SYNC_ALARM,
} from "./alarms";

const baseSettings: AppSettings = {
  ...SAMPLE_APP_STATE.settings,
  syncIntervalMinutes: 30,
};

function stubChromeAlarms(currentAlarm?: chrome.alarms.Alarm) {
  const get = vi.fn(async (alarmName: string) =>
    alarmName === PERIODIC_SYNC_ALARM ? currentAlarm : undefined,
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

    await ensurePeriodicSyncAlarm(baseSettings);

    expect(alarms.clear).toHaveBeenCalledWith(LEGACY_PERIODIC_SYNC_ALARMS[0]);
    expect(alarms.get).toHaveBeenCalledWith(PERIODIC_SYNC_ALARM);
    expect(alarms.create).toHaveBeenCalledWith(PERIODIC_SYNC_ALARM, {
      delayInMinutes: INITIAL_PERIODIC_SYNC_DELAY_MINUTES,
      periodInMinutes: 30,
    });
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

  it("normalizes too-small settings to Chrome's supported fifteen-minute period", async () => {
    const alarms = stubChromeAlarms();

    await ensurePeriodicSyncAlarm({
      ...baseSettings,
      syncIntervalMinutes: 5,
    });

    expect(alarms.create).toHaveBeenCalledWith(PERIODIC_SYNC_ALARM, {
      delayInMinutes: INITIAL_PERIODIC_SYNC_DELAY_MINUTES,
      periodInMinutes: 15,
    });
  });
});
