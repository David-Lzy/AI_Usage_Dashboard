import { describe, expect, it, vi } from "vitest";

import { createEmptyPageBinding } from "../../shared/page-bindings";
import type {
  PageSessionClient,
  PageSessionObservedNetworkState,
  PageSessionResult,
} from "../page-session";
import {
  CODEX_DAILY_TOKEN_USAGE_PATH,
  CODEX_DAILY_WORKSPACE_USAGE_PATH,
} from "./usage-history-contract";
import { createCodexPersonalPageClient } from "./personal-page-client";

const CODEX_ANALYTICS_URL =
  "https://chatgpt.com/codex/cloud/settings/analytics";

function buildMatchedCodexResult(
  html: string,
  observedNetwork?: PageSessionObservedNetworkState,
): PageSessionResult {
  return {
    status: "matched",
    page: {
      url: CODEX_ANALYTICS_URL,
      title: "Codex",
      heading: "Codex analysis",
      html,
      observedNetwork,
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
    const analyticsDefinitions: Parameters<PageSessionClient["capture"]>[0][] = [];
    const capture = vi.fn<PageSessionClient["capture"]>(async (definition) => {
      if (!definition.urlPatterns.includes(`${CODEX_ANALYTICS_URL}*`)) {
        return {
          status: "not_found",
          attempts: [],
        };
      }

      analyticsCaptureCount += 1;
      analyticsDefinitions.push(definition);

      if (analyticsCaptureCount === 1) {
        return buildMatchedCodexResult(`
          <html>
            <body>
              <h1>Codex analysis</h1>
              <p>Usage limits loading</p>
            </body>
          </html>
        `, {
          matchUrlSubstrings: [
            CODEX_DAILY_TOKEN_USAGE_PATH,
            CODEX_DAILY_WORKSPACE_USAGE_PATH,
          ],
          maxEntries: 4,
          entries: [
            {
              url: `https://chatgpt.com${CODEX_DAILY_TOKEN_USAGE_PATH}`,
              method: "GET",
              status: 200,
              ok: true,
              contentType: "application/json",
              bodyText: JSON.stringify({
                data: [
                  {
                    date: "2026-07-13",
                    product_surface_usage_values: { desktop_app: 45 },
                  },
                ],
              }),
              capturedAt: "2026-07-13T00:00:00.000Z",
              transport: "fetch",
            },
          ],
        });
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
    expect(result.status === "ok" ? result.snapshot.usageHistory : undefined)
      .toMatchObject({
        rangeStart: "2026-07-13",
        rangeEnd: "2026-07-13",
      });
    expect(analyticsCaptureCount).toBe(2);
    expect(analyticsDefinitions[0].reloadBeforeCapture).toBeDefined();
    expect(analyticsDefinitions[1].reloadBeforeCapture).toBeUndefined();
    expect(analyticsDefinitions[1].reloadOnCaptureFailure).toBeUndefined();
    expect(pageBinding).toMatchObject({
      status: "bound",
      tabId: 88,
      matchedUrl: CODEX_ANALYTICS_URL,
    });
  });

  it("retries a transient capture failure after the reloaded page settles", async () => {
    let analyticsCaptureCount = 0;
    const capture = vi.fn<PageSessionClient["capture"]>(async (definition) => {
      if (!definition.urlPatterns.includes(`${CODEX_ANALYTICS_URL}*`)) {
        return {
          status: "not_found",
          attempts: [],
        };
      }

      analyticsCaptureCount += 1;

      if (analyticsCaptureCount === 1) {
        return {
          status: "capture_unavailable",
          attempts: [
            {
              tabId: 88,
              bindingMode: "auto",
              status: "capture_failed",
              error: "Execution context was destroyed during navigation",
            },
          ],
        };
      }

      return buildMatchedCodexResult(`
        <html>
          <body>
            <h1>Codex analysis</h1>
            <p>Weekly usage limit</p>
            <p>68%</p>
            <p>remaining</p>
          </body>
        </html>
      `);
    });
    const client = createCodexPersonalPageClient({
      source: "live",
      pageSessionClient: { capture },
      hydrationRetryAttempts: 2,
      hydrationRetryDelayMs: 0,
    });

    const { result } = await client.getUsageSnapshot(createEmptyPageBinding());

    expect(result.status).toBe("ok");
    expect(analyticsCaptureCount).toBe(2);
  });

  it("keeps inspecting the same slow page without reloading it again", async () => {
    let analyticsCaptureCount = 0;
    const analyticsDefinitions: Parameters<PageSessionClient["capture"]>[0][] = [];
    const capture = vi.fn<PageSessionClient["capture"]>(async (definition) => {
      if (!definition.urlPatterns.includes(`${CODEX_ANALYTICS_URL}*`)) {
        return {
          status: "not_found",
          attempts: [],
        };
      }

      analyticsCaptureCount += 1;
      analyticsDefinitions.push(definition);

      if (analyticsCaptureCount <= 10) {
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
            <p>Weekly usage limit</p>
            <p>71%</p>
            <p>remaining</p>
          </body>
        </html>
      `);
    });
    const client = createCodexPersonalPageClient({
      source: "live",
      pageSessionClient: { capture },
      hydrationRetryAttempts: 12,
      hydrationRetryDelayMs: 0,
    });

    const { result } = await client.getUsageSnapshot(createEmptyPageBinding());

    expect(result.status).toBe("ok");
    expect(analyticsCaptureCount).toBe(11);
    expect(analyticsDefinitions[0].reloadBeforeCapture).toBeDefined();
    expect(
      analyticsDefinitions.slice(1).every(
        (definition) =>
          definition.reloadBeforeCapture === undefined &&
          definition.reloadOnCaptureFailure === undefined,
      ),
    ).toBe(true);
  });
});
