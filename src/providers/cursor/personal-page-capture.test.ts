import { describe, expect, it, vi } from "vitest";
import usageBillingFixture from "../../../fixtures/cursor/usage-billing.fixture.json";

import type {
  PageSessionCapturedPage,
  PageSessionClient,
  PageSessionResult,
} from "../page-session";
import {
  captureCursorPersonalLiveFixture,
  summarizeCursorPersonalPage,
} from "./personal-page-capture";
import {
  CURSOR_FILTERED_USAGE_EVENTS_PATH,
  CURSOR_HARD_LIMIT_PATH,
  CURSOR_PLAN_INFO_PATH,
  CURSOR_USAGE_SUMMARY_PATH,
  type CursorUsageBillingContractFixture,
} from "./usage-billing-contract";

function buildCaptureClient(page: PageSessionCapturedPage): PageSessionClient {
  return {
    capture: vi.fn<PageSessionClient["capture"]>(async (definition) => {
      const matchStatus = definition.match(page);

      if (matchStatus === "matched") {
        return {
          status: "matched",
          page,
          target: {
            tabId: 77,
            bindingMode: "auto",
            active: false,
            lastAccessed: null,
          },
          attempts: [
            {
              tabId: 77,
              bindingMode: "auto",
              status: "matched",
              url: page.url,
              title: page.title,
            },
          ],
        } satisfies PageSessionResult;
      }

      return {
        status: matchStatus === "logged_out" ? "logged_out" : "not_found",
        attempts: [
          {
            tabId: 77,
            bindingMode: "auto",
            status: matchStatus,
            url: page.url,
            title: page.title,
          },
        ],
      } satisfies PageSessionResult;
    }),
  };
}

