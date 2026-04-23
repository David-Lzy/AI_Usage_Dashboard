import { describe, expect, it } from "vitest";

import type { AppState } from "../providers/types";
import { SAMPLE_APP_STATE } from "../shared/constants";
import {
  buildSummaryItems,
  getProviderViewModel,
  getVisibleProviders,
} from "./view-models";

function createState(overrides?: Partial<AppState>): AppState {
  return {
    ...SAMPLE_APP_STATE,
    ...overrides,
    providers: overrides?.providers ?? SAMPLE_APP_STATE.providers,
    providerSettings:
      overrides?.providerSettings ?? SAMPLE_APP_STATE.providerSettings,
    settings: overrides?.settings ?? SAMPLE_APP_STATE.settings,
  };
}

describe("sidepanel view models", () => {
  it("sorts visible providers by severity and access gap first", () => {
    const providers = getVisibleProviders(createState());

    expect(providers.map((provider) => provider.providerId)).toEqual([
      "claude-code",
      "codex",
      "gemini",
      "cursor",
    ]);
  });

  it("escalates a healthy provider to warning when host access is missing", () => {
    const state = createState({
      providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) =>
        provider.id === "cursor" ? { ...provider, status: "missing" } : provider,
      ),
    });

    const cursor = getProviderViewModel(state, "cursor");

    expect(cursor).not.toBeNull();
    expect(cursor?.displaySyncStatus).toBe("warning");
    expect(cursor?.displayTone).toBe("warning");
    expect(cursor?.permissionStatus).toBe("missing");
  });

  it("builds summary items for visible health, access gaps, and attention", () => {
    const summaryItems = buildSummaryItems(createState());

    expect(summaryItems).toEqual([
      { label: "Visible", value: "4", tone: "neutral" },
      { label: "Healthy", value: "1", tone: "neutral" },
      { label: "Needs Access", value: "0", tone: "neutral" },
      { label: "Needs Attention", value: "3", tone: "error" },
    ]);
  });

  it("maps provider snapshots to user-facing source labels", () => {
    const codex = getProviderViewModel(createState(), "codex");
    const cursor = getProviderViewModel(createState(), "cursor");
    const gemini = getProviderViewModel(createState(), "gemini");
    const jetbrains = getProviderViewModel(createState(), "jetbrains");

    expect(codex?.currentSourceContractLabel).toBe("Shipped enterprise analytics");
    expect(codex?.sessionPageContractLabel).toBe("Shipped personal partial");
    expect(codex?.currentSourceGraduationGateLabel).toBeNull();
    expect(codex?.currentSourceFidelityLabel).toBe("Analytics snapshot");
    expect(codex?.currentAccessModelLabel).toBe("Stored credential");
    expect(cursor?.currentSourceContractLabel).toBe("Shipped personal partial");
    expect(cursor?.currentSourceFidelityLabel).toBe("Window-only vendor value");
    expect(cursor?.hostAccessRequirementLabel).toBe("Required");
    expect(gemini?.currentSourceLabel).toBe("Policy only");
    expect(gemini?.currentSourceContractLabel).toBe("Shipped policy only");
    expect(gemini?.sessionPageContractLabel).toBe("Deferred project metrics");
    expect(gemini?.sessionPageGraduationGateLabel).toBe(
      "Accept project-metrics support",
    );
    expect(gemini?.currentSourceFidelityLabel).toBe("Documented policy");
    expect(gemini?.cookiePolicyLabel).toBe("Forbidden");
    expect(gemini?.currentSourceStateKind).toBe("policy_only");
    expect(jetbrains?.currentSourceLabel).toBe("Session page");
    expect(jetbrains?.currentSourceContractLabel).toBe(
      "Deferred org console path",
    );
    expect(jetbrains?.currentSourceGraduationGateLabel).toBe(
      "Reverify org-visible Console session",
    );
    expect(jetbrains?.currentSourceFidelityLabel).toBe("Exact vendor value");
  });
});
