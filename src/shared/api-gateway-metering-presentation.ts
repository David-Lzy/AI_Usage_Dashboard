import type {
  ApiGatewayAllowance,
  ApiGatewayMeteringSnapshot,
  ApiGatewayModelUsage,
  ApiGatewayMoney,
  ApiGatewayUsageMetric,
} from "../providers/types";
import { buildApiGatewayModelBreakdownView } from "./api-gateway-metering";
import type { ApiGatewayMeteringLocalizedCopy } from "./api-gateway-metering-localized-copy";
import type {
  ApiGatewayTrendMetric,
  ApiGatewayTrendRangeDays,
} from "./api-gateway-metering-ui-preferences";
import type { UsageHistoryChartData } from "./usage-history-chart-data";
import { formatUsageHistoryDate } from "./usage-history-date-format";

type PrimaryMetric = {
  label: string;
  value: string;
  percentUsed: number | null;
};

export function formatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    notation: Math.abs(value) >= 10_000 ? "compact" : "standard",
    maximumFractionDigits: Math.abs(value) < 1 && value !== 0 ? 4 : 2,
  }).format(value);
}

export function formatDuration(milliseconds: number, locale: string): string {
  const value = milliseconds >= 1_000 ? milliseconds / 1_000 : milliseconds;
  const unit = milliseconds >= 1_000 ? "s" : "ms";
  return `${new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
  }).format(value)} ${unit}`;
}

export function formatMoney(value: ApiGatewayMoney | null, locale: string): string | null {
  if (!value) {
    return null;
  }
  const currency = value.unit.toUpperCase();
  if (/^[A-Z]{3}$/.test(currency)) {
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: Math.abs(value.amount) < 1 && value.amount !== 0 ? 4 : 2,
      }).format(value.amount);
    } catch {
      // Preserve unknown source units rather than coercing them to a currency.
    }
  }
  return `${formatNumber(value.amount, locale)} ${value.unit}`;
}

function sameUnit(...values: Array<ApiGatewayMoney | null>): boolean {
  const present = values.filter((value): value is ApiGatewayMoney => value !== null);
  return present.length > 0 && present.every((value) => value.unit === present[0]?.unit);
}

function getAllowancePrimary(
  allowance: ApiGatewayAllowance,
  label: string,
  locale: string,
): PrimaryMetric | null {
  const remaining =
    allowance.remaining ??
    (allowance.limit && allowance.used && sameUnit(allowance.limit, allowance.used)
      ? {
          amount: Math.max(0, allowance.limit.amount - allowance.used.amount),
          unit: allowance.limit.unit,
        }
      : null);
  const value = formatMoney(remaining, locale);
  if (!value) {
    return null;
  }
  const percentUsed =
    allowance.limit &&
    allowance.used &&
    sameUnit(allowance.limit, allowance.used) &&
    allowance.limit.amount > 0
      ? Math.max(0, Math.min(100, (allowance.used.amount / allowance.limit.amount) * 100))
      : null;
  return { label, value, percentUsed };
}

export function getPrimaryMetric(
  metering: ApiGatewayMeteringSnapshot,
  copy: ApiGatewayMeteringLocalizedCopy,
  locale: string,
): PrimaryMetric {
  if (metering.billingMode === "wallet") {
    const value = formatMoney(metering.balance ?? metering.remaining, locale);
    return {
      label: copy.balance,
      value: value ?? copy.unavailable,
      percentUsed: null,
    };
  }
  if (metering.billingMode === "quota" && metering.quota) {
    return (
      getAllowancePrimary(metering.quota, copy.quotaRemaining, locale) ?? {
        label: copy.quotaRemaining,
        value: copy.unavailable,
        percentUsed: null,
      }
    );
  }
  if (metering.billingMode === "subscription" && metering.subscription) {
    const candidates: Array<{
      label: string;
      limit: ApiGatewayMoney | null;
      used: ApiGatewayMoney | null;
    }> = [
      {
        label: copy.monthlyRemaining,
        limit: metering.subscription.monthlyLimit,
        used: metering.subscription.monthlyUsage,
      },
      {
        label: copy.weeklyRemaining,
        limit: metering.subscription.weeklyLimit,
        used: metering.subscription.weeklyUsage,
      },
      {
        label: copy.dailyRemaining,
        limit: metering.subscription.dailyLimit,
        used: metering.subscription.dailyUsage,
      },
    ];
    for (const candidate of candidates) {
      if (candidate.limit) {
        const primary = getAllowancePrimary(
          { limit: candidate.limit, used: candidate.used, remaining: null },
          candidate.label,
          locale,
        );
        if (primary) {
          return primary;
        }
      }
    }
  }
  const fallback = formatMoney(metering.remaining ?? metering.balance, locale);
  return {
    label: fallback ? copy.quotaRemaining : copy.overview,
    value: fallback ?? copy.noFixedLimit,
    percentUsed: null,
  };
}

