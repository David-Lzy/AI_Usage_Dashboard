import { describe, expect, it } from "vitest";

import { buildSidePanelHash, parseSidePanelHash } from "./route-state";

describe("sidepanel route state", () => {
  it("builds stable hashes for supported routes", () => {
    expect(buildSidePanelHash({ name: "dashboard" })).toBe("#dashboard");
    expect(buildSidePanelHash({ name: "settings" })).toBe("#settings");
    expect(
      buildSidePanelHash({
        name: "settings",
        focus: {
          kind: "quick-setup-provider",
          providerId: "cursor",
        },
      }),
    ).toBe("#settings/quick-setup/cursor");
    expect(
      buildSidePanelHash({
        name: "settings",
        focus: {
          kind: "credential-provider",
          providerId: "codex",
        },
      }),
    ).toBe("#settings/credentials/codex");
    expect(
      buildSidePanelHash({ name: "provider-detail", providerId: "codex" }),
    ).toBe("#provider-detail/codex");
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
    expect(parseSidePanelHash("#settings/quick-setup/cursor")).toEqual({
      name: "settings",
      focus: {
        kind: "quick-setup-provider",
        providerId: "cursor",
      },
    });
    expect(parseSidePanelHash("#settings/credentials/claude-code")).toEqual({
      name: "settings",
      focus: {
        kind: "credential-provider",
        providerId: "claude-code",
      },
    });
    expect(parseSidePanelHash("#provider-detail/cursor")).toEqual({
      name: "provider-detail",
      providerId: "cursor",
    });
  });

  it("rejects unsupported hashes so debug or invalid paths stay separate", () => {
    expect(parseSidePanelHash("#debug-capture-codex")).toBeNull();
    expect(parseSidePanelHash("#provider-detail/unknown")).toBeNull();
    expect(parseSidePanelHash("#settings/credentials/gemini")).toBeNull();
  });
});
