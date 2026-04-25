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

  it("preserves repeated usage percentages because Codex windows are positional", () => {
    const summary = summarizeCodexPersonalPage({
      url: "https://chatgpt.com/codex/cloud/settings/analytics#usage",
      title: "Codex",
      heading: "Codex analysis",
      html: `
        <html>
          <body>
            <p>5 小时使用限额</p>
            <p>100%</p>
            <p>剩余</p>
            <p>每周使用限额</p>
            <p>32%</p>
            <p>剩余</p>
            <p>GPT-5.3-Codex-Spark 5 小时使用限额</p>
            <p>100%</p>
            <p>剩余</p>
            <p>GPT-5.3-Codex-Spark 每周使用限额</p>
            <p>100%</p>
            <p>余额额度</p>
            <p>0</p>
            <p>使用积分可在超出套餐限制后继续使用 Codex</p>
          </body>
        </html>
      `,
    });

    expect(summary.textSnippets.filter((snippet) => snippet === "100%")).toHaveLength(3);
    expect(summary.textSnippets).toEqual([
      "5 小时使用限额",
      "100%",
      "剩余",
      "每周使用限额",
      "32%",
      "剩余",
      "GPT-5.3-Codex-Spark 5 小时使用限额",
      "100%",
      "剩余",
      "GPT-5.3-Codex-Spark 每周使用限额",
      "100%",
      "余额额度",
      "0",
      "使用积分可在超出套餐限制后继续使用 Codex",
    ]);
  });
});
