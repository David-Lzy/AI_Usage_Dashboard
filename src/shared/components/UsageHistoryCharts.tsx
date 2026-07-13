import { useMemo, useState } from "react";

import type {
  ProviderUsageHistory,
  ProviderUsageHistoryModuleId,
} from "../../providers/types";
import {
  buildUsageHistoryChartData,
  type UsageHistoryChartData,
} from "../usage-history-chart-data";
import "./usage-history-charts.css";

export type UsageHistoryChartCopy = {
  personalUsage: string;
  turns: string;
  byModel: string;
  bySurface: string;
  sevenDays: string;
  oneMonth: string;
  other: string;
  noData: string;
  hide: string;
  openDetails: string;
  capturedAt: string;
  totalTurns: string;
  percentUnit: string;
  turnsUnit: string;
};

type ChartKind = "bars" | "area";

const CHART_COLORS = [
  "var(--md-sys-color-primary)",
  "var(--md-sys-color-tertiary)",
  "var(--md-sys-color-secondary)",
  "var(--md-sys-color-error)",
  "var(--md-sys-color-primary-container)",
  "var(--md-sys-color-outline)",
];

function formatDateRange(data: UsageHistoryChartData): string {
  if (data.dates.length === 0) {
    return "";
  }

  return `${data.dates[0]} – ${data.dates.at(-1)}`;
}

function buildPointLabel(
  data: UsageHistoryChartData,
  pointIndex: number,
  unit: string,
): string {
  const values = data.series
    .filter((series) => series.values[pointIndex] > 0)
    .map((series) => `${series.label}: ${series.values[pointIndex]} ${unit}`)
    .join(", ");
  return `${data.dates[pointIndex]} — ${values || `0 ${unit}`}`;
}

function UsageHistorySvg({
  data,
  kind,
  label,
  unit,
  compact,
}: {
  data: UsageHistoryChartData;
  kind: ChartKind;
  label: string;
  unit: string;
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
      aria-label={`${label}, ${formatDateRange(data)}`}
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
          aria-label={buildPointLabel(data, pointIndex, unit)}
        >
          <title>{buildPointLabel(data, pointIndex, unit)}</title>
        </rect>
      ))}
    </svg>
  );
}

function UsageHistoryLegend({ data }: { data: UsageHistoryChartData }) {
  return (
    <ul className="usage-history-legend" aria-label="Chart legend">
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

export function UsageHistoryCompact({
  history,
  moduleId,
  copy,
  onHide,
  onOpenDetails,
}: {
  history?: ProviderUsageHistory;
  moduleId: ProviderUsageHistoryModuleId;
  copy: UsageHistoryChartCopy;
  onHide?: () => void;
  onOpenDetails?: () => void;
}) {
  const points = getModulePoints(history, moduleId);
  const data = useMemo(
    () => buildUsageHistoryChartData(points, { days: 31, maxSeries: 3, otherLabel: copy.other }),
    [copy.other, points],
  );
  const title = moduleId === "personal_usage_by_surface" ? copy.personalUsage : copy.turns;

  return (
    <section className="usage-history-compact" aria-label={title}>
      <header className="usage-history-compact__header">
        <div>
          <h3 className="usage-history-compact__title">{title}</h3>
          <p className="usage-history-compact__range">{formatDateRange(data)}</p>
        </div>
        <div className="usage-history-compact__actions">
          {onOpenDetails ? <button className="text-button" type="button" onClick={onOpenDetails}>{copy.openDetails}</button> : null}
          {onHide ? <button className="text-button" type="button" onClick={onHide}>{copy.hide}</button> : null}
        </div>
      </header>
      {data.dates.length > 0 ? (
        <>
          {moduleId === "turns_history" ? (
            <p className="usage-history-compact__metric">{copy.totalTurns}: {data.total}</p>
          ) : null}
          <UsageHistorySvg
            compact
            data={data}
            kind={moduleId === "personal_usage_by_surface" ? "bars" : "area"}
            label={title}
            unit={moduleId === "personal_usage_by_surface" ? copy.percentUnit : copy.turnsUnit}
          />
          <UsageHistoryLegend data={data} />
        </>
      ) : <p className="supporting-copy">{copy.noData}</p>}
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
  showPersonalUsage = true,
  showTurns = true,
}: {
  history: ProviderUsageHistory;
  copy: UsageHistoryChartCopy;
  showPersonalUsage?: boolean;
  showTurns?: boolean;
}) {
  const [days, setDays] = useState<7 | 31>(31);
  const [grouping, setGrouping] = useState<"model" | "surface">("model");
  const personalData = useMemo(
    () => buildUsageHistoryChartData(history.personalUsageBySurface?.points ?? [], { days, maxSeries: 6, otherLabel: copy.other }),
    [copy.other, days, history.personalUsageBySurface?.points],
  );
  const turnPoints = grouping === "model" ? history.turns?.byModel ?? [] : history.turns?.bySurface ?? [];
  const turnsData = useMemo(
    () => buildUsageHistoryChartData(turnPoints, { days, maxSeries: 6, otherLabel: copy.other }),
    [copy.other, days, turnPoints],
  );

  return (
    <section className="usage-history-detail" aria-label={`${copy.personalUsage}, ${copy.turns}`}>
      <header className="usage-history-detail__toolbar">
        <p className="supporting-copy">{copy.capturedAt}: {history.capturedAt}</p>
        <SegmentedControl
          label="Date range"
          value={days}
          options={[{ value: 7, label: copy.sevenDays }, { value: 31, label: copy.oneMonth }] as const}
          onChange={setDays}
        />
      </header>
      {showPersonalUsage ? (
        <section className="usage-history-detail__module">
          <h3 className="section-title">{copy.personalUsage}</h3>
          {personalData.dates.length ? <><UsageHistorySvg compact={false} data={personalData} kind="bars" label={copy.personalUsage} unit={copy.percentUnit} /><UsageHistoryLegend data={personalData} /></> : <p className="supporting-copy">{copy.noData}</p>}
        </section>
      ) : null}
      {showTurns ? (
        <section className="usage-history-detail__module">
          <header className="usage-history-detail__module-header">
            <div><h3 className="section-title">{copy.turns}</h3><p className="usage-history-compact__metric">{copy.totalTurns}: {turnsData.total}</p></div>
            <SegmentedControl
              label="Grouping"
              value={grouping}
              options={[{ value: "model", label: copy.byModel }, { value: "surface", label: copy.bySurface }] as const}
              onChange={setGrouping}
            />
          </header>
          {turnsData.dates.length ? <><UsageHistorySvg compact={false} data={turnsData} kind="area" label={copy.turns} unit={copy.turnsUnit} /><UsageHistoryLegend data={turnsData} /></> : <p className="supporting-copy">{copy.noData}</p>}
        </section>
      ) : null}
    </section>
  );
}
