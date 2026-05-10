import { describe, expect, it, vi } from "vitest";

import { createEmptyPageBinding } from "../../shared/page-bindings";
import type { PageSessionClient, PageSessionResult } from "../page-session";
import { createClaudePersonalPageClient } from "./personal-page-client";

const CLAUDE_USAGE_URL = "https://claude.ai/settings/usage";

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

    const { result, pageBinding } = await client.getUsageSnapshot(
      createEmptyPageBinding(),
    );

    expect(result.status).toBe("ok");
    expect(usageCaptureCount).toBe(2);
    expect(pageBinding).toMatchObject({
      status: "bound",
      tabId: 107,
      matchedUrl: CLAUDE_USAGE_URL,
    });
    expect(capture.mock.calls[0]?.[0]).toMatchObject({
      openWhenMissing: {
        url: CLAUDE_USAGE_URL,
        active: false,
        closeOnUnmatched: true,
      },
      reloadBeforeCapture: {
        bypassCache: true,
        waitForLoadTimeoutMs: 10_000,
        loadPollIntervalMs: 250,
        postLoadDelayMs: 2_000,
      },
    });
  });
});

