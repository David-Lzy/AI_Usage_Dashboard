import { Fragment, useMemo, useState, type ReactNode } from "react";

import type {
  ApiGatewayAllowance,
  ApiGatewayMeteringDisplayPreferences,
  ApiGatewayMeteringModuleId,
  ApiGatewayMeteringSnapshot,
  ApiGatewayModelUsage,
  ApiGatewayMoney,
  ApiGatewayUsageMetric,
  DisplaySurface,
  ProviderId,
} from "../../providers/types";
import {
  buildApiGatewayModelBreakdownView,
  createDefaultApiGatewayMeteringDisplayPreferences,
  normalizeApiGatewayMeteringDisplayPreferences,
} from "../api-gateway-metering";
import type { ApiGatewayMeteringLocalizedCopy } from "../api-gateway-metering-localized-copy";
import {
  readApiGatewayModuleCollapsed,
  readApiGatewayTrendMetric,
  readApiGatewayTrendRangeDays,
  writeApiGatewayModuleCollapsed,
  writeApiGatewayTrendMetric,
  writeApiGatewayTrendRangeDays,
  type ApiGatewayTrendMetric,
  type ApiGatewayTrendRangeDays,
} from "../api-gateway-metering-ui-preferences";
import type { UsageHistoryChartData } from "../usage-history-chart-data";
import { UsageHistoryLegend, UsageHistorySvg } from "./UsageHistoryCharts";
import "./api-gateway-metering-summary.css";

type ApiGatewayMeteringSummaryProps = {
  copy: ApiGatewayMeteringLocalizedCopy;
  locale: string;
  metering: ApiGatewayMeteringSnapshot;
  preferences?: ApiGatewayMeteringDisplayPreferences;
  providerId: ProviderId;
  surface: DisplaySurface;
  density?: "compact" | "detail";
};

type PrimaryMetric = {
  label: string;
  value: string;
  percentUsed: number | null;
};

const METRIC_COLORS = [
  "var(--app-usage-history-series-1)",
  "var(--app-usage-history-series-2)",
  "var(--app-usage-history-series-3)",
  "var(--app-usage-history-series-4)",
];

function formatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    notation: Math.abs(value) >= 10_000 ? "compact" : "standard",
    maximumFractionDigits: Math.abs(value) < 1 && value !== 0 ? 4 : 2,
  }).format(value);
}