describe("summarizeCursorPersonalPage", () => {
  it("prefers boot-data when Next.js markers are present", () => {
    const summary = summarizeCursorPersonalPage({
      url: "https://cursor.com/dashboard/usage",
      title: "Cursor",
      heading: "Usage",
      html: `
        <html>
          <body>
            <h1>Usage</h1>
            <script id="__NEXT_DATA__">{}</script>
            <div>Remaining requests: 212</div>
          </body>
        </html>
      `,
    });

    expect(summary.recommendedSurface).toBe("boot_data");
    expect(summary.scriptMarkers.hasNextDataScript).toBe(true);
    expect(summary.keywordSignals.hasRemainingSignal).toBe(true);
  });

  it("falls back to DOM when visible usage snippets are present", () => {
    const summary = summarizeCursorPersonalPage({
      url: "https://cursor.com/cn/dashboard/usage",
      title: "Cursor",
      heading: "使用情况",
      html: `
        <html>
          <body>
            <h1>使用情况</h1>
            <div>已使用 128 请求</div>
            <div>剩余 372 请求</div>
            <div>刷新时间：7 天后</div>
          </body>
        </html>
      `,
    });

    expect(summary.recommendedSurface).toBe("dom");
    expect(summary.localePrefix).toBe("cn");
    expect(summary.textSnippets).toContain("剩余 372 请求");
    expect(summary.keywordSignals.hasRequestSignal).toBe(true);
    expect(summary.keywordSignals.hasResetSignal).toBe(true);
  });

  it("keeps short Cursor usage labels needed by the personal display summary", () => {
    const summary = summarizeCursorPersonalPage({
      url: "https://cursor.com/dashboard/usage",
      title: "Cursor - Usage",
      heading: "Usage",
      html: `
        <html>
          <body>
            <h1>Usage</h1>
            <p>Pro</p>
            <p>Pro+</p>
            <p>Ultra</p>
            <p>On-Demand Usage is Off</p>
            <p>Your Usage</p>
            <p>Your usage per day across this billing period</p>
            <p>By Model</p>
            <p>Spend</p>
            <p>Total spend</p>
            <p>$0</p>
            <p>Included</p>
            <p>$0</p>
            <p>On-demand</p>
            <p>$0</p>
            <p>Export CSV</p>
            <p>Mar 23 - Apr 21</p>
          </body>
        </html>
      `,
    });

    expect(summary.textSnippets).toEqual([
      "Usage",
      "Pro",
      "Pro+",
      "Ultra",
      "On-Demand Usage is Off",
      "Your Usage",
      "Your usage per day across this billing period",
      "By Model",
      "Spend",
      "Total spend",
      "$0",
      "Included",
      "$0",
      "On-demand",
      "$0",
      "Export CSV",
      "Mar 23 - Apr 21",
    ]);
  });

  it("matches an authenticated usage dashboard even when auth copy exists in the DOM", async () => {
    const fixture = await captureCursorPersonalLiveFixture(
      buildCaptureClient({
        url: "https://cursor.com/cn/dashboard/usage",
        title: "Cursor - The best way to code with AI",
        heading: "Usage",
        html: `
          <html>
            <body>
              <nav>Usage</nav>
              <section>
                <h1>Pro <span>Current</span></h1>
                <p>On-Demand Usage is Off</p>
                <p>Total spend</p>
                <p>Included</p>
                <p>On-demand</p>
                <h2>Your Usage</h2>
                <p>Your usage per day across this billing period</p>
                <p>Apr 28 - May 04</p>
              </section>
              <div hidden>
                <button>Continue with Google</button>
                <button>Continue with Github</button>
              </div>
            </body>
          </html>
        `,
      }),
    );

    expect(fixture.routes[0]).toMatchObject({
      status: "matched",
      matchedUrl: "https://cursor.com/cn/dashboard/usage",
    });
    expect(fixture.routes[0]?.summary?.textSnippets).toContain(
      "On-Demand Usage is Off",
    );
  });

  it("still treats a sign-in-only Cursor page as logged out", async () => {
    const fixture = await captureCursorPersonalLiveFixture(
      buildCaptureClient({
        url: "https://cursor.com/cn/dashboard/usage",
        title: "Cursor - Sign in",
        heading: "Sign in to Cursor",
        html: `
          <html>
            <body>
              <h1>Sign in to Cursor</h1>
              <button>Continue with Google</button>
              <button>Continue with Github</button>
            </body>
          </html>
        `,
      }),
    );

    expect(fixture.routes[0]).toMatchObject({
      status: "logged_out",
      matchedUrl: null,
    });
  });

  it("captures structured usage data and follows bounded event pagination", async () => {
    const contractFixture =
      usageBillingFixture as CursorUsageBillingContractFixture;
    const firstEvent = contractFixture.usageEvents.usageEventsDisplay[0]!;
    const secondEvent = contractFixture.usageEvents.usageEventsDisplay[1]!;
    const thirdEvent = {
      ...secondEvent,
      timestamp: "2026-07-15T12:00:00.000Z",
    };
    const page: PageSessionCapturedPage = {
      url: "https://cursor.com/dashboard/usage?from=2026-06-15&to=2026-07-15",
      title: "Cursor",
      heading: "Usage",
      html: "<html><body><h1>Usage</h1><p>Loading</p></body></html>",
      observedNetwork: {
        matchUrlSubstrings: [],
        maxEntries: 10,
        entries: [
          {
            url: `https://cursor.com${CURSOR_USAGE_SUMMARY_PATH}`,
            method: "GET",
            status: 200,
            ok: true,
            contentType: "application/json",
            bodyText: JSON.stringify(contractFixture.usageSummary),
            capturedAt: "2026-07-15T00:00:00.000Z",
            transport: "fetch",
          },
          {
            url: `https://cursor.com${CURSOR_FILTERED_USAGE_EVENTS_PATH}`,
            method: "POST",
            status: 200,
            ok: true,
            contentType: "application/json",
            bodyText: JSON.stringify({
              totalUsageEventsCount: 3,
              usageEventsDisplay: [firstEvent],
            }),
            requestBodyText: JSON.stringify({
              startDate: "2026-06-15",
              endDate: "2026-07-15",
              page: 1,
              pageSize: 1,
              teamId: 7,
            }),
            capturedAt: "2026-07-15T00:00:00.000Z",
            transport: "fetch",
          },
        ],
      },
    };
    const capture = vi.fn<PageSessionClient["capture"]>(async (definition) => {
      if (!definition.urlPatterns.some((pattern) => pattern.includes("/usage"))) {
        return { status: "not_found", attempts: [] };
      }
      return {
        status: "matched",
        page,
        target: {
          tabId: 77,
          bindingMode: "auto",
          active: false,
          lastAccessed: null,
        },
        attempts: [
          {
            tabId: 77,
            bindingMode: "auto",
            status: "matched",
            url: page.url,
            title: page.title,
          },
        ],
      };
    });
    const executeMainWorldMock = vi.fn(async () => [
      JSON.stringify({
        totalUsageEventsCount: 3,
        usageEventsDisplay: [secondEvent],
      }),
      JSON.stringify({
        totalUsageEventsCount: 3,
        usageEventsDisplay: [thirdEvent],
      }),
    ]);
    const executeMainWorld: NonNullable<PageSessionClient["executeMainWorld"]> =
      async <T>() => (await executeMainWorldMock()) as T;

    const fixture = await captureCursorPersonalLiveFixture({
      capture,
      executeMainWorld,
    });

    expect(fixture.extractionMode).toBe("network_observer");
    expect(fixture.routes).toHaveLength(2);
    expect(fixture.routes[0]?.usageBillingContract?.usageEvents).toMatchObject({
      totalUsageEventsCount: 3,
    });
    expect(
      fixture.routes[0]?.usageBillingContract?.usageEvents?.usageEventsDisplay,
    ).toHaveLength(3);
    expect(executeMainWorldMock).toHaveBeenCalledTimes(1);
    expect(capture.mock.calls[0]?.[0]).toMatchObject({
      reloadBeforeCapture: {
        bypassCache: true,
        waitForLoadTimeoutMs: 12_000,
        loadPollIntervalMs: 250,
        postLoadDelayMs: 250,
      },
      extraction: {
        mode: "network_observer",
        captureRequestBody: true,
        observeReload: true,
      },
    });
  });

  it("recovers a lazy-loaded billing summary through bounded same-origin requests", async () => {
    const contractFixture =
      usageBillingFixture as CursorUsageBillingContractFixture;
    const page: PageSessionCapturedPage = {
      url: "https://cursor.com/dashboard/usage",
      title: "Cursor",
      heading: "Usage",
      html: "<html><body><h1>Usage</h1><p>Loading</p></body></html>",
      observedNetwork: {
        matchUrlSubstrings: [],
        maxEntries: 10,
        entries: [],
      },
    };
    const capture = vi.fn<PageSessionClient["capture"]>(async (definition) => {
      if (!definition.urlPatterns.some((pattern) => pattern.includes("/usage"))) {
        return { status: "not_found", attempts: [] };
      }

      return {
        status: "matched",
        page,
        target: {
          tabId: 77,
          bindingMode: "auto",
          active: false,
          lastAccessed: null,
        },
        attempts: [],
      };
    });
    const executeMainWorldMock = vi.fn(async () => [
      {
        url: `https://cursor.com${CURSOR_USAGE_SUMMARY_PATH}`,
        ok: true,
        bodyText: JSON.stringify(contractFixture.usageSummary),
      },
      {
        url: `https://cursor.com${CURSOR_PLAN_INFO_PATH}`,
        ok: true,
        bodyText: JSON.stringify(contractFixture.planInfo),
      },
      {
        url: `https://cursor.com${CURSOR_HARD_LIMIT_PATH}`,
        ok: true,
        bodyText: JSON.stringify(contractFixture.hardLimit),
      },
    ]);
    const executeMainWorld: NonNullable<PageSessionClient["executeMainWorld"]> =
      async <T>() => (await executeMainWorldMock()) as T;

    const fixture = await captureCursorPersonalLiveFixture({
      capture,
      executeMainWorld,
    });

    expect(fixture.routes[0]?.usageBillingContract).toEqual({
      usageSummary: contractFixture.usageSummary,
      planInfo: contractFixture.planInfo,
      hardLimit: contractFixture.hardLimit,
      usageEvents: null,
    });
    expect(fixture.routes[0]?.summary?.recommendedSurface).toBe(
      "network_observer",
    );
    expect(executeMainWorldMock).toHaveBeenCalledTimes(1);
  });
});
