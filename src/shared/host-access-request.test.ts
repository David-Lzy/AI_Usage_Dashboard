import { describe, expect, it } from "vitest";

import type { AppState } from "../providers/types";
import { SAMPLE_APP_STATE } from "./constants";
import { findHostAccessRefreshCandidate } from "./host-access-request";

function createState(overrides?: Partial<AppState>): AppState {
  return {
    ...structuredClone(SAMPLE_APP_STATE),
    ...overrides,
  };
}

describe("host access refresh helpers", () => {
  it("returns the requested provider when refresh targets one missing grant", () => {
    const state = createState({
      providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) =>
        provider.id === "codex-personal-page"
          ? { ...provider, status: "missing" as const }
          : provider,
      ),
    });

    expect(findHostAccessRefreshCandidate(state, "codex-personal-page")?.id).toBe("codex-personal-page");
  });

  it("does not pick a refresh-all candidate when multiple grants are missing", () => {
    const state = createState({
      providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) =>
        provider.id === "codex-personal-page" || provider.id === "cursor-personal-page"
          ? { ...provider, status: "missing" as const }
          : provider,
      ),
    });

    expect(findHostAccessRefreshCandidate(state)).toBeNull();
  });

  it("uses the only enabled missing-grant provider for refresh-all", () => {
    const state = createState({
      providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) =>
        provider.id === "codex-personal-page"
          ? { ...provider, status: "missing" as const }
          : provider,
      ),
    });

    expect(findHostAccessRefreshCandidate(state)?.id).toBe("codex-personal-page");
  });
});
