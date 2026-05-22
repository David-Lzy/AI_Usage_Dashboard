import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type {
  ProgressColorBand,
  ProgressDisplayStyle,
  ProgressItemsBySurface,
} from "../providers/types";
import { SAMPLE_APP_STATE } from "../shared/constants";
import { createDefaultProgressItemsBySurface } from "../shared/display-preferences";
import type { RuntimeI18n } from "../shared/i18n";
import type { ProviderViewModel } from "../sidepanel/view-models";
import { PopupProviderProgress } from "./PopupProviderProgress";

const testI18n = {
  localePreference: "en",
  resolvedLocale: "en",
  resolvedTextDirection: "ltr",
  t: (id: string) => id,
  formatNumber: (value: number) => String(value),
  formatPercentValue: (value: number) => `${value}%`,
  formatTemporalValue: (rawValue: string) => rawValue,
  localizeRelativeRuntimeLabel: (rawValue: string) => rawValue,
  localizeResetRuntimeLabel: (rawValue: string) => rawValue,
} as RuntimeI18n;

const zhTestI18n = {
  ...testI18n,
  localePreference: "zh-CN",
  resolvedLocale: "zh-CN",
  formatPercentValue: (value: number) => `${value}%`,
} as RuntimeI18n;

function createProvider(
  overrides: Partial<ProviderViewModel> = {},
): ProviderViewModel {
  return {
    displayTone: "warning",
    providerId: "codex-personal-page",
    providerLabel: "Codex",
    quotaUnit: "percent",
    quotaWindow: "weekly window",
    remaining: 42,
    total: 100,
    usageWindows: undefined,
    used: 58,
    ...overrides,
  } as ProviderViewModel;
}

function renderPopupProviderProgress(
  provider: ProviderViewModel,
  progressItemsBySurface: ProgressItemsBySurface = createDefaultProgressItemsBySurface(),
  progressDisplayStyle: ProgressDisplayStyle = "circle",
  progressColorBands: readonly ProgressColorBand[] =
    SAMPLE_APP_STATE.settings.progressColorBands,
) {
  return renderToStaticMarkup(
    <PopupProviderProgress
      i18n={testI18n}
      progressColorBands={progressColorBands}
      popupCircularProgressItemsPerRow={
        SAMPLE_APP_STATE.settings.popupCircularProgressItemsPerRow
      }
      progressDisplayStyle={progressDisplayStyle}
      progressItemsBySurface={progressItemsBySurface}
      progressThicknessPx={SAMPLE_APP_STATE.settings.progressThicknessPx}
      provider={provider}
    />,
  );
}

