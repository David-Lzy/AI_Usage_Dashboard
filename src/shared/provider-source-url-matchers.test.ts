import { describe, expect, it } from "vitest";

import {
  doesUrlMatchRouteHint,
  doesUrlMatchRouteHints,
  getOpenableRouteHint,
} from "./provider-source-url-matchers";

describe("provider source URL matchers", () => {
  it("selects the first openable HTTPS route hint without interior wildcards", () => {
    expect(
      getOpenableRouteHint([
        "chrome-extension://example/src/sidepanel/index.html",
        "https://cursor.com/*/dashboard/usage*",
        "https://cursor.com/dashboard/usage*",
        "https://chatgpt.com/codex/cloud/settings/analytics*",
      ]),
    ).toBe("https://cursor.com/dashboard/usage");
  });

  it("returns null when no route hint can be opened directly", () => {
    expect(
      getOpenableRouteHint([
        "http://cursor.com/dashboard/usage",
        "chrome-extension://example/src/sidepanel/index.html",
        "https://cursor.com/*/dashboard/usage*",
      ]),
    ).toBeNull();
  });

  it("matches exact route hints while ignoring hash-only differences", () => {
    expect(
      doesUrlMatchRouteHint(
        "https://chatgpt.com/codex/cloud/settings/analytics#usage",
        "https://chatgpt.com/codex/cloud/settings/analytics",
      ),
    ).toBe(true);
    expect(
      doesUrlMatchRouteHint(
        "https://chatgpt.com/codex/cloud/settings/analytics?tab=usage#quota",
        "https://chatgpt.com/codex/cloud/settings/analytics?tab=usage",
      ),
    ).toBe(true);
  });

  it("does not treat different query strings as exact matches", () => {
    expect(
      doesUrlMatchRouteHint(
        "https://chatgpt.com/codex/cloud/settings/analytics?tab=usage",
        "https://chatgpt.com/codex/cloud/settings/analytics?tab=billing",
      ),
    ).toBe(false);
  });

  it("matches wildcard route hints against provider URL variants", () => {
    expect(
      doesUrlMatchRouteHint(
        "https://cursor.com/acme/dashboard/usage?period=current",
        "https://cursor.com/*/dashboard/usage*",
      ),
    ).toBe(true);
    expect(
      doesUrlMatchRouteHint(
        "https://cursor.com/dashboard/usage#team",
        "https://cursor.com/dashboard/usage*",
      ),
    ).toBe(true);
  });

  it("rejects invalid active URLs and non-HTTPS route hints", () => {
    expect(
      doesUrlMatchRouteHint("not a url", "https://cursor.com/dashboard/usage*"),
    ).toBe(false);
    expect(
      doesUrlMatchRouteHint(
        "https://cursor.com/dashboard/usage",
        "http://cursor.com/dashboard/usage",
      ),
    ).toBe(false);
  });

  it("matches a URL against any matching route hint", () => {
    expect(
      doesUrlMatchRouteHints("https://cursor.com/dashboard/usage#team", [
        "https://chatgpt.com/codex/cloud/settings/analytics*",
        "https://cursor.com/dashboard/usage*",
      ]),
    ).toBe(true);
    expect(
      doesUrlMatchRouteHints("https://chatgpt.com/gpts", [
        "https://chatgpt.com/codex/cloud/settings/analytics*",
        "https://cursor.com/dashboard/usage*",
      ]),
    ).toBe(false);
  });
});
