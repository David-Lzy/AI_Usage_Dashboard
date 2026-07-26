import { describe, expect, it } from "vitest";

import {
  buildSidePanelHash,
  parseSidePanelHash,
  settingsRouteFocusRequiresAdvanced,
} from "./route-state";

describe("sidepanel route state", () => {
  it("builds stable hashes for supported routes", () => {
    expect(buildSidePanelHash({ name: "dashboard" })).toBe("#dashboard");
    expect(buildSidePanelHash({ name: "settings" })).toBe("#settings");
    expect(
      buildSidePanelHash({
        name: "settings",
        focus: {
          kind: "quick-setup-provider",
          providerId: "cursor-personal-page",
        },
      }),
    ).toBe("#settings/quick-setup/cursor-personal-page");
    expect(
      buildSidePanelHash({
        name: "settings",
        focus: {
          kind: "credential-provider",
          providerId: "codex-enterprise-api",
        },
      }),
    ).toBe("#settings/credentials/codex-enterprise-api");
    expect(
      buildSidePanelHash({ name: "provider-detail", providerId: "codex-personal-page" }),
    ).toBe("#provider-detail/codex-personal-page");
  });

  it("parses supported hashes back into route state", () => {
    expect(parseSidePanelHash("")).toEqual({ name: "dashboard" });
    expect(parseSidePanelHash("#dashboard")).toEqual({ name: "dashboard" });
    expect(parseSidePanelHash("#settings")).toEqual({ name: "settings" });
    expect(parseSidePanelHash("#settings/section/settings-quick-setup")).toEqual({
      name: "settings",
      focus: {
        kind: "section",
        sectionId: "settings-quick-setup",
      },
    });
    expect(parseSidePanelHash("#settings/quick-setup/cursor-personal-page")).toEqual({
      name: "settings",
      focus: {
        kind: "quick-setup-provider",
        providerId: "cursor-personal-page",
      },
    });
    expect(parseSidePanelHash("#settings/credentials/claude-code-admin-api")).toEqual({
      name: "settings",
      focus: {
        kind: "credential-provider",
        providerId: "claude-code-admin-api",
      },
    });
    expect(parseSidePanelHash("#provider-detail/cursor-personal-page")).toEqual({
      name: "provider-detail",
      providerId: "cursor-personal-page",
    });
  });

  it("rejects unsupported hashes so debug or invalid paths stay separate", () => {
    expect(parseSidePanelHash("#debug-capture-codex")).toBeNull();
    expect(parseSidePanelHash("#provider-detail/unknown")).toBeNull();
    expect(parseSidePanelHash("#settings/credentials/gemini")).toBeNull();
  });

  it("keeps Sub2API credentials in Provider display while other credentials use Advanced", () => {
    expect(
      settingsRouteFocusRequiresAdvanced({
        kind: "credential-provider",
        providerId: "sub2api-api-key",
      }),
    ).toBe(false);
    expect(
      settingsRouteFocusRequiresAdvanced({
        kind: "credential-provider",
        providerId: "cursor-team-api",
      }),
    ).toBe(true);
  });
});
