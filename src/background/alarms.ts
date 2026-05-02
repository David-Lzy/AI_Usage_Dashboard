import type { AppSettings } from "../providers/types";

export const LEGACY_PERIODIC_SYNC_ALARMS = [
  "ai-usage-dashboard.periodic-sync",
];
export const PERIODIC_SYNC_ALARM = "ai-usage-dashboard.periodic-sync.v2";
export const INITIAL_PERIODIC_SYNC_DELAY_MINUTES = 1;

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

export async function ensurePeriodicSyncAlarm(
  settings: AppSettings,
): Promise<void> {
  if (!supportsChromeAlarms()) {
    return;
  }

  await clearLegacyPeriodicSyncAlarms();

  const periodInMinutes = Math.max(15, settings.syncIntervalMinutes);
  const currentAlarm = await chrome.alarms.get(PERIODIC_SYNC_ALARM);

  if (currentAlarm?.periodInMinutes === periodInMinutes) {
    return;
  }

  await chrome.alarms.create(PERIODIC_SYNC_ALARM, {
    delayInMinutes: INITIAL_PERIODIC_SYNC_DELAY_MINUTES,
    periodInMinutes,
  });
}

export function isPeriodicSyncAlarm(alarm: chrome.alarms.Alarm): boolean {
  return alarm.name === PERIODIC_SYNC_ALARM;
}
