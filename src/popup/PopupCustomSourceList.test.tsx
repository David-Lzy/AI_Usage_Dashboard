import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SAMPLE_APP_STATE } from "../shared/constants";
import type { CustomSourceViewModel } from "../shared/custom-source-view-models";
import { createRuntimeI18n } from "../shared/i18n";
import { PopupCustomSourceList } from "./PopupCustomSourceList";

const CUSTOM_SOURCE: CustomSourceViewModel = {
  sourceId: "custom:build_quota",
  label: "Build Quota",
  description: "Internal quota endpoint",
  endpointUrl: "https://example.com/ai-usage.json",
  refreshIntervalMinutes: 15,
  displayEnabled: true,
  syncStatus: "ok",
  displayTone: "neutral",
  statusLabel: "Healthy",
  lastSyncLabel: "Just now",
  warningReason: null,
  stale: false,
  hasSnapshot: true,
  usageSummary: "28% daily quota remaining",
  quota: null,
  windows: [],
  balances: [],
  facts: [],
  progressItems: [
    {
      id: "primary",
      kind: "primary_quota",
      sourceId: "custom:build_quota",
      sourceLabel: "Build Quota",
      label: "Daily quota",
      quotaUnit: "percent",
      used: 72,
      remaining: 28,
      total: 100,
      resetAt: null,
      resetLabel: "Resets tomorrow",
      detail: "daily",
      tone: "warning",
      availability: "progress",
    },
  ],
};

describe("PopupCustomSourceList", () => {
  it("renders enabled custom sources in the popup quota section", () => {
    const html = renderToStaticMarkup(
      <PopupCustomSourceList
        ariaLabel="Custom sources"
        sources={[CUSTOM_SOURCE]}
        i18n={createRuntimeI18n("en")}
        progressColorBands={SAMPLE_APP_STATE.settings.progressColorBands}
        popupCircularProgressItemsPerRow={2}
        progressDisplayStyle="line"
        progressItemsBySurface={SAMPLE_APP_STATE.settings.progressItemsBySurface}
        progressThicknessPx={SAMPLE_APP_STATE.settings.progressThicknessPx}
        settingsFocus={{
          kind: "section",
          sectionId: "settings-provider-display",
        }}
        onOpenSettings={() => {}}
      />,
    );

    expect(html).toContain('data-popup-custom-source-id="custom:build_quota"');
    expect(html).toContain(">Build Quota<");
    expect(html).toContain(">Settings<");
    expect(html).toContain('data-custom-source-progress-item="primary"');
  });

  it("centers a single custom-source circular quota item", () => {
    const html = renderToStaticMarkup(
      <PopupCustomSourceList
        ariaLabel="Custom sources"
        sources={[CUSTOM_SOURCE]}
        i18n={createRuntimeI18n("en")}
        progressColorBands={SAMPLE_APP_STATE.settings.progressColorBands}
        popupCircularProgressItemsPerRow={2}
        progressDisplayStyle="circle-soft"
        progressItemsBySurface={SAMPLE_APP_STATE.settings.progressItemsBySurface}
        progressThicknessPx={SAMPLE_APP_STATE.settings.progressThicknessPx}
        settingsFocus={{
          kind: "section",
          sectionId: "settings-provider-display",
        }}
        onOpenSettings={() => {}}
      />,
    );

    expect(html).toContain("provider-progress-item-list--single-circular");
    expect(html).toContain('data-single-circular-progress=""');
  });
});
