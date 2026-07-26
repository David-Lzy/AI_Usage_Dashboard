import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

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

export type UsageHistoryRangeDays = 7 | 31;

type ChartKind = "bars" | "area";

const TURN_SERIES_MINIMUM_SHARE = 0.1;
const MAX_TURN_SERIES = 9;

const CHART_COLORS = [
  "var(--app-usage-history-series-1)",
  "var(--app-usage-history-series-2)",
  "var(--app-usage-history-series-3)",
  "var(--app-usage-history-series-4)",
  "var(--app-usage-history-series-5)",
  "var(--app-usage-history-series-6)",
  "var(--app-usage-history-series-7)",
  "var(--app-usage-history-series-8)",
  "var(--app-usage-history-series-9)",
  "var(--app-usage-history-series-10)",
];

const COMPOSITION_ENVELOPE = [
  0.16, 0.5, 0.78, 0.94, 1, 0.94, 0.78, 0.5, 0.16,
];

type UsageHistoryChartPoint = {
  x: number;
  y: number;
};

function formatChartCoordinate(value: number): string {
  return String(Number(value.toFixed(3)));
}

function buildMonotoneCurveCommands(
  points: readonly UsageHistoryChartPoint[],
  startCommand: "M" | "L",
): string {
  const first = points[0];
  if (!first) {
    return "";
  }

  const commands = [
    `${startCommand}${formatChartCoordinate(first.x)},${formatChartCoordinate(first.y)}`,
  ];
  if (points.length === 1) {
    return commands[0];
  }

  const slopes = points.slice(0, -1).map((point, index) => {
    const next = points[index + 1];
    return (next?.y ?? point.y) - point.y;
  });
  const tangents = points.map((_, index) => {
    if (index === 0) {
      return slopes[0] ?? 0;
    }
    if (index === points.length - 1) {
      return slopes.at(-1) ?? 0;
    }

    const previousSlope = slopes[index - 1] ?? 0;
    const nextSlope = slopes[index] ?? 0;
    if (
      previousSlope === 0 ||
      nextSlope === 0 ||
      Math.sign(previousSlope) !== Math.sign(nextSlope)
    ) {
      return 0;
    }

    return (2 * previousSlope * nextSlope) / (previousSlope + nextSlope);
  });

  for (let index = 0; index < points.length - 1; index += 1) {
    const point = points[index];
    const next = points[index + 1];
    if (!point || !next) {
      continue;
    }

    const deltaX = next.x - point.x;
    commands.push(
      `C${formatChartCoordinate(point.x + deltaX / 3)},${formatChartCoordinate(point.y + (tangents[index] ?? 0) / 3)} ` +
        `${formatChartCoordinate(next.x - deltaX / 3)},${formatChartCoordinate(next.y - (tangents[index + 1] ?? 0) / 3)} ` +
        `${formatChartCoordinate(next.x)},${formatChartCoordinate(next.y)}`,
    );
  }

  return commands.join(" ");
}

function buildStackedAreaPath(
  upperPoints: readonly UsageHistoryChartPoint[],
  lowerPoints: readonly UsageHistoryChartPoint[],
): string {
  return `${buildMonotoneCurveCommands(upperPoints, "M")} ${buildMonotoneCurveCommands([...lowerPoints].reverse(), "L")} Z`;
}

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

