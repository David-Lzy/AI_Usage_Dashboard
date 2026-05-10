import { describe, expect, it } from "vitest";

import {
  captureClaudePersonalLiveFixture,
  summarizeClaudePersonalPage,
} from "./personal-page-capture";
import type { PageSessionClient } from "../page-session";

describe("summarizeClaudePersonalPage", () => {
  it("detects boot-data-capable Claude usage pages", () => {
    const summary = summarizeClaudePersonalPage({
      url: "https://claude.ai/settings/usage",
      title: "Claude",
      heading: "Usage",
      html: `
        <html>
          <body>
            <h1>Usage</h1>
            <script>self.__next_f.push([1, "usage"])</script>
            <p>Weekly usage limit</p>
            <p>42% remaining</p>
          </body>
        </html>
      `,
    });

    expect(summary.recommendedSurface).toBe("boot_data");
    expect(summary.keywordSignals.hasUsageSignal).toBe(true);
    expect(summary.keywordSignals.hasRemainingSignal).toBe(true);
    expect(summary.textSnippets).toContain("42% remaining");
  });

  it("reloads stale Claude usage tabs and can auto-open the usage route", async () => {
    const capturedDefinitions: Parameters<PageSessionClient["capture"]>[0][] = [];
    const client: PageSessionClient = {
      async capture(definition) {
        capturedDefinitions.push(definition);
        return {
          status: "not_found",
          attempts: [],
        };
      },
    };

    await captureClaudePersonalLiveFixture(
      client,
      {
        mode: "auto",
        tabId: null,
      },
      {
        openPageWhenMissing: true,
      },
    );

    expect(capturedDefinitions).toHaveLength(1);
    expect(capturedDefinitions[0]?.urlPatterns).toEqual([
      "https://claude.ai/settings/usage*",
    ]);
    expect(capturedDefinitions[0]?.reloadBeforeCapture).toEqual({
      bypassCache: true,
      waitForLoadTimeoutMs: 10_000,
      loadPollIntervalMs: 250,
      postLoadDelayMs: 2_000,
    });
    expect(capturedDefinitions[0]?.reloadOnCaptureFailure).toEqual({
      bypassCache: true,
      waitForLoadTimeoutMs: 10_000,
      loadPollIntervalMs: 250,
      postLoadDelayMs: 2_000,
    });
    expect(capturedDefinitions[0]?.openWhenMissing).toEqual({
      url: "https://claude.ai/settings/usage",
      active: false,
      closeOnUnmatched: true,
    });
  });
});

