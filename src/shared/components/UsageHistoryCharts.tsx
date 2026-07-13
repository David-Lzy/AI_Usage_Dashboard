import { useId, useMemo, useState } from "react";

import type {
  ProviderUsageHistory,
  ProviderUsageHistoryModuleId,
  ProviderUsageHistoryPoint,
} from "../../providers/types";
import {
  buildUsageHistoryChartData,
  type UsageHistoryChartData,
} from "../usage-history-chart-data";
import "./usage-history-charts.css";

export type UsageHistoryChartCopy = {
  locale: string;
  personalUsage: string;
  turns: string;
  byModel: string;
  bySurface: string;
  sevenDays: string;
  oneMonth: string;
  other: string;
  noData: string;
  collapse: string;
  expand: string;
  capturedAt: string;
  totalTurns: string;
  percentUnit: string;
  turnsUnit: string;
  surfaceLabels: Record<string, string>;
  chartLegend: string;
  dateRange: string;
  grouping: string;
  settingsSectionLabel: string;
  settingsTitle: string;
  settingsDetail: string;
};

type ChartKind = "bars" | "area";

const CHART_COLORS = [
  "var(--app-usage-history-series-1)",
  "var(--app-usage-history-series-2)",
  "var(--app-usage-history-series-3)",
  "var(--app-usage-history-series-4)",
  "var(--app-usage-history-series-5)",
  "var(--app-usage-history-series-6)",
];

export function formatUsageHistoryDate(value: string, locale: string): string {
  const date = new Date(`${value}T00:00:00.000Z`);

  if (!Number.isFinite(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

export function formatUsageHistoryValue(
  value: number,
  locale: string,
  unit: string,
): string {
  if (unit.trim() === "%") {
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: 2,
      style: "percent",
    }).format(value / 100);
  }

  const formattedValue = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
  }).format(value);
  return `${formattedValue} ${unit}`.trim();
}

function formatDateRange(data: UsageHistoryChartData, locale: string): string {
  if (data.dates.length === 0) {
    return "";
  }

  return `${formatUsageHistoryDate(data.dates[0], locale)} – ${formatUsageHistoryDate(data.dates.at(-1) ?? data.dates[0], locale)}`;
}

function buildPointLabel(
  data: UsageHistoryChartData,
  pointIndex: number,
  unit: string,
  locale: string,
): string {
  const values = data.series
    .filter((series) => series.values[pointIndex] > 0)
    .map(
      (series) =>
        `${series.label}: ${formatUsageHistoryValue(series.values[pointIndex], locale, unit)}`,
    )
    .join(", ");
  return `${formatUsageHistoryDate(data.dates[pointIndex], locale)} — ${
    values || formatUsageHistoryValue(0, locale, unit)
  }`;
}

