// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (c) 2026 David-Lzy (https://github.com/David-Lzy). All rights reserved.

import type { ProviderUsageWindow } from "../providers/types";
import { parseResetDate } from "./reset-time-display";

export const DEFAULT_QUOTA_PACE_FORECAST_ENABLED = false;

const WINDOW_DURATION_MS: Partial<
  Record<ProviderUsageWindow["kind"], number>
> = {
  rolling_5h: 5 * 60 * 60 * 1000,
  model_rolling_5h: 5 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
  model_weekly: 7 * 24 * 60 * 60 * 1000,
};

const MINIMUM_ELAPSED_RATIO = 0.05;
const MINIMUM_ELAPSED_MS = 10 * 60 * 1000;
const MAXIMUM_SNAPSHOT_AGE_MS = 30 * 60 * 1000;
const PACE_TOLERANCE_PERCENT = 5;

export type QuotaPaceStatus = "ahead" | "on_track" | "at_risk";

export type QuotaPaceUnavailableReason =
  | "unknown_window"
  | "missing_usage"
  | "invalid_usage"
  | "missing_reset"
  | "invalid_reset"
  | "expired_window"
  | "future_window"
  | "insufficient_elapsed"
  | "invalid_snapshot_time"
  | "stale_snapshot";

export type QuotaPaceForecast =
  | {
      status: "unavailable";
      reason: QuotaPaceUnavailableReason;
    }
  | {
      status: QuotaPaceStatus;
      reason: null;
      window: ProviderUsageWindow;
      usedPercent: number;
      expectedUsedPercent: number;
      deltaPercent: number;
      resetAt: string;
      projectedExhaustionAt: string | null;
      willLastToReset: boolean;
    };

export function normalizeQuotaPaceForecastEnabled(value: unknown): boolean {
  return value === true;
}

function unavailable(reason: QuotaPaceUnavailableReason): QuotaPaceForecast {
  return { status: "unavailable", reason };
}

function resolveUsedPercent(window: ProviderUsageWindow): number | null {
  const candidate =
    typeof window.used === "number"
      ? window.used
      : typeof window.remaining === "number"
        ? 100 - window.remaining
        : null;

  return candidate !== null && Number.isFinite(candidate) ? candidate : null;
}

export function buildQuotaPaceForecast(
  window: ProviderUsageWindow,
  syncedAt: string,
  now = new Date(),
): QuotaPaceForecast {
  const durationMs = WINDOW_DURATION_MS[window.kind];

  if (!durationMs) {
    return unavailable("unknown_window");
  }

  const usedPercent = resolveUsedPercent(window);

  if (usedPercent === null) {
    return unavailable("missing_usage");
  }

  if (usedPercent < 0 || usedPercent > 100) {
    return unavailable("invalid_usage");
  }

  if (!window.resetAt) {
    return unavailable("missing_reset");
  }

  const resetDate = parseResetDate(window.resetAt, now);

  if (!resetDate) {
    return unavailable("invalid_reset");
  }

  const nowMs = now.getTime();
  const resetMs = resetDate.getTime();

  if (resetMs <= nowMs) {
    return unavailable("expired_window");
  }

  const windowStartMs = resetMs - durationMs;

  if (nowMs < windowStartMs) {
    return unavailable("future_window");
  }

  const elapsedMs = nowMs - windowStartMs;
  const minimumElapsedMs = Math.max(
    MINIMUM_ELAPSED_MS,
    durationMs * MINIMUM_ELAPSED_RATIO,
  );

  if (elapsedMs < minimumElapsedMs) {
    return unavailable("insufficient_elapsed");
  }

  const syncedDate = parseResetDate(syncedAt, now);

  if (!syncedDate) {
    return unavailable("invalid_snapshot_time");
  }

  const snapshotAgeMs = nowMs - syncedDate.getTime();

  if (snapshotAgeMs < 0 || snapshotAgeMs > MAXIMUM_SNAPSHOT_AGE_MS) {
    return unavailable("stale_snapshot");
  }

  const expectedUsedPercent = (elapsedMs / durationMs) * 100;
  const deltaPercent = usedPercent - expectedUsedPercent;
  const projectedExhaustionMs =
    usedPercent > 0
      ? windowStartMs + (elapsedMs * 100) / usedPercent
      : null;
  const willLastToReset =
    projectedExhaustionMs === null || projectedExhaustionMs >= resetMs;
  const status: QuotaPaceStatus =
    deltaPercent >= PACE_TOLERANCE_PERCENT && !willLastToReset
      ? "at_risk"
      : deltaPercent <= -PACE_TOLERANCE_PERCENT
        ? "ahead"
        : "on_track";

  return {
    status,
    reason: null,
    window,
    usedPercent,
    expectedUsedPercent,
    deltaPercent,
    resetAt: resetDate.toISOString(),
    projectedExhaustionAt:
      projectedExhaustionMs !== null && projectedExhaustionMs < resetMs
        ? new Date(projectedExhaustionMs).toISOString()
        : null,
    willLastToReset,
  };
}

export function buildAvailableQuotaPaceForecasts(
  windows: readonly ProviderUsageWindow[] | undefined,
  syncedAt: string,
  now = new Date(),
): Array<Extract<QuotaPaceForecast, { reason: null }>> {
  return (windows ?? [])
    .map((window) => buildQuotaPaceForecast(window, syncedAt, now))
    .filter(
      (forecast): forecast is Extract<QuotaPaceForecast, { reason: null }> =>
        forecast.status !== "unavailable",
    );
}
