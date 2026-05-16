import { describe, expect, it } from "vitest";

import { SAMPLE_APP_STATE } from "../shared/constants";
import {
  createAdapterErrorDiagnostic,
  createCredentialDiagnostic,
  createHostAccessDiagnostic,
  createPageSessionDiagnostic,
  createPolicyOnlyDiagnostic,
  createProviderDiagnostic,
  createSourceFallbackDiagnostic,
  createSourceSelectionDiagnostic,
  createSyncStaleDiagnostic,
  createUsageThresholdDiagnostic,
  getProviderDiagnosticRawMessage,
  isKnownProviderDiagnosticCode,
} from "./diagnostics";
import type { ProviderDiagnostic, ProviderSnapshot } from "./types";

describe("provider diagnostics", () => {
  it("creates typed diagnostics while preserving raw source-truth messages", () => {
    const diagnostic = createProviderDiagnostic(
      "source.official_api_missing_credential",
      "warning",
      "Official API unavailable: no Cursor Admin API key is stored.",
      {
        providerId: "cursor-personal-page",
        sourceKind: "official_api",
      },
    );

    expect(diagnostic).toEqual({
      code: "source.official_api_missing_credential",
      category: "source_fallback",
      severity: "warning",
      rawMessage: "Official API unavailable: no Cursor Admin API key is stored.",
      params: {
        providerId: "cursor-personal-page",
        sourceKind: "official_api",
      },
    });
  });

  it("keeps typed diagnostic fields additive on provider snapshots", () => {
    const cursor = SAMPLE_APP_STATE.providers.find(
      (provider) => provider.providerId === "cursor-personal-page",
    );

    expect(cursor).toBeDefined();

    const snapshot: ProviderSnapshot = {
      ...cursor!,
      sourceFallbackReason:
        "Official API unavailable: no Cursor Admin API key is stored.",
      sourceFallbackDiagnostic: createProviderDiagnostic(
        "source.official_api_missing_credential",
        "warning",
        "Official API unavailable: no Cursor Admin API key is stored.",
      ),
    };

    expect(snapshot.sourceFallbackReason).toBe(
      "Official API unavailable: no Cursor Admin API key is stored.",
    );
    expect(snapshot.sourceFallbackDiagnostic?.rawMessage).toBe(
      snapshot.sourceFallbackReason,
    );
  });

  it("falls back to raw strings when typed diagnostics are absent", () => {
    expect(
      getProviderDiagnosticRawMessage(
        null,
        "Official API unavailable: no Cursor Admin API key is stored.",
      ),
    ).toBe("Official API unavailable: no Cursor Admin API key is stored.");
    expect(getProviderDiagnosticRawMessage(undefined, "  ")).toBeNull();
  });

  it("builds source-selection diagnostics from stable source metadata", () => {
    const diagnostic = createSourceSelectionDiagnostic({
      providerId: "cursor-personal-page",
      sourcePreference: "auto",
      selectedKind: "session_page",
      hadFallback: true,
      rawMessage: "Auto fell back to Session page.",
    });

    expect(diagnostic).toMatchObject({
      code: "source.auto_selected_session_page",
      category: "source_selection",
      severity: "info",
      rawMessage: "Auto fell back to Session page.",
      params: {
        providerId: "cursor-personal-page",
        sourcePreference: "auto",
        selectedKind: "session_page",
        hadFallback: true,
      },
    });
  });

  it("builds source-fallback diagnostics without rewriting raw messages", () => {
    const diagnostic = createSourceFallbackDiagnostic({
      providerId: "cursor-personal-page",
      sourcePreference: "official_api",
      failure: {
        kind: "official_api",
        code: "credential_missing",
        detail: "No Cursor Admin API key is stored.",
      },
      rawMessage: "Official API unavailable: No Cursor Admin API key is stored.",
    });

    expect(diagnostic).toMatchObject({
      code: "source.official_api_missing_credential",
      category: "source_fallback",
      severity: "warning",
      rawMessage: "Official API unavailable: No Cursor Admin API key is stored.",
      params: {
        providerId: "cursor-personal-page",
        sourcePreference: "official_api",
        failedSourceKind: "official_api",
        failureCode: "credential_missing",
      },
    });
  });

  it("builds credential diagnostics without rewriting raw warning messages", () => {
    const diagnostic = createCredentialDiagnostic({
      providerId: "codex-personal-page",
      credentialKind: "workspace_config",
      rawMessage:
        "Codex analytics API key and workspace ID are not both configured.",
    });

    expect(diagnostic).toMatchObject({
      code: "credential.workspace_config_missing",
      category: "credential",
      severity: "error",
      rawMessage:
        "Codex analytics API key and workspace ID are not both configured.",
      params: {
        providerId: "codex-personal-page",
        credentialKind: "workspace_config",
      },
    });
  });

  it("builds host-access diagnostics without rewriting raw warning messages", () => {
    const diagnostic = createHostAccessDiagnostic({
      providerId: "cursor-personal-page",
      sourceKind: "official_api",
      hostLabel: "api.cursor.com · cursor.com",
      rawMessage:
        "Host access missing; grant Cursor access for api.cursor.com and cursor.com before live sync can run.",
    });

    expect(diagnostic).toMatchObject({
      code: "host_access.missing",
      category: "host_access",
      severity: "warning",
      rawMessage:
        "Host access missing; grant Cursor access for api.cursor.com and cursor.com before live sync can run.",
      params: {
        providerId: "cursor-personal-page",
        sourceKind: "official_api",
        hostLabel: "api.cursor.com · cursor.com",
      },
    });
  });

  it("builds page-session diagnostics without rewriting raw warning messages", () => {
    const diagnostic = createPageSessionDiagnostic({
      providerId: "cursor-personal-page",
      pageSessionKind: "open_page_required",
      rawMessage:
        "Open the logged-in Cursor dashboard usage page before refreshing personal usage capture.",
    });

    expect(diagnostic).toMatchObject({
      code: "page_session.open_page_required",
      category: "page_session",
      severity: "warning",
      rawMessage:
        "Open the logged-in Cursor dashboard usage page before refreshing personal usage capture.",
      params: {
        providerId: "cursor-personal-page",
        pageSessionKind: "open_page_required",
      },
    });
  });

  it("marks capture-unavailable page-session diagnostics as errors", () => {
    const diagnostic = createPageSessionDiagnostic({
      providerId: "codex-personal-page",
      pageSessionKind: "capture_unavailable",
      rawMessage: "Codex personal usage page sync failed unexpectedly.",
    });

    expect(diagnostic).toMatchObject({
      code: "page_session.capture_unavailable",
      category: "page_session",
      severity: "error",
      rawMessage: "Codex personal usage page sync failed unexpectedly.",
      params: {
        providerId: "codex-personal-page",
        pageSessionKind: "capture_unavailable",
      },
    });
  });

  it("builds usage-threshold diagnostics without rewriting raw warning messages", () => {
    const diagnostic = createUsageThresholdDiagnostic({
      providerId: "cursor-personal-page",
      usageThresholdKind: "overage_detected",
      rawMessage: "15 pay-per-use requests recorded this cycle",
      overageCount: 15,
      unitLabel: "requests",
    });

    expect(diagnostic).toMatchObject({
      code: "usage.overage_detected",
      category: "usage_threshold",
      severity: "warning",
      rawMessage: "15 pay-per-use requests recorded this cycle",
      params: {
        providerId: "cursor-personal-page",
        usageThresholdKind: "overage_detected",
        overageCount: 15,
        unitLabel: "requests",
      },
    });
  });

  it("builds policy-only diagnostics without rewriting raw warning messages", () => {
    const diagnostic = createPolicyOnlyDiagnostic({
      providerId: "gemini-policy",
      policyOnlyKind: "documented_limit_only",
      rawMessage:
        "120/min and 2000/day per user for Gemini CLI and agent mode.",
    });

    expect(diagnostic).toMatchObject({
      code: "policy.documented_limit_only",
      category: "policy_only",
      severity: "warning",
      rawMessage:
        "120/min and 2000/day per user for Gemini CLI and agent mode.",
      params: {
        providerId: "gemini-policy",
        policyOnlyKind: "documented_limit_only",
      },
    });
  });

  it("builds sync-stale diagnostics without rewriting raw warning messages", () => {
    const diagnostic = createSyncStaleDiagnostic({
      providerId: "cursor-personal-page",
      syncStaleKind: "cached_state_stale",
      rawMessage: "Automatic refresh is overdue; showing cached data.",
      ageMinutes: 240,
      staleAfterMinutes: 60,
    });

    expect(diagnostic).toMatchObject({
      code: "sync.cached_state_stale",
      category: "sync_stale",
      severity: "warning",
      rawMessage: "Automatic refresh is overdue; showing cached data.",
      params: {
        providerId: "cursor-personal-page",
        syncStaleKind: "cached_state_stale",
        ageMinutes: 240,
        staleAfterMinutes: 60,
      },
    });
  });

  it("builds adapter-error diagnostics without rewriting raw warning messages", () => {
    const diagnostic = createAdapterErrorDiagnostic({
      providerId: "codex-personal-page",
      adapterErrorKind: "parse_failed",
      sourceKind: "session_page",
      failureCode: "route_drift",
      parserStage: "personal_usage_page",
      rawMessage:
        "The matched Codex usage page no longer exposed a parseable remaining-percentage window.",
    });

    expect(diagnostic).toMatchObject({
      code: "adapter.parse_failed",
      category: "adapter_error",
      severity: "error",
      rawMessage:
        "The matched Codex usage page no longer exposed a parseable remaining-percentage window.",
      params: {
        providerId: "codex-personal-page",
        adapterErrorKind: "parse_failed",
        sourceKind: "session_page",
        failureCode: "route_drift",
        parserStage: "personal_usage_page",
      },
    });
  });

  it("preserves raw messages for unknown future codes", () => {
    const diagnostic: ProviderDiagnostic = {
      code: "future.experimental_code",
      category: "adapter_error",
      severity: "warning",
      rawMessage: "Future diagnostic body remains raw.",
    };

    expect(isKnownProviderDiagnosticCode(diagnostic.code)).toBe(false);
    expect(
      getProviderDiagnosticRawMessage(diagnostic, "Fallback raw message."),
    ).toBe("Future diagnostic body remains raw.");
  });
});
