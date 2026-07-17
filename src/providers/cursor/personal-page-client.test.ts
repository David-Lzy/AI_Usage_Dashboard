import { describe, expect, it, vi } from "vitest";

import { createEmptyPageBinding } from "../../shared/page-bindings";
import usageBillingFixture from "../../../fixtures/cursor/usage-billing.fixture.json";
import type { PageSessionClient, PageSessionResult } from "../page-session";
import { createCursorPersonalPageClient } from "./personal-page-client";
import { parseCursorPersonalUsageContract } from "./personal-page-parser";
import {
  CURSOR_FILTERED_USAGE_EVENTS_PATH,
  CURSOR_USAGE_SUMMARY_PATH,
  type CursorUsageBillingContractFixture,
} from "./usage-billing-contract";

const CURSOR_USAGE_URL = "https://cursor.com/cn/dashboard/usage";

function buildMatchedCursorResult(
  html: string,
  observedEntries: NonNullable<
    Extract<PageSessionResult, { status: "matched" }>["page"]["observedNetwork"]
  >["entries"] = [],
): PageSessionResult {
  return {
    status: "matched",
    page: {
      url: CURSOR_USAGE_URL,
      title: "Cursor - Usage",
      heading: "Usage",
      html,
      observedNetwork: {
        matchUrlSubstrings: [],
        maxEntries: 10,
        entries: observedEntries,
      },
    },
    target: {
      tabId: 91,
      bindingMode: "auto",
      active: false,
      lastAccessed: null,
    },
    attempts: [
      {
        tabId: 91,
        bindingMode: "auto",
        status: "matched",
        url: CURSOR_USAGE_URL,
        title: "Cursor - Usage",
      },
    ],
  };
}

describe("createCursorPersonalPageClient", () => {
  it("uses the background session API without touching the page renderer", async () => {
    const fixture = usageBillingFixture as CursorUsageBillingContractFixture;
    const result = parseCursorPersonalUsageContract({
      usageSummary: fixture.usageSummary,
      planInfo: fixture.planInfo,
      hardLimit: fixture.hardLimit,
      usageEvents: null,
    });
    expect(result).not.toBeNull();

    const capture = vi.fn<PageSessionClient["capture"]>();
    const getUsageSnapshot = vi.fn(async () => ({
      ok: true as const,
      result: result!,
    }));
    const client = createCursorPersonalPageClient({
      source: "live",
      pageSessionClient: { capture },
      sessionApiClient: { getUsageSnapshot },
      trigger: "alarm",
    });

    const response = await client.getUsageSnapshot(createEmptyPageBinding());

    expect(response.captureSource).toBe("session_api");
    expect(response.result.status).toBe("ok");
    expect(getUsageSnapshot).toHaveBeenCalledWith("alarm");
    expect(capture).not.toHaveBeenCalled();
  });

  it("opens and retries the Cursor usage route while the dashboard hydrates", async () => {
    let usageCaptureCount = 0;
    const capture = vi.fn<PageSessionClient["capture"]>(async (definition) => {
      if (!definition.urlPatterns.includes(`${CURSOR_USAGE_URL}*`)) {
        return {
          status: "not_found",
          attempts: [],
        };
      }

      usageCaptureCount += 1;

      if (usageCaptureCount === 1) {
        return buildMatchedCursorResult(`
          <html>
            <body>
              <h1>Dashboard</h1>
              <p>Loading</p>
            </body>
          </html>
        `);
      }

      return buildMatchedCursorResult(`
        <html>
          <body>
            <h1>Usage</h1>
            <p>Pro</p>
            <p>On-Demand Usage is Off</p>
            <p>Your Usage</p>
            <p>Your usage per day across this billing period</p>
            <p>By Model</p>
            <p>Spend</p>
            <p>Export CSV</p>
            <p>Mar 23 - Apr 21</p>
          </body>
        </html>
      `, (() => {
        const fixture = usageBillingFixture as CursorUsageBillingContractFixture;
        const capturedAt = "2026-07-15T00:00:00.000Z";
        return [
          {
            url: `https://cursor.com${CURSOR_USAGE_SUMMARY_PATH}`,
            method: "GET",
            status: 200,
            ok: true,
            contentType: "application/json",
            bodyText: JSON.stringify(fixture.usageSummary),
            capturedAt,
            transport: "fetch" as const,
          },
          {
            url: `https://cursor.com${CURSOR_FILTERED_USAGE_EVENTS_PATH}`,
            method: "POST",
            status: 200,
            ok: true,
            contentType: "application/json",
            bodyText: JSON.stringify(fixture.usageEvents),
            capturedAt,
            transport: "fetch" as const,
          },
        ];
      })());
    });
    const client = createCursorPersonalPageClient({
      source: "live",
      pageSessionClient: { capture },
      sessionApiClient: {
        getUsageSnapshot: vi.fn(async () => ({
          ok: false as const,
          code: "network_error" as const,
          reason: "Background session unavailable in this page fallback test.",
          retryAt: null,
        })),
      },
      openPageWhenMissing: true,
      hydrationRetryAttempts: 2,
      hydrationRetryDelayMs: 0,
    });

    const { result, pageBinding, captureSource } = await client.getUsageSnapshot(
      createEmptyPageBinding(),
    );

    expect(result.status).toBe("ok");
    expect(captureSource).toBe("page_parse");
    expect(usageCaptureCount).toBe(2);
    expect(pageBinding).toMatchObject({
      status: "bound",
      tabId: 91,
      matchedUrl: CURSOR_USAGE_URL,
    });
    expect(capture.mock.calls[0]?.[0]).toMatchObject({
      openWhenMissing: {
        url: CURSOR_USAGE_URL,
        active: false,
        closeOnUnmatched: true,
      },
      reloadBeforeCapture: {
        bypassCache: true,
        waitForLoadTimeoutMs: 12_000,
        loadPollIntervalMs: 250,
        postLoadDelayMs: 250,
      },
      extraction: expect.objectContaining({
        mode: "network_observer",
        observeReload: true,
      }),
    });
  });
});
