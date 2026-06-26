/**
 * Test suite: Claude page detection — isLoggedOutOrUpgradeClaudePage (P1a fix)
 * Module under test: src/providers/claude-code/personal-page-capture.ts
 *
 * Before the fix, a page at /settings/usage that contained any upgrade-adjacent
 * text (e.g. navigation copy, or the Next.js server-render phase of a Pro/Max
 * account) was classified as logged_out. The fix adds a partial-usage-signal
 * guard: if the URL is /settings/usage and any usage keyword is present, the
 * page is treated as still loading rather than as an upgrade gate.
 */
import { describe, expect, it } from "vitest";

import {
  captureClaudePersonalLiveFixture,
} from "../personal-page-capture";
import type {
  PageSessionCapturedPage,
  PageSessionClient,
  PageSessionDefinition,
  PageSessionResult,
} from "../../page-session";

const USAGE_URL = "https://claude.ai/settings/usage";
const UPGRADE_URL = "https://claude.ai/upgrade";

function makeInspectingClient(
  page: PageSessionCapturedPage,
): PageSessionClient {
  return {
    async capture(definition: PageSessionDefinition): Promise<PageSessionResult> {
      const matchStatus = definition.match(page);
      if (matchStatus === "matched") {
        return {
          status: "matched",
          page,
          target: { tabId: 1, bindingMode: "auto", active: false, lastAccessed: null },
          attempts: [
            { tabId: 1, bindingMode: "auto", status: "matched", url: page.url, title: page.title },
          ],
        };
      }
      if (matchStatus === "logged_out") {
        return {
          status: "logged_out",
          attempts: [
            { tabId: 1, bindingMode: "auto", status: "logged_out", url: page.url, title: page.title },
          ],
        };
      }
      return { status: "not_found", attempts: [] };
    },
  };
}

async function captureWithPage(page: PageSessionCapturedPage) {
  const client = makeInspectingClient(page);
  return captureClaudePersonalLiveFixture(client, { mode: "auto", tabId: null });
}

describe("isLoggedOutOrUpgradeClaudePage (P1a — partial-load false-positive fix)", () => {
  describe("given a page at /settings/usage with full usage shell", () => {
    it("should classify the page as matched, not logged_out", async () => {
      const fixture = await captureWithPage({
        url: USAGE_URL,
        title: "Claude",
        heading: "Usage",
        html: `
          <html><body>
            <h1>Settings</h1>
            <h2>Usage</h2>
            <p>Weekly usage limit</p>
            <p>42% remaining</p>
            <p>Resets at 2026-06-08 00:00</p>
          </body></html>
        `,
      });

      expect(fixture.routes[0]?.status).toBe("matched");
    });
  });

  describe("given a page at /settings/usage with only partial usage text (P1a fix)", () => {
    it("should not classify as logged_out when usage keyword is present", async () => {
      const fixture = await captureWithPage({
        url: USAGE_URL,
        title: "Claude",
        heading: null,
        html: `
          <html><body>
            <p>Loading your usage information...</p>
            <p>upgrade to Pro for more</p>
          </body></html>
        `,
      });

      expect(fixture.routes[0]?.status).not.toBe("logged_out");
    });

    it("should not classify as logged_out when 'remaining' appears alongside navigation copy", async () => {
      const fixture = await captureWithPage({
        url: USAGE_URL,
        title: "Claude",
        heading: null,
        html: `
          <html><body>
            <nav>Team · Projects · Invite team members</nav>
            <p>Plans that grow with you</p>
            <p>remaining quota loading</p>
          </body></html>
        `,
      });

      expect(fixture.routes[0]?.status).not.toBe("logged_out");
    });
  });

  describe("given a page at /settings/usage with NO usage signal at all", () => {
    it("should classify as logged_out when only upgrade marketing is visible", async () => {
      const fixture = await captureWithPage({
        url: USAGE_URL,
        title: "Claude — Plans",
        heading: null,
        html: `
          <html><body>
            <h1>Plans that grow with you</h1>
            <p>Free · Pro · Max</p>
            <p>Choose a plan</p>
          </body></html>
        `,
      });

      expect(fixture.routes[0]?.status).toBe("logged_out");
    });
  });

  describe("given a page at /upgrade", () => {
    it("should classify as logged_out when the URL has navigated away to /upgrade", async () => {
      const fixture = await captureWithPage({
        url: UPGRADE_URL,
        title: "Claude — Upgrade",
        heading: null,
        html: `
          <html><body>
            <h1>Plans that grow with you</h1>
            <p>usage metrics are available on paid plans</p>
          </body></html>
        `,
      });

      expect(fixture.routes[0]?.status).toBe("logged_out");
    });
  });

  describe("given a login redirect page", () => {
    it("should classify as logged_out when the URL contains /login", async () => {
      const fixture = await captureWithPage({
        url: "https://claude.ai/login",
        title: "Log in to Claude",
        heading: null,
        html: `
          <html><body>
            <h1>Log in</h1>
            <p>Continue with Google</p>
          </body></html>
        `,
      });

      expect(fixture.routes[0]?.status).toBe("logged_out");
    });
  });
});
