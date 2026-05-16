import { describe, expect, it } from "vitest";

import type { AppState } from "../providers/types";
import { SAMPLE_APP_STATE } from "./constants";
import { selectVisibleProviderProgressItems } from "./provider-progress-item-selection";

function createWindowState(): AppState {
  return {
    ...SAMPLE_APP_STATE,
    providers: SAMPLE_APP_STATE.providers.map((provider) =>
      provider.providerId === "codex-personal-page"
        ? {
            ...provider,
            quotaUnit: "percent",
            used: 68,
            remaining: 32,
            total: 100,
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

describe("provider progress item selection", () => {
  it("defaults to all discovered progress items in inventory order", () => {
    const state = createWindowState();
    const codex = state.providers.find((provider) => provider.providerId === "codex-personal-page");

    expect(codex).toBeDefined();
    expect(
      selectVisibleProviderProgressItems(
        codex!,
        "popup",
        state.settings.progressItemsBySurface,
      ).map((item) => item.label),
    ).toEqual(["5-hour usage window", "Weekly usage window"]);
  });

  it("applies saved visibility and order for one surface", () => {
    const state = createWindowState();
    const codex = state.providers.find((provider) => provider.providerId === "codex-personal-page");

    expect(codex).toBeDefined();
    expect(
      selectVisibleProviderProgressItems(codex!, "popup", {
        popup: {
          "codex-personal-page": [
            {
              id: "window:weekly:Weekly%20usage%20window::1",
              visible: true,
            },
            {
              id: "window:rolling_5h:5-hour%20usage%20window::0",
              visible: false,
            },
          ],
        },
        sidebar: {},
        fullPage: {},
      }).map((item) => item.label),
    ).toEqual(["Weekly usage window"]);
  });
});
