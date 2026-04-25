import { describe, expect, it } from "vitest";

import { createUsageThresholdDiagnostic } from "../providers/diagnostics";
import type { AppState, ProviderSnapshot } from "../providers/types";
import { SAMPLE_APP_STATE } from "../shared/constants";
import { reconcileAppStateHealth } from "./sync-engine";

const NOW = new Date("2026-04-25T10:00:00.000Z");
const STALE_SYNCED_AT = "2026-04-25T06:00:00.000Z";

function buildStateWithProvider(
  overrides: Partial<ProviderSnapshot>,
): AppState {
  const provider = SAMPLE_APP_STATE.providers[0];

  return {
    ...SAMPLE_APP_STATE,
    settings: {
      ...SAMPLE_APP_STATE.settings,
      syncIntervalMinutes: 30,
    },
    providers: [
      {
        ...provider,
        syncStatus: "ok",
        tone: "neutral",
        warningReason: null,
        syncedAt: STALE_SYNCED_AT,
        lastSyncLabel: "Synced 4h ago",
        ...overrides,
      },
    ],
  };
}

describe("sync engine health reconciliation", () => {
  it("adds a typed cached-state stale diagnostic without changing stale copy", () => {
    const state = reconcileAppStateHealth(buildStateWithProvider({}), NOW);
    const snapshot = state.providers[0];

    expect(snapshot.syncStatus).toBe("warning");
    expect(snapshot.tone).toBe("warning");
    expect(snapshot.lastSyncLabel).toBe("Cached snapshot stale by 4h");
    expect(snapshot.warningReason).toBe(
      "Automatic refresh is overdue; showing cached data.",
    );
    expect(snapshot.warningDiagnostic).toMatchObject({
      code: "sync.cached_state_stale",
      category: "sync_stale",
      severity: "warning",
      rawMessage: snapshot.warningReason,
      params: {
        providerId: "cursor",
        syncStaleKind: "cached_state_stale",
        ageMinutes: 240,
        staleAfterMinutes: 60,
      },
    });
  });

  it("adds a typed automatic-sync overdue diagnostic for stale error states", () => {
    const state = reconcileAppStateHealth(
      buildStateWithProvider({
        syncStatus: "error",
        tone: "error",
      }),
      NOW,
    );
    const snapshot = state.providers[0];

    expect(snapshot.syncStatus).toBe("error");
    expect(snapshot.tone).toBe("error");
    expect(snapshot.lastSyncLabel).toBe("Last failed sync 4h ago");
    expect(snapshot.warningReason).toBe(
      "Automatic sync is overdue; cached state may be stale.",
    );
    expect(snapshot.warningDiagnostic).toMatchObject({
      code: "sync.automatic_sync_overdue",
      category: "sync_stale",
      severity: "warning",
      rawMessage: snapshot.warningReason,
      params: {
        providerId: "cursor",
        syncStaleKind: "automatic_sync_overdue",
        ageMinutes: 240,
        staleAfterMinutes: 60,
      },
    });
  });

  it("does not overwrite existing provider warning diagnostics", () => {
    const existingDiagnostic = createUsageThresholdDiagnostic({
      providerId: "cursor",
      usageThresholdKind: "threshold_warning",
      rawMessage: "80% of included requests consumed",
      usagePercent: 80,
      thresholdPercent: 80,
    });
    const state = reconcileAppStateHealth(
      buildStateWithProvider({
        warningReason: existingDiagnostic.rawMessage,
        warningDiagnostic: existingDiagnostic,
      }),
      NOW,
    );
    const snapshot = state.providers[0];

    expect(snapshot.syncStatus).toBe("warning");
    expect(snapshot.lastSyncLabel).toBe("Cached snapshot stale by 4h");
    expect(snapshot.warningReason).toBe(existingDiagnostic.rawMessage);
    expect(snapshot.warningDiagnostic).toEqual(existingDiagnostic);
  });
});
