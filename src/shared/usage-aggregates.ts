import type { ApiGatewayMeteringSnapshot, ProviderId } from "../providers/types";
import { normalizeApiGatewayMeteringSnapshot } from "./api-gateway-metering";
import { getProviderAccountRuntime, type ProviderAccountRuntimeState } from "./provider-accounts";
import { normalizeSnapshotTimestamp } from "./snapshot-freshness";

export type UsageDateRange = { start: string; end: string };
export type UsageFreshness = "fresh" | "stale" | "unknown";
export type UsageCoverage = { start: string | null; end: string | null; observedDays: number; selectedDays: number };
export const GATEWAY_AGGREGATE_METRICS = [
  "requests", "inputTokens", "outputTokens", "cacheCreationTokens", "cacheReadTokens", "totalTokens", "actualCost", "referenceCost",
] as const;
export type GatewayAggregateMetric = typeof GATEWAY_AGGREGATE_METRICS[number];
export type ComparisonReason = "one_account" | "missing" | "partial" | "time_basis" | "stale" | "currency" | "scope" | "open_day" | "range";
export type UsageAggregateCell = { value: number | null; unit: string; currency: string | null; complete: boolean };
export type GatewayComparisonRow = {
  accountId: string;
  label: string;
  active: boolean;
  connected: boolean;
  syncStatus: string;
  capturedAt: string | null;
  freshness: UsageFreshness;
  timezone: string | null;
  requestedTimezone: string | null;
  coverage: UsageCoverage;
  metrics: Record<GatewayAggregateMetric, UsageAggregateCell>;
};
export type UsageSourceState = ProviderAccountRuntimeState;
export const USAGE_AGGREGATE_MAX_AGE_MS = 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const GATEWAY_ID = "sub2api-api-key" as const;

export function isUsageDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value;
}

export function usageRangeDayCount(range: UsageDateRange): number {
  if (!isUsageDate(range.start) || !isUsageDate(range.end) || range.end < range.start) return 0;
  const count = (Date.parse(`${range.end}T00:00:00Z`) - Date.parse(`${range.start}T00:00:00Z`)) / DAY_MS + 1;
  return count <= 366 ? count : 0;
}

export function normalizeUsageTimezone(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 80) return null;
  try { return new Intl.DateTimeFormat("en", { timeZone: value }).resolvedOptions().timeZone; }
  catch { return null; }
}

export function usageDateInTimezone(now: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  return ["year", "month", "day"].map((type) => parts.find((part) => part.type === type)!.value).join("-");
}

export function aggregateFreshness(capturedAt: string | null, stale: boolean, now: Date): UsageFreshness {
  const capture = normalizeSnapshotTimestamp(capturedAt);
  if (!capture || Date.parse(capture) > now.getTime()) return "unknown";
  return stale || now.getTime() - Date.parse(capture) > USAGE_AGGREGATE_MAX_AGE_MS ? "stale" : "fresh";
}

export function getSavedUsageAccounts(state: UsageSourceState, providerId: ProviderId) {
  const collection = state.providerAccounts?.[providerId];
  const ids = collection?.accounts.map((account) => account.id) ?? ["default"];
  return [...new Set(ids)].flatMap((id) => {
    const runtime = getProviderAccountRuntime(state, providerId, id);
    return runtime ? [runtime] : [];
  });
}

export function getAccountGatewayMetering(account: ReturnType<typeof getSavedUsageAccounts>[number]): ApiGatewayMeteringSnapshot | undefined {
  const metering = normalizeApiGatewayMeteringSnapshot(account.snapshot.apiGatewayMetering);
  if (metering?.accountId !== account.metadata.id) return undefined;
  const connection = account.metadata.apiGatewayConnection;
  if (connection && metering.origin !== connection.baseUrl) return undefined;
  return metering;
}

export function getDefaultGatewayRange(state: UsageSourceState): UsageDateRange {
  const dates = getSavedUsageAccounts(state, GATEWAY_ID).flatMap((account) =>
    getAccountGatewayMetering(account)?.dailyUsage.map((entry) => entry.date) ?? []).sort();
  const end = dates.at(-1) ?? new Date().toISOString().slice(0, 10);
  const earliest = new Date(Date.parse(`${end}T00:00:00Z`) - 30 * DAY_MS).toISOString().slice(0, 10);
  return { start: dates[0] && dates[0] > earliest ? dates[0] : earliest, end };
}

