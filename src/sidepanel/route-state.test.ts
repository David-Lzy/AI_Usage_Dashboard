import { describe, expect, it } from "vitest";

import { buildSidePanelHash, parseSidePanelHash } from "./route-state";

describe("sidepanel route state", () => {
  it("builds stable hashes for supported routes", () => {
    expect(buildSidePanelHash({ name: "dashboard" })).toBe("#dashboard");
    expect(buildSidePanelHash({ name: "settings" })).toBe("#settings");
    expect(
      buildSidePanelHash({ name: "provider-detail", providerId: "codex" }),
    ).toBe("#provider-detail/codex");
  });

  it("parses supported hashes back into route state", () => {
    expect(parseSidePanelHash("")).toEqual({ name: "dashboard" });
    expect(parseSidePanelHash("#dashboard")).toEqual({ name: "dashboard" });
    expect(parseSidePanelHash("#settings")).toEqual({ name: "settings" });
    expect(parseSidePanelHash("#provider-detail/cursor")).toEqual({
      name: "provider-detail",
      providerId: "cursor",
    });
  });

  it("rejects unsupported hashes so debug or invalid paths stay separate", () => {
    expect(parseSidePanelHash("#debug-capture-codex")).toBeNull();
    expect(parseSidePanelHash("#provider-detail/unknown")).toBeNull();
  });
});
