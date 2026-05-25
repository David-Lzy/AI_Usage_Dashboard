import type { AppSettings, AppState } from "../providers/types";
import {
  ACTION_BADGE_ROTATION_ALARM,
  LEGACY_PERIODIC_SYNC_ALARMS,
  PERIODIC_SYNC_ALARM,
} from "../shared/alarm-names";
import {
  ACTION_BADGE_ROTATION_INTERVAL_MIN_SECONDS,
  SYNC_INTERVAL_MIN_MINUTES,
} from "../shared/settings-preferences";
import { getEffectiveActionBadgeSelections } from "../shared/action-badge-preferences";

export const INITIAL_PERIODIC_SYNC_DELAY_MINUTES = 1;
export const PERIODIC_SYNC_INITIAL_JITTER_MAX_MINUTES = 2;

export {
  ACTION_BADGE_ROTATION_ALARM,
  LEGACY_PERIODIC_SYNC_ALARMS,
  PERIODIC_SYNC_ALARM,
} from "../shared/alarm-names";

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

export async function ensureActionBadgeRotationAlarm(
  state: AppState,
): Promise<void> {
  if (!supportsChromeAlarms()) {
    return;
  }

  const settings = state.settings;
  const selectedBadgeCount = getEffectiveActionBadgeSelections(state).length;

  if (selectedBadgeCount <= 1) {
    await chrome.alarms.clear(ACTION_BADGE_ROTATION_ALARM);
    return;
  }

  const periodInMinutes =
    Math.max(
      ACTION_BADGE_ROTATION_INTERVAL_MIN_SECONDS,
      settings.actionBadgeRotationIntervalSeconds,
    ) / 60;
  const currentAlarm = await chrome.alarms.get(ACTION_BADGE_ROTATION_ALARM);

  if (currentAlarm?.periodInMinutes === periodInMinutes) {
    return;
  }

  await chrome.alarms.create(ACTION_BADGE_ROTATION_ALARM, {
    delayInMinutes: periodInMinutes,
    periodInMinutes,
  });
}

export function isPeriodicSyncAlarm(alarm: chrome.alarms.Alarm): boolean {
  return alarm.name === PERIODIC_SYNC_ALARM;
}

export function isActionBadgeRotationAlarm(alarm: chrome.alarms.Alarm): boolean {
  return alarm.name === ACTION_BADGE_ROTATION_ALARM;
}