function formatMoney(value: ApiGatewayMoney | null, locale: string): string | null {
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

function getPrimaryMetric(
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

function sumNumbers(values: Array<number | null>): number | null {
  return values.length > 0 && values.every((value) => value !== null)
    ? values.reduce<number>((sum, value) => sum + (value ?? 0), 0)
    : null;
}

function sumMoney(values: Array<ApiGatewayMoney | null>): ApiGatewayMoney | null {
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

function buildCompactModels(
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

function buildLegendData(models: readonly ApiGatewayModelUsage[]): UsageHistoryChartData {
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

function buildTrendData(
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

function formatReset(value: string | null, locale: string): string | null {
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

function ModuleToggle({
  copy,
  expanded,
  onToggle,
}: {
  copy: ApiGatewayMeteringLocalizedCopy;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      aria-expanded={expanded}
      aria-label={expanded ? copy.collapse : copy.expand}
      className="icon-button api-gateway-metering-module__collapse-toggle"
      title={expanded ? copy.collapse : copy.expand}
      type="button"
      onClick={onToggle}
    >
      <span className="api-gateway-metering-module__collapse-icon" aria-hidden="true" />
    </button>
  );
}

function useExpandedModule(
  providerId: ProviderId,
  accountId: ApiGatewayMeteringSnapshot["accountId"],
  surface: DisplaySurface,
  moduleId: ApiGatewayMeteringModuleId,
) {
  const [expanded, setExpanded] = useState(
    () => !readApiGatewayModuleCollapsed(providerId, accountId, surface, moduleId),
  );
  const update = (next: boolean) => {
    setExpanded(next);
    writeApiGatewayModuleCollapsed(providerId, accountId, surface, moduleId, !next);
  };
  return [expanded, update] as const;
}

function MeteringModule({
  children,
  copy,
  expanded,
  moduleId,
  onToggle,
  title,
}: {
  children: ReactNode;
  copy: ApiGatewayMeteringLocalizedCopy;
  expanded: boolean;
  moduleId: ApiGatewayMeteringModuleId;
  onToggle: () => void;
  title: string;
}) {
  return (
    <section
      className={`api-gateway-metering-module${expanded ? "" : " api-gateway-metering-module--collapsed"}`}
      data-api-gateway-metering-module={moduleId}
    >
      <header className="api-gateway-metering-module__header">
        <p>{title}</p>
        <ModuleToggle copy={copy} expanded={expanded} onToggle={onToggle} />
      </header>
      {expanded ? <div className="api-gateway-metering-module__content">{children}</div> : null}
    </section>
  );
}

export function ApiGatewayMeteringSummary({
  copy,
  locale,
  metering,
  preferences = createDefaultApiGatewayMeteringDisplayPreferences(),
  providerId,
  surface,
  density = "compact",
}: ApiGatewayMeteringSummaryProps) {
  const [summaryExpanded, setSummaryExpanded] = useExpandedModule(
    providerId,
    metering.accountId,
    surface,
    "summary",
  );
  const [trendExpanded, setTrendExpanded] = useExpandedModule(
    providerId,
    metering.accountId,
    surface,
    "trend",
  );
  const [modelsExpanded, setModelsExpanded] = useExpandedModule(
    providerId,
    metering.accountId,
    surface,
    "model_breakdown",
  );
  const [limitsExpanded, setLimitsExpanded] = useExpandedModule(
    providerId,
    metering.accountId,
    surface,
    "limit_windows",
  );
  const [rangeDays, setRangeDays] = useState<ApiGatewayTrendRangeDays>(() =>
    readApiGatewayTrendRangeDays(providerId, metering.accountId, surface),
  );
  const [trendMetric, setTrendMetric] = useState<ApiGatewayTrendMetric>(() =>
    readApiGatewayTrendMetric(providerId, metering.accountId, surface),
  );
  const normalizedPreferences = useMemo(
    () => normalizeApiGatewayMeteringDisplayPreferences(preferences)[surface],
    [preferences, surface],
  );
  const primary = useMemo(
    () => getPrimaryMetric(metering, copy, locale),
    [copy, locale, metering],
  );
  const selectedDays = metering.dailyUsage.slice(-rangeDays);
  const hasSelectedPeriod = selectedDays.length > 0;
  const selectedMetric = hasSelectedPeriod
    ? {
        actualCost: sumMoney(selectedDays.map((day) => day.totals.actualCost)),
        requests: sumNumbers(selectedDays.map((day) => day.totals.requests)),
        totalTokens: sumNumbers(selectedDays.map((day) => day.totals.totalTokens)),
      }
    : {
        actualCost: metering.usage?.total?.actualCost ?? null,
        requests: metering.usage?.total?.requests ?? null,
        totalTokens: metering.usage?.total?.totalTokens ?? null,
      };
  const availableTrendMetrics = useMemo(
    () =>
      (["actual_spend", "tokens", "requests"] as const).filter((metric) =>
        buildTrendData(metering, rangeDays, metric, "") !== null,
      ),
    [metering, rangeDays],
  );
  const effectiveTrendMetric = availableTrendMetrics.includes(trendMetric)
    ? trendMetric
    : (availableTrendMetrics[0] ?? trendMetric);
  const metricLabels: Record<ApiGatewayTrendMetric, string> = {
    actual_spend: copy.actualSpend,
    tokens: copy.tokens,
    requests: copy.requests,
  };
  const trend = useMemo(
    () =>
      buildTrendData(
        metering,
        rangeDays,
        effectiveTrendMetric,
        metricLabels[effectiveTrendMetric],
      ),
    [effectiveTrendMetric, metering, rangeDays],
  );
  const compactModels = useMemo(
    () =>
      buildCompactModels(metering.modelUsage).map((model) =>
        model.id === "other" ? { ...model, label: copy.other } : model,
      ),
    [copy.other, metering.modelUsage],
  );
  const modelLegendData = useMemo(
    () => buildLegendData(compactModels),
    [compactModels],
  );
  const scopeLabel =
    metering.scope === "api_key" ? copy.apiKeyScope : copy.accountScope;
  const dataStateLabel = metering.stale ? copy.savedData : copy.currentData;

  const setRange = (nextRange: ApiGatewayTrendRangeDays) => {
    setRangeDays(nextRange);
    writeApiGatewayTrendRangeDays(providerId, metering.accountId, surface, nextRange);
  };
  const setMetric = (nextMetric: ApiGatewayTrendMetric) => {
    setTrendMetric(nextMetric);
    writeApiGatewayTrendMetric(providerId, metering.accountId, surface, nextMetric);
  };

  const modules: Record<ApiGatewayMeteringModuleId, ReactNode> = {
    summary: (
      <MeteringModule
        copy={copy}
        expanded={summaryExpanded}
        moduleId="summary"
        onToggle={() => setSummaryExpanded(!summaryExpanded)}
        title={copy.overview}
      >
        <div className="api-gateway-metering-primary">
          <div>
            <span>{primary.label}</span>
            <strong>{primary.value}</strong>
          </div>
          <span className="api-gateway-metering-primary__scope">{scopeLabel} · {dataStateLabel}</span>
        </div>
        {primary.percentUsed !== null ? (
          <div
            aria-label={`${primary.label}: ${formatNumber(primary.percentUsed, locale)}%`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={primary.percentUsed}
            className="api-gateway-metering-progress"
            role="progressbar"
          >
            <span style={{ width: `${primary.percentUsed}%` }} />
          </div>
        ) : null}
        <dl className="api-gateway-metering-facts">
          <div>
            <dt>{copy.actualSpend}</dt>
            <dd>{formatMoney(selectedMetric.actualCost, locale) ?? copy.unavailable}</dd>
          </div>
          <div>
            <dt>{copy.requests}</dt>
            <dd>{selectedMetric.requests === null ? copy.unavailable : formatNumber(selectedMetric.requests, locale)}</dd>
          </div>
          <div>
            <dt>{copy.tokens}</dt>
            <dd>{selectedMetric.totalTokens === null ? copy.unavailable : formatNumber(selectedMetric.totalTokens, locale)}</dd>
          </div>
        </dl>
        <p className="api-gateway-metering-period-label">
          {hasSelectedPeriod ? (rangeDays === 7 ? copy.sevenDays : copy.thirtyDays) : copy.recorded}
        </p>
      </MeteringModule>
    ),
    trend: trend ? (
      <MeteringModule
        copy={copy}
        expanded={trendExpanded}
        moduleId="trend"
        onToggle={() => setTrendExpanded(!trendExpanded)}
        title={copy.trend}
      >
        <div className="api-gateway-metering-controls">
          <div className="api-gateway-metering-segmented" aria-label={copy.trend}>
            {availableTrendMetrics.map((metric) => (
              <button
                aria-pressed={effectiveTrendMetric === metric}
                key={metric}
                type="button"
                onClick={() => setMetric(metric)}
              >
                {metricLabels[metric]}
              </button>
            ))}
          </div>
          <button
            className="api-gateway-metering-range"
            type="button"
            onClick={() => setRange(rangeDays === 7 ? 30 : 7)}
          >
            {rangeDays === 7 ? copy.sevenDays : copy.thirtyDays}
          </button>
        </div>
        <UsageHistorySvg
          compact={density === "compact"}
          data={trend.data}
          kind="area"
          label={`${copy.trend}: ${metricLabels[effectiveTrendMetric]}`}
          locale={locale}
          unit={trend.unit}
        />
      </MeteringModule>
    ) : null,
    model_breakdown: compactModels.length > 0 ? (
      <MeteringModule
        copy={copy}
        expanded={modelsExpanded}
        moduleId="model_breakdown"
        onToggle={() => setModelsExpanded(!modelsExpanded)}
        title={copy.models}
      >
        <div className="api-gateway-metering-model-bar" aria-hidden="true">
          {compactModels.map((model, index) => (
            <span
              key={model.id}
              style={{
                background: METRIC_COLORS[index % METRIC_COLORS.length],
                width: `${modelLegendData.total > 0 ? (metricMagnitude(model.totals) / modelLegendData.total) * 100 : 0}%`,
              }}
            />
          ))}
        </div>
        <UsageHistoryLegend data={modelLegendData} label={copy.chartLegend} />
      </MeteringModule>
    ) : null,
    limit_windows: metering.rateLimits.length > 0 ? (
      <MeteringModule
        copy={copy}
        expanded={limitsExpanded}
        moduleId="limit_windows"
        onToggle={() => setLimitsExpanded(!limitsExpanded)}
        title={copy.limits}
      >
        <ul className="api-gateway-metering-limits">
          {metering.rateLimits.slice(0, 3).map((limit) => (
            <li key={limit.id}>
              <span>{limit.id}</span>
              <strong>{formatMoney(limit.remaining, locale) ?? copy.unavailable}</strong>
              {formatReset(limit.resetAt, locale) ? (
                <small>{copy.reset} {formatReset(limit.resetAt, locale)}</small>
              ) : null}
            </li>
          ))}
        </ul>
      </MeteringModule>
    ) : null,
  };

  return (
    <div
      className={`api-gateway-metering-summary api-gateway-metering-summary--${surface} api-gateway-metering-summary--${density}`}
      data-api-gateway-metering-scope={metering.scope}
      data-api-gateway-metering-stale={metering.stale ? "true" : "false"}
    >
      {normalizedPreferences.map((preference) =>
        preference.visible ? (
          <Fragment key={preference.id}>{modules[preference.id]}</Fragment>
        ) : null,
      )}
    </div>
  );
}
