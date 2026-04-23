import { describe, expect, it } from "vitest";

import { summarizeCodexPersonalPage } from "./personal-page-capture";

describe("summarizeCodexPersonalPage", () => {
  it("prefers boot-data when Next.js flight markers are present", () => {
    const summary = summarizeCodexPersonalPage({
      url: "https://chatgpt.com/codex/settings/usage",
      title: "Codex",
      heading: "Usage",
      html: `
        <html>
          <body>
            <h1>Usage</h1>
            <script>self.__next_f.push([1, "usage"]);</script>
            <div>Resets in 4 days</div>
          </body>
        </html>
      `,
    });

    expect(summary.recommendedSurface).toBe("boot_data");
    expect(summary.scriptMarkers.hasNextFlightStream).toBe(true);
    expect(summary.keywordSignals.hasResetSignal).toBe(true);
  });

  it("falls back to DOM when visible usage snippets are present", () => {
    const summary = summarizeCodexPersonalPage({
      url: "https://chatgpt.com/codex/settings/usage",
      title: "Codex",
      heading: "Usage",
      html: `
        <html>
          <body>
            <h1>Usage</h1>
            <div>Remaining credits: 120</div>
            <div>Usage window resets tomorrow</div>
          </body>
        </html>
      `,
    });

    expect(summary.recommendedSurface).toBe("dom");
    expect(summary.textSnippets).toContain("Remaining credits: 120");
    expect(summary.keywordSignals.hasRemainingSignal).toBe(true);
  });
});
