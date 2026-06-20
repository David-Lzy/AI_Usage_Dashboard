/**
 * Test suite: Claude hydration retry — shouldRetryHydratingClaudeRoute (P1b fix)
 * Module under test: src/providers/claude-code/personal-page-client.ts
 *
 * Before the fix, the retry loop only re-ran on route_drift. When
 * openPageWhenMissing=true caused the extension to open a new background tab,
 * the first capture attempt returned open_page_required because the tab had not
 * finished loading. Without a retry, the error was surfaced immediately. The fix
 * adds open_page_required to the retry predicate when openPageWhenMissing=true,
 * giving the newly opened tab time to render before giving up.
 */
import { describe, expect, it, vi } from "vitest";

import { createEmptyPageBinding } from "../../../shared/page-bindings";
import type { PageSessionClient, PageSessionResult } from "../../page-session";
import { createClaudePersonalPageClient } from "../personal-page-client";

const CLAUDE_USAGE_URL = "https://claude.ai/settings/usage";

function buildMatchedResult(html: string): PageSessionResult {
  return {
    status: "matched",
    page: {
      url: CLAUDE_USAGE_URL,
      title: "Claude",
      heading: "Usage",
      html,
    },
    target: { tabId: 1, bindingMode: "auto", active: false, lastAccessed: null },
    attempts: [
      { tabId: 1, bindingMode: "auto", status: "matched", url: CLAUDE_USAGE_URL, title: "Claude" },
    ],
  };
}

const validUsageHtml = `
  <html><body>
    <h1>Settings</h1>
    <h2>Usage</h2>
    <p>Weekly usage limit</p>
    <p>55% remaining</p>
    <p>Resets at 2026-06-09 00:00</p>
  </body></html>
`;

describe("createClaudePersonalPageClient / hydration retry on open_page_required (P1b)", () => {
  describe("given openPageWhenMissing: true and the tab is still loading on the first attempt", () => {
    it("should retry and succeed once the tab finishes rendering", async () => {
      let callCount = 0;
      const capture = vi.fn<PageSessionClient["capture"]>(async () => {
        callCount += 1;
        if (callCount === 1) {
          return { status: "not_found", attempts: [] };
        }
        return buildMatchedResult(validUsageHtml);
      });

      const client = createClaudePersonalPageClient({
        source: "live",
        pageSessionClient: { capture },
        openPageWhenMissing: true,
        hydrationRetryAttempts: 3,
        hydrationRetryDelayMs: 0,
      });

      const { result } = await client.getUsageSnapshot(createEmptyPageBinding());

      expect(result.status).toBe("ok");
      expect(callCount).toBeGreaterThanOrEqual(2);
    });
  });

  describe("given openPageWhenMissing: false and the page is not found", () => {
    it("should NOT retry on open_page_required and return the error immediately", async () => {
      let callCount = 0;
      const capture = vi.fn<PageSessionClient["capture"]>(async () => {
        callCount += 1;
        return { status: "not_found", attempts: [] };
      });

      const client = createClaudePersonalPageClient({
        source: "live",
        pageSessionClient: { capture },
        openPageWhenMissing: false,
        hydrationRetryAttempts: 3,
        hydrationRetryDelayMs: 0,
      });

      const { result } = await client.getUsageSnapshot(createEmptyPageBinding());

      expect(result.status).toBe("open_page_required");
      expect(callCount).toBe(1);
    });
  });

  describe("given route_drift on a matched page", () => {
    it("should retry regardless of openPageWhenMissing value", async () => {
      let callCount = 0;
      const capture = vi.fn<PageSessionClient["capture"]>(async () => {
        callCount += 1;
        if (callCount < 3) {
          return buildMatchedResult(`
            <html><body>
              <h1>Usage</h1>
              <p>Loading...</p>
            </body></html>
          `);
        }
        return buildMatchedResult(validUsageHtml);
      });

      const client = createClaudePersonalPageClient({
        source: "live",
        pageSessionClient: { capture },
        openPageWhenMissing: false,
        hydrationRetryAttempts: 4,
        hydrationRetryDelayMs: 0,
      });

      const { result } = await client.getUsageSnapshot(createEmptyPageBinding());

      expect(result.status).toBe("ok");
      expect(callCount).toBeGreaterThanOrEqual(3);
    });
  });
});
