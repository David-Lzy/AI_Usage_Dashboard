import { describe, expect, it } from "vitest";

import type { AppState } from "../providers/types";
import { SAMPLE_APP_STATE } from "./constants";
import {
  buildActionBadgeQuotaCandidates,
  buildActionBadgeSelectOptions,
  getEffectiveActionBadgeSelection,
  normalizeActionBadgeSelection,
} from "./action-badge-preferences";
import { createRuntimeI18n } from "./i18n";

function createStateWithCodexWindows(): AppState {
  return {
    ...SAMPLE_APP_STATE,
    providers: SAMPLE_APP_STATE.providers.map((provider) =>
      provider.providerId === "codex"
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

describe("action badge preferences", () => {
  it("normalizes unknown values to the attention badge", () => {
    expect(normalizeActionBadgeSelection("codex-weekly")).toBe("attention");
    expect(normalizeActionBadgeSelection("quota:codex:primary")).toBe(
      "quota:codex:primary",
    );
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
      candidates.some((candidate) => candidate.providerId === "claude-code"),
    ).toBe(false);
  });

  it("falls back to attention when a stored quota selection is no longer available", () => {
    const state = {
      ...SAMPLE_APP_STATE,
      settings: {
        ...SAMPLE_APP_STATE.settings,
        actionBadgeSelection: "quota:claude-code:primary",
      },
    };

    expect(getEffectiveActionBadgeSelection(state)).toBe("attention");
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
      "Codex · Weekly usage window 剩余",
    );
  });
});
