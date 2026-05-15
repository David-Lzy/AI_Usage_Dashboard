export const SYNC_INTERVAL_MIN_MINUTES = 3;
export const SYNC_INTERVAL_MAX_MINUTES = 240;
export const DEFAULT_SYNC_INTERVAL_MINUTES = 30;
export const SYNC_INTERVAL_PRESETS = [3, 15, 30, 60] as const;

export const WARNING_THRESHOLD_MIN_PERCENT = 50;
export const WARNING_THRESHOLD_MAX_PERCENT = 99;
export const DEFAULT_WARNING_THRESHOLD_PERCENT = 80;
export const WARNING_THRESHOLD_PRESETS = [70, 80, 90] as const;

export const ACTION_BADGE_ROTATION_INTERVAL_MIN_SECONDS = 30;
export const ACTION_BADGE_ROTATION_INTERVAL_MAX_SECONDS = 3600;
export const DEFAULT_ACTION_BADGE_ROTATION_INTERVAL_SECONDS = 60;
export const ACTION_BADGE_ROTATION_INTERVAL_PRESETS = [30, 60, 120, 300] as const;

function normalizeIntegerInRange(
  value: unknown,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  const parsedValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value.trim())
        : Number.NaN;

  if (!Number.isInteger(parsedValue)) {
    return fallback;
  }

  if (parsedValue < minimum || parsedValue > maximum) {
    return fallback;
  }

  return parsedValue;
}

export function normalizeSyncIntervalMinutes(value: unknown): number {
  return normalizeIntegerInRange(
    value,
    DEFAULT_SYNC_INTERVAL_MINUTES,
    SYNC_INTERVAL_MIN_MINUTES,
    SYNC_INTERVAL_MAX_MINUTES,
  );
}

export function normalizeWarningThresholdPercent(value: unknown): number {
  return normalizeIntegerInRange(
    value,
    DEFAULT_WARNING_THRESHOLD_PERCENT,
    WARNING_THRESHOLD_MIN_PERCENT,
    WARNING_THRESHOLD_MAX_PERCENT,
  );
}

export function normalizeActionBadgeRotationIntervalSeconds(
  value: unknown,
): number {
  return normalizeIntegerInRange(
    value,
    DEFAULT_ACTION_BADGE_ROTATION_INTERVAL_SECONDS,
    ACTION_BADGE_ROTATION_INTERVAL_MIN_SECONDS,
    ACTION_BADGE_ROTATION_INTERVAL_MAX_SECONDS,
  );
}