describe("PopupProviderProgress", () => {
  it("renders structured usage windows before single-value progress", () => {
    const html = renderPopupProviderProgress(
      createProvider({
          usageWindows: [
            {
              label: "Weekly usage window",
              normalizedLabel: "Weekly usage window",
              kind: "weekly",
              modelLabel: null,
              quotaUnit: "percent",
              used: 65,
              remaining: 35,
              total: 100,
              resetAt: "2026-05-13 12:30",
              resetLabel: "Weekly usage window resets at 2026-05-13 12:30",
            },
          ],
        }),
    );

    expect(html).toContain("provider-progress-item-list--circle");
    expect(html).toContain("week, reset: Wed 12:30");
    expect(html).not.toContain("Weekly usage window");
    expect(html).toContain("--usage-progress-percent:35%");
    expect(html).not.toContain("Codex weekly window percent");
  });

  it("keeps popup circular labels compact while showing reset time", () => {
    const html = renderToStaticMarkup(
      <PopupProviderProgress
        i18n={zhTestI18n}
        progressColorBands={SAMPLE_APP_STATE.settings.progressColorBands}
        popupCircularProgressItemsPerRow={
          SAMPLE_APP_STATE.settings.popupCircularProgressItemsPerRow
        }
        progressDisplayStyle="circle-soft"
        progressItemsBySurface={createDefaultProgressItemsBySurface()}
        progressThicknessPx={SAMPLE_APP_STATE.settings.progressThicknessPx}
        provider={createProvider({
          usageWindows: [
            {
              label: "5-hour usage window",
              normalizedLabel: "5-hour usage window",
              kind: "rolling_5h",
              modelLabel: null,
              quotaUnit: "percent",
              used: 23,
              remaining: 77,
              total: 100,
              resetAt: "2026-05-17 01:11",
              resetLabel: "5-hour usage window resets at 2026-05-17 01:11",
            },
          ],
        })}
      />,
    );

    expect(html).toContain("5小时，重置：01:11");
    expect(html).not.toContain("5-hour usage window");
  });

  it("keeps Claude all-model weekly labels compact in localized popup rings", () => {
    const html = renderToStaticMarkup(
      <PopupProviderProgress
        i18n={zhTestI18n}
        progressColorBands={SAMPLE_APP_STATE.settings.progressColorBands}
        popupCircularProgressItemsPerRow={
          SAMPLE_APP_STATE.settings.popupCircularProgressItemsPerRow
        }
        progressDisplayStyle="circle-soft"
        progressItemsBySurface={createDefaultProgressItemsBySurface()}
        progressThicknessPx={SAMPLE_APP_STATE.settings.progressThicknessPx}
        provider={createProvider({
          providerId: "claude-code-team-page",
          providerLabel: "Claude Team",
          usageWindows: [
            {
              label: "All models weekly limit",
              normalizedLabel: "All models weekly limit",
              kind: "weekly",
              modelLabel: null,
              quotaUnit: "percent",
              used: 3,
              remaining: 97,
              total: 100,
              resetAt: "Tue 12:30 AM",
              resetLabel: "All models weekly limit resets at Tue 12:30 AM",
            },
          ],
        })}
      />,
    );

    expect(html).toContain("周额度，重置：周二 00:30");
    expect(html).not.toContain("All models weekly limit");
  });

  it("renders single-value progress when no usage windows exist", () => {
    const html = renderToStaticMarkup(
      <PopupProviderProgress
        i18n={testI18n}
        progressColorBands={SAMPLE_APP_STATE.settings.progressColorBands}
        popupCircularProgressItemsPerRow={
          SAMPLE_APP_STATE.settings.popupCircularProgressItemsPerRow
        }
        progressDisplayStyle="line"
        progressItemsBySurface={createDefaultProgressItemsBySurface()}
        progressThicknessPx={SAMPLE_APP_STATE.settings.progressThicknessPx}
        provider={createProvider()}
      />,
    );

    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-valuenow="42"');
    expect(html).toContain('aria-label="week"');
    expect(html).toContain("--usage-progress-thickness:10px");
    expect(html).toContain("--usage-progress-color:#8A4B00");
  });

  it("renders nothing for empty percent-only providers", () => {
    const html = renderToStaticMarkup(
      <PopupProviderProgress
        i18n={testI18n}
        progressColorBands={SAMPLE_APP_STATE.settings.progressColorBands}
        popupCircularProgressItemsPerRow={
          SAMPLE_APP_STATE.settings.popupCircularProgressItemsPerRow
        }
        progressDisplayStyle="line"
        progressItemsBySurface={createDefaultProgressItemsBySurface()}
        progressThicknessPx={SAMPLE_APP_STATE.settings.progressThicknessPx}
        provider={createProvider({
          remaining: null,
          total: 100,
          used: null,
        })}
      />,
    );

    expect(html).toBe("");
  });

  it("honors hidden popup progress item preferences", () => {
    const html = renderPopupProviderProgress(createProvider(), {
      popup: {
        "codex-personal-page": [{ id: "primary", visible: false }],
      },
      sidebar: {},
      fullPage: {},
    });

    expect(html).toBe("");
  });

  it("renders the new soft circle style in popup progress", () => {
    const html = renderPopupProviderProgress(
      createProvider(),
      createDefaultProgressItemsBySurface(),
      "circle-soft",
    );

    expect(html).toContain("provider-progress-item-list--circle-soft");
    expect(html).toContain("usage-progress-ring--circle-soft");
    expect(html).toContain('aria-valuenow="42"');
  });

  it("keeps gauge rings proportional when percent source totals drift", () => {
    const html = renderPopupProviderProgress(
      createProvider({
        usageWindows: [
          {
            label: "Weekly usage window",
            normalizedLabel: "Weekly usage window",
            kind: "weekly",
            modelLabel: null,
            quotaUnit: "percent",
            used: 17,
            remaining: 83,
            total: 83,
            resetAt: "2026-05-20 07:00",
            resetLabel: "Weekly usage window resets at 2026-05-20 07:00",
          },
        ],
      }),
      createDefaultProgressItemsBySurface(),
      "circle-gauge",
    );

    expect(html).toContain("usage-progress-ring--circle-gauge");
    expect(html).toContain('aria-valuenow="83"');
    expect(html).toContain("--usage-progress-ring-fill-arc:170.22");
    expect(html).toContain('stroke-dasharray="170.22 301.59"');
  });

  it("applies the popup circular row count only to circular styles", () => {
    const circularHtml = renderToStaticMarkup(
      <PopupProviderProgress
        i18n={testI18n}
        progressColorBands={SAMPLE_APP_STATE.settings.progressColorBands}
        popupCircularProgressItemsPerRow={3}
        progressDisplayStyle="circle-soft"
        progressItemsBySurface={createDefaultProgressItemsBySurface()}
        progressThicknessPx={SAMPLE_APP_STATE.settings.progressThicknessPx}
        provider={createProvider()}
      />,
    );
    const lineHtml = renderToStaticMarkup(
      <PopupProviderProgress
        i18n={testI18n}
        progressColorBands={SAMPLE_APP_STATE.settings.progressColorBands}
        popupCircularProgressItemsPerRow={3}
        progressDisplayStyle="line"
        progressItemsBySurface={createDefaultProgressItemsBySurface()}
        progressThicknessPx={SAMPLE_APP_STATE.settings.progressThicknessPx}
        provider={createProvider()}
      />,
    );

    expect(circularHtml).toContain('data-popup-circular-items-per-row="3"');
    expect(circularHtml).toContain("--popup-circular-items-per-row:3");
    expect(lineHtml).not.toContain("data-popup-circular-items-per-row");
    expect(lineHtml).not.toContain("--popup-circular-items-per-row");
  });
});
