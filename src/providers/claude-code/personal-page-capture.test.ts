import { describe, expect, it } from "vitest";

import {
  captureClaudePersonalLiveFixture,
  summarizeClaudePersonalPage,
} from "./personal-page-capture";
import { parseClaudePersonalPageSummary } from "./personal-page-parser";
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
      waitForLoadTimeoutMs: 15_000,
      loadPollIntervalMs: 250,
      postLoadDelayMs: 3_500,
    });
    expect(capturedDefinitions[0]?.reloadOnCaptureFailure).toEqual({
      bypassCache: true,
      waitForLoadTimeoutMs: 15_000,
      loadPollIntervalMs: 250,
      postLoadDelayMs: 3_500,
    });
    expect(capturedDefinitions[0]?.openWhenMissing).toEqual({
      url: "https://claude.ai/settings/usage",
      active: false,
      closeOnUnmatched: true,
    });
  });

  it("preserves repeated Claude usage snippets so all visible Team rows can still be parsed", () => {
    const summary = summarizeClaudePersonalPage({
      url: "https://claude.ai/settings/usage",
      title: "Claude",
      heading: "Usage",
      html: `
        <html>
          <body>
            <nav>
              <p>0% used</p>
              <p>All models</p>
              <p>Customize</p>
              <p>Design</p>
              <p>More</p>
              <p>Recents</p>
              <p>Language capabilities and usage context</p>
              <p>Support</p>
              <p>Invite team members</p>
            </nav>
            <main>
              <h1>Usage</h1>
              <p>Your usage limits</p>
              <p>Team</p>
              <p>Current session</p>
              <p>Resets in 29 min</p>
              <p>0% used</p>
              <p>Weekly limits</p>
              <p>Learn more about usage limits</p>
              <p>All models</p>
              <p>Resets in 9 hr 49 min</p>
              <p>15% used</p>
              <p>Claude Design</p>
              <p>You haven't used Claude Design yet</p>
              <p>0% used</p>
              <p>Additional features</p>
              <p>Daily included routine runs</p>
              <p>You haven't run any routines yet</p>
              <p>0 / 25</p>
            </main>
          </body>
        </html>
      `,
    });

    expect(summary.textSnippets.filter((line) => line === "All models")).toHaveLength(2);
    expect(summary.textSnippets.filter((line) => line === "0% used")).toHaveLength(3);

    const snapshot = parseClaudePersonalPageSummary("settings_usage", summary);

    expect(snapshot).not.toBeNull();
    expect(snapshot?.windows.map((window) => window.normalizedLabel)).toEqual([
      "Current session",
      "All models weekly limit",
      "Claude Design",
      "Daily included routine runs",
    ]);
  });
});
