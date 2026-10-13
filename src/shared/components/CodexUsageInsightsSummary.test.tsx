import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createRuntimeI18n, type ResolvedAppLocale } from "../i18n";
import { getProviderInsightsCopy } from "../provider-insights-copy";
import type { ProviderViewModel } from "../provider-view-models";
import { CodexUsageInsightsSummary } from "./CodexUsageInsightsSummary";

const capturedAt = new Date().toISOString();
const provider = { providerId: "codex-personal-page", usageInsights: { resetCredits: {
  source: "local_companion", capturedAt, accountVerified: false, availableCount: 0,
  offers: [{ kind: "codex", available: true, expiresAt: "2026-12-01T00:00:00.000Z" }], detailsComplete: false,
} } } as ProviderViewModel;

describe("Codex insight summary", () => {
  it("shows the real zero, bounded expiry and partial detail warning", () => {
    const html = renderToStaticMarkup(<CodexUsageInsightsSummary provider={provider} i18n={createRuntimeI18n("en")} detail />);
    expect(html).toContain("<strong>0</strong>");
    expect(html).toContain("Expires");
    expect(html).toContain("Account unverified");
    expect(html).toContain("Reset details may be incomplete");
    expect(html).not.toContain("redeem");
  });

  it("omits offer details in compact surfaces and has 14-language labels", () => {
    const html = renderToStaticMarkup(<CodexUsageInsightsSummary provider={provider} i18n={createRuntimeI18n("en")} detail={false} />);
    expect(html).not.toContain("Expires");
    for (const locale of ["en", "zh-CN", "zh-TW", "ja", "ko", "es-419", "pt-BR", "fr", "de", "it", "ru", "ar", "hi", "id"] as ResolvedAppLocale[]) {
      expect(Object.values(getProviderInsightsCopy(locale)).every(Boolean)).toBe(true);
    }
  });
});
