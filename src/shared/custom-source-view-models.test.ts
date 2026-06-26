import { describe, expect, it } from "vitest";

import type { AppState } from "../providers/types";
import { SAMPLE_APP_STATE } from "./constants";
import type {
  CustomSourceSetting,
  CustomSourceSnapshot,
  CustomSourceSyncState,
} from "./custom-sources";
import {
  buildCustomSourceProgressItemIdsBySource,
  getVisibleCustomSources,
  hasCustomSourceAttention,
  selectVisibleCustomSourceProgressItems,
} from "./custom-source-view-models";

const CUSTOM_SOURCE: CustomSourceSetting = {
  id: "custom:build_quota",
  label: "Build Quota",
  description: "Internal quota endpoint",
  endpointUrl: "https://example.com/ai-usage.json",
  displayEnabled: true,
  refreshIntervalMinutes: 15,
  createdAt: "2026-06-26T00:00:00.000Z",
  updatedAt: "2026-06-26T00:00:00.000Z",
};

const CUSTOM_SNAPSHOT: CustomSourceSnapshot = {
  sourceId: "custom:build_quota",
  endpointId: "build_quota",
  label: "Build Quota Live",
  description: "Live custom usage",
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
    resetAt: "2026-06-27T10:00:00.000Z",
    resetLabel: "Resets tomorrow",
  },
  windows: [
    {
      label: "Hourly quota",
      unit: "requests",
      window: "hourly",
      used: 40,
      remaining: 60,
      total: 100,
      resetAt: null,
      resetLabel: "Resets in 20m",
    },
  ],
  balances: [
    {
      label: "Credits",
      unit: "credits",
      window: null,
      used: null,
      remaining: 1200,
      total: null,
      resetAt: null,
      resetLabel: null,
    },
  ],
  facts: [
    {
      label: "Queue",
      value: "Healthy",
      detail: "No backlog",
    },
  ],
};

function createState(
  overrides: Partial<AppState> = {},
  syncStateOverrides: Partial<CustomSourceSyncState> = {},
): AppState {
  return {
    ...SAMPLE_APP_STATE,
    ...overrides,
    customSources: overrides.customSources ?? [CUSTOM_SOURCE],
    customSourceStates: overrides.customSourceStates ?? [
      {
        sourceId: "custom:build_quota",
        status: "ok",
        snapshot: CUSTOM_SNAPSHOT,
        lastAttemptAt: "2026-06-26T10:00:00.000Z",
        lastSuccessAt: "2026-06-26T10:00:00.000Z",
        lastFailureAt: null,
        lastFailureReason: null,
        stale: false,
        ...syncStateOverrides,
      },
    ],
    settings: {
      ...SAMPLE_APP_STATE.settings,
      ...overrides.settings,
    },
  };
}

describe("custom source view models", () => {
  it("builds visible custom source cards from settings and sync state", () => {
    const sources = getVisibleCustomSources(createState());

    expect(sources).toHaveLength(1);
    expect(sources[0]).toMatchObject({
      sourceId: "custom:build_quota",
      label: "Build Quota Live",
      statusLabel: "Healthy",
      usageSummary: "28% daily quota remaining",
    });
    expect(sources[0]?.progressItems.map((item) => item.id)).toEqual([
      "primary",
      "window:Hourly%20quota:hourly:0",
      "balance:Credits:0",
    ]);
  });

  it("respects surface order and progress visibility preferences", () => {
    const state = createState({
      settings: {
        ...SAMPLE_APP_STATE.settings,
        providerOrderBySurface: {
          ...SAMPLE_APP_STATE.settings.providerOrderBySurface,
          popup: ["codex-personal-page", "custom:build_quota"],
        },
        progressItemsBySurface: {
          ...SAMPLE_APP_STATE.settings.progressItemsBySurface,
          popup: {
            "custom:build_quota": [
              { id: "primary", visible: false },
              { id: "window:Hourly%20quota:hourly:0", visible: true },
              { id: "balance:Credits:0", visible: true },
            ],
          },
        },
      },
    });
    const [source] = getVisibleCustomSources(state, "popup");

    expect(source?.sourceId).toBe("custom:build_quota");
    expect(
      selectVisibleCustomSourceProgressItems(
        source!,
        "popup",
        state.settings.progressItemsBySurface,
      ).map((item) => item.id),
    ).toEqual(["window:Hourly%20quota:hourly:0", "balance:Credits:0"]);
  });

  it("marks stale or unsynced custom sources as needing attention", () => {
    const [staleSource] = getVisibleCustomSources(
      createState({}, { stale: true }),
    );
    const [unsyncedSource] = getVisibleCustomSources(
      createState(
        {},
        {
          status: "warning",
          snapshot: null,
          lastFailureReason: "Network error",
        },
      ),
    );

    expect(hasCustomSourceAttention(staleSource!)).toBe(true);
    expect(hasCustomSourceAttention(unsyncedSource!)).toBe(true);
  });

  it("reports known progress item ids for storage normalization", () => {
    expect(
      buildCustomSourceProgressItemIdsBySource([CUSTOM_SOURCE], [
        {
          sourceId: "custom:build_quota",
          status: "ok",
          snapshot: CUSTOM_SNAPSHOT,
          lastAttemptAt: null,
          lastSuccessAt: null,
          lastFailureAt: null,
          lastFailureReason: null,
          stale: false,
        },
      ]),
    ).toEqual({
      "custom:build_quota": [
        "primary",
        "window:Hourly%20quota:hourly:0",
        "balance:Credits:0",
      ],
    });
  });
});
