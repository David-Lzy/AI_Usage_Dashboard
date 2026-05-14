import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type {
  ProgressDisplayStyle,
  ProgressItemsBySurface,
} from "../providers/types";
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

function createProvider(
  overrides: Partial<ProviderViewModel> = {},
): ProviderViewModel {
  return {
    displayTone: "warning",
    providerId: "codex",
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
) {
  return renderToStaticMarkup(
    <PopupProviderProgress
      i18n={testI18n}
      progressDisplayStyle={progressDisplayStyle}
      progressItemsBySurface={progressItemsBySurface}
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
              resetAt: "2026-05-13 04:00",
              resetLabel: "Weekly usage window resets at 2026-05-13 04:00",
            },
          ],
        }),
    );

    expect(html).toContain("provider-progress-item-list--circle");
    expect(html).toContain("Weekly usage window");
    expect(html).toContain("--usage-progress-percent:35%");
    expect(html).not.toContain("Codex weekly window percent");
  });

  it("renders single-value progress when no usage windows exist", () => {
    const html = renderToStaticMarkup(
      <PopupProviderProgress
        i18n={testI18n}
        progressDisplayStyle="line"
        progressItemsBySurface={createDefaultProgressItemsBySurface()}
        provider={createProvider()}
      />,
    );

    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-valuenow="42"');
    expect(html).toContain('aria-label="weekly window percent"');
  });

  it("renders nothing for empty percent-only providers", () => {
    const html = renderToStaticMarkup(
      <PopupProviderProgress
        i18n={testI18n}
        progressDisplayStyle="line"
        progressItemsBySurface={createDefaultProgressItemsBySurface()}
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
        codex: [{ id: "primary", visible: false }],
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
});
