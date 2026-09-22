import Papa from "papaparse";
import type { ProviderId } from "../providers/types";
import { PROVIDER_IDS } from "../providers/provider-definitions";
import { normalizeProviderUsageHistory } from "./provider-usage-history";
import { normalizeSnapshotTimestamp } from "./snapshot-freshness";
import {
  aggregateFreshness, GATEWAY_AGGREGATE_METRICS, getAccountGatewayMetering,
  getSavedUsageAccounts, normalizeUsageTimezone, usageRangeDayCount,
  type UsageCoverage, type UsageDateRange, type UsageFreshness, type UsageSourceState,
} from "./usage-aggregates";

export const USAGE_EXPORT_FAMILIES = ["gateway_daily", "turns_by_model", "turns_by_surface", "personal_usage_by_surface"] as const;
export type UsageExportFamily = typeof USAGE_EXPORT_FAMILIES[number];
export type UsageExportScope = { providerId: ProviderId; accountId: string; family: UsageExportFamily; range: UsageDateRange };
export const USAGE_CSV_COLUMNS = [
  "schema_version", "provider", "account", "account_label", "family", "date", "series", "metric", "value", "unit", "currency",
  "range_start", "range_end", "coverage_start", "coverage_end", "observed_days", "selected_days", "source_timezone", "requested_timezone", "captured_at", "freshness",
] as const;
export type UsageExportRow = {
  schema_version: 1; provider: ProviderId; account: string; account_label: string; family: UsageExportFamily;
  date: string; series: string; metric: string; value: number | null; unit: string; currency: string;
  range_start: string; range_end: string; coverage_start: string; coverage_end: string;
  observed_days: number; selected_days: number; source_timezone: string; requested_timezone: string; captured_at: string; freshness: UsageFreshness;
};
export type UsageExportResult = {
  status: "ready" | "invalid_range" | "missing_account" | "unsupported" | "empty";
  rows: UsageExportRow[]; coverage: UsageCoverage; capturedAt: string | null; freshness: UsageFreshness;
  sourceTimezone: string | null; requestedTimezone: string | null; csv: string; filename: string;
};
type Account = ReturnType<typeof getSavedUsageAccounts>[number];
type Point = Pick<UsageExportRow, "date" | "series" | "metric" | "value" | "unit" | "currency">;
const METRIC_NAMES = { requests: "requests", inputTokens: "input_tokens", outputTokens: "output_tokens", cacheCreationTokens: "cache_creation_tokens", cacheReadTokens: "cache_read_tokens", totalTokens: "total_tokens", actualCost: "actual_cost", referenceCost: "reference_cost" } as const;

function historyFor(account: Account) {
  return normalizeProviderUsageHistory(account.snapshot.usageHistory);
}

export function listUsageExportFamilies(state: UsageSourceState, providerId: ProviderId, accountId: string): UsageExportFamily[] {
  if (!PROVIDER_IDS.includes(providerId)) return [];
  const account = getSavedUsageAccounts(state, providerId).find((entry) => entry.metadata.id === accountId);
  if (!account) return [];
  const history = historyFor(account);
  const families: UsageExportFamily[] = [];
  if (providerId === "sub2api-api-key" && getAccountGatewayMetering(account)?.dailyUsage.length) families.push("gateway_daily");
  if (history?.turns?.byModel.some((point) => point.values.length)) families.push("turns_by_model");
  if (history?.turns?.bySurface.some((point) => point.values.length)) families.push("turns_by_surface");
  if (history?.personalUsageBySurface?.points.some((point) => point.values.length)) families.push("personal_usage_by_surface");
  return families;
}

function readFamily(account: Account, family: UsageExportFamily) {
  const metering = family === "gateway_daily" ? getAccountGatewayMetering(account) : undefined;
  const history = metering ? undefined : historyFor(account);
  const percent = family === "personal_usage_by_surface";
  const rawHistory = account.snapshot.usageHistory;
  const rawModule = percent ? rawHistory?.personalUsageBySurface : rawHistory?.turns;
  const moduleCapture = rawModule?.capturedAt === undefined ? rawHistory?.capturedAt : rawModule.capturedAt;
  const capturedAt = normalizeSnapshotTimestamp(metering ? metering.dailyUsageContext?.capturedAt : moduleCapture);
  const sourceTimezone = normalizeUsageTimezone(metering?.dailyUsageContext?.bucketTimezone);
  const requestedTimezone = normalizeUsageTimezone(metering?.dailyUsageContext?.requestedTimezone);
  const points: Point[] = [];
  if (metering) {
    for (const day of metering.dailyUsage) for (const key of GATEWAY_AGGREGATE_METRICS) {
      const value = day.totals[key];
      const money = key === "actualCost" || key === "referenceCost";
      points.push({ date: day.date, series: "", metric: METRIC_NAMES[key],
        value: typeof value === "number" ? value : value?.amount ?? null,
        unit: money ? "currency" : key === "requests" ? "requests" : "tokens",
        currency: typeof value === "object" && value ? value.unit : "" });
    }
  } else {
    const historyPoints = percent ? history?.personalUsageBySurface?.points
      : family === "turns_by_model" ? history?.turns?.byModel : history?.turns?.bySurface;
    for (const day of historyPoints ?? []) for (const series of day.values) {
      const value = Number.isFinite(series.value) && (percent || Number.isSafeInteger(series.value)) ? series.value : null;
      points.push({ date: day.date, series: series.label.slice(0, 160), metric: percent ? "usage_percent" : "turns", value, unit: percent ? "percent" : "turns", currency: "" });
    }
  }
  return { points, capturedAt, sourceTimezone, requestedTimezone,
    stale: account.snapshot.syncStatus === "error" || account.setting.status !== "granted" || metering?.stale === true || metering?.isValid === false };
}

