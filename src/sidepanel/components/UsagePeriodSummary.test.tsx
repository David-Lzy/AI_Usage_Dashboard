import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createRuntimeI18n } from "../../shared/i18n";
import type { UsageExportResult } from "../../shared/usage-export";
import { UsagePeriodSummary } from "./UsagePeriodSummary";

const RESULT: UsageExportResult = { status: "ready", rows: [{ schema_version: 1, provider: "sub2api-api-key", account: "account-1", account_label: "Local", family: "gateway_daily", date: "2026-09-20", series: "", metric: "requests", value: 0, unit: "requests", currency: "", range_start: "2026-09-20", range_end: "2026-09-20", coverage_start: "2026-09-20", coverage_end: "2026-09-20", observed_days: 1, selected_days: 1, source_timezone: "UTC", requested_timezone: "UTC", captured_at: "2026-09-20T00:00:00Z", freshness: "fresh" }], coverage: { start: "2026-09-20", end: "2026-09-20", observedDays: 1, selectedDays: 1 }, capturedAt: "2026-09-20T00:00:00Z", freshness: "fresh", sourceTimezone: "UTC", requestedTimezone: "UTC", csv: "", filename: "" };

describe("UsagePeriodSummary", () => {
  it("renders a localized read-only observed summary", () => {
    const html = renderToStaticMarkup(<UsagePeriodSummary i18n={createRuntimeI18n("en")} result={RESULT} />);
    expect(html).toContain('data-usage-period-summary=""');
    expect(html).toContain('data-usage-period-summary-item="requests"');
    expect(html).toContain('data-summary-value="0"');
    expect(html).toContain('data-summary-kind="observed_total"');
    expect(html).toContain('data-summary-date="2026-09-20"');
    expect(html).toContain("Observed total");
    expect(html).toContain(">0<");
  });
});
