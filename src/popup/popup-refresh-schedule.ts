import { PERIODIC_SYNC_ALARM } from "../background/alarms";
import { SYNC_INTERVAL_MIN_MINUTES } from "../shared/settings-preferences";

type ChromeAlarmsReader = {
  alarms?: {
    get?: (
      name: string,
    ) => Promise<chrome.alarms.Alarm | undefined>;
  };
};

export type PopupRefreshScheduleReader = {
  chrome?: ChromeAlarmsReader;
  now?: () => number;
};

function readChromeAlarms(
  reader?: PopupRefreshScheduleReader,
): ChromeAlarmsReader["alarms"] | undefined {
  if (reader?.chrome?.alarms) {
    return reader.chrome.alarms;
  }

  return typeof chrome !== "undefined" ? chrome.alarms : undefined;
}

export async function readPopupRefreshCountdownMinutes(
  syncIntervalMinutes: number,
  reader?: PopupRefreshScheduleReader,
): Promise<number | null> {
  const alarms = readChromeAlarms(reader);
  const now = reader?.now?.() ?? Date.now();

  if (typeof alarms?.get === "function") {
    try {
      const alarm = await alarms.get(PERIODIC_SYNC_ALARM);

      if (typeof alarm?.scheduledTime === "number") {
        return Math.max(
          1,
          Math.ceil((alarm.scheduledTime - now) / 60000),
        );
      }
    } catch {
      // Popup countdown is advisory; manual refresh remains available.
    }
  }

  if (Number.isFinite(syncIntervalMinutes)) {
    return Math.max(SYNC_INTERVAL_MIN_MINUTES, Math.ceil(syncIntervalMinutes));
  }

  return null;
}

export function formatPopupRefreshCountdownLabel(
  minutes: number | null,
  formatNumber: (value: number) => string,
): string | null {
  if (minutes === null) {
    return null;
  }

  return `~${formatNumber(Math.max(1, minutes))}m`;
}
