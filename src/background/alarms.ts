import type { AppSettings } from "../providers/types";
import { SYNC_INTERVAL_MIN_MINUTES } from "../shared/settings-preferences";

export const LEGACY_PERIODIC_SYNC_ALARMS = [
  "ai-usage-dashboard.periodic-sync",
];
export const PERIODIC_SYNC_ALARM = "ai-usage-dashboard.periodic-sync.v2";
export const INITIAL_PERIODIC_SYNC_DELAY_MINUTES = 1;
export const PERIODIC_SYNC_INITIAL_JITTER_MAX_MINUTES = 2;

function supportsChromeAlarms(): boolean {
  return typeof chrome !== "undefined" && typeof chrome.alarms?.create === "function";
}

async function clearLegacyPeriodicSyncAlarms(): Promise<void> {
  if (typeof chrome.alarms?.clear !== "function") {
    return;
  }

  for (const alarmName of LEGACY_PERIODIC_SYNC_ALARMS) {
    try {
      await chrome.alarms.clear(alarmName);
    } catch {
      // Best-effort cleanup for existing unpacked-extension alarm names.
    }
  }
}

export function getPeriodicSyncInitialDelayMinutes(
  periodInMinutes: number,
  randomValue = Math.random(),
): number {
  const normalizedPeriodInMinutes = Math.max(
    SYNC_INTERVAL_MIN_MINUTES,
    periodInMinutes,
  );
  const normalizedRandomValue = Math.min(1, Math.max(0, randomValue));
  const jitterWindow = Math.min(
    PERIODIC_SYNC_INITIAL_JITTER_MAX_MINUTES,
    Math.max(
      0,
      normalizedPeriodInMinutes - INITIAL_PERIODIC_SYNC_DELAY_MINUTES,
    ),
  );

  return Number(
    Math.min(
      normalizedPeriodInMinutes,
      INITIAL_PERIODIC_SYNC_DELAY_MINUTES +
        normalizedRandomValue * jitterWindow,
    ).toFixed(3),
  );
}

export async function ensurePeriodicSyncAlarm(
  settings: AppSettings,
): Promise<void> {
  if (!supportsChromeAlarms()) {
    return;
  }

  await clearLegacyPeriodicSyncAlarms();

  const periodInMinutes = Math.max(
    SYNC_INTERVAL_MIN_MINUTES,
    settings.syncIntervalMinutes,
  );
  const currentAlarm = await chrome.alarms.get(PERIODIC_SYNC_ALARM);

  if (currentAlarm?.periodInMinutes === periodInMinutes) {
    return;
  }

  await chrome.alarms.create(PERIODIC_SYNC_ALARM, {
    delayInMinutes: getPeriodicSyncInitialDelayMinutes(periodInMinutes),
    periodInMinutes,
  });
}

export function isPeriodicSyncAlarm(alarm: chrome.alarms.Alarm): boolean {
  return alarm.name === PERIODIC_SYNC_ALARM;
}
