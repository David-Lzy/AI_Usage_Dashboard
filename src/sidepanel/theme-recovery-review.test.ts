import { describe, expect, it } from "vitest";

import type { AppState, ProviderId, ProviderSnapshot, ProviderSetting } from "../providers/types";
import { SAMPLE_APP_STATE } from "../shared/constants";
import {
  buildThemeRecoveryReviewSnapshot,
  buildThemeRecoveryReviewSummary,
} from "./theme-recovery-review";

function cloneSampleState(): AppState {
  return structuredClone(SAMPLE_APP_STATE);
}

function updateProvider(
  state: AppState,
  providerId: ProviderId,
  updater: (provider: ProviderSnapshot) => ProviderSnapshot,
) {
  state.providers = state.providers.map((provider) =>
    provider.providerId === providerId ? updater(provider) : provider,
  );
}

function updateProviderSetting(
  state: AppState,
  providerId: ProviderId,
  updater: (provider: ProviderSetting) => ProviderSetting,
) {
  state.providerSettings = state.providerSettings.map((provider) =>
    provider.id === providerId ? updater(provider) : provider,
  );
}

function isolateRecoveryTargets(state: AppState) {
  state.settings.themeMode = "light";
  state.settings.themePreset = "custom";
  state.settings.themeCustomSeedHex = "#4F46E5";

  state.providerSettings = state.providerSettings.map((provider) => ({
    ...provider,
    displayEnabled:
      provider.id === "cursor-personal-page" ||
      provider.id === "codex-personal-page",
  }));

  updateProviderSetting(state, "cursor-personal-page", (provider) => ({
    ...provider,
    sourcePreference: "session_page",
  }));
  updateProviderSetting(state, "codex-personal-page", (provider) => ({
    ...provider,
    sourcePreference: "session_page",
  }));

  updateProvider(state, "cursor-personal-page", (provider) => ({
    ...provider,
    syncSource: "page_parse",
    syncedAt: "2026-04-23 13:20",
    lastSyncLabel: "Synced 1m ago",
  }));
  updateProvider(state, "codex-personal-page", (provider) => ({
    ...provider,
    syncSource: "page_parse",
    syncedAt: "2026-04-23 13:20",
    lastSyncLabel: "Synced 1m ago",
  }));
}

function setDegradedRecoveryState(state: AppState) {
  isolateRecoveryTargets(state);

  updateProviderSetting(state, "cursor-personal-page", (provider) => ({
    ...provider,
    status: "missing",
  }));
  updateProviderSetting(state, "codex-personal-page", (provider) => ({
    ...provider,
    status: "missing",
  }));

  updateProvider(state, "cursor-personal-page", (provider) => ({
    ...provider,
    syncStatus: "ok",
    tone: "neutral",
    warningReason: "Host access missing for the personal usage page.",
  }));
  updateProvider(state, "codex-personal-page", (provider) => ({
    ...provider,
    syncStatus: "ok",
    tone: "neutral",
    warningReason: "Host access missing for the personal usage page.",
  }));
}

function setRecoveredState(state: AppState) {
  isolateRecoveryTargets(state);

  updateProviderSetting(state, "cursor-personal-page", (provider) => ({
    ...provider,
    status: "granted",
  }));
  updateProviderSetting(state, "codex-personal-page", (provider) => ({
    ...provider,
    status: "granted",
  }));

  updateProvider(state, "cursor-personal-page", (provider) => ({
    ...provider,
    syncStatus: "ok",
    tone: "neutral",
    warningReason: null,
    planName: "Cursor Personal Dashboard",
  }));
  updateProvider(state, "codex-personal-page", (provider) => ({
    ...provider,
    syncStatus: "ok",
    tone: "neutral",
    warningReason: null,
    planName: "Codex personal usage pages",
  }));
}

describe("theme recovery review snapshot", () => {
  it("reports an isolated degraded recovery pass as needs access", () => {
    const state = cloneSampleState();

    setDegradedRecoveryState(state);

    const snapshot = buildThemeRecoveryReviewSnapshot(
      state,
      "light",
      "2026-04-23T13:20:00.000Z",
    );

    expect(snapshot.themePreset).toBe("custom");
    expect(snapshot.themeCustomSeedHex).toBe("#4F46E5");
    expect(snapshot.scopeIsolationLabel).toBe("Cursor + Codex isolated");
    expect(snapshot.overallStage).toBe("needs_access");
    expect(snapshot.overallLabel).toBe("Needs access");
    expect(snapshot.popupSnapshotLabel).toBe("Mixed state");
    expect(snapshot.computedActionBadge.text).toBe("2");
    expect(snapshot.targetProviders.map((provider) => provider.recoveryLabel)).toEqual([
      "Needs access",
      "Needs access",
    ]);
  });

  it("reports an isolated recovered pass as recovered with a cleared badge", () => {
    const state = cloneSampleState();

    setRecoveredState(state);

    const snapshot = buildThemeRecoveryReviewSnapshot(
      state,
      "dark",
      "2026-04-23T13:21:00.000Z",
    );

    expect(snapshot.scopeIsolationLabel).toBe("Cursor + Codex isolated");
    expect(snapshot.overallStage).toBe("recovered");
    expect(snapshot.overallLabel).toBe("Recovered");
    expect(snapshot.popupSnapshotLabel).toBe("Aligned");
    expect(snapshot.computedActionBadge.text).toBe("");
    expect(snapshot.targetProviders.every((provider) => provider.isRecovered)).toBe(
      true,
    );
  });

  it("keeps the stage mixed when extra visible providers can skew popup alignment", () => {
    const state = cloneSampleState();

    setRecoveredState(state);
    updateProviderSetting(state, "claude-code-team-page", (provider) => ({
      ...provider,
      displayEnabled: true,
    }));

    const snapshot = buildThemeRecoveryReviewSnapshot(
      state,
      "dark",
      "2026-04-23T13:22:00.000Z",
    );
    const summary = buildThemeRecoveryReviewSummary(snapshot);

    expect(snapshot.scopeIsolationLabel).toBe("Additional providers visible");
    expect(snapshot.overallStage).toBe("mixed");
    expect(snapshot.extraVisibleProviderLabels).toContain("Claude Team");
    expect(summary).toContain("Additional providers visible");
  });

  it("includes request binding details in the summary when the workspace is request-bound", () => {
    const state = cloneSampleState();

    setRecoveredState(state);

    const snapshot = buildThemeRecoveryReviewSnapshot(
      state,
      "dark",
      "2026-04-23T13:23:00.000Z",
      {
        requestId: "2026-04-23-first-real-theme-recovery-review-request",
        requestCreatedAt: "2026-04-23T11:13:03.801Z",
        requestBoundWorkspaceRoute:
          "http://127.0.0.1:4173/src/sidepanel/index.html?themeRecoveryRequestId=2026-04-23-first-real-theme-recovery-review-request&themeRecoveryRequestCreatedAt=2026-04-23T11%3A13%3A03.801Z#debug-theme-recovery-review",
      },
    );
    const summary = buildThemeRecoveryReviewSummary(snapshot);

    expect(snapshot.requestContext?.requestId).toBe(
      "2026-04-23-first-real-theme-recovery-review-request",
    );
    expect(summary).toContain(
      "Request binding: 2026-04-23-first-real-theme-recovery-review-request @ 2026-04-23T11:13:03.801Z",
    );
  });
});
