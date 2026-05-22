import { describe, expect, it } from "vitest";

import type { AppState } from "../providers/types";
import { SAMPLE_APP_STATE } from "./constants";
import {
  buildProviderProgressItemIdsByProvider,
  buildProviderProgressItems,
} from "./provider-progress-items";

function createCodexWindowState(): AppState {
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
            usageBalances: [
              {
                label: "Flex credits",
                normalizedLabel: "Flex credits",
                kind: "flex_credit_balance",
                quotaUnit: "credits",
                remaining: 12,
                total: null,
                detail: "Visible balance card",
              },
            ],
          }
        : provider,
    ),
  };
}

describe("provider progress items", () => {
  it("builds a primary quota item when no usage windows are present", () => {
    const jetbrains = SAMPLE_APP_STATE.providers.find(
      (provider) => provider.providerId === "jetbrains-org-page",
    );

    expect(jetbrains).toBeDefined();
    expect(buildProviderProgressItems(jetbrains!)).toEqual([
      expect.objectContaining({
        id: "primary",
        kind: "primary_quota",
        providerId: "jetbrains-org-page",
        label: "monthly credits",
        used: 16,
        remaining: 4,
        total: 20,
        availability: "progress",
      }),
    ]);
  });

  it("uses usage windows and balances without duplicating the primary quota", () => {
    const codex = createCodexWindowState().providers.find(
      (provider) => provider.providerId === "codex-personal-page",
    );

    expect(codex).toBeDefined();
    expect(buildProviderProgressItems(codex!).map((item) => item.id)).toEqual([
      "window:rolling_5h:5-hour%20usage%20window::0",
      "window:weekly:Weekly%20usage%20window::1",
      "balance:flex_credit_balance:Flex%20credits:0",
    ]);
    expect(buildProviderProgressItems(codex!).map((item) => item.kind)).toEqual([
      "usage_window",
      "usage_window",
      "usage_balance",
    ]);
  });

  it("normalizes percent usage windows to a 100 total", () => {
    const codex = createCodexWindowState().providers.find(
      (provider) => provider.providerId === "codex-personal-page",
    );
    const driftedCodex = {
      ...codex!,
      usageWindows: codex!.usageWindows?.map((usageWindow) =>
        usageWindow.kind === "weekly"
          ? {
              ...usageWindow,
              used: 17,
              remaining: 83,
              total: 83,
            }
          : usageWindow,
      ),
    };

    const weeklyItem = buildProviderProgressItems(driftedCodex).find(
      (item) => item.id === "window:weekly:Weekly%20usage%20window::1",
    );

    expect(weeklyItem).toEqual(
      expect.objectContaining({
        availability: "progress",
        remaining: 83,
        total: 100,
        used: 17,
      }),
    );
  });

  it("does not fabricate progress items for policy-only totals", () => {
    const gemini = SAMPLE_APP_STATE.providers.find(
      (provider) => provider.providerId === "gemini-policy",
    );

    expect(gemini).toBeDefined();
    expect(buildProviderProgressItems(gemini!)).toEqual([]);
  });

  it("builds provider id maps for display preference normalization", () => {
    const idsByProvider = buildProviderProgressItemIdsByProvider(
      createCodexWindowState().providers,
    );

    expect(idsByProvider["codex-personal-page"]).toEqual([
      "window:rolling_5h:5-hour%20usage%20window::0",
      "window:weekly:Weekly%20usage%20window::1",
      "balance:flex_credit_balance:Flex%20credits:0",
    ]);
    expect(idsByProvider["gemini-policy"]).toEqual([]);
  });
});