export function sumNumbers(values: Array<number | null>): number | null {
  return values.length > 0 && values.every((value) => value !== null)
    ? values.reduce<number>((sum, value) => sum + (value ?? 0), 0)
    : null;
}

export function sumMoney(values: Array<ApiGatewayMoney | null>): ApiGatewayMoney | null {
  if (values.length === 0 || values.some((value) => value === null) || !sameUnit(...values)) {
    return null;
  }
  return {
    amount: values.reduce((sum, value) => sum + (value?.amount ?? 0), 0),
    unit: values[0]!.unit,
  };
}

function metricMagnitude(metric: ApiGatewayUsageMetric): number {
  return (
    metric.totalTokens ??
    metric.actualCost?.amount ??
    metric.requests ??
    0
  );
}

export function buildCompactModels(
  models: readonly ApiGatewayModelUsage[],
): ApiGatewayModelUsage[] {
  const ranked = [...models]
    .filter((model) => metricMagnitude(model.totals) > 0)
    .sort((left, right) => metricMagnitude(right.totals) - metricMagnitude(left.totals));
  const total = ranked.reduce((sum, model) => sum + metricMagnitude(model.totals), 0);
  const eligibleCount = ranked.filter(
    (model) => total > 0 && metricMagnitude(model.totals) / total >= 0.1,
  ).length;
  const primaryCount = Math.min(3, Math.max(1, eligibleCount || Math.min(3, ranked.length)));
  return ranked.length > primaryCount
    ? buildApiGatewayModelBreakdownView(ranked, primaryCount + 1)
    : ranked;
}

export function buildLegendData(models: readonly ApiGatewayModelUsage[]): UsageHistoryChartData {
  const values = models.map((model) => metricMagnitude(model.totals));
  const total = values.reduce((sum, value) => sum + value, 0);
  return {
    dates: ["aggregate"],
    series: models.map((model, index) => ({
      id: model.id,
      label: model.label,
      values: [values[index] ?? 0],
      total: values[index] ?? 0,
    })),
    dailyTotals: [total],
    maximumDailyTotal: total,
    total,
  };
}

function getDailyMetric(
  metric: ApiGatewayUsageMetric,
  trendMetric: ApiGatewayTrendMetric,
): { value: number; unit: string } | null {
  if (trendMetric === "actual_spend") {
    return metric.actualCost
      ? { value: metric.actualCost.amount, unit: metric.actualCost.unit }
      : null;
  }
  if (trendMetric === "tokens") {
    return metric.totalTokens === null
      ? null
      : { value: metric.totalTokens, unit: "tokens" };
  }
  return metric.requests === null
    ? null
    : { value: metric.requests, unit: "requests" };
}

export function buildTrendData(
  metering: ApiGatewayMeteringSnapshot,
  rangeDays: ApiGatewayTrendRangeDays,
  metric: ApiGatewayTrendMetric,
  label: string,
): { data: UsageHistoryChartData; unit: string } | null {
  const days = metering.dailyUsage.slice(-rangeDays);
  const values = days.map((day) => getDailyMetric(day.totals, metric));
  if (days.length === 0 || values.some((value) => value === null)) {
    return null;
  }
  const unit = values[0]!.unit;
  if (values.some((value) => value?.unit !== unit)) {
    return null;
  }
  const numericValues = values.map((value) => value?.value ?? 0);
  const total = numericValues.reduce((sum, value) => sum + value, 0);
  return {
    unit,
    data: {
      dates: days.map((day) => day.date),
      series: [{ id: metric, label, values: numericValues, total }],
      dailyTotals: numericValues,
      maximumDailyTotal: Math.max(0, ...numericValues),
      total,
    },
  };
}

export function formatReset(value: string | null, locale: string): string | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat(locale, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(date)
    : null;
}

export function formatSelectedDateRange(
  days: ReadonlyArray<ApiGatewayMeteringSnapshot["dailyUsage"][number]>,
  locale: string,
): string | null {
  const first = days[0]?.date;
  if (!first) {
    return null;
  }
  const last = days.at(-1)?.date ?? first;
  const firstLabel = formatUsageHistoryDate(first, locale);
  const lastLabel = formatUsageHistoryDate(last, locale);
  return first === last ? firstLabel : `${firstLabel} – ${lastLabel}`;
}
