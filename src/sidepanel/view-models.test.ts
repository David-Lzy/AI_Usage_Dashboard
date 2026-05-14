import { describe, expect, it } from "vitest";

import type { AppState, ProviderDiagnostic } from "../providers/types";
import { SAMPLE_APP_STATE } from "../shared/constants";
import { createRuntimeI18n } from "../shared/i18n";
import { buildProviderSourceDisplayLocalizedCopy } from "../shared/localized-copy";
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

  it("applies custom provider order for the selected surface", () => {
    const state = createState({
      settings: {
        ...SAMPLE_APP_STATE.settings,
        providerOrderBySurface: {
          ...SAMPLE_APP_STATE.settings.providerOrderBySurface,
          sidebar: ["cursor", "codex", "gemini", "claude-code", "jetbrains"],
          fullPage: ["gemini", "codex", "cursor", "claude-code", "jetbrains"],
        },
      },
    });

    expect(
      getVisibleProviders(state, undefined, "sidebar").map(
        (provider) => provider.providerId,
      ),
    ).toEqual(["cursor", "codex", "gemini", "claude-code"]);
    expect(
      getVisibleProviders(state, undefined, "fullPage").map(
        (provider) => provider.providerId,
      ),
    ).toEqual(["gemini", "codex", "cursor", "claude-code"]);
    expect(getVisibleProviders(state).map((provider) => provider.providerId)).toEqual([
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


  it("accepts a custom formatter for dashboard summary values", () => {
    const summaryItems = buildSummaryItems(
      createState(),
      undefined,
      (value) => `#${value}`,
    );

    expect(summaryItems).toEqual([
      { label: "Visible", value: "#4", tone: "neutral" },
      { label: "Healthy", value: "#1", tone: "neutral" },
      { label: "Needs Access", value: "#0", tone: "neutral" },
      { label: "Needs Attention", value: "#3", tone: "error" },
    ]);
  });

  it("maps provider snapshots to user-facing source labels", () => {
    const codex = getProviderViewModel(createState(), "codex");
    const cursor = getProviderViewModel(createState(), "cursor");
    const gemini = getProviderViewModel(createState(), "gemini");
    const jetbrains = getProviderViewModel(createState(), "jetbrains");

    expect(codex?.currentSourceContractLabel).toBe("Shipped enterprise analytics");
    expect(codex?.sessionPageContractLabel).toBe("Shipped personal partial");
    expect(codex?.openableSessionPageUrl).toBe(
      "https://chatgpt.com/codex/cloud/settings/analytics",
    );
    expect(codex?.currentSourceGraduationGateLabel).toBeNull();
    expect(codex?.currentSourceFidelityLabel).toBe("Analytics snapshot");
    expect(codex?.currentAccessModelLabel).toBe("Stored credential");
    expect(cursor?.currentSourceContractLabel).toBe("Shipped personal partial");
    expect(cursor?.currentSourceFidelityLabel).toBe("Window-only vendor value");
    expect(cursor?.hostAccessRequirementLabel).toBe("Required");
    expect(cursor?.openableSessionPageUrl).toBe(
      "https://cursor.com/cn/dashboard/usage",
    );
    expect(gemini?.currentSourceLabel).toBe("Policy only");
    expect(gemini?.currentSourceContractLabel).toBe("Shipped policy only");
    expect(gemini?.sessionPageContractLabel).toBe("Deferred project metrics");
    expect(gemini?.openableSessionPageUrl).toBeNull();
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
    expect(jetbrains?.openableSessionPageUrl).toBeNull();
    expect(jetbrains?.currentSourceGraduationGateLabel).toBe(
      "Reverify org-visible Console session",
    );
    expect(jetbrains?.currentSourceFidelityLabel).toBe("Exact vendor value");
  });

  it("accepts localized provider-source display copy while preserving raw diagnostics", () => {
    const cursor = getProviderViewModel(
      createState(),
      "cursor",
      buildProviderSourceDisplayLocalizedCopy(createRuntimeI18n("zh-CN")),
    );

    expect(cursor).not.toBeNull();
    expect(cursor?.currentSourceLabel).toBe("会话页面");
    expect(cursor?.currentSourceContractLabel).toBe("已发布 personal partial");
    expect(cursor?.currentSourceAvailabilitySummary).toBe(
      "已用：仅窗口 · 剩余：不可用 · 重置：仅窗口",
    );
    expect(cursor?.sourceFallbackReason).toBe(
      "Official API unavailable: no Cursor Admin API key is stored.",
    );
  });

  it("keeps provider-detail input raw evidence when typed diagnostics are unknown", () => {
    const warningReason =
      "No Cursor Admin API key is stored; add an API key before official sync can run.";
    const sourceFallbackReason =
      "Official API unavailable: no Cursor Admin API key is stored.";
    const unknownWarningDiagnostic: ProviderDiagnostic = {
      code: "future.cursor_credential_hint",
      category: "adapter_error",
      severity: "warning",
      rawMessage: warningReason,
    };
    const unknownFallbackDiagnostic: ProviderDiagnostic = {
      code: "future.cursor_source_fallback",
      category: "source_fallback",
      severity: "warning",
      rawMessage: sourceFallbackReason,
    };
    const state = createState({
      providers: SAMPLE_APP_STATE.providers.map((provider) =>
        provider.providerId === "cursor"
          ? {
              ...provider,
              warningReason,
              warningDiagnostic: unknownWarningDiagnostic,
              sourceFallbackReason,
              sourceFallbackDiagnostic: unknownFallbackDiagnostic,
            }
          : provider,
      ),
    });

    const cursor = getProviderViewModel(state, "cursor");

    expect(cursor?.warningReason).toBe(warningReason);
    expect(cursor?.sourceFallbackReason).toBe(sourceFallbackReason);
    expect(cursor?.currentSourceStateKind).toBe("credential_missing");
    expect(cursor?.currentSourceStateDetail).toBe(warningReason);
  });
});
