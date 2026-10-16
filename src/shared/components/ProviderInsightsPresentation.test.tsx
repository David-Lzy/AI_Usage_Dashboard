import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createRuntimeI18n, SUPPORTED_APP_LOCALES } from "../i18n";
import { createDefaultAppState } from "../production-state";
import { getProviderViewModel } from "../provider-view-models";
import { normalizeCommunityResetStore, emptyCommunityResetCache } from "../community-reset-feeds";
import { getResetExpirySummary } from "../reset-expiry-presentation";
import { getProviderInsightsUiCopy } from "../provider-insights-ui-copy";
import { getCommunityResetCopy } from "../community-reset-copy";
import { ProviderUsageComposition } from "./ProviderUsageComposition";
import { CommunityResetPanel } from "./CommunityResetPanel";
import { CursorQuotaPoolInsights } from "./CursorQuotaPoolInsights";
import { ProviderSupplementalModules } from "./ProviderSupplementalModules";

const capturedAt = new Date().toISOString();
function model() {
  const state = createDefaultAppState();
  state.providers.find((provider) => provider.providerId === "codex-personal-page")!.usageInsights = {
    quotaScope: { source: "page", capturedAt, accountVerified: false, scope: "shared_plan" },
    distribution: { source: "page", capturedAt, accountVerified: false, kind: "function", unit: "percent", rangeStart: "2026-10-06", rangeEnd: "2026-10-12",
      values: [{ id: "tasks", label: "Tasks", value: 64 }, { id: "subagents", label: "Subagents", value: 36 }] },
  };
  return getProviderViewModel(state, "codex-personal-page")!;
}
describe("source-scoped insight presentation", () => {
  it("shows composition scope/period without quota progress or a shared remaining-balance claim", () => {
    const html = renderToStaticMarkup(<ProviderUsageComposition provider={model()} i18n={createRuntimeI18n("en")} />);
    expect(html).toContain("Usage scope: Work / Codex / agents");
    expect(html).toContain("Share of usage, not remaining quota");
    expect(html).toContain("2026-10-06"); expect(html).toContain("2026-10-12");
    expect(html).toContain("Account unverified"); expect(html).not.toContain('role="progressbar"');
  });
  it("keeps supplemental composition and public summary off by default", () => {
    const state = createDefaultAppState();
    const html = renderToStaticMarkup(<ProviderSupplementalModules provider={model()} i18n={createRuntimeI18n("en")} surface="popup" preferences={state.settings.usageHistoryModulesBySurface} compact />);
    expect(html).not.toContain("data-provider-composition"); expect(html).not.toContain("data-community-resets");
  });
  it("retains known reset credits without quota windows and honors the surface switch", () => {
    const state = createDefaultAppState();
    const snapshot = state.providers.find((provider) => provider.providerId === "codex-personal-page")!;
    snapshot.usageInsights = { resetCredits: { source: "local_companion", capturedAt, accountVerified: true, availableCount: 2, offers: null, detailsComplete: null } };
    snapshot.codexLocal = { availableResetCount: 2, accountVerified: true, estimates: [] };
    const provider = getProviderViewModel(state, "codex-personal-page")!;
    const render = () => renderToStaticMarkup(<ProviderSupplementalModules provider={provider} i18n={createRuntimeI18n("en")} surface="popup" preferences={state.settings.usageHistoryModulesBySurface} compact includeAccountSummary />);
    expect(render()).toContain("<strong>2</strong>");
    state.settings.usageHistoryModulesBySurface.popup["codex-personal-page"] = [{ id: "quota_insights", visible: false }];
    expect(render()).not.toContain("data-usage-insights");
  });
  it("distinguishes monthly/weekly pools and known zero versus unknown", () => {
    const html = renderToStaticMarkup(<CursorQuotaPoolInsights i18n={createRuntimeI18n("en")} pools={[
      { source: "page", capturedAt, accountVerified: false, id: "cursor_models", kind: "monthly", usedPercent: 0, remainingPercent: 100, resetAt: null, resetText: "Source: November 1" },
      { source: "page", capturedAt, accountVerified: false, id: "grok_bot", kind: "weekly", usedPercent: null, remainingPercent: null, resetAt: null },
    ]} />);
    expect(html).toContain("Cursor Models · Monthly"); expect(html).toContain("Grok Bot · Weekly");
    expect(html).toContain("0% used"); expect(html).toContain("Unknown"); expect(html).toContain("Source: November 1");
  });
  it("credits conflicting community reports, keeps probability out of rings and does not imply personal confirmation", () => {
    const store = normalizeCommunityResetStore(undefined); store.preferences.mode = "in_app";
    const event = { source: "codex-resets" as const, id: "synthetic", kind: "reset" as const, state: "reported" as const, announcedAt: capturedAt,
      originalUrl: "https://x.com/i/web/status/2100000000000000001", scheduledFor: null, traceable: true, summary: "Synthetic report" };
    store.caches.status = { ...emptyCommunityResetCache(), capturedAt, fragment: { events: [event], forecasts: [], generatedAt: capturedAt } };
    store.caches.timeline = { ...emptyCommunityResetCache(), capturedAt, fragment: { events: [{ ...event, source: "codex-reset", state: "unknown" }], forecasts: [], generatedAt: null } };
    store.caches.forecast = { ...emptyCommunityResetCache(), capturedAt, fragment: { events: [], forecasts: [{ source: "codex-reset", capturedAt, expiresAt: null, percent24h: 19, percent48h: 34, confidence: "low", watchPercent: null, lastResetAt: null }], generatedAt: capturedAt } };
    const html = renderToStaticMarkup(<CommunityResetPanel store={store} i18n={createRuntimeI18n("en")} />);
    expect(html).toContain("Source conflict"); expect(html).toContain("not confirmation of your account");
    expect(html).toContain("Source reports execution"); expect(html).toContain("Unconfirmed");
    expect(html).toContain('href="https://codex-resets.com/"'); expect(html).toContain('href="https://codex-reset.com/"');
    expect(html).toContain("19%"); expect(html).toContain("34%"); expect(html).not.toContain('role="progressbar"');
  });
  it("does not present an expired Cursor observation as current usage", () => {
    const html = renderToStaticMarkup(<CursorQuotaPoolInsights i18n={createRuntimeI18n("en")} pools={[
      { source: "page", capturedAt, accountVerified: false, id: "cursor_models", kind: "monthly", usedPercent: 71, remainingPercent: 29, resetAt: new Date(Date.now() - 1).toISOString() },
    ]} />);
    expect(html).toContain("Expired"); expect(html).not.toContain("71% used");
  });
  it("uses 14 localized UI/status sets, not missing placeholders", () => {
    for (const locale of SUPPORTED_APP_LOCALES) {
      expect(Object.values(getProviderInsightsUiCopy(locale)).every((value) => value.trim().length > 0)).toBe(true);
      expect(Object.values(getCommunityResetCopy(locale)).every((value) => value.trim().length > 0)).toBe(true);
    }
  });
  it("retains literal expiry without guessing time and does not reverse count from offers", () => {
    const credits = { source: "local_companion" as const, capturedAt, accountVerified: true, availableCount: 2, detailsComplete: false,
      offers: [{ kind: "codex" as const, available: true, expiresAt: null, expiryText: "Through OCT 28" }] };
    expect(getResetExpirySummary(credits)).toMatchObject({ knownExpiry: "Through OCT 28", precise: false });
    expect(getResetExpirySummary({ ...credits, availableCount: 0 }).knownExpiry).toBeNull();
    const expired = new Date(Date.now() - 60_000).toISOString();
    expect(getResetExpirySummary({ ...credits, offers: [{ kind: "codex", available: true, expiresAt: expired }] }).expiredCapture).toBe(false);
  });
});
