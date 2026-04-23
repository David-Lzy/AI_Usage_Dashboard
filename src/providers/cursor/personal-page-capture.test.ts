import { describe, expect, it } from "vitest";

import { summarizeCursorPersonalPage } from "./personal-page-capture";

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
});
