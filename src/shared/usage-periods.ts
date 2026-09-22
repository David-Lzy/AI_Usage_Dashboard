import type { UsageExportResult, UsageExportRow } from "./usage-export";
import { normalizeUsageTimezone, usageDateInTimezone, type UsageDateRange } from "./usage-aggregates";

export type UsagePeriodPreset = "this_week" | "this_month" | "last_7_days" | "last_30_days" | "custom";
export type UsagePeriodSummaryItem = {
  metric: string; series: string; unit: string; currency: string;
  value: number | null; kind: "observed_total" | "latest_observation";
  observedDays: number; selectedDays: number; complete: boolean;
  firstDate: string | null; lastDate: string | null; ambiguous: boolean;
};
const DAY_MS = 86_400_000;

export function getUsagePeriodReferenceTimezone(value?: string | null): string {
  return normalizeUsageTimezone(value) ?? "UTC";
}

export function getUsagePeriodRange(
  preset: Exclude<UsagePeriodPreset, "custom">,
  now = new Date(),
  sourceTimezone?: string | null,
): UsageDateRange {
  const end = usageDateInTimezone(now, getUsagePeriodReferenceTimezone(sourceTimezone));
  const day = new Date(`${end}T00:00:00Z`);
  if (preset === "this_month") return { start: `${end.slice(0, 8)}01`, end };
  // Calculate calendar labels in UTC after resolving the source day, not elapsed DST hours.
  const daysBack = preset === "this_week" ? (day.getUTCDay() + 6) % 7 : preset === "last_7_days" ? 6 : 29;
  return { start: new Date(day.getTime() - daysBack * DAY_MS).toISOString().slice(0, 10), end };
}

function isPresent(value: number | null): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

export function buildUsagePeriodSummary(result: UsageExportResult): UsagePeriodSummaryItem[] {
  if (result.status !== "ready") return [];
  const groups = new Map<string, UsageExportRow[]>();
  for (const row of result.rows) {
    const key = JSON.stringify([row.metric, row.series, row.unit, row.currency]);
    const group = groups.get(key);
    if (group) group.push(row); else groups.set(key, [row]);
  }
  return [...groups.values()].map((rows) => {
    rows.sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
    const first = rows[0]!, last = rows.at(-1)!;
    const dates = new Set(rows.map((row) => row.date));
    // CSV intentionally omits internal series IDs; duplicate date/label groups are ambiguous.
    const ambiguous = dates.size !== rows.length;
    const present = rows.filter((row) => isPresent(row.value));
    const observedDays = new Set(present.map((row) => row.date)).size;
    const percent = first.unit === "percent";
    const sum = present.reduce((total, row) => total + row.value!, 0);
    const candidate = percent ? last.value : present.length ? sum : null;
    const representable = candidate !== null && isPresent(candidate)
      && ((percent || first.unit === "currency") ? Number.isFinite(candidate) : Number.isSafeInteger(candidate));
    const value = !ambiguous && representable ? candidate : null;
    return {
      metric: first.metric, series: first.series, unit: first.unit, currency: first.currency,
      value, kind: percent ? "latest_observation" : "observed_total",
      observedDays, selectedDays: result.coverage.selectedDays,
      complete: !ambiguous && value !== null && observedDays === result.coverage.selectedDays,
      firstDate: first.date, lastDate: last.date, ambiguous,
    };
  });
}
