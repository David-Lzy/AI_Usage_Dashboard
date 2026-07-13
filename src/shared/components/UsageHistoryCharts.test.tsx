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
  personalUsage: "Personal usage",
  turns: "Turns",
  byModel: "By model",
  bySurface: "By surface",
  sevenDays: "7 days",
  oneMonth: "1 month",
  other: "Other",
  noData: "No history data",
  hide: "Hide",
  openDetails: "Details",
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
    { date: "2026-07-12", values: [{ id: "desktop", label: "Desktop", value: 40 }] },
    { date: "2026-07-13", values: [{ id: "desktop", label: "Desktop", value: 50 }] },
  ] },
  turns: { total: 12, byModel: [
    { date: "2026-07-12", values: [{ id: "gpt", label: "GPT", value: 5 }] },
    { date: "2026-07-13", values: [{ id: "gpt", label: "GPT", value: 7 }] },
  ], bySurface: [] },
};

describe("UsageHistoryCharts", () => {
  it("renders compact accessible data points and actions", () => {
    const html = renderToStaticMarkup(<UsageHistoryCompact history={history} moduleId="turns_history" copy={copy} onHide={() => undefined} onOpenDetails={() => undefined} />);
    expect(html).toContain("Total turns: 12");
    expect(html).toContain("tabindex=\"0\"");
    expect(html).toContain("Details");
    expect(html).toContain("Hide");
  });

  it("renders detail controls and both chart modules", () => {
    const html = renderToStaticMarkup(<UsageHistoryDetail history={history} copy={copy} />);
    expect(html).toContain("7 days");
    expect(html).toContain("1 month");
    expect(html).toContain("By model");
    expect(html).toContain("Personal usage");
  });

  it("keeps compact actions at the inline end on narrow surfaces", () => {
    expect(chartsCss).toContain(".usage-history-compact__header {");
    expect(chartsCss).toContain("flex-wrap: wrap;");
    expect(chartsCss).toContain(".usage-history-compact__actions {");
    expect(chartsCss).toContain("margin-inline-start: auto;");
    expect(chartsCss).not.toContain(
      ".usage-history-compact__header,\n  .usage-history-detail__toolbar",
    );
  });
});
