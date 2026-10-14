import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createRuntimeI18n, SUPPORTED_APP_LOCALES } from "../i18n";
import { createDefaultAppState } from "../production-state";
import { getProviderViewModel } from "../provider-view-models";
import { emptyCommunityResetCache, normalizeCommunityResetStore, type CommunityResetEvent } from "../community-reset-feeds";
import { getCommunityResetPopupCopy } from "../community-reset-popup-copy";
import { CommunityResetPopupSummary } from "./CommunityResetPopupSummary";
import { CommunityResetPanel } from "./CommunityResetPanel";
import { ProviderSupplementalModules } from "./ProviderSupplementalModules";

const now = Date.parse("2026-10-14T05:40:00Z"), capturedAt = new Date(now).toISOString();
function fixture() {
  const store = normalizeCommunityResetStore(undefined);
  const event: CommunityResetEvent = { source: "codex-reset", id: "synthetic", kind: "grant", state: "unknown", announcedAt: "2026-10-13T05:06:00Z",
    originalUrl: null, scheduledFor: null, summary: "Synthetic long source text must stay in detail", traceable: false };
  store.preferences = { mode: "in_app", sources: ["codex-reset"] };
  store.caches.timeline = { ...emptyCommunityResetCache(), capturedAt, expiresAt: new Date(now + 600_000).toISOString(), fragment: { events: [event], forecasts: [], generatedAt: capturedAt } };
  return store;
}
const html = (store = fixture(), failed = false) => renderToStaticMarkup(<CommunityResetPopupSummary i18n={createRuntimeI18n("en")} store={store} now={now} detailUrl="#provider-detail/codex-personal-page" external={false} failed={failed} />);

describe("Popup-only insight rendering", () => {
  it("shows kind, honest state, short date, one credited link and accessible exact timestamps", () => {
    const rendered = html();
    expect(rendered).toContain("Reset-card grant"); expect(rendered).toContain("Unconfirmed"); expect(rendered).toContain("Oct 13");
    expect(rendered).toContain("not account confirmation");
    expect(rendered.match(/href="https:\/\/codex-reset.com\/"/g)).toHaveLength(1);
    expect(rendered).toContain("Announcement time:"); expect(rendered).toContain("UTC"); expect(rendered).toContain('role="tooltip"');
    expect(rendered).not.toContain("Synthetic long"); expect(rendered).not.toContain('role="progressbar"');
  });
  it("never presents a scheduled, announced or untraceable report as account confirmation", () => {
    const store = fixture(), entry = store.caches.timeline!.fragment!.events[0];
    for (const [state, label] of [["scheduled", "Scheduled"], ["announced", "Announcement"], ["unknown", "Unconfirmed"]] as const) {
      entry.state = state; entry.scheduledFor = "2026-10-01T00:00:00Z";
      expect(html(store)).toContain(label); expect(html(store)).not.toContain("Source reports execution");
    }
    entry.kind = "credits"; expect(html(store)).toContain("Credit grant"); expect(html(store)).not.toContain("Reset-card grant");
  });
  it("keeps errors separate from a healthy no-data result", () => {
    const store = fixture(); store.caches.timeline!.fragment!.events = [];
    expect(html(store)).toContain("No reports yet");
    store.caches.timeline!.failure = "permission";
    expect(html(store)).toContain("Access needed"); expect(html(store)).not.toContain("No reports yet");
    expect(html(store, true)).toContain('data-community-health="unavailable"'); expect(html(store, true)).not.toContain("No reports yet");
    expect(html(store, true)).toContain("settings-usage-notifications");
  });
  it("keeps old compact and detail layouts separate and hides an off Popup panel", () => {
    const store = fixture(), i18n = createRuntimeI18n("en");
    expect(renderToStaticMarkup(<CommunityResetPanel store={store} i18n={i18n} compact />)).toContain('data-community-resets="compact"');
    expect(renderToStaticMarkup(<CommunityResetPanel store={store} i18n={i18n} />)).toContain("Synthetic long");
    expect(renderToStaticMarkup(<CommunityResetPanel store={store} i18n={i18n} compact presentation="popup" />)).toContain('data-community-resets="popup"');
    store.preferences.mode = "off";
    expect(renderToStaticMarkup(<CommunityResetPanel store={store} i18n={i18n} compact presentation="popup" />)).toBe("");
  });
  it("omits only empty Popup composition without changing preferences or known zero/stale values", () => {
    const state = createDefaultAppState();
    for (const surface of ["popup", "sidebar", "fullPage"] as const) state.settings.usageHistoryModulesBySurface[surface]["codex-personal-page"] = [{ id: "usage_composition", visible: true }];
    const preferences = JSON.stringify(state.settings.usageHistoryModulesBySurface);
    const render = (surface: "popup" | "sidebar" | "fullPage", compact = true) => renderToStaticMarkup(<ProviderSupplementalModules provider={getProviderViewModel(state, "codex-personal-page")!} i18n={createRuntimeI18n("en")} surface={surface} preferences={state.settings.usageHistoryModulesBySurface} compact={compact} />);
    expect(render("popup")).not.toContain("data-provider-composition");
    expect(render("sidebar")).toContain("Composition is not exposed"); expect(render("fullPage", false)).toContain("Composition is not exposed");
    state.providers.find((provider) => provider.providerId === "codex-personal-page")!.usageInsights = { distribution: { source: "page", capturedAt: "2026-01-01T00:00:00Z", accountVerified: false,
      kind: "function", unit: "percent", rangeStart: null, rangeEnd: null, values: [{ id: "tasks", label: "Tasks", value: 0 }] } };
    expect(render("popup")).toContain("0%"); expect(render("popup")).toContain("Stale");
    expect(JSON.stringify(state.settings.usageHistoryModulesBySurface)).toBe(preferences);
  });
  it("renders all locales without missing copy", () => {
    for (const locale of SUPPORTED_APP_LOCALES) {
      const rendered = renderToStaticMarkup(<CommunityResetPopupSummary i18n={createRuntimeI18n(locale)} store={fixture()} now={now} detailUrl="#details" external={false} />);
      expect(rendered).toContain(getCommunityResetPopupCopy(locale).title);
      expect(rendered).not.toContain("undefined");
    }
  });
});
