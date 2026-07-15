import { useMemo, useState } from "react";

import type {
  CursorUsageBilling,
  CursorUsageBreakdown,
  CursorUsageDailyAggregate,
  CursorUsageMetric,
  DisplaySurface,
  ProviderId,
} from "../../providers/types";
import {
  readCursorUsageCollapsePreference,
  writeCursorUsageCollapsePreference,
  type CursorUsageUiModuleId,
} from "../cursor-usage-ui-preferences";
import type { CursorUsageLocalizedCopy } from "../cursor-usage-localized-copy";
import "./cursor-usage-summary.css";

type CursorUsageRangeDays = 7 | 30;

type CursorUsageSummaryProps = {
  copy: CursorUsageLocalizedCopy;
  locale: string;
  providerId: ProviderId;
  surface: DisplaySurface;
  usage: CursorUsageBilling;
};

type AggregateBreakdown = {
  id: string;
  label: string;
  value: number;
};

const METRIC_COLORS = [
  "var(--app-usage-history-series-1)",
  "var(--app-usage-history-series-2)",
  "var(--app-usage-history-series-3)",
  "var(--app-usage-history-series-4)",
];

function formatDate(value: string | null, locale: string): string | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return null;
  }
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatCurrency(cents: number | null, locale: string): string | null {
  if (cents === null || !Number.isFinite(cents)) {
    return null;
  }
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function clampPercent(value: number | null): number | null {
  return value === null || !Number.isFinite(value)
    ? null
    : Math.max(0, Math.min(100, value));
}

function metricValue(metric: CursorUsageMetric): number {
  if (metric.apiValueCents !== null) {
    return metric.apiValueCents;
  }
  const tokens =
    (metric.inputTokens ?? 0) +
    (metric.outputTokens ?? 0) +
    (metric.cacheReadTokens ?? 0);
  return tokens > 0 ? tokens : metric.requests;
}

function aggregateBreakdowns(
  days: readonly CursorUsageDailyAggregate[],
  getBreakdowns: (day: CursorUsageDailyAggregate) => readonly CursorUsageBreakdown[],
): AggregateBreakdown[] {
  const aggregate = new Map<string, AggregateBreakdown>();
  for (const day of days) {
    for (const breakdown of getBreakdowns(day)) {
      const current = aggregate.get(breakdown.id);
      const value = metricValue(breakdown);
      aggregate.set(breakdown.id, {
        id: breakdown.id,
        label: breakdown.label,
        value: (current?.value ?? 0) + value,
      });
    }
  }
  return [...aggregate.values()]
    .filter((entry) => entry.value > 0)
    .sort((left, right) => right.value - left.value)
    .slice(0, 4);
}

function CursorCollapseToggle({
  copy,
  expanded,
  onToggle,
}: {
  copy: CursorUsageLocalizedCopy;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      aria-expanded={expanded}
      aria-label={expanded ? copy.collapse : copy.expand}
      className="icon-button cursor-usage-module__collapse-toggle"
      title={expanded ? copy.collapse : copy.expand}
      type="button"
      onClick={onToggle}
    >
      <span className="cursor-usage-module__collapse-icon" aria-hidden="true" />
    </button>
  );
}

function usePersistedExpandedState(
  providerId: ProviderId,
  surface: DisplaySurface,
  moduleId: CursorUsageUiModuleId,
) {
  const [expanded, setExpanded] = useState(
    () => !readCursorUsageCollapsePreference(providerId, surface, moduleId),
  );
  const updateExpanded = (nextExpanded: boolean) => {
    setExpanded(nextExpanded);
    writeCursorUsageCollapsePreference(
      providerId,
      surface,
      moduleId,
      !nextExpanded,
    );
  };
  return [expanded, updateExpanded] as const;
}

function CursorProgressRow({
  label,
  percent,
  valueLabel,
}: {
  label: string;
  percent: number | null;
  valueLabel: string;
}) {
  return (
    <div className="cursor-usage-progress-row">
      <div className="cursor-usage-progress-row__labels">
        <span>{label}</span>
        <span>{valueLabel}</span>
      </div>
      {percent !== null ? (
        <div
          aria-label={`${label}: ${valueLabel}`}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={percent}
          className="cursor-usage-progress-row__track"
          role="progressbar"
        >
          <span style={{ width: `${percent}%` }} />
        </div>
      ) : null}
    </div>
  );
}

function CursorBreakdownLegend({
  entries,
  label,
  locale,
}: {
  entries: readonly AggregateBreakdown[];
  label: string;
  locale: string;
}) {
  const total = entries.reduce((sum, entry) => sum + entry.value, 0);
  if (total <= 0) {
    return null;
  }
  return (
    <div className="cursor-usage-breakdown" aria-label={label}>
      <div className="cursor-usage-breakdown__bar" aria-hidden="true">
        {entries.map((entry, index) => (
          <span
            key={entry.id}
            style={{
              background: METRIC_COLORS[index % METRIC_COLORS.length],
              width: `${(entry.value / total) * 100}%`,
            }}
          />
        ))}
      </div>
      <ul className="cursor-usage-breakdown__legend">
        {entries.map((entry, index) => (
          <li key={entry.id} title={`${entry.label}: ${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(entry.value)}`}>
            <span
              aria-hidden="true"
              style={{ background: METRIC_COLORS[index % METRIC_COLORS.length] }}
            />
            {entry.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CursorUsageSummary({
  copy,
  locale,
  providerId,
  surface,
  usage,
}: CursorUsageSummaryProps) {
  const [billingExpanded, setBillingExpanded] = usePersistedExpandedState(
    providerId,
    surface,
    "billing_summary",
  );
  const [historyExpanded, setHistoryExpanded] = usePersistedExpandedState(
    providerId,
    surface,
    "usage_history",
  );
  const [rangeDays, setRangeDays] = useState<CursorUsageRangeDays>(7);
  const cycleStart = formatDate(usage.billingCycleStart, locale);
  const cycleEnd = formatDate(usage.billingCycleEnd, locale);
  const updatedAt = formatDate(usage.capturedAt, locale);
  const planPercent = clampPercent(usage.plan?.totalPercentUsed ?? null);
  const planValue = formatCurrency(usage.plan?.usedCents ?? null, locale);
  const onDemandUsed = formatCurrency(usage.onDemand?.usedCents ?? null, locale);
  const onDemandLimit = formatCurrency(usage.onDemand?.limitCents ?? null, locale);
  const onDemandPercent =
    usage.onDemand?.usedCents !== null &&
    usage.onDemand?.usedCents !== undefined &&
    usage.onDemand.limitCents !== null &&
    usage.onDemand.limitCents > 0
      ? clampPercent((usage.onDemand.usedCents / usage.onDemand.limitCents) * 100)
      : null;
  const visibleDays = useMemo(
    () => usage.history?.days.slice(-rangeDays) ?? [],
    [rangeDays, usage.history?.days],
  );
  const dailyValues = useMemo(
    () => visibleDays.map((day) => metricValue(day.totals)),
    [visibleDays],
  );
  const maxDailyValue = Math.max(0, ...dailyValues);
  const modelBreakdowns = useMemo(
    () => aggregateBreakdowns(visibleDays, (day) => day.byModel),
    [visibleDays],
  );
  const kindBreakdowns = useMemo(
    () => aggregateBreakdowns(visibleDays, (day) => day.byKind),
    [visibleDays],
  );

  return (
    <div className={`cursor-usage-summary cursor-usage-summary--${surface}`}>
      <section className={`cursor-usage-module${billingExpanded ? "" : " cursor-usage-module--collapsed"}`}>
        <header className="cursor-usage-module__header">
          <div className="cursor-usage-module__heading">
            <p>{copy.billingSummary}</p>
            {cycleStart && cycleEnd ? (
              <span>{`${cycleStart} – ${cycleEnd}`}</span>
            ) : updatedAt ? (
              <span>{`${copy.updated} ${updatedAt}`}</span>
            ) : null}
          </div>
          <CursorCollapseToggle
            copy={copy}
            expanded={billingExpanded}
            onToggle={() => setBillingExpanded(!billingExpanded)}
          />
        </header>
        {billingExpanded ? (
          <div className="cursor-usage-module__content">
            {usage.plan ? (
              <>
                <CursorProgressRow
                  label={copy.planUsage}
                  percent={planPercent}
                  valueLabel={planValue ?? copy.unavailable}
                />
                {usage.plan.autoPercentUsed !== null ? (
                  <CursorProgressRow
                    label={copy.firstPartyPool}
                    percent={clampPercent(usage.plan.autoPercentUsed)}
                    valueLabel={`${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(usage.plan.autoPercentUsed)}%`}
                  />
                ) : null}
                {usage.plan.apiPercentUsed !== null ? (
                  <CursorProgressRow
                    label={copy.apiPool}
                    percent={clampPercent(usage.plan.apiPercentUsed)}
                    valueLabel={`${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(usage.plan.apiPercentUsed)}%`}
                  />
                ) : null}
              </>
            ) : (
              <p className="cursor-usage-module__empty">{copy.unavailable}</p>
            )}
            {usage.onDemand ? (
              <CursorProgressRow
                label={copy.onDemand}
                percent={onDemandPercent}
                valueLabel={
                  usage.onDemand.enabled
                    ? onDemandUsed && onDemandLimit
                      ? `${onDemandUsed} / ${onDemandLimit}`
                      : onDemandUsed ?? copy.enabled
                    : copy.disabled
                }
              />
            ) : null}
            <div className="cursor-usage-module__facts">
              {usage.plan?.includedUsageCents !== null && usage.plan?.includedUsageCents !== undefined ? (
                <span>{`${copy.includedValue}: ${formatCurrency(usage.plan.includedUsageCents, locale)}`}</span>
              ) : null}
              {usage.plan?.bonusUsageCents !== null && usage.plan?.bonusUsageCents !== undefined ? (
                <span>{`${copy.bonusValue}: ${formatCurrency(usage.plan.bonusUsageCents, locale)}`}</span>
              ) : null}
              {usage.onDemand?.usedCents !== null && usage.onDemand?.usedCents !== undefined ? (
                <span>{`${copy.actualCharge}: ${formatCurrency(usage.onDemand.usedCents, locale)}`}</span>
              ) : null}
            </div>
          </div>
        ) : null}
      </section>

      <section className={`cursor-usage-module${historyExpanded ? "" : " cursor-usage-module--collapsed"}`}>
        <header className="cursor-usage-module__header">
          <div className="cursor-usage-module__heading">
            <p>{copy.recentUsage}</p>
            {historyExpanded && usage.history ? (
              <button
                className="cursor-usage-module__range-toggle"
                type="button"
                onClick={() => setRangeDays(rangeDays === 7 ? 30 : 7)}
              >
                {rangeDays === 7 ? copy.sevenDays : copy.thirtyDays}
              </button>
            ) : null}
          </div>
          <CursorCollapseToggle
            copy={copy}
            expanded={historyExpanded}
            onToggle={() => setHistoryExpanded(!historyExpanded)}
          />
        </header>
        {historyExpanded ? (
          <div className="cursor-usage-module__content">
            {visibleDays.length > 0 && maxDailyValue > 0 ? (
              <>
                <div
                  className="cursor-usage-daily-bars"
                  aria-label={`${copy.recentUsage}: ${rangeDays}`}
                >
                  {dailyValues.map((value, index) => (
                    <span
                      key={visibleDays[index]?.date ?? index}
                      style={{ height: `${Math.max(3, (value / maxDailyValue) * 100)}%` }}
                      title={`${visibleDays[index]?.date}: ${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value)}`}
                    />
                  ))}
                </div>
                <CursorBreakdownLegend
                  entries={modelBreakdowns}
                  label={copy.models}
                  locale={locale}
                />
                <CursorBreakdownLegend
                  entries={kindBreakdowns}
                  label={copy.usageTypes}
                  locale={locale}
                />
              </>
            ) : (
              <p className="cursor-usage-module__empty">{copy.noHistory}</p>
            )}
          </div>
        ) : null}
      </section>
    </div>
  );
}
