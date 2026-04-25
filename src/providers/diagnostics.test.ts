import { describe, expect, it } from "vitest";

import { SAMPLE_APP_STATE } from "../shared/constants";
import {
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
