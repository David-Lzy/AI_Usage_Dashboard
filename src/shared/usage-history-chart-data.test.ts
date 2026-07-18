import { describe, expect, it } from "vitest";

import { buildUsageHistoryChartData } from "./usage-history-chart-data";

describe("buildUsageHistoryChartData", () => {
  it("keeps the strongest series and combines the remainder", () => {
    const data = buildUsageHistoryChartData([
      { date: "2026-07-12", values: [
        { id: "a", label: "A", value: 10 },
        { id: "b", label: "B", value: 8 },
        { id: "c", label: "C", value: 3 },
        { id: "d", label: "D", value: 2 },
      ] },
      { date: "2026-07-13", values: [
        { id: "a", label: "A", value: 9 },
        { id: "b", label: "B", value: 7 },
        { id: "c", label: "C", value: 2 },
        { id: "d", label: "D", value: 1 },
      ] },
    ], { days: 31, maxSeries: 3, otherLabel: "Other" });

    expect(data.series.map((series) => series.id)).toEqual(["a", "b", "c", "other"]);
    expect(data.series.at(-1)?.values).toEqual([2, 1]);
    expect(data.total).toBe(42);
  });

  it("limits the visible date range", () => {
    const points = Array.from({ length: 10 }, (_, index) => ({
      date: `2026-07-${String(index + 1).padStart(2, "0")}`,
      values: [{ id: "a", label: "A", value: index }],
    }));
    const data = buildUsageHistoryChartData(points, {
      days: 7,
      maxSeries: 6,
      otherLabel: "Other",
    });

    expect(data.dates).toHaveLength(7);
    expect(data.dates[0]).toBe("2026-07-04");
  });

  it("keeps every series above the selected-range share threshold", () => {
    const data = buildUsageHistoryChartData(
      [
        {
          date: "2026-07-12",
          values: [
            { id: "a", label: "A", value: 25 },
            { id: "b", label: "B", value: 20 },
            { id: "c", label: "C", value: 15 },
            { id: "d", label: "D", value: 12 },
            { id: "e", label: "E", value: 10 },
            { id: "f", label: "F", value: 9 },
            { id: "g", label: "G", value: 9 },
          ],
        },
      ],
      {
        days: 31,
        maxSeries: 9,
        minimumSeriesShare: 0.1,
        otherLabel: "Other",
      },
    );

    expect(data.series.map((series) => series.id)).toEqual([
      "a",
      "b",
      "c",
      "d",
      "other",
    ]);
    expect(data.series.at(-1)?.total).toBe(28);
    expect(data.total).toBe(100);
  });
});
