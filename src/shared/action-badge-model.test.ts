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
});
