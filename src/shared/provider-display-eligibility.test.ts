import { describe, expect, it } from "vitest";

import { SAMPLE_APP_STATE } from "./constants";
import {
  filterDisplayEligibleProviderSettings,
  resolveProviderDisplayEligibility,
} from "./provider-display-eligibility";

function getProviderPair(providerId: string) {
  const setting =
    SAMPLE_APP_STATE.providerSettings.find((provider) => provider.id === providerId) ??
    null;
  const snapshot =
    SAMPLE_APP_STATE.providers.find(
      (provider) => provider.providerId === providerId,
    ) ?? null;

  if (!setting || !snapshot) {
    throw new Error(`Missing sample provider pair for ${providerId}`);
  }

  return { setting, snapshot };
}

describe("provider display eligibility", () => {
  it("allows shipped live providers and policy-only providers", () => {
    const codex = getProviderPair("codex-personal-page");
    const gemini = getProviderPair("gemini-policy");

    expect(
      resolveProviderDisplayEligibility(codex.snapshot, codex.setting),
    ).toEqual({
      eligible: true,
      reason: "connected_or_supported_fallback",
    });
    expect(
      resolveProviderDisplayEligibility(gemini.snapshot, gemini.setting),
    ).toEqual({
      eligible: true,
      reason: "policy_only",
    });
  });

  it("does not treat enabled deferred providers as display eligible", () => {
    const jetbrains = getProviderPair("jetbrains-org-page");

    expect(
      resolveProviderDisplayEligibility(jetbrains.snapshot, {
        ...jetbrains.setting,
        enabled: true,
      }),
    ).toEqual({
      eligible: false,
      reason: "deferred",
    });
  });

  it("keeps hidden but otherwise displayable providers eligible for recovery controls", () => {
    const cursor = getProviderPair("cursor-personal-page");

    expect(
      resolveProviderDisplayEligibility(cursor.snapshot, {
        ...cursor.setting,
        enabled: false,
      }),
    ).toEqual({
      eligible: true,
      reason: "connected_or_supported_fallback",
    });
  });

  it("filters settings lists by source truth rather than provider.displayEnabled alone", () => {
    const providers = filterDisplayEligibleProviderSettings(
      SAMPLE_APP_STATE.providerSettings.map((provider) =>
        provider.id === "jetbrains-org-page"
          ? {
              ...provider,
              enabled: true,
            }
          : {
              ...provider,
              displayEnabled:
                provider.id === "cursor-personal-page" ||
                provider.id === "gemini-policy" ||
                provider.displayEnabled,
            },
      ),
      SAMPLE_APP_STATE.providers,
    );

    expect(providers.map((provider) => provider.id)).toEqual([
      "cursor-personal-page",
      "claude-code-team-page",
      "gemini-policy",
      "codex-personal-page",
    ]);
  });
});
