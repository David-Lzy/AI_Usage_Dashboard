import { describe, expect, it } from "vitest";

import type { AppState } from "../providers/types";
import { SAMPLE_APP_STATE } from "./constants";
import {
  buildActionBadgeQuotaCandidates,
  buildActionBadgeSelectOptions,
  getEffectiveActionBadgeSelection,
  getSelectedActionBadgeSelections,
  normalizeActionBadgeSelections,
  normalizeActionBadgeSelection,
} from "./action-badge-preferences";
import { createRuntimeI18n } from "./i18n";

function createStateWithCodexWindows(): AppState {
  return {
    ...SAMPLE_APP_STATE,
    providers: SAMPLE_APP_STATE.providers.map((provider) =>
      provider.providerId === "codex-personal-page"
        ? {
            ...provider,
            syncStatus: "ok",
            tone: "neutral",
            remaining: 32,
            quotaUnit: "percent",
            usageSummary:
              "Visible Codex usage: 5-hour usage window: 100% remaining · Weekly usage window: 32% remaining",
            usageWindows: [
              {
                label: "5-hour usage window",
                normalizedLabel: "5-hour usage window",
                kind: "rolling_5h",
                modelLabel: null,
                quotaUnit: "percent",
                used: 0,
                remaining: 100,
                total: 100,
                resetAt: "2026-05-03T10:00:00.000Z",
                resetLabel: "Resets in 2h",
              },
              {
                label: "Weekly usage window",
                normalizedLabel: "Weekly usage window",
                kind: "weekly",
                modelLabel: null,
                quotaUnit: "percent",
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
}

function createStateWithCustomSource(): AppState {
  return {
    ...SAMPLE_APP_STATE,
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
          used: 72,
          remaining: 28,
          total: 100,
          resetAt: "2026-06-27T10:00:00.000Z",
          resetLabel: "Resets tomorrow",
          syncedAt: "2026-06-26T10:00:00.000Z",
          syncStatus: "ok",
          tone: "neutral",
          warningReason: null,
          lastSyncLabel: "Just now",
          usageSummary: "28% daily quota remaining",
          quota: {
            label: "Daily quota",
            unit: "percent",
            window: "daily",
            used: 72,
            remaining: 28,
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
}

describe("action badge preferences", () => {
  it("normalizes unknown values to the attention badge", () => {
    expect(normalizeActionBadgeSelection("codex-weekly")).toBe("attention");
    expect(normalizeActionBadgeSelection("quota:codex:primary")).toBe(
      "quota:codex:primary",
    );
    expect(
      normalizeActionBadgeSelections([
        "attention",
        "quota:codex:primary",
        "quota:codex:primary",
        "unknown",
      ]),
    ).toEqual(["attention", "quota:codex:primary"]);
  });

  it("builds quota candidates only from visible providers with remaining data", () => {
    const candidates = buildActionBadgeQuotaCandidates(createStateWithCodexWindows());

    expect(candidates.map((candidate) => candidate.sourceLabel)).toContain(
      "5-hour usage window",
    );
    expect(candidates.map((candidate) => candidate.sourceLabel)).toContain(
      "Weekly usage window",
    );
    expect(
      candidates.some((candidate) => candidate.providerId === "claude-code-team-page"),
    ).toBe(false);
  });

  it("falls back to attention when a stored quota selection is no longer available", () => {
    const state = {
      ...SAMPLE_APP_STATE,
      settings: {
        ...SAMPLE_APP_STATE.settings,
        actionBadgeSelectionMode: "manual" as const,
        actionBadgeSelection: "quota:claude-code:primary",
        actionBadgeSelections: ["quota:claude-code:primary"],
      },
    };

    expect(getEffectiveActionBadgeSelection(state)).toBe("attention");
  });

  it("rotates through selected badge entries by interval", () => {
    const state = createStateWithCodexWindows();
    const candidateValues = buildActionBadgeQuotaCandidates(state)
      .filter((candidate) => candidate.providerId === "codex-personal-page")
      .map((candidate) => candidate.value);
    const rotatingState = {
      ...state,
      settings: {
        ...state.settings,
        actionBadgeSelectionMode: "manual" as const,
        actionBadgeSelections: ["attention", ...candidateValues],
        actionBadgeRotationIntervalSeconds: 60,
      },
    };

    expect(getSelectedActionBadgeSelections(rotatingState)).toEqual([
      "attention",
      ...candidateValues,
    ]);
    expect(getEffectiveActionBadgeSelection(rotatingState, 0)).toBe("attention");
    expect(getEffectiveActionBadgeSelection(rotatingState, 60_000)).toBe(
      candidateValues[0],
    );
    expect(getEffectiveActionBadgeSelection(rotatingState, 120_000)).toBe(
      candidateValues[1],
    );
  });

  it("formats select options with dynamic provider quota entries", () => {
    const state = createStateWithCodexWindows();
    const options = buildActionBadgeSelectOptions(
      state,
      createRuntimeI18n("zh-CN"),
    );

    expect(options[0]).toEqual({
      value: "attention",
      label: "异常数量",
    });
    expect(options.map((option) => option.label)).toContain(
      "Codex Personal · Weekly usage window 剩余",
    );
  });

  it("includes visible custom source remaining values as badge candidates", () => {
    const state = createStateWithCustomSource();
    const candidates = buildActionBadgeQuotaCandidates(state);
    const customCandidate = candidates.find(
      (candidate) => candidate.providerId === "custom:build_quota",
    );

    expect(customCandidate).toMatchObject({
      kind: "custom_source",
      providerLabel: "Build Quota",
      sourceLabel: "Daily quota",
      remaining: 28,
      quotaUnit: "percent",
    });
    expect(buildActionBadgeSelectOptions(state, createRuntimeI18n("en"))).toContainEqual(
      {
        value: "quota:custom:build_quota:primary",
        label: "Build Quota · Daily quota remaining",
      },
    );
  });
});