export function getUsageExportRange(state: UsageSourceState, providerId: ProviderId, accountId: string, family: UsageExportFamily): UsageDateRange {
  const account = getSavedUsageAccounts(state, providerId).find((entry) => entry.metadata.id === accountId);
  const dates = account && listUsageExportFamilies(state, providerId, accountId).includes(family)
    ? readFamily(account, family).points.map((point) => point.date).sort() : [];
  const today = new Date().toISOString().slice(0, 10);
  return { start: dates[0] ?? today, end: dates.at(-1) ?? today };
}

export function protectUsageCsvText(value: string): string {
  // Spreadsheet readers may skip invisible prefixes before interpreting formulas.
  return /^[\p{White_Space}\p{Cc}\p{Cf}]*[=+\-@]|^[\p{White_Space}\p{Cc}\p{Cf}]*[\t\r\n]/u.test(value) ? `'${value}` : value;
}

export function serializeUsageCsv(rows: readonly UsageExportRow[]): string {
  const data = rows.map((row) => USAGE_CSV_COLUMNS.map((key) => {
    const value = row[key];
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    return typeof value === "string" ? protectUsageCsvText(value) : null;
  }));
  return `\uFEFF${Papa.unparse({ fields: [...USAGE_CSV_COLUMNS], data }, { newline: "\r\n", delimiter: ",", header: true })}\r\n`;
}

export function buildUsageExport(state: UsageSourceState, scope: UsageExportScope, now = new Date()): UsageExportResult {
  const selectedDays = usageRangeDayCount(scope.range);
  const empty: UsageExportResult = { status: "empty", rows: [], coverage: { start: null, end: null, observedDays: 0, selectedDays }, capturedAt: null, freshness: "unknown", sourceTimezone: null, requestedTimezone: null, csv: "", filename: "" };
  if (!selectedDays) return { ...empty, status: "invalid_range" };
  if (!PROVIDER_IDS.includes(scope.providerId) || !USAGE_EXPORT_FAMILIES.includes(scope.family)) return { ...empty, status: "unsupported" };
  const accounts = getSavedUsageAccounts(state, scope.providerId);
  const index = accounts.findIndex((account) => account.metadata.id === scope.accountId);
  const account = accounts[index];
  if (!account) return { ...empty, status: "missing_account" };
  if (!listUsageExportFamilies(state, scope.providerId, scope.accountId).includes(scope.family)) return { ...empty, status: "unsupported" };
  const source = readFamily(account, scope.family);
  const points = source.points.filter((point) => point.date >= scope.range.start && point.date <= scope.range.end)
    .sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : a.metric < b.metric ? -1 : a.metric > b.metric ? 1 : a.series < b.series ? -1 : a.series > b.series ? 1 : 0);
  const dates = [...new Set(points.map((point) => point.date))];
  const coverage = { start: dates[0] ?? null, end: dates.at(-1) ?? null, observedDays: dates.length, selectedDays };
  const freshness = aggregateFreshness(source.capturedAt, source.stale, now);
  // Positive field allowlist: never serialize snapshots, connections, identity or raw responses.
  const rows: UsageExportRow[] = points.map((point) => ({
    schema_version: 1, provider: scope.providerId, account: `account-${index + 1}`, account_label: account.metadata.label.slice(0, 160), family: scope.family,
    date: point.date, series: point.series, metric: point.metric, value: point.value, unit: point.unit, currency: point.currency,
    range_start: scope.range.start, range_end: scope.range.end, coverage_start: coverage.start ?? "", coverage_end: coverage.end ?? "",
    observed_days: coverage.observedDays, selected_days: selectedDays, source_timezone: source.sourceTimezone ?? "unknown", requested_timezone: source.requestedTimezone ?? "",
    captured_at: source.capturedAt ?? "", freshness,
  }));
  return { status: rows.length ? "ready" : "empty", rows, coverage, capturedAt: source.capturedAt, freshness,
    sourceTimezone: source.sourceTimezone, requestedTimezone: source.requestedTimezone,
    csv: rows.length ? serializeUsageCsv(rows) : "", filename: `usage-${scope.providerId}-${scope.family}-${scope.range.start}-${scope.range.end}.csv` };
}
