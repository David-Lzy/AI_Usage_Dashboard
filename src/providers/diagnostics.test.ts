import { describe, expect, it } from "vitest";

import { SAMPLE_APP_STATE } from "../shared/constants";
import {
  createCredentialDiagnostic,
  createHostAccessDiagnostic,
  createPageSessionDiagnostic,
  createProviderDiagnostic,
  createSourceFallbackDiagnostic,
  createSourceSelectionDiagnostic,
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
        providerId: "cursor",
        sourceKind: "official_api",
      },
    );

    expect(diagnostic).toEqual({
      code: "source.official_api_missing_credential",
      category: "source_fallback",
      severity: "warning",
      rawMessage: "Official API unavailable: no Cursor Admin API key is stored.",
      params: {
        providerId: "cursor",
        sourceKind: "official_api",
      },
    });
  });

  it("keeps typed diagnostic fields additive on provider snapshots", () => {
    const cursor = SAMPLE_APP_STATE.providers.find(
      (provider) => provider.providerId === "cursor",
    );

    expect(cursor).toBeDefined();

    const snapshot: ProviderSnapshot = {
      ...cursor!,
      sourceFallbackDiagnostic: createProviderDiagnostic(
        "source.official_api_missing_credential",
        "warning",
        cursor!.sourceFallbackReason!,
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
      providerId: "cursor",
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
        providerId: "cursor",
        sourcePreference: "auto",
        selectedKind: "session_page",
        hadFallback: true,
      },
    });
  });

  it("builds source-fallback diagnostics without rewriting raw messages", () => {
    const diagnostic = createSourceFallbackDiagnostic({
      providerId: "cursor",
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
        providerId: "cursor",
        sourcePreference: "official_api",
        failedSourceKind: "official_api",
        failureCode: "credential_missing",
      },
    });
  });

  it("builds credential diagnostics without rewriting raw warning messages", () => {
    const diagnostic = createCredentialDiagnostic({
      providerId: "codex",
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
        providerId: "codex",
        credentialKind: "workspace_config",
      },
    });
  });

  it("builds host-access diagnostics without rewriting raw warning messages", () => {
    const diagnostic = createHostAccessDiagnostic({
      providerId: "cursor",
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
        providerId: "cursor",
        sourceKind: "official_api",
        hostLabel: "api.cursor.com · cursor.com",
      },
    });
  });

  it("builds page-session diagnostics without rewriting raw warning messages", () => {
    const diagnostic = createPageSessionDiagnostic({
      providerId: "cursor",
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
        providerId: "cursor",
        pageSessionKind: "open_page_required",
      },
    });
  });

  it("marks capture-unavailable page-session diagnostics as errors", () => {
    const diagnostic = createPageSessionDiagnostic({
      providerId: "codex",
      pageSessionKind: "capture_unavailable",
      rawMessage: "Codex personal usage page sync failed unexpectedly.",
    });

    expect(diagnostic).toMatchObject({
      code: "page_session.capture_unavailable",
      category: "page_session",
      severity: "error",
      rawMessage: "Codex personal usage page sync failed unexpectedly.",
      params: {
        providerId: "codex",
        pageSessionKind: "capture_unavailable",
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
