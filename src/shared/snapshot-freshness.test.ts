import { describe, expect, it } from "vitest";
import { SAMPLE_APP_STATE } from "./demo-state";
import { normalizeSnapshotFreshness, normalizeSnapshotTimestamp, withSnapshotFreshness } from "./snapshot-freshness";

const NOW = new Date("2026-09-22T12:00:00Z");
const CAPTURE = "2026-09-22T10:00:00.000Z";

describe("snapshot capture provenance", () => {
  it("does not infer success from legacy sync status or attempt timestamps", () => {
    const legacy = { ...SAMPLE_APP_STATE.providers[0], syncedAt: NOW.toISOString(), syncStatus: "ok" as const };
    expect(normalizeSnapshotFreshness(legacy)).toMatchObject({ lastAttemptAt: null, lastSuccessAt: null });
    expect(withSnapshotFreshness(legacy, legacy, NOW).lastSuccessAt).toBeNull();
  });

  it("records failed attempts without advancing a successful capture", () => {
    const previous = { ...SAMPLE_APP_STATE.providers[0], lastSuccessAt: CAPTURE };
    const failed = withSnapshotFreshness(previous, { ...previous, syncedAt: NOW.toISOString(), syncStatus: "error" }, NOW);
    expect(failed).toMatchObject({ lastAttemptAt: NOW.toISOString(), lastSuccessAt: CAPTURE });
  });

  it("accepts warning captures and keeps cached acquisition times", () => {
    const previous = SAMPLE_APP_STATE.providers[0];
    const warning = { ...previous, syncStatus: "warning" as const };
    expect(withSnapshotFreshness(previous, warning, NOW, CAPTURE)).toMatchObject({
      syncStatus: "warning", lastAttemptAt: NOW.toISOString(), lastSuccessAt: CAPTURE,
    });
    expect(withSnapshotFreshness(previous, warning, NOW, null).lastSuccessAt).toBeNull();
  });

  it("normalizes explicit ISO offsets and rejects non-time values", () => {
    expect(normalizeSnapshotTimestamp("2026-09-22T12:00:00+02:00")).toBe(CAPTURE);
    expect(normalizeSnapshotTimestamp("2026-09-22 12:00")).toBeNull();
    expect(normalizeSnapshotTimestamp("2026-09-22T12:00:00")).toBeNull();
    expect(normalizeSnapshotTimestamp("just now")).toBeNull();
  });
});