function UsageHistoryRangeToggle({
  copy,
  data,
  days,
  onChange,
}: {
  copy: UsageHistoryChartCopy;
  data: UsageHistoryChartData;
  days: UsageHistoryRangeDays;
  onChange: (days: UsageHistoryRangeDays) => void;
}) {
  const periodLabel = days === 7 ? copy.sevenDays : copy.oneMonth;
  const nextDays: UsageHistoryRangeDays = days === 7 ? 31 : 7;
  const nextPeriodLabel = nextDays === 7 ? copy.sevenDays : copy.oneMonth;
  const dateRange = formatDateRange(data, copy.locale);
  const accessibleLabel = `${copy.dateRange}: ${periodLabel}, ${dateRange}. ${nextPeriodLabel}`;

  return (
    <button
      className="usage-history-range-toggle"
      data-usage-history-range-days={days}
      type="button"
      aria-label={accessibleLabel}
      title={accessibleLabel}
      onClick={() => onChange(nextDays)}
    >
      <span className="usage-history-range-toggle__dates">{dateRange}</span>
    </button>
  );
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

export function UsageHistorySvg({
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
  const height = compact ? 90 : 176;
  const top = compact ? 6 : 12;
  const bottom = compact ? 8 : 20;
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
            const topPoints = upper.map((value, pointIndex) => ({
              x: pointIndex * xStep + xStep / 2,
              y: top + chartHeight - (value / maximum) * chartHeight,
            }));
            const bottomPoints = lower.map((value, pointIndex) => ({
              x: pointIndex * xStep + xStep / 2,
              y: top + chartHeight - (value / maximum) * chartHeight,
            }));
            return (
              <path
                key={series.id}
                className="usage-history-chart__area"
                data-curve="monotone"
                d={buildStackedAreaPath(topPoints, bottomPoints)}
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

export function UsageCompositionSvg({
  compact,
  data,
  label,
  locale,
}: {
  compact: boolean;
  data: UsageHistoryChartData;
  label: string;
  locale: string;
}) {
  const width = 720;
  const height = compact ? 68 : 104;
  const top = compact ? 4 : 8;
  const bottom = compact ? 4 : 8;
  const chartHeight = height - top - bottom;
  const baseline = top + chartHeight;
  const series = data.series.filter((item) => item.total > 0);
  const total = series.reduce((sum, item) => sum + item.total, 0);
  const percentage = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
    style: "percent",
  });
  const accessibleLabel = `${label}: ${series
    .map(
      (item) =>
        `${item.label}: ${percentage.format(total > 0 ? item.total / total : 0)}`,
    )
    .join(", ")}`;

  let lowerShare = 0;

  return (
    <svg
      aria-label={accessibleLabel}
      className={`usage-composition-chart${compact ? " usage-composition-chart--compact" : ""}`}
      preserveAspectRatio="none"
      role="img"
      viewBox={`0 0 ${width} ${height}`}
    >
      <title>{accessibleLabel}</title>
      {series.map((item, index) => {
        const share = total > 0 ? item.total / total : 0;
        const upperShare = lowerShare + share;
        const upperPoints = COMPOSITION_ENVELOPE.map((envelope, pointIndex) => ({
          x: (pointIndex / (COMPOSITION_ENVELOPE.length - 1)) * width,
          y: baseline - envelope * chartHeight * upperShare,
        }));
        const lowerPoints = COMPOSITION_ENVELOPE.map((envelope, pointIndex) => ({
          x: (pointIndex / (COMPOSITION_ENVELOPE.length - 1)) * width,
          y: baseline - envelope * chartHeight * lowerShare,
        }));
        lowerShare = upperShare;

        return (
          <path
            className="usage-history-chart__area"
            data-composition-layer={item.id}
            data-curve="monotone"
            d={buildStackedAreaPath(upperPoints, lowerPoints)}
            fill={CHART_COLORS[index % CHART_COLORS.length]}
            key={item.id}
            stroke={CHART_COLORS[index % CHART_COLORS.length]}
            strokeWidth="0.75"
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </svg>
  );
}

export function UsageHistoryLegend({
  data,
  label,
}: {
  data: UsageHistoryChartData;
  label: string;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLUListElement>(null);
  const [marqueeState, setMarqueeState] = useState({
    isOverflowing: false,
    durationSeconds: 16,
  });

  useEffect(() => {
    const viewport = viewportRef.current;
    const group = groupRef.current;
    if (!viewport || !group) {
      return undefined;
    }

    const updateMarqueeState = () => {
      const groupWidth = group.scrollWidth;
      const isOverflowing = groupWidth > viewport.clientWidth + 1;
      const durationSeconds = Math.max(12, Math.min(30, groupWidth / 24));
      setMarqueeState((current) =>
        current.isOverflowing === isOverflowing &&
        Math.abs(current.durationSeconds - durationSeconds) < 0.1
          ? current
          : { isOverflowing, durationSeconds },
      );
    };

    updateMarqueeState();

    const resizeObserver =
      typeof ResizeObserver === "function"
        ? new ResizeObserver(updateMarqueeState)
        : null;
    resizeObserver?.observe(viewport);
    resizeObserver?.observe(group);
    if (!resizeObserver) {
      window.addEventListener("resize", updateMarqueeState);
    }

    return () => {
      resizeObserver?.disconnect();
      if (!resizeObserver) {
        window.removeEventListener("resize", updateMarqueeState);
      }
    };
  }, [data.series]);

  const renderItems = () =>
    data.series.map((series, index) => (
      <li key={series.id} className="usage-history-legend__item">
        <span
          className="usage-history-legend__swatch"
          style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
          aria-hidden="true"
        />
        <span>{series.label}</span>
      </li>
    ));

  return (
    <div
      ref={viewportRef}
      className="usage-history-legend"
      data-overflow={marqueeState.isOverflowing ? "true" : "false"}
      aria-label={marqueeState.isOverflowing ? label : undefined}
      tabIndex={marqueeState.isOverflowing ? 0 : undefined}
    >
      <div
        className="usage-history-legend__track"
        style={
          {
            "--usage-history-legend-duration": `${marqueeState.durationSeconds}s`,
          } as CSSProperties
        }
      >
        <ul
          ref={groupRef}
          className="usage-history-legend__group"
          aria-label={label}
        >
          {renderItems()}
        </ul>
        {marqueeState.isOverflowing ? (
          <ul
            className="usage-history-legend__group usage-history-legend__group--duplicate"
            aria-hidden="true"
          >
            {renderItems()}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

function UsageHistoryChartFrame({
  metric,
  children,
}: {
  metric?: string;
  children: ReactNode;
}) {
  return (
    <div className="usage-history-chart-frame">
      {metric ? (
        <p className="usage-history-chart-frame__metric">{metric}</p>
      ) : null}
      {children}
    </div>
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
  defaultExpanded = true,
  rangeDays,
  onExpandedChange,
  onRangeDaysChange,
}: {
  history?: ProviderUsageHistory;
  moduleId: ProviderUsageHistoryModuleId;
  copy: UsageHistoryChartCopy;
  defaultExpanded?: boolean;
  rangeDays?: UsageHistoryRangeDays;
  onExpandedChange?: (isExpanded: boolean) => void;
  onRangeDaysChange?: (days: UsageHistoryRangeDays) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [localRangeDays, setLocalRangeDays] =
    useState<UsageHistoryRangeDays>(31);
  const selectedRangeDays = rangeDays ?? localRangeDays;
  const contentId = useId();
  const points = useMemo(() => {
    const sourcePoints = getModulePoints(history, moduleId);
    return moduleId === "personal_usage_by_surface"
      ? localizeSurfacePoints(sourcePoints, copy.surfaceLabels)
      : sourcePoints;
  }, [copy.surfaceLabels, history, moduleId]);
  const data = useMemo(
    () =>
      buildUsageHistoryChartData(points, {
        days: selectedRangeDays,
        maxSeries:
          moduleId === "turns_history" ? MAX_TURN_SERIES : 3,
        minimumSeriesShare:
          moduleId === "turns_history"
            ? TURN_SERIES_MINIMUM_SHARE
            : undefined,
        otherLabel: copy.other,
      }),
    [copy.other, moduleId, points, selectedRangeDays],
  );
  const title = moduleId === "personal_usage_by_surface" ? copy.personalUsage : copy.turns;

  function updateRangeDays(nextDays: UsageHistoryRangeDays) {
    if (rangeDays === undefined) {
      setLocalRangeDays(nextDays);
    }
    onRangeDaysChange?.(nextDays);
  }

  return (
    <section
      className={`usage-history-compact${isExpanded ? "" : " usage-history-compact--collapsed"}`}
      aria-label={title}
      data-usage-history-module={moduleId}
    >
      <header className="usage-history-compact__header">
        <div className="usage-history-compact__heading">
          <h3 className="usage-history-compact__title">{title}</h3>
          {isExpanded && data.dates.length > 0 ? (
            <UsageHistoryRangeToggle
              copy={copy}
              data={data}
              days={selectedRangeDays}
              onChange={updateRangeDays}
            />
          ) : null}
        </div>
        <button
          className="icon-button usage-history-compact__collapse-toggle"
          type="button"
          aria-controls={contentId}
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? copy.collapse : copy.expand}: ${title}`}
          title={isExpanded ? copy.collapse : copy.expand}
          onClick={() =>
            setIsExpanded((current) => {
              const next = !current;
              onExpandedChange?.(next);
              return next;
            })
          }
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
            <UsageHistoryChartFrame
              metric={
                moduleId === "turns_history"
                  ? `${copy.totalTurns}: ${data.total}`
                  : undefined
              }
            >
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
            </UsageHistoryChartFrame>
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
  const [personalDays, setPersonalDays] =
    useState<UsageHistoryRangeDays>(31);
  const [turnsDays, setTurnsDays] = useState<UsageHistoryRangeDays>(31);
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
        days: personalDays,
        maxSeries: 6,
        otherLabel: copy.other,
      }),
    [copy.other, personalDays, personalPoints],
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
    () =>
      buildUsageHistoryChartData(turnPoints, {
        days: turnsDays,
        maxSeries: MAX_TURN_SERIES,
        minimumSeriesShare: TURN_SERIES_MINIMUM_SHARE,
        otherLabel: copy.other,
      }),
    [copy.other, turnsDays, turnPoints],
  );

  return (
    <section className="usage-history-detail" aria-label={`${copy.personalUsage}, ${copy.turns}`}>
      <header className="usage-history-detail__toolbar">
        <p className="supporting-copy">
          {copy.capturedAt}: {formatCapturedAt(history.capturedAt)}
        </p>
      </header>
      {moduleOrder.map((moduleId) =>
        moduleId === "personal_usage_by_surface" ? (
          <section key={moduleId} className="usage-history-detail__module">
            <header className="usage-history-detail__module-header">
              <h3 className="section-title">{copy.personalUsage}</h3>
              {personalData.dates.length ? (
                <UsageHistoryRangeToggle
                  copy={copy}
                  data={personalData}
                  days={personalDays}
                  onChange={setPersonalDays}
                />
              ) : null}
            </header>
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
              <h3 className="section-title">{copy.turns}</h3>
              <div className="usage-history-detail__module-actions">
                {turnsData.dates.length ? (
                  <UsageHistoryRangeToggle
                    copy={copy}
                    data={turnsData}
                    days={turnsDays}
                    onChange={setTurnsDays}
                  />
                ) : null}
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
              </div>
            </header>
            {turnsData.dates.length ? (
              <>
                <UsageHistoryChartFrame
                  metric={`${copy.totalTurns}: ${turnsData.total}`}
                >
                  <UsageHistorySvg
                    compact={false}
                    data={turnsData}
                    kind="area"
                    label={copy.turns}
                    locale={copy.locale}
                    unit={copy.turnsUnit}
                  />
                </UsageHistoryChartFrame>
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
