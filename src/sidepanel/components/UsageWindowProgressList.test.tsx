import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { RuntimeI18n } from "../../shared/i18n";
import { UsageWindowProgressList } from "./UsageWindowProgressList";

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

describe("UsageWindowProgressList", () => {
  it("renders every visible usage window as a remaining progress bar", () => {
    const html = renderToStaticMarkup(
      <UsageWindowProgressList
        i18n={testI18n}
        windows={[
          {
            label: "5 小时使用限额",
            normalizedLabel: "5-hour usage window",
            kind: "rolling_5h",
            modelLabel: null,
            quotaUnit: "percent",
            used: 27,
            remaining: 73,
            total: 100,
            resetAt: "2026-04-26 00:11",
            resetLabel: "5-hour usage window resets at 2026-04-26 00:11",
          },
          {
            label: "每周使用限额",
            normalizedLabel: "Weekly usage window",
            kind: "weekly",
            modelLabel: null,
            quotaUnit: "percent",
            used: 72,
            remaining: 28,
            total: 100,
            resetAt: "2026-04-29 04:00",
            resetLabel: "Weekly usage window resets at 2026-04-29 04:00",
          },
          {
            label: "GPT-5.3-Codex-Spark 5 小时使用限额",
            normalizedLabel: "GPT-5.3-Codex-Spark 5 小时使用限额",
            kind: "model_rolling_5h",
            modelLabel: "GPT-5.3-Codex-Spark",
            quotaUnit: "percent",
            used: 0,
            remaining: 100,
            total: 100,
            resetAt: null,
            resetLabel: null,
          },
        ]}
      />,
    );

    expect(html.match(/role="progressbar"/g)).toHaveLength(3);
    expect(html).toContain("5-hour usage window");
    expect(html).toContain("Weekly usage window");
    expect(html).toContain("GPT-5.3-Codex-Spark 5 小时使用限额");
    expect(html).toContain('aria-valuenow="73"');
    expect(html).toContain('aria-valuenow="28"');
    expect(html).toContain('aria-valuenow="100"');
    expect(html).toContain("usage-progress__track--error");
    expect(html).toContain('style="width:28%"');
    expect(html).toContain("resets 2026-04-29 04:00");
  });

  it("renders every visible usage window as circular progress when requested", () => {
    const html = renderToStaticMarkup(
      <UsageWindowProgressList
        i18n={testI18n}
        displayStyle="circle"
        density="compact"
        windows={[
          {
            label: "5 小时使用限额",
            normalizedLabel: "5-hour usage window",
            kind: "rolling_5h",
            modelLabel: null,
            quotaUnit: "percent",
            used: 63,
            remaining: 37,
            total: 100,
            resetAt: "2026-04-26 00:11",
            resetLabel: "5-hour usage window resets at 2026-04-26 00:11",
          },
          {
            label: "每周使用限额",
            normalizedLabel: "Weekly usage window",
            kind: "weekly",
            modelLabel: null,
            quotaUnit: "percent",
            used: 65,
            remaining: 35,
            total: 100,
            resetAt: "2026-04-29 04:00",
            resetLabel: "Weekly usage window resets at 2026-04-29 04:00",
          },
        ]}
      />,
    );

    expect(html.match(/role="progressbar"/g)).toHaveLength(2);
    expect(html).toContain("usage-window-progress-list--circle");
    expect(html).toContain("usage-progress--circle");
    expect(html).toContain("--usage-progress-percent:37%");
    expect(html).toContain("--usage-progress-percent:35%");
    expect(html).toContain(">37%<");
    expect(html).toContain(">35%<");
    expect(html).not.toContain(">37% remaining<");
  });
});
