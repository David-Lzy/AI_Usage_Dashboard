import { describe, expect, it } from "vitest";

import type { ProviderViewModel } from "../sidepanel/view-models";
import { buildFeaturedSection } from "./featured-section-view-models";

function createProvider(
  overrides: Partial<ProviderViewModel> = {},
): ProviderViewModel {
  return {
    currentSourceStateKind: "ready",
    providerLabel: "Codex",
    ...overrides,
  } as ProviderViewModel;
}

describe("buildFeaturedSection", () => {
  it("points zero-provider users to the recommended first provider", () => {
    expect(
      buildFeaturedSection([], [], {
        providerId: "cursor",
        providerLabel: "Cursor",
      }),
    ).toEqual({
      label: "Provider triage",
      headline: "Nothing to triage yet",
      detail:
        "Enable Cursor in Settings > Quick Setup first, then this section becomes actionable.",
      emptyStateHeadline: "No provider cards yet",
      emptyStateDetail:
        "Start with Cursor, then come back here for one-click provider triage.",
    });
  });

  it("uses the needs-attention story when attention providers exist", () => {
    expect(
      buildFeaturedSection(
        [createProvider()],
        [createProvider({ providerLabel: "Cursor" })],
      ),
    ).toMatchObject({
      label: "Needs attention",
      headline: "Featured providers",
      emptyStateHeadline: null,
    });
  });

  it("uses the policy-only story when every visible provider is policy-only", () => {
    expect(
      buildFeaturedSection(
        [
          createProvider({
            currentSourceStateKind: "policy_only",
            providerLabel: "Gemini Code Assist",
          }),
        ],
        [],
      ),
    ).toMatchObject({
      label: "Current contract",
      headline: "Policy-only providers",
      emptyStateDetail: null,
    });
  });

  it("uses the all-clear story for ready visible providers without attention", () => {
    expect(buildFeaturedSection([createProvider()], [])).toMatchObject({
      label: "All clear",
      headline: "Healthy providers",
      emptyStateHeadline: null,
    });
  });
});
