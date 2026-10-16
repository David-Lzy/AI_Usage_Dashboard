import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createRuntimeI18n, type ResolvedAppLocale } from "../i18n";
import type { ProviderViewModel } from "../provider-view-models";
import { ClaudeUsageInsightsSummary } from "./ClaudeUsageInsightsSummary";
import { buildUsageInsightsFromDom, type UsageInsightsDomCapture } from "../../providers/usage-insights-dom";
import fixture from "../../../fixtures/claude/usage-insights-dom.fixture.json";

describe("Claude independent insight summaries", () => {
  const provider = { providerId: "claude-code-team-page", usageInsights: buildUsageInsightsFromDom("claude", fixture as UsageInsightsDomCapture, new Date().toISOString()) } as ProviderViewModel;
  it("shows presence, zero and the separate USD allowance without a total balance", () => {
    const html = renderToStaticMarkup(<ClaudeUsageInsightsSummary provider={provider} i18n={createRuntimeI18n("en")} detail />);
    expect(html).toContain("Full reset");
    expect(html).toContain("Available");
    expect(html).toContain("5-hour reset");
    expect(html).toContain("Not available");
    expect(html).toContain("$80.00");
    expect(html).toContain("$0.00");
    expect(html).toContain("Expires October 31");
    expect(html).not.toContain("$180");
    expect(html).not.toContain("button");
  });
  it("keeps compact summaries small and supports all current locales", () => {
    for (const locale of ["en", "zh-CN", "zh-TW", "ja", "ko", "es-419", "pt-BR", "fr", "de", "it", "ru", "ar", "hi", "id"] as ResolvedAppLocale[]) {
      const html = renderToStaticMarkup(<ClaudeUsageInsightsSummary provider={provider} i18n={createRuntimeI18n(locale)} detail={false} />);
      expect(html).not.toContain("October 31");
      expect(html).toContain("data-usage-insights");
      expect(html).not.toContain("undefined");
    }
  });
});
