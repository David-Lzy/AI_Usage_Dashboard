import { describe, expect, it } from "vitest";

import type { AppState, ProviderId } from "../providers/types";
import { buildActionBadgeModel } from "./action-badge-model";
import { buildActionBadgeQuotaCandidates } from "./action-badge-preferences";
import { SAMPLE_APP_STATE } from "./constants";

function withVisibleProviders(providerIds: readonly ProviderId[]): AppState {
  return {
    ...SAMPLE_APP_STATE,
    providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) => ({
      ...provider,
      displayEnabled: providerIds.includes(provider.id),
    })),
  };
}

function createCodexQuotaState(remaining: number): AppState {
  const state = {
    ...withVisibleProviders(["codex-personal-page"]),
    providers: SAMPLE_APP_STATE.providers.map((provider) =>
      provider.providerId === "codex-personal-page"
        ? {
            ...provider,
            syncStatus: "ok" as const,
            tone: "neutral" as const,
            remaining,
            quotaUnit: "percent" as const,
            usageWindows: [
              {
                label: "Weekly usage window",
                normalizedLabel: "Weekly usage window",
                kind: "weekly" as const,
                modelLabel: null,
                quotaUnit: "percent" as const,
                used: 100 - remaining,
                remaining,
                total: 100,
                resetAt: "2026-05-07T10:00:00.000Z",
                resetLabel: "Resets Thursday",
              },
            ],
          }
        : provider,
    ),
  };
  const weeklyCandidate = buildActionBadgeQuotaCandidates(state).find(
    (candidate) =>
      candidate.providerId === "codex-personal-page" &&
      candidate.sourceLabel === "Weekly usage window",
  );

  if (!weeklyCandidate) {
    throw new Error("Expected Codex weekly quota badge candidate.");
  }

  return {
    ...state,
    settings: {
      ...state.settings,
      actionBadgeSelectionMode: "manual",
      actionBadgeSelection: weeklyCandidate.value,
      actionBadgeSelections: [weeklyCandidate.value],
    },
  };
}

function createCustomQuotaState(remaining: number): AppState {
  const state: AppState = {
    ...withVisibleProviders([]),
    customSources: [
      {
        id: "custom:build_quota",
        label: "Build Quota",
        description: "Internal quota endpoint",
        endpointUrl: "https://example.com/ai-usage.json",
        displayEnabled: true,
        refreshIntervalMinutes: 15,
        createdAt: "2026-06-26T00:00:00.000Z",
        updatedAt: "2026-06-26T00:00:00.000Z",
      },
    ],
    customSourceStates: [
      {
        sourceId: "custom:build_quota",
        status: "ok",
        snapshot: {
          sourceId: "custom:build_quota",
          endpointId: "build_quota",
          label: "Build Quota",
          description: "Internal quota endpoint",
          planName: "Custom",
          quotaUnit: "percent",
          quotaWindow: "daily",
          used: 100 - remaining,
          remaining,
          total: 100,
          resetAt: "2026-06-27T10:00:00.000Z",
          resetLabel: "Resets tomorrow",
          syncedAt: "2026-06-26T10:00:00.000Z",
          syncStatus: "ok",
          tone: "neutral",
          warningReason: null,
          lastSyncLabel: "Just now",
          usageSummary: `${remaining}% daily quota remaining`,
          quota: {
            label: "Daily quota",
            unit: "percent",
            window: "daily",
            used: 100 - remaining,
            remaining,
            total: 100,
            resetAt: null,
            resetLabel: "Resets tomorrow",
          },
          windows: [],
          balances: [],
          facts: [],
        },
        lastAttemptAt: "2026-06-26T10:00:00.000Z",
        lastSuccessAt: "2026-06-26T10:00:00.000Z",
        lastFailureAt: null,
        lastFailureReason: null,
        stale: false,
      },
    ],
  };
  const [customCandidate] = buildActionBadgeQuotaCandidates(state).filter(
    (candidate) => candidate.providerId === "custom:build_quota",
  );

  if (!customCandidate) {
    throw new Error("Expected custom quota badge candidate.");
  }

  return {
    ...state,
    settings: {
      ...state.settings,
      actionBadgeSelectionMode: "manual",
      actionBadgeSelection: customCandidate.value,
      actionBadgeSelections: [customCandidate.value],
    },
  };
}

describe("action badge model", () => {
  it("uses an empty transparent badge when no visible provider needs attention", () => {
    const model = buildActionBadgeModel(withVisibleProviders([]));

    expect(model).toEqual({
      text: "",
      title: "AI Usage Dashboard: all visible providers are healthy",
      backgroundColor: [0, 0, 0, 0],
    });
  });

  it("counts visible providers that need attention", () => {
    const model = buildActionBadgeModel(withVisibleProviders(["cursor-team-api"]));

    expect(model.text).toBe("1");
    expect(model.backgroundColor).toEqual([161, 84, 0, 255]);
    expect(model.title).toContain(
      "AI Usage Dashboard: 1 visible provider needs attention",
    );
    expect(model.title).toContain(
      "Cursor Team API: Cursor Admin API key is missing.",
    );
  });

  it("formats the selected quota badge with tooltip details", () => {
    const model = buildActionBadgeModel(createCodexQuotaState(51));

    expect(model.text).toBe("51%");
    expect(model.backgroundColor).toEqual([46, 125, 50, 255]);
    expect(model.title).toContain("Selected badge");
    expect(model.title).toContain("Provider: Codex Personal");
    expect(model.title).toContain("Source: Weekly usage window");
    expect(model.title).toContain("Remaining: 51% remaining");
    expect(model.title).toContain("Reset: Resets Thursday");
  });

  it("uses the error color for critically low selected quota badges", () => {
    const model = buildActionBadgeModel(createCodexQuotaState(5));

    expect(model.text).toBe("5%");
    expect(model.backgroundColor).toEqual([179, 38, 30, 255]);
  });

  it("formats selected custom source quota badges", () => {
    const model = buildActionBadgeModel(createCustomQuotaState(28));

    expect(model.text).toBe("28%");
    expect(model.title).toContain("Provider: Build Quota");
    expect(model.title).toContain("Source: Daily quota");
    expect(model.title).toContain("Remaining: 28% remaining");
  });
});
