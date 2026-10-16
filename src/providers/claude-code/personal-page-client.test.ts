import { describe, expect, it, vi } from "vitest";

import { createEmptyPageBinding } from "../../shared/page-bindings";
import type { PageSessionClient, PageSessionResult } from "../page-session";
import { createClaudePersonalPageClient } from "./personal-page-client";

const CLAUDE_USAGE_URL = "https://claude.ai/settings/usage";
const CLAUDE_USAGE_MODAL_URL = "https://claude.ai/new#settings/usage";

function buildMatchedClaudeResult(html: string): PageSessionResult {
  return {
    status: "matched",
    page: {
      url: CLAUDE_USAGE_URL,
      title: "Claude",
      heading: "Usage",
      html,
    },
    target: {
      tabId: 107,
      bindingMode: "auto",
      active: false,
      lastAccessed: null,
    },
    attempts: [
      {
        tabId: 107,
        bindingMode: "auto",
        status: "matched",
        url: CLAUDE_USAGE_URL,
        title: "Claude",
      },
    ],
  };
}

describe("createClaudePersonalPageClient", () => {
  it("retains independently captured insights through hydration on the same tab", async () => {
    const insight = { resetCredits: { source: "page" as const, capturedAt: "2026-10-13T10:00:00.000Z", accountVerified: false,
      availableCount: null, offers: [{ kind: "full" as const, available: true, expiresAt: null }], detailsComplete: null } };
    let reads = 0;
    const client = createClaudePersonalPageClient({ source: "live", hydrationRetryAttempts: 1, hydrationRetryDelayMs: 0,
      pageSessionClient: { capture: async () => {
        reads++;
        const page = buildMatchedClaudeResult(reads === 1 ? "<h1>Usage</h1>Loading" : "<h1>Usage</h1><p>Weekly limit</p><p>60% remaining</p>");
        if (reads === 1 && page.status === "matched") page.page.usageInsights = insight;
        return page;
      } } });
    const result = await client.getUsageSnapshot();
    expect(result.result.status).toBe("ok");
    expect(result.usageInsights).toEqual(insight);
  });

  it("does not retain earlier aggregate data after the source tab changes", async () => {
    let reads = 0;
    const client = createClaudePersonalPageClient({ source: "live", hydrationRetryAttempts: 1, hydrationRetryDelayMs: 0,
      pageSessionClient: { capture: async () => {
        reads++;
        const result = buildMatchedClaudeResult(reads === 1 ? "<h1>Usage</h1>Loading" : "<h1>Usage</h1><p>Weekly limit</p><p>60% remaining</p>");
        if (result.status === "matched" && reads === 1) result.page.usageInsights = { resetCredits: { source: "page", capturedAt: "2026-10-13T10:00:00.000Z", accountVerified: false, availableCount: null, offers: [], detailsComplete: null } };
        if (reads === 2) result.attempts[0]!.tabId = 208;
        return result;
      } } });
    expect((await client.getUsageSnapshot()).usageInsights).toBeUndefined();
  });
  it("opens and retries the Claude usage route while the page hydrates", async () => {
    let usageCaptureCount = 0;
    const capture = vi.fn<PageSessionClient["capture"]>(async (definition) => {
      if (!definition.urlPatterns.includes(`${CLAUDE_USAGE_URL}*`)) {
        return {
          status: "not_found",
          attempts: [],
        };
      }

      usageCaptureCount += 1;

      if (usageCaptureCount === 1) {
        return buildMatchedClaudeResult(`
          <html>
            <body>
              <h1>Usage</h1>
              <p>Loading</p>
            </body>
          </html>
        `);
      }

      return buildMatchedClaudeResult(`
        <html>
          <body>
            <h1>Usage</h1>
            <p>Team plan</p>
            <p>Weekly usage limit</p>
            <p>42% remaining</p>
            <p>Resets at 2026-05-18 00:00</p>
          </body>
        </html>
      `);
    });
    const client = createClaudePersonalPageClient({
      source: "live",
      pageSessionClient: { capture },
      openPageWhenMissing: true,
      hydrationRetryAttempts: 2,
      hydrationRetryDelayMs: 0,
    });

    const { result, pageBinding, capturedAt } = await client.getUsageSnapshot(
      createEmptyPageBinding(),
    );

    expect(result.status).toBe("ok");
    expect(capturedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(usageCaptureCount).toBe(2);
    expect(pageBinding).toMatchObject({
      status: "bound",
      tabId: 107,
      matchedUrl: CLAUDE_USAGE_URL,
    });
    expect(capture.mock.calls[0]?.[0]).toMatchObject({
      openWhenMissing: {
        url: CLAUDE_USAGE_MODAL_URL,
        active: false,
        closeOnUnmatched: true,
      },
      reloadBeforeCapture: {
        bypassCache: true,
        waitForLoadTimeoutMs: 12_000,
        loadPollIntervalMs: 250,
        postLoadDelayMs: 250,
      },
    });
  });
});
