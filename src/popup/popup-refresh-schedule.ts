import { PERIODIC_SYNC_ALARM } from "../shared/alarm-names";
import { SYNC_INTERVAL_MIN_MINUTES } from "../shared/settings-preferences";

export const POPUP_REFRESH_COUNTDOWN_ALARM_RESYNC_MS = 30_000;

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

export function decrementPopupRefreshCountdownSeconds(
  currentSeconds: number | null,
): number | null {
  if (currentSeconds === null) {
    return null;
  }

  return Math.max(0, Math.ceil(currentSeconds) - 1);
}

function readChromeAlarms(
  reader?: PopupRefreshScheduleReader,
): ChromeAlarmsReader["alarms"] | undefined {
  if (reader?.chrome?.alarms) {
    return reader.chrome.alarms;
  }

  return typeof chrome !== "undefined" ? chrome.alarms : undefined;
}

export async function readPopupRefreshCountdownSeconds(
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
          0,
          Math.ceil((alarm.scheduledTime - now) / 1000),
        );
      }
    } catch {
      // Popup countdown is advisory; manual refresh remains available.
    }
  }

  if (Number.isFinite(syncIntervalMinutes)) {
    return Math.max(
      SYNC_INTERVAL_MIN_MINUTES * 60,
      Math.ceil(syncIntervalMinutes * 60),
    );
  }

  return null;
}

export function formatPopupRefreshCountdownLabel(
  seconds: number | null,
  formatNumber: (value: number) => string,
): string | null {
  if (seconds === null) {
    return null;
  }

  const safeSeconds = Math.max(0, Math.ceil(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;

  const formatTwoDigit = (value: number) =>
    value < 10 ? `0${formatNumber(value)}` : formatNumber(value);

  if (hours > 0) {
    return `${formatNumber(hours)}:${formatTwoDigit(minutes)}:${formatTwoDigit(
      remainingSeconds,
    )}`;
  }

  return `${formatNumber(minutes)}:${formatTwoDigit(remainingSeconds)}`;
}
