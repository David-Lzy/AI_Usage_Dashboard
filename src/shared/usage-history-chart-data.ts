import type {
  ProviderUsageHistoryPoint,
  ProviderUsageHistoryValue,
} from "../providers/types";

export type UsageHistoryChartSeries = {
  id: string;
  label: string;
  values: number[];
  total: number;
};

export type UsageHistoryChartData = {
  dates: string[];
  series: UsageHistoryChartSeries[];
  dailyTotals: number[];
  maximumDailyTotal: number;
  total: number;
};

type BuildUsageHistoryChartDataOptions = {
  days: 7 | 31;
  maxSeries: number;
  otherLabel: string;
};

function sumValues(values: readonly ProviderUsageHistoryValue[]): number {
  return values.reduce((sum, value) => sum + value.value, 0);
}

export function buildUsageHistoryChartData(
  points: readonly ProviderUsageHistoryPoint[],
  { days, maxSeries, otherLabel }: BuildUsageHistoryChartDataOptions,
): UsageHistoryChartData {
  const visiblePoints = points.slice(-days);
  const totalsBySeries = new Map<string, { label: string; total: number }>();

  for (const point of visiblePoints) {
    for (const value of point.values) {
      const current = totalsBySeries.get(value.id);
      totalsBySeries.set(value.id, {
        label: value.label,
        total: (current?.total ?? 0) + value.value,
      });
    }
  }

  const rankedIds = [...totalsBySeries.entries()]
    .sort((left, right) => right[1].total - left[1].total)
    .map(([id]) => id);
  const hasOther = rankedIds.length > maxSeries;
  const visibleIds = rankedIds.slice(0, maxSeries);
  const visibleIdSet = new Set(visibleIds);
  const series = visibleIds.map<UsageHistoryChartSeries>((id) => ({
    id,
    label: totalsBySeries.get(id)?.label ?? id,
    total: totalsBySeries.get(id)?.total ?? 0,
    values: visiblePoints.map(
      (point) => point.values.find((value) => value.id === id)?.value ?? 0,
    ),
  }));

  if (hasOther) {
    const values = visiblePoints.map((point) =>
      point.values
        .filter((value) => !visibleIdSet.has(value.id))
        .reduce((sum, value) => sum + value.value, 0),
    );
    series.push({
      id: "other",
      label: otherLabel,
      values,
      total: values.reduce((sum, value) => sum + value, 0),
    });
  }

  const dailyTotals = visiblePoints.map((point) => sumValues(point.values));

  return {
    dates: visiblePoints.map((point) => point.date),
    series,
    dailyTotals,
    maximumDailyTotal: Math.max(0, ...dailyTotals),
    total: dailyTotals.reduce((sum, value) => sum + value, 0),
  };
}
