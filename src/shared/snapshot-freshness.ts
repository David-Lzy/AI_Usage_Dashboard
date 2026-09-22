import type { ProviderSnapshot } from "../providers/types";

export function normalizeSnapshotTimestamp(value: unknown): string | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return null;
  const time = Date.parse(value);
  return Number.isFinite(time) ? new Date(time).toISOString() : null;
}

/** A successful capture time must come from acquisition, never a retry label. */
export function withSnapshotFreshness(
  previous: ProviderSnapshot,
  snapshot: ProviderSnapshot,
  attemptedAt: Date,
  capturedAt?: string | null,
): ProviderSnapshot {
  return {
    ...snapshot,
    lastAttemptAt: attemptedAt.toISOString(),
    lastSuccessAt: capturedAt === undefined
      ? normalizeSnapshotTimestamp(previous.lastSuccessAt)
      : normalizeSnapshotTimestamp(capturedAt),
  };
}

export function normalizeSnapshotFreshness(snapshot: ProviderSnapshot): ProviderSnapshot {
  return {
    ...snapshot,
    lastAttemptAt: normalizeSnapshotTimestamp(snapshot.lastAttemptAt),
    lastSuccessAt: normalizeSnapshotTimestamp(snapshot.lastSuccessAt),
  };
}
