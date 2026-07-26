import { describe, expect, it } from "vitest";

import { SETTINGS_SECTION_IDS } from "./settings-section-ids";
import {
  getSettingsRouteFocusElement,
  getSettingsRouteFocusKey,
} from "./settings-route-focus";

describe("settings route focus", () => {
  it("falls back to Quick Setup for a provider that is not currently mounted", () => {
    const fallback = {} as HTMLElement;
    const documentRef = {
      querySelector: () => null,
      getElementById: (id: string) =>
        id === SETTINGS_SECTION_IDS.quickSetup ? fallback : null,
    } as unknown as Document;

    expect(
      getSettingsRouteFocusElement(
        {
          kind: "quick-setup-provider",
          providerId: "cursor-team-api",
        },
        documentRef,
      ),
    ).toBe(fallback);
  });

  it("falls back to Provider display settings for a credential form", () => {
    const fallback = {} as HTMLElement;
    const documentRef = {
      querySelector: () => null,
      getElementById: (id: string) =>
        id === SETTINGS_SECTION_IDS.providerDisplay ? fallback : null,
    } as unknown as Document;

    expect(
      getSettingsRouteFocusElement(
        {
          kind: "credential-provider",
          providerId: "sub2api-api-key",
        },
        documentRef,
      ),
    ).toBe(fallback);
  });

  it("builds stable keys for provider setup targets", () => {
    expect(
      getSettingsRouteFocusKey({
        kind: "quick-setup-provider",
        providerId: "codex-personal-page",
      }),
    ).toBe("quick-setup-provider:codex-personal-page");
    expect(
      getSettingsRouteFocusKey({
        kind: "credential-provider",
        providerId: "sub2api-api-key",
      }),
    ).toBe("credential-provider:sub2api-api-key");
  });
});
