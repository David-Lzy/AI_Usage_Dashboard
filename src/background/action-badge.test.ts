import { describe, expect, it } from "vitest";

import { SAMPLE_APP_STATE } from "../shared/constants";
import { buildActionBadgeQuotaCandidates } from "../shared/action-badge-preferences";
import { buildActionBadgeModel } from "./action-badge";

function createStateWithCodexWindows() {
  const state = {
    ...SAMPLE_APP_STATE,
    providers: SAMPLE_APP_STATE.providers.map((provider) =>
      provider.providerId === "codex"
        ? {
            ...provider,
            syncStatus: "ok" as const,
            tone: "neutral" as const,
            warningReason: null,
            remaining: 32,
            quotaUnit: "percent" as const,
            usageSummary:
              "Visible Codex usage: 5-hour usage window: 100% remaining · Weekly usage window: 32% remaining",
            usageWindows: [
              {
                label: "5-hour usage window",
                normalizedLabel: "5-hour usage window",
                kind: "rolling_5h" as const,
                modelLabel: null,
                quotaUnit: "percent" as const,
                used: 0,
                remaining: 100,
                total: 100,
                resetAt: "2026-05-03T10:00:00.000Z",
                resetLabel: "Resets in 2h",
              },
              {
                label: "Weekly usage window",
                normalizedLabel: "Weekly usage window",
                kind: "weekly" as const,
                modelLabel: null,
                quotaUnit: "percent" as const,
                used: 68,
                remaining: 32,
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
    (candidate) => candidate.sourceLabel === "Weekly usage window",
  );

  return {
    ...state,
    settings: {
      ...state.settings,
      actionBadgeSelection: weeklyCandidate?.value ?? "attention",
      actionBadgeSelections: [weeklyCandidate?.value ?? "attention"],
    },
  };
}

describe("action badge", () => {
  it("clears the badge when no visible provider needs attention", () => {
    const model = buildActionBadgeModel({
      ...SAMPLE_APP_STATE,
      providers: SAMPLE_APP_STATE.providers.map((provider) => ({
        ...provider,
        syncStatus: "ok",
        tone: "neutral",
        warningReason: null,
      })),
      providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) => ({
        ...provider,
        status: "granted",
      })),
    });

    expect(model.text).toBe("");
    expect(model.title).toContain("all visible providers are healthy");
  });

  it("shows the number of visible providers needing attention", () => {
    const model = buildActionBadgeModel(SAMPLE_APP_STATE);

    expect(model.text).toBe("3");
    expect(model.title).toContain("3 visible providers need attention");
    expect(model.backgroundColor).toEqual([161, 84, 0, 255]);
  });

  it("shows a selected quota source when the badge is configured for remaining usage", () => {
    const model = buildActionBadgeModel(createStateWithCodexWindows());

    expect(model.text).toBe("32%");
    expect(model.title).toContain("Selected badge");
    expect(model.title).toContain("  Provider: Codex");
    expect(model.title).toContain("  Source: Weekly usage window");
    expect(model.title).toContain("  Remaining: 32% remaining");
    expect(model.title).toContain("  Reset: Resets Thursday");
    expect(model.title).toContain("Visible providers");
    expect(model.title).toContain("  Cursor: Healthy");
    expect(model.title).toContain("    Billing period: Mar 23 - Apr 21");
    expect(model.title).toContain(
      "    Total spend: $0; Included: $0; On-demand: $0",
    );
    expect(model.title).toContain("    Weekly usage window: 32% remaining");
    expect(model.title).not.toContain("Details:");
    expect(model.backgroundColor).toEqual([46, 125, 50, 255]);
  });

  it("keeps full percent values short enough for Chrome action badge rendering", () => {
    const state = createStateWithCodexWindows();
    const firstWindowCandidate = buildActionBadgeQuotaCandidates(state).find(
      (candidate) => candidate.sourceLabel === "5-hour usage window",
    );
    const model = buildActionBadgeModel({
      ...state,
      settings: {
        ...state.settings,
        actionBadgeSelection: firstWindowCandidate?.value ?? "attention",
        actionBadgeSelections: [firstWindowCandidate?.value ?? "attention"],
      },
    });

    expect(model.text).toBe("100");
    expect(model.title).toContain("  Remaining: 100% remaining");
  });

  it("uses the active rotated badge selection for toolbar text", () => {
    const state = createStateWithCodexWindows();
    const candidateValues = buildActionBadgeQuotaCandidates(state)
      .filter((candidate) => candidate.providerId === "codex")
      .map((candidate) => candidate.value);
    const rotatingState = {
      ...state,
      settings: {
        ...state.settings,
        actionBadgeSelections: candidateValues,
        actionBadgeRotationIntervalSeconds: 60,
      },
    };

    expect(buildActionBadgeModel(rotatingState, 0).title).toContain(
      "  Source: 5-hour usage window",
    );
    expect(buildActionBadgeModel(rotatingState, 60_000).title).toContain(
      "  Source: Weekly usage window",
    );
  });
});
