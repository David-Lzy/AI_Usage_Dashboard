import { describe, expect, it } from "vitest";

import type { ProviderId } from "../providers/types";
import type { ProviderViewModel } from "../shared/provider-view-models";
import { buildGuidanceCard } from "./guidance-card-view-models";

function createProvider(
  overrides: Partial<ProviderViewModel> = {},
): ProviderViewModel {
  return {
    currentSourceAvailabilitySummary: "Ready for live sync.",
    currentSourceStateDetail: "Ready.",
    currentSourceStateKind: "ready",
    displaySyncStatus: "ok",
    displayTone: "neutral",
    hostAccessRequirementDetail: "Grant browser access.",
    permissionStatus: "granted",
    providerId: "codex-personal-page" as ProviderId,
    providerLabel: "Codex",
    warningReason: null,
    ...overrides,
  } as ProviderViewModel;
}

describe("buildGuidanceCard", () => {
  it("starts zero-provider users with the recommended first provider", () => {
    expect(
      buildGuidanceCard([], {
        providerId: "cursor-personal-page",
        providerLabel: "Cursor",
      }),
    ).toMatchObject({
      label: "Start here",
      tone: "warning",
      headline: "Start with Cursor in Quick Setup",
      action: {
        kind: "settings",
        label: "Open Quick Setup",
        providerId: "cursor-personal-page",
      },
    });
  });

  it("prioritizes missing host access before other provider review", () => {
    expect(
      buildGuidanceCard([
        createProvider({
          permissionStatus: "missing",
          providerLabel: "Cursor",
        }),
      ]),
    ).toMatchObject({
      label: "Next step",
      tone: "warning",
      headline: "Grant access for Cursor",
      detail: "Grant browser access.",
      action: {
        kind: "settings",
      },
    });
  });

  it("prioritizes missing credentials after host access gaps", () => {
    expect(
      buildGuidanceCard([
        createProvider({
          currentSourceStateKind: "credential_missing",
          currentSourceStateDetail: "Add an API key.",
          providerLabel: "Cursor",
        }),
      ]),
    ).toMatchObject({
      headline: "Add credentials for Cursor",
      detail: "Add an API key.",
      action: {
        kind: "settings",
      },
    });
  });

  it("routes blocked provider review to provider detail", () => {
    expect(
      buildGuidanceCard([
        createProvider({
          currentSourceStateKind: "capture_unavailable",
          displaySyncStatus: "warning",
          displayTone: "warning",
          providerId: "cursor-personal-page",
          providerLabel: "Cursor",
          warningReason: "Usage page capture is unavailable.",
        }),
      ]),
    ).toMatchObject({
      headline: "Review Cursor",
      detail: "Usage page capture is unavailable.",
      action: {
        kind: "provider-detail",
        providerId: "cursor-personal-page",
      },
    });
  });

  it("explains all-policy-only visible providers without fake live setup", () => {
    expect(
      buildGuidanceCard([
        createProvider({
          currentSourceStateKind: "policy_only",
          providerLabel: "Gemini Code Assist",
        }),
      ]),
    ).toMatchObject({
      label: "Current contract",
      tone: "neutral",
      headline: "Visible providers are policy-only",
      action: {
        kind: "settings",
      },
    });
  });

  it("returns no guidance when every visible provider is ready", () => {
    expect(buildGuidanceCard([createProvider()])).toBeNull();
  });
});
