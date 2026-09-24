import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type {
  ProgressColorBand,
  ProgressDisplayStyle,
  ProgressItemsBySurface,
} from "../providers/types";
import { SAMPLE_APP_STATE } from "../shared/demo-state";
import { createDefaultProgressItemsBySurface } from "../shared/display-preferences";
import type { RuntimeI18n } from "../shared/i18n";
import type { ProviderViewModel } from "../shared/provider-view-models";
import { CodexEstimateStrip } from "../shared/components/CodexEstimateStrip";
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
  it("shows priced local equivalents and distinguishes zero reset cards from unknown", () => {
    const local = createProvider({
      syncSource: "local_companion", syncStatus: "ok", lastSuccessAt: new Date().toISOString(),
      codexLocal: { availableResetCount: 0, accountVerified: true, estimates: [{ windowId: "primary", status: "ready", fullUsd: 200, fullLowerUsd: 190, fullUpperUsd: 210, currentUsd: 80, sampleCount: 3, confidence: "medium", priceDate: "2026-09-24" }] },
      usageWindows: [{ label: "Weekly limit", normalizedLabel: "Weekly limit", kind: "weekly", modelLabel: null, quotaUnit: "percent", used: 40, remaining: 60, total: 100, resetAt: "2026-09-30T10:00:00.000Z", resetLabel: null }],
    });
    const html = renderPopupProviderProgress(local);
    expect(html).toContain("codex-progress-group--single-ring");
    expect(html).toContain('data-codex-estimate-status="ready"');
    expect(html).toContain("$80.00");
    expect(html).toContain("$200.00");
    expect(html).toContain("Available reset cards");
    expect(html).toContain(">0</strong>");
    expect(renderPopupProviderProgress({ ...local, codexLocal: { ...local.codexLocal!, availableResetCount: null } })).toContain("Unknown");
  });

  it("keeps dual-window estimates below the rings and suppresses stale prices", () => {
    const local = createProvider({
      syncSource: "local_companion", syncStatus: "error", lastSuccessAt: "2026-09-20T10:00:00.000Z",
      codexLocal: { availableResetCount: 2, accountVerified: true, estimates: [{ windowId: "secondary", status: "ready", fullUsd: 100, fullLowerUsd: 90, fullUpperUsd: 110, currentUsd: 20, sampleCount: 2, confidence: "medium", priceDate: "2026-09-24" }] },
      usageWindows: [
        { label: "5-hour limit", normalizedLabel: "5-hour limit", kind: "rolling_5h", modelLabel: null, quotaUnit: "percent", used: 20, remaining: 80, total: 100, resetAt: "2026-09-24T15:00:00.000Z", resetLabel: null },
        { label: "Weekly limit", normalizedLabel: "Weekly limit", kind: "weekly", modelLabel: null, quotaUnit: "percent", used: 20, remaining: 80, total: 100, resetAt: "2026-09-30T10:00:00.000Z", resetLabel: null },
      ],
    });
    const html = renderPopupProviderProgress(local);
    expect(html).toContain('class="codex-progress-group"');
    expect(html).not.toContain("codex-progress-group--single-ring");
    expect(html).toContain("Disconnected");
    expect(html).not.toContain("$100.00");
    const stale = renderPopupProviderProgress({ ...local, syncStatus: "ok" });
    expect(stale).toContain('data-codex-estimate-status="stale"');
    expect(stale).toContain("Stale");
  });
  it("labels unknown quota windows distinctly and exposes the selected detail mode", () => {
    const window = { label: "Usage limit", normalizedLabel: "Usage limit", kind: "unknown" as const, modelLabel: null, quotaUnit: "percent" as const, used: 20, remaining: 80, total: 100, resetAt: null, resetLabel: null };
    const provider = createProvider({
      syncSource: "local_companion", syncStatus: "ok", lastSuccessAt: new Date().toISOString(),
      usageWindows: [window, { ...window }],
      codexLocal: { availableResetCount: 0, accountVerified: true, estimates: [
        { windowId: "primary", status: "ready", fullUsd: 100, fullLowerUsd: 90, fullUpperUsd: 110, currentUsd: 20, sampleCount: 1, confidence: "low", priceDate: "2026-09-24" },
        { windowId: "secondary", status: "learning", fullUsd: null, fullLowerUsd: null, fullUpperUsd: null, currentUsd: null, sampleCount: 0, confidence: null, priceDate: null },
      ] },
    });
    const html = renderToStaticMarkup(<CodexEstimateStrip provider={provider} i18n={testI18n} detail />);
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain("Window 1");
    expect(html).toContain("Window 2");
    expect(html).toContain("Confidence: Low");
  });
  it("uses the single-ring layout when one of two local windows is hidden", () => {
    const provider = createProvider({
      syncSource: "local_companion", syncStatus: "ok", lastSuccessAt: new Date().toISOString(),
      usageWindows: [
        { label: "5-hour limit", normalizedLabel: "5-hour limit", kind: "rolling_5h", modelLabel: null, quotaUnit: "percent", used: 20, remaining: 80, total: 100, resetAt: null, resetLabel: null },
        { label: "Weekly limit", normalizedLabel: "Weekly limit", kind: "weekly", modelLabel: null, quotaUnit: "percent", used: 40, remaining: 60, total: 100, resetAt: null, resetLabel: null },
      ],
      codexLocal: { availableResetCount: 0, accountVerified: true, estimates: [
        { windowId: "primary", status: "learning", fullUsd: null, fullLowerUsd: null, fullUpperUsd: null, currentUsd: null, sampleCount: 0, confidence: null, priceDate: null },
        { windowId: "secondary", status: "ready", fullUsd: 100, fullLowerUsd: 90, fullUpperUsd: 110, currentUsd: 40, sampleCount: 3, confidence: "medium", priceDate: "2026-09-24" },
      ] },
    });
    const html = renderPopupProviderProgress(provider, {
      popup: { "codex-personal-page": [{ id: "window:rolling_5h:5-hour%20limit::0", visible: false }] },
      sidebar: {}, fullPage: {},
    });
    expect(html).toContain("codex-progress-group--single-ring");
    expect(html).not.toContain("5-hour limit");
  });
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
    expect(html).toContain("provider-progress-item-list--single-circular");
    expect(html).toContain('data-single-circular-progress=""');
    expect(html).toContain(
      '<span class="usage-progress__label-name">Weekly limit</span>',
    );
    expect(html).toContain('class="usage-progress__label-reset"');
    expect(html).toContain("Resets");
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

    expect(html).toContain(
      '<span class="usage-progress__label-name">5 小时限额</span>',
    );
    expect(html).toContain("5月17日");
    expect(html).toContain("重置");
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

    expect(html).toContain(
      '<span class="usage-progress__label-name">每周限额</span>',
    );
    expect(html).toContain("重置");
    expect(html).not.toContain("All models weekly limit");
  });

  it("formats absolute ISO weekly resets in the active locale", () => {
    const resetAt = "2026-05-19T10:30:00.000Z";
    const expectedReset = new Intl.DateTimeFormat("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(resetAt));
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
              label: "Weekly usage window",
              normalizedLabel: "Weekly usage window",
              kind: "weekly",
              modelLabel: null,
              quotaUnit: "percent",
              used: 0,
              remaining: 100,
              total: 100,
              resetAt,
              resetLabel: "Resets in 36:23",
            },
          ],
        })}
      />,
    );

    expect(html).toContain("每周限额");
    expect(html).toContain(`${expectedReset} 重置`);
    expect(html).not.toContain("36:23");
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
    expect(html).toContain('aria-label="Weekly limit"');
    expect(html).toContain("--usage-progress-thickness:10px");
    expect(html).toContain("--usage-progress-color:#8A4B00");
    expect(html).not.toContain("provider-progress-item-list--single-circular");
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

  it("hides Flex credits by default and renders an explicitly enabled balance inline", () => {
    const flexItemId = "balance:flex_credit_balance:Flex%20credits:0";
    const provider = createProvider({
      usageBalances: [
        {
          label: "Flex credits",
          normalizedLabel: "Flex credits",
          kind: "flex_credit_balance",
          quotaUnit: "credits",
          remaining: 0,
          total: null,
          detail: "Optional balance",
        },
      ],
    });
    const defaultHtml = renderPopupProviderProgress(provider);
    const visibleHtml = renderPopupProviderProgress(provider, {
      popup: {
        "codex-personal-page": [
          { id: "primary", visible: true },
          { id: flexItemId, visible: true },
        ],
      },
      sidebar: {},
      fullPage: {},
    });

    expect(defaultHtml).not.toContain("Flex credits");
    expect(visibleHtml).toContain("Flex credits");
    expect(visibleHtml).toContain("0 credits remaining");
    expect(visibleHtml).toContain(
      "provider-progress-item-list__item--flex-credit",
    );
    expect(visibleHtml).toContain(
      "provider-progress-item-list__value-only--inline",
    );
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
    expect(html).toContain("--usage-progress-ring-fill-arc:150.19");
    expect(html).toContain('stroke-dasharray="140.19 301.59"');
  });

  it("keeps multiple circular items in the configured responsive grid", () => {
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
            total: 100,
            resetAt: null,
            resetLabel: null,
          },
          {
            label: "GPT-5.3-Codex-Spark",
            normalizedLabel: "GPT-5.3-Codex-Spark",
            kind: "unknown",
            modelLabel: "GPT-5.3-Codex-Spark",
            quotaUnit: "percent",
            used: 9,
            remaining: 91,
            total: 100,
            resetAt: null,
            resetLabel: null,
          },
        ],
      }),
    );

    expect(html.match(/role="progressbar"/g)).toHaveLength(2);
    expect(html).not.toContain("provider-progress-item-list--single-circular");
    expect(html).not.toContain('data-single-circular-progress=""');
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
