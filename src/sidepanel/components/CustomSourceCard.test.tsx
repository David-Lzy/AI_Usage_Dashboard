import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { AppState } from "../../providers/types";
import { SAMPLE_APP_STATE } from "../../shared/constants";
import { getVisibleCustomSources } from "../../shared/custom-source-view-models";
import { CustomSourceCard } from "./CustomSourceCard";

function createCustomSourceState(): AppState {
  return {
    ...SAMPLE_APP_STATE,
    customSources: [
      {
        id: "custom:build_quota",
        label: "Build Quota",
        description: "Internal quota endpoint",
        endpointUrl: "https://example.com/ai-usage.json",
        displayEnabled: true,
        refreshIntervalMinutes: 15,
        createdAt: "2026-06-26T00:00:00.000Z",
        updatedAt: "2026-06-26T00:00:00.000Z",
      },
    ],
    customSourceStates: [
      {
        sourceId: "custom:build_quota",
        status: "ok",
        snapshot: {
          sourceId: "custom:build_quota",
          endpointId: "build_quota",
          label: "Build Quota Live",
          description: "Live custom usage",
          planName: "Custom",
          quotaUnit: "percent",
          quotaWindow: "daily",
          used: 72,
          remaining: 28,
          total: 100,
          resetAt: "2026-06-27T10:00:00.000Z",
          resetLabel: "Resets tomorrow",
          syncedAt: "2026-06-26T10:00:00.000Z",
          syncStatus: "ok",
          tone: "neutral",
          warningReason: null,
          lastSyncLabel: "Just now",
          usageSummary: "28% daily quota remaining",
          quota: {
            label: "Daily quota",
            unit: "percent",
            window: "daily",
            used: 72,
            remaining: 28,
            total: 100,
            resetAt: "2026-06-27T10:00:00.000Z",
            resetLabel: "Resets tomorrow",
          },
          windows: [],
          balances: [],
          facts: [
            {
              label: "Queue",
              value: "Healthy",
              detail: "No backlog",
            },
          ],
        },
        lastAttemptAt: "2026-06-26T10:00:00.000Z",
        lastSuccessAt: "2026-06-26T10:00:00.000Z",
        lastFailureAt: null,
        lastFailureReason: null,
        stale: false,
      },
    ],
  };
}

describe("CustomSourceCard", () => {
  function renderCard(localePreference: AppState["settings"]["locale"]) {
    const state = createCustomSourceState();
    const [source] = getVisibleCustomSources(state);

    return renderToStaticMarkup(
      <CustomSourceCard
        localePreference={localePreference}
        progressColorBands={state.settings.progressColorBands}
        progressDisplayStyle="line"
        progressItemsBySurface={state.settings.progressItemsBySurface}
        progressThicknessPx={state.settings.progressThicknessPx}
        progressSurface="sidebar"
        source={source!}
        onOpenSettings={() => {}}
        onRefresh={() => {}}
      />,
    );
  }

  it("renders custom source status, progress, facts, and safe endpoint context", () => {
    const html = renderCard("en");

    expect(html).toContain('data-custom-source-id="custom:build_quota"');
    expect(html).toContain(">Build Quota Live<");
    expect(html).toContain(">Custom<");
    expect(html).toContain(">28% daily quota remaining<");
    expect(html).toContain(">Queue<");
    expect(html).toContain(">Healthy<");
    expect(html).toContain("https://example.com/ai-usage.json");
    expect(html).toContain('data-custom-source-progress-item="primary"');
  });

  it("localizes static custom source card labels without translating user data", () => {
    const zhHtml = renderCard("zh-CN");
    const deHtml = renderCard("de");

    expect(zhHtml).toContain(">自定义<");
    expect(zhHtml).toContain(">设置<");
    expect(zhHtml).toContain(">刷新<");
    expect(zhHtml).toContain("自定义 JSON 端点");
    expect(zhHtml).toContain(">Live custom usage<");
    expect(zhHtml).toContain(">28% daily quota remaining<");
    expect(zhHtml).toContain("https://example.com/ai-usage.json");

    expect(deHtml).toContain(">Eigene Quelle<");
    expect(deHtml).toContain(">Einstellungen<");
    expect(deHtml).toContain(">Aktualisieren<");
    expect(deHtml).toContain("Eigener JSON-Endpunkt");
    expect(deHtml).toContain(">Live custom usage<");
    expect(deHtml).toContain(">28% daily quota remaining<");
    expect(deHtml).toContain("https://example.com/ai-usage.json");
  });
});