function metricCell(metering: ApiGatewayMeteringSnapshot | undefined, range: UsageDateRange, key: GatewayAggregateMetric): UsageAggregateCell {
  const days = usageRangeDayCount(range);
  const entries = days ? metering?.dailyUsage.filter((entry) => entry.date >= range.start && entry.date <= range.end) ?? [] : [];
  const money = key === "actualCost" || key === "referenceCost";
  const values = entries.map((entry) => entry.totals[key]);
  const present = values.flatMap((value) => {
    const amount = typeof value === "number" ? value : value?.amount;
    return typeof amount === "number" && Number.isFinite(amount) && amount >= 0 ? [amount] : [];
  });
  const currencies = new Set(values.flatMap((value) => typeof value === "object" && value ? [value.unit] : []));
  const mixed = money && currencies.size > 1;
  const sum = present.reduce((total, value) => total + value, 0);
  const representable = Number.isFinite(sum) && (money || Number.isSafeInteger(sum));
  return {
    value: present.length && !mixed && representable ? sum : null,
    unit: money ? "currency" : key === "requests" ? "requests" : "tokens",
    currency: money && currencies.size === 1 ? [...currencies][0]! : null,
    complete: days > 0 && entries.length === days && present.length === days && !mixed && representable,
  };
}

export function buildGatewayComparison(state: UsageSourceState, range: UsageDateRange, now = new Date()) {
  const selectedDays = usageRangeDayCount(range);
  const accounts = getSavedUsageAccounts(state, GATEWAY_ID);
  const meterings = accounts.map(getAccountGatewayMetering);
  const rows: GatewayComparisonRow[] = accounts.map((account, index) => {
    const metering = meterings[index];
    const capturedAt = normalizeSnapshotTimestamp(metering?.dailyUsageContext?.capturedAt);
    const dates = selectedDays ? metering?.dailyUsage.filter((entry) => entry.date >= range.start && entry.date <= range.end).map((entry) => entry.date) ?? [] : [];
    const failed = account.snapshot.syncStatus === "error" || account.setting.status !== "granted";
    return {
      accountId: account.metadata.id, label: account.metadata.label, active: account.active,
      connected: Boolean(account.metadata.apiGatewayConnection), syncStatus: account.snapshot.syncStatus,
      capturedAt, freshness: aggregateFreshness(capturedAt, failed || metering?.stale === true || metering?.isValid === false, now),
      timezone: normalizeUsageTimezone(metering?.dailyUsageContext?.bucketTimezone),
      requestedTimezone: normalizeUsageTimezone(metering?.dailyUsageContext?.requestedTimezone),
      coverage: { start: dates[0] ?? null, end: dates.at(-1) ?? null, observedDays: dates.length, selectedDays },
      metrics: Object.fromEntries(GATEWAY_AGGREGATE_METRICS.map((key) => [key, metricCell(metering, range, key)])) as Record<GatewayAggregateMetric, UsageAggregateCell>,
    };
  });
  const metricReasons = Object.fromEntries(GATEWAY_AGGREGATE_METRICS.map((key) => {
    const reasons: ComparisonReason[] = [];
    if (!selectedDays) reasons.push("range");
    if (rows.length < 2) reasons.push("one_account");
    if (rows.some((row) => row.metrics[key].value === null)) reasons.push("missing");
    if (rows.some((row) => !row.metrics[key].complete)) reasons.push("partial");
    if (rows.some((row) => !row.timezone) || new Set(rows.map((row) => row.timezone)).size > 1) reasons.push("time_basis");
    if (rows.some((row) => row.freshness !== "fresh")) reasons.push("stale");
    if (meterings.some((metering) => metering?.scope !== "api_key")) reasons.push("scope");
    if ((key === "actualCost" || key === "referenceCost") && (rows.some((row) => !row.metrics[key].currency) || new Set(rows.map((row) => row.metrics[key].currency)).size > 1)) reasons.push("currency");
    if (rows.some((row) => row.timezone && range.end >= usageDateInTimezone(now, row.timezone))) reasons.push("open_day");
    return [key, reasons];
  })) as Record<GatewayAggregateMetric, ComparisonReason[]>;
  return { rangeValid: selectedDays > 0, rows, metricReasons };
}
