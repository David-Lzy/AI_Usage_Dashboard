import type { ProgressDisplayStyle, ProviderSnapshot } from "../providers/types";
import type { ProviderProgressItem } from "./provider-progress-items";
import { normalizeSnapshotTimestamp } from "./snapshot-freshness";

export type ProgressMotionSample = {
  id: string;
  identity: string | null;
  capturedAt: number | null;
  resetAt: number | null;
  percent: number | null;
  total: number | null;
  remaining: boolean;
  successful: boolean;
};

const MAX_CAPTURE_AGE_MS = 30 * 60 * 1000;

export function buildProgressMotionSample(
  provider: ProviderSnapshot,
  item: ProviderProgressItem,
  accountId: string | null | undefined,
  style: ProgressDisplayStyle,
): ProgressMotionSample {
  const remaining = item.remaining !== null;
  const value = remaining ? item.remaining : item.used;
  const reset = normalizeSnapshotTimestamp(item.resetAt);
  const captured = normalizeSnapshotTimestamp(provider.lastSuccessAt);
  return {
    id: item.id,
    identity: accountId && reset ? JSON.stringify([
      provider.providerId, accountId, provider.syncSource, item.id,
      provider.quotaWindow, item.quotaUnit, reset, style, remaining,
    ]) : null,
    capturedAt: captured ? Date.parse(captured) : null,
    resetAt: reset ? Date.parse(reset) : null,
    percent: value !== null && Number.isFinite(value) && item.total !== null &&
      Number.isFinite(item.total) && item.total > 0 && value >= 0 && value <= item.total
      ? Math.round(value / item.total * 100) : null,
    total: item.total,
    remaining,
    successful: provider.syncStatus === "ok" && item.availability === "progress",
  };
}

export function canInterpolateProgress(
  previous: ProgressMotionSample | undefined,
  current: ProgressMotionSample,
  now = Date.now(),
): boolean {
  if (!previous || !current.identity || previous.identity !== current.identity ||
      previous.percent === null || current.percent === null ||
      previous.total !== current.total || !previous.successful || !current.successful ||
      previous.capturedAt === null || current.capturedAt === null ||
      current.capturedAt <= previous.capturedAt || current.capturedAt > now ||
      now - previous.capturedAt > MAX_CAPTURE_AGE_MS ||
      current.resetAt === null || current.resetAt <= now) return false;
  // A refill or reset may precede an updated reset identifier; never interpolate it.
  return current.remaining
    ? current.percent <= previous.percent
    : current.percent >= previous.percent;
}
