import type { AppSettings } from "../providers/types";

export const PERIODIC_SYNC_ALARM = "ai-usage-dashboard.periodic-sync";

function supportsChromeAlarms(): boolean {
  return typeof chrome !== "undefined" && typeof chrome.alarms?.create === "function";
}

export async function ensurePeriodicSyncAlarm(
  settings: AppSettings,
): Promise<void> {
  if (!supportsChromeAlarms()) {
    return;
  }

  const periodInMinutes = Math.max(15, settings.syncIntervalMinutes);
  const currentAlarm = await chrome.alarms.get(PERIODIC_SYNC_ALARM);

  if (currentAlarm?.periodInMinutes === periodInMinutes) {
    return;
  }

  await chrome.alarms.create(PERIODIC_SYNC_ALARM, {
    delayInMinutes: periodInMinutes,
    periodInMinutes,
  });
}

export function isPeriodicSyncAlarm(alarm: chrome.alarms.Alarm): boolean {
  return alarm.name === PERIODIC_SYNC_ALARM;
}
