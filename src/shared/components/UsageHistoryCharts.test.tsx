import { readFileSync } from "node:fs";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { ProviderUsageHistory } from "../../providers/types";
import { UsageHistoryCompact, UsageHistoryDetail, type UsageHistoryChartCopy } from "./UsageHistoryCharts";

const chartsCss = readFileSync(
  new URL("./usage-history-charts.css", import.meta.url),
  "utf8",
);

const copy: UsageHistoryChartCopy = {
  locale: "en",
  personalUsage: "Personal usage",
  turns: "Turns",
  byModel: "By model",
  bySurface: "By surface",
  sevenDays: "7 days",
  oneMonth: "1 month",
  other: "Other",
  noData: "No history data",
  collapse: "Collapse",
  expand: "Expand",
  capturedAt: "Captured",
  totalTurns: "Total turns",
  percentUnit: "%",
  turnsUnit: "turns",
  surfaceLabels: { desktop: "Desktop" },
  chartLegend: "Chart legend",
  dateRange: "Date range",
  grouping: "Grouping",
  settingsSectionLabel: "Usage history",
  settingsTitle: "Show history modules by surface",
  settingsDetail: "History modules can be hidden per surface.",
};

const history: ProviderUsageHistory = {
  capturedAt: "2026-07-13T00:00:00.000Z",
  rangeStart: "2026-07-12",
  rangeEnd: "2026-07-13",
  granularity: "day",
  personalUsageBySurface: { unit: "percent", points: [
    { date: "2026-07-12", values: [{ id: "desktop", label: "Desktop", value: 59.599564941441386 }] },
    { date: "2026-07-13", values: [{ id: "desktop", label: "Desktop", value: 50 }] },
  ] },
  turns: { total: 12, byModel: [
    { date: "2026-07-12", values: [{ id: "gpt", label: "GPT", value: 5 }] },
    { date: "2026-07-13", values: [{ id: "gpt", label: "GPT", value: 7 }] },
  ], bySurface: [] },
};

const tenDayHistory: ProviderUsageHistory = {
  ...history,
  rangeStart: "2026-07-01",
  rangeEnd: "2026-07-10",
  personalUsageBySurface: {
    unit: "percent",
    points: Array.from({ length: 10 }, (_, index) => ({
      date: `2026-07-${String(index + 1).padStart(2, "0")}`,
      values: [{ id: "desktop", label: "Desktop", value: index + 1 }],
    })),
  },
  turns: {
    total: 55,
    byModel: Array.from({ length: 10 }, (_, index) => ({
      date: `2026-07-${String(index + 1).padStart(2, "0")}`,
      values: [{ id: "gpt", label: "GPT", value: index + 1 }],
    })),
    bySurface: [],
  },
};

describe("UsageHistoryCharts", () => {
  it("renders compact localized dates, rounded values, and a disclosure toggle", () => {
    const html = renderToStaticMarkup(
      <UsageHistoryCompact
        history={history}
        moduleId="personal_usage_by_surface"
        copy={copy}
      />,
    );

    expect(html).toContain("Jul 12 – Jul 13");
    expect(html).toContain("59.6%");
    expect(html).not.toContain("59.599564941441386");
    expect(html).not.toContain("2026-07-12");
    expect(html).toContain('aria-label="Collapse: Personal usage"');
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain("usage-history-compact__collapse-toggle");
    expect(html).toContain("usage-history-compact__heading");
    expect(html).toContain('data-usage-history-range-days="31"');
    expect(html).toContain("1 month");
    expect(html).toContain("tabindex=\"0\"");
  });

  it("renders an explicit seven-day range when controlled by a surface", () => {
    const html = renderToStaticMarkup(
      <UsageHistoryCompact
        history={tenDayHistory}
        moduleId="turns_history"
        copy={copy}
        rangeDays={7}
      />,
    );

    expect(html).toContain('data-usage-history-range-days="7"');
    expect(html).toContain("7 days");
    expect(html).toContain("Jul 4 – Jul 10");
    expect(html).toContain("Total turns: 49");
    expect(html).not.toContain("Jul 1 – Jul 10");
  });

  it("keeps total turns in the compact turns module", () => {
    const html = renderToStaticMarkup(
      <UsageHistoryCompact
        history={history}
        moduleId="turns_history"
        copy={copy}
      />,
    );

    expect(html).toContain("Total turns: 12");
    expect(html).toContain("usage-history-chart-frame__metric");
    expect(html.indexOf("Total turns: 12")).toBeLessThan(
      html.indexOf("usage-history-chart--area"),
    );
  });

  it("can start a compact module collapsed for a persisted surface preference", () => {
    const html = renderToStaticMarkup(
      <UsageHistoryCompact
        history={history}
        moduleId="personal_usage_by_surface"
        copy={copy}
        defaultExpanded={false}
      />,
    );

    expect(html).toContain("usage-history-compact--collapsed");
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('aria-label="Expand: Personal usage"');
    expect(html).toContain("hidden");
    expect(html).not.toContain("usage-history-range-toggle");
  });

  it("renders detail controls and both chart modules", () => {
    const html = renderToStaticMarkup(<UsageHistoryDetail history={history} copy={copy} />);
    expect(html).toContain("7 days");
    expect(html).toContain("1 month");
    expect(html).toContain("By model");
    expect(html).toContain("Personal usage");
  });

  it("renders detail modules in the configured order", () => {
    const html = renderToStaticMarkup(
      <UsageHistoryDetail
        history={history}
        copy={copy}
        moduleOrder={["turns_history", "personal_usage_by_surface"]}
      />,
    );

    expect(html.indexOf('section-title">Turns<')).toBeLessThan(
      html.indexOf('section-title">Personal usage<'),
    );
  });

  it("uses theme-aware chart colors and keeps the disclosure at inline end", () => {
    expect(chartsCss).toContain("--app-usage-history-series-1");
    expect(chartsCss).toContain(':root[data-theme-resolved="dark"]');
    expect(chartsCss).toContain(".usage-history-compact__header {");
    expect(chartsCss).toContain(
      ".icon-button.usage-history-compact__collapse-toggle {",
    );
    expect(chartsCss).toContain("width: 56px;");
    expect(chartsCss).toContain("height: 18px;");
    expect(chartsCss).toContain(".usage-history-compact--collapsed {");
    expect(chartsCss).toContain(
      ".usage-history-chart--compact .usage-history-chart__grid {",
    );
    expect(chartsCss).toContain("margin-inline-start: auto;");
    expect(chartsCss).toContain("justify-content: space-between;");
    expect(chartsCss).toContain("white-space: nowrap;");
    expect(chartsCss).toContain(".usage-history-range-toggle {");
    expect(chartsCss).toContain(".usage-history-range-toggle__dates {");
    expect(chartsCss).toContain("usage-history-chart-frame__metric");
    expect(chartsCss).toContain("height: 70px;");
    expect(chartsCss).toContain(".usage-history-chart__bar {");
    expect(chartsCss).toContain("--app-usage-history-bar-opacity");
    expect(chartsCss).toContain("--app-usage-history-area-fill-opacity");
    expect(chartsCss).toContain("fill-opacity: var(--app-usage-history-area-fill-opacity);");
    expect(chartsCss).toContain("stroke-opacity: var(--app-usage-history-area-stroke-opacity);");
  });
});
