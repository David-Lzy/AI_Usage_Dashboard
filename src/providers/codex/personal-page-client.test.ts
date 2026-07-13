import { describe, expect, it, vi } from "vitest";

import { createEmptyPageBinding } from "../../shared/page-bindings";
import type { PageSessionClient, PageSessionResult } from "../page-session";
import { createCodexPersonalPageClient } from "./personal-page-client";

const CODEX_ANALYTICS_URL =
  "https://chatgpt.com/codex/cloud/settings/analytics";

function buildMatchedCodexResult(html: string): PageSessionResult {
  return {
    status: "matched",
    page: {
      url: CODEX_ANALYTICS_URL,
      title: "Codex",
      heading: "Codex analysis",
      html,
    },
    target: {
      tabId: 88,
      bindingMode: "auto",
      active: false,
      lastAccessed: null,
    },
    attempts: [
      {
        tabId: 88,
        bindingMode: "auto",
        status: "matched",
        url: CODEX_ANALYTICS_URL,
        title: "Codex",
      },
    ],
  };
}

describe("createCodexPersonalPageClient", () => {
  it("retries a newly matched Codex route while the page hydrates usage windows", async () => {
    let analyticsCaptureCount = 0;
    const capture = vi.fn<PageSessionClient["capture"]>(async (definition) => {
      if (!definition.urlPatterns.includes(`${CODEX_ANALYTICS_URL}*`)) {
        return {
          status: "not_found",
          attempts: [],
        };
      }

      expect(definition.extraction).toMatchObject({
        mode: "network_observer",
        recoverFromPerformanceResources: true,
      });

      analyticsCaptureCount += 1;

      if (analyticsCaptureCount === 1) {
        return buildMatchedCodexResult(`
          <html>
            <body>
              <h1>Codex analysis</h1>
              <p>Usage limits loading</p>
            </body>
          </html>
        `);
      }

      return buildMatchedCodexResult(`
        <html>
          <body>
            <h1>Codex analysis</h1>
            <p>5 小时使用限额</p>
            <p>42%</p>
            <p>剩余</p>
          </body>
        </html>
      `);
    });
    const client = createCodexPersonalPageClient({
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
    expect(analyticsCaptureCount).toBe(2);
    expect(pageBinding).toMatchObject({
      status: "bound",
      tabId: 88,
      matchedUrl: CODEX_ANALYTICS_URL,
    });
  });
});
