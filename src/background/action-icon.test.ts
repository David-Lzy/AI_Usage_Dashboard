import { afterEach, describe, expect, it, vi } from "vitest";

import type { AppState } from "../providers/types";
import { SAMPLE_APP_STATE } from "../shared/constants";
import { buildActionBadgeQuotaCandidates } from "../shared/action-badge-preferences";
import {
  buildProviderFaviconUrl,
  resolveToolbarIconProviderId,
} from "./action-icon";

function createStateWithCodexBadge(): AppState {
  const state = {
    ...SAMPLE_APP_STATE,
    providers: SAMPLE_APP_STATE.providers.map((provider) =>
      provider.providerId === "codex"
        ? {
            ...provider,
            remaining: 51,
            quotaUnit: "percent" as const,
            usageWindows: [
              {
                label: "Weekly usage window",
                normalizedLabel: "Weekly usage window",
                kind: "weekly" as const,
                modelLabel: null,
                quotaUnit: "percent" as const,
                used: 49,
                remaining: 51,
                total: 100,
                resetAt: "2026-05-19T09:15:00.000Z",
                resetLabel: "Resets Tuesday",
              },
            ],
          }
        : provider,
    ),
  };
  const weeklyCandidate = buildActionBadgeQuotaCandidates(state).find(
    (candidate) => candidate.providerId === "codex",
  );

  return {
    ...state,
    settings: {
      ...state.settings,
      actionBadgeSelection: weeklyCandidate?.value ?? "attention",
      toolbarIconMode: "match-badge",
    },
  };
}

describe("action icon", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("resolves provider icons from explicit provider settings", () => {
    const state: AppState = {
      ...SAMPLE_APP_STATE,
      settings: {
        ...SAMPLE_APP_STATE.settings,
        toolbarIconMode: "provider",
        toolbarIconProviderId: "claude-code",
      },
    };

    expect(resolveToolbarIconProviderId(state)).toBe("claude-code");
  });

  it("matches the selected quota badge provider when configured", () => {
    expect(resolveToolbarIconProviderId(createStateWithCodexBadge())).toBe(
      "codex",
    );
  });

  it("falls back to the default icon for attention-count badges", () => {
    const state: AppState = {
      ...SAMPLE_APP_STATE,
      settings: {
        ...SAMPLE_APP_STATE.settings,
        toolbarIconMode: "match-badge",
        actionBadgeSelection: "attention",
      },
    };

    expect(resolveToolbarIconProviderId(state)).toBeNull();
  });

  it("builds Chrome favicon API URLs for provider toolbar icons", () => {
    vi.stubGlobal("chrome", {
      runtime: {
        getURL: (path: string) => `chrome-extension://extension-id${path}`,
      },
    });

    expect(buildProviderFaviconUrl("codex", 32)).toBe(
      "chrome-extension://extension-id/_favicon/?pageUrl=https%3A%2F%2Fchatgpt.com%2F&size=32",
    );
  });
});