function UsageHistorySvg({
  data,
  kind,
  label,
  unit,
  locale,
  compact,
}: {
  data: UsageHistoryChartData;
  kind: ChartKind;
  label: string;
  unit: string;
  locale: string;
  compact: boolean;
}) {
  const width = 720;
  const height = compact ? 112 : 220;
  const top = compact ? 8 : 16;
  const bottom = compact ? 12 : 28;
  const chartHeight = height - top - bottom;
  const count = Math.max(1, data.dates.length);
  const maximum = kind === "bars" ? 100 : Math.max(1, data.maximumDailyTotal);
  const xStep = width / count;

  return (
    <svg
      className={`usage-history-chart usage-history-chart--${kind}${compact ? " usage-history-chart--compact" : ""}`}
      role="img"
      aria-label={`${label}, ${formatDateRange(data, locale)}`}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      <line className="usage-history-chart__grid" x1="0" y1={top} x2={width} y2={top} />
      <line
        className="usage-history-chart__grid"
        x1="0"
        y1={top + chartHeight}
        x2={width}
        y2={top + chartHeight}
      />
      {kind === "bars"
        ? data.dates.map((date, pointIndex) => {
            let stacked = 0;
            return (
              <g key={date}>
                {data.series.map((series, seriesIndex) => {
                  const value = series.values[pointIndex] ?? 0;
                  const segmentHeight = (value / maximum) * chartHeight;
                  const y = top + chartHeight - stacked - segmentHeight;
                  stacked += segmentHeight;
                  return (
                    <rect
                      key={series.id}
                      className="usage-history-chart__bar"
                      x={pointIndex * xStep + Math.max(1.5, xStep * 0.12)}
                      y={y}
                      width={Math.max(1, xStep * 0.76)}
                      height={Math.max(0, segmentHeight)}
                      fill={CHART_COLORS[seriesIndex % CHART_COLORS.length]}
                    />
                  );
                })}
              </g>
            );
          })
        : data.series.map((series, seriesIndex) => {
            const lower = data.dates.map((_, pointIndex) =>
              data.series
                .slice(0, seriesIndex)
                .reduce((sum, item) => sum + (item.values[pointIndex] ?? 0), 0),
            );
            const upper = lower.map(
              (value, pointIndex) => value + (series.values[pointIndex] ?? 0),
            );
            const topPoints = upper.map((value, pointIndex) =>
              `${pointIndex * xStep + xStep / 2},${top + chartHeight - (value / maximum) * chartHeight}`,
            );
            const bottomPoints = lower
              .map((value, pointIndex) =>
                `${pointIndex * xStep + xStep / 2},${top + chartHeight - (value / maximum) * chartHeight}`,
              )
              .reverse();
            return (
              <polygon
                key={series.id}
                className="usage-history-chart__area"
                points={[...topPoints, ...bottomPoints].join(" ")}
                fill={CHART_COLORS[seriesIndex % CHART_COLORS.length]}
                stroke={CHART_COLORS[seriesIndex % CHART_COLORS.length]}
                strokeWidth="0.75"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
      {data.dates.map((date, pointIndex) => (
        <rect
          key={`focus-${date}`}
          className="usage-history-chart__focus-target"
          x={pointIndex * xStep}
          y={top}
          width={xStep}
          height={chartHeight}
          tabIndex={0}
          aria-label={buildPointLabel(data, pointIndex, unit, locale)}
        >
          <title>{buildPointLabel(data, pointIndex, unit, locale)}</title>
        </rect>
      ))}
    </svg>
  );
}

function UsageHistoryLegend({
  data,
  label,
}: {
  data: UsageHistoryChartData;
  label: string;
}) {
  return (
    <ul className="usage-history-legend" aria-label={label}>
      {data.series.map((series, index) => (
        <li key={series.id} className="usage-history-legend__item">
          <span
            className="usage-history-legend__swatch"
            style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
            aria-hidden="true"
          />
          <span>{series.label}</span>
        </li>
      ))}
    </ul>
  );
}

function getModulePoints(
  history: ProviderUsageHistory | undefined,
  moduleId: ProviderUsageHistoryModuleId,
) {
  return moduleId === "personal_usage_by_surface"
    ? history?.personalUsageBySurface?.points ?? []
    : history?.turns?.byModel ?? [];
}

function localizeSurfacePoints(
  points: readonly ProviderUsageHistoryPoint[],
  surfaceLabels: Record<string, string>,
) {
  return points.map((point) => ({
    ...point,
    values: point.values.map((value) => ({
      ...value,
      label: surfaceLabels[value.id] ?? value.label,
    })),
  }));
}

export function UsageHistoryCompact({
  history,
  moduleId,
  copy,
}: {
  history?: ProviderUsageHistory;
  moduleId: ProviderUsageHistoryModuleId;
  copy: UsageHistoryChartCopy;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const contentId = useId();
  const points = useMemo(() => {
    const sourcePoints = getModulePoints(history, moduleId);
    return moduleId === "personal_usage_by_surface"
      ? localizeSurfacePoints(sourcePoints, copy.surfaceLabels)
      : sourcePoints;
  }, [copy.surfaceLabels, history, moduleId]);
  const data = useMemo(
    () => buildUsageHistoryChartData(points, { days: 31, maxSeries: 3, otherLabel: copy.other }),
    [copy.other, points],
  );
  const title = moduleId === "personal_usage_by_surface" ? copy.personalUsage : copy.turns;

  return (
    <section
      className={`usage-history-compact${isExpanded ? "" : " usage-history-compact--collapsed"}`}
      aria-label={title}
    >
      <header className="usage-history-compact__header">
        <div className="usage-history-compact__heading">
          <h3 className="usage-history-compact__title">{title}</h3>
          {isExpanded ? (
            <p className="usage-history-compact__range">
              {formatDateRange(data, copy.locale)}
            </p>
          ) : null}
        </div>
        <button
          className="icon-button usage-history-compact__collapse-toggle"
          type="button"
          aria-controls={contentId}
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? copy.collapse : copy.expand}: ${title}`}
          title={isExpanded ? copy.collapse : copy.expand}
          onClick={() => setIsExpanded((current) => !current)}
        >
          <span
            className="usage-history-compact__collapse-icon"
            aria-hidden="true"
          />
        </button>
      </header>
      <div
        id={contentId}
        className="usage-history-compact__content"
        hidden={!isExpanded}
      >
        {data.dates.length > 0 ? (
          <>
            {moduleId === "turns_history" ? (
              <p className="usage-history-compact__metric">
                {copy.totalTurns}: {data.total}
              </p>
            ) : null}
            <UsageHistorySvg
              compact
              data={data}
              kind={
                moduleId === "personal_usage_by_surface" ? "bars" : "area"
              }
              label={title}
              locale={copy.locale}
              unit={
                moduleId === "personal_usage_by_surface"
                  ? copy.percentUnit
                  : copy.turnsUnit
              }
            />
            <UsageHistoryLegend data={data} label={copy.chartLegend} />
          </>
        ) : (
          <p className="supporting-copy">{copy.noData}</p>
        )}
      </div>
    </section>
  );
}

function SegmentedControl<T extends string | number>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div className="usage-history-segmented" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          className={option.value === value ? "usage-history-segmented__button usage-history-segmented__button--active" : "usage-history-segmented__button"}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function UsageHistoryDetail({
  history,
  copy,
  moduleOrder = ["personal_usage_by_surface", "turns_history"],
  formatCapturedAt = (value) => value,
}: {
  history: ProviderUsageHistory;
  copy: UsageHistoryChartCopy;
  moduleOrder?: readonly ProviderUsageHistoryModuleId[];
  formatCapturedAt?: (value: string) => string;
}) {
  const [days, setDays] = useState<7 | 31>(31);
  const [grouping, setGrouping] = useState<"model" | "surface">("model");
  const personalPoints = useMemo(
    () =>
      localizeSurfacePoints(
        history.personalUsageBySurface?.points ?? [],
        copy.surfaceLabels,
      ),
    [copy.surfaceLabels, history.personalUsageBySurface?.points],
  );
  const personalData = useMemo(
    () =>
      buildUsageHistoryChartData(personalPoints, {
        days,
        maxSeries: 6,
        otherLabel: copy.other,
      }),
    [copy.other, days, personalPoints],
  );
  const turnPoints = useMemo(() => {
    const points =
      grouping === "model"
        ? history.turns?.byModel ?? []
        : history.turns?.bySurface ?? [];
    return grouping === "surface"
      ? localizeSurfacePoints(points, copy.surfaceLabels)
      : points;
  }, [copy.surfaceLabels, grouping, history.turns?.byModel, history.turns?.bySurface]);
  const turnsData = useMemo(
    () => buildUsageHistoryChartData(turnPoints, { days, maxSeries: 6, otherLabel: copy.other }),
    [copy.other, days, turnPoints],
  );

  return (
    <section className="usage-history-detail" aria-label={`${copy.personalUsage}, ${copy.turns}`}>
      <header className="usage-history-detail__toolbar">
        <p className="supporting-copy">
          {copy.capturedAt}: {formatCapturedAt(history.capturedAt)}
        </p>
        <SegmentedControl
          label={copy.dateRange}
          value={days}
          options={[{ value: 7, label: copy.sevenDays }, { value: 31, label: copy.oneMonth }] as const}
          onChange={setDays}
        />
      </header>
      {moduleOrder.map((moduleId) =>
        moduleId === "personal_usage_by_surface" ? (
          <section key={moduleId} className="usage-history-detail__module">
            <h3 className="section-title">{copy.personalUsage}</h3>
            {personalData.dates.length ? (
              <>
                <UsageHistorySvg
                  compact={false}
                  data={personalData}
                  kind="bars"
                  label={copy.personalUsage}
                  locale={copy.locale}
                  unit={copy.percentUnit}
                />
                <UsageHistoryLegend
                  data={personalData}
                  label={copy.chartLegend}
                />
              </>
            ) : (
              <p className="supporting-copy">{copy.noData}</p>
            )}
          </section>
        ) : (
          <section key={moduleId} className="usage-history-detail__module">
            <header className="usage-history-detail__module-header">
              <div>
                <h3 className="section-title">{copy.turns}</h3>
                <p className="usage-history-compact__metric">
                  {copy.totalTurns}: {turnsData.total}
                </p>
              </div>
              <SegmentedControl
                label={copy.grouping}
                value={grouping}
                options={
                  [
                    { value: "model", label: copy.byModel },
                    { value: "surface", label: copy.bySurface },
                  ] as const
                }
                onChange={setGrouping}
              />
            </header>
            {turnsData.dates.length ? (
              <>
                <UsageHistorySvg
                  compact={false}
                  data={turnsData}
                  kind="area"
                  label={copy.turns}
                  locale={copy.locale}
                  unit={copy.turnsUnit}
                />
                <UsageHistoryLegend
                  data={turnsData}
                  label={copy.chartLegend}
                />
              </>
            ) : (
              <p className="supporting-copy">{copy.noData}</p>
            )}
          </section>
        ),
      )}
    </section>
  );
}
