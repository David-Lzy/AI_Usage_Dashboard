import { describe, expect, it } from "vitest";
import {
  mergeProviderUsageHistoryModules,
  normalizeProviderUsageHistory,
} from "./provider-usage-history";

describe("provider usage history normalization", () => {
  it("sorts and deduplicates dates while normalizing values", () => {
    const history = normalizeProviderUsageHistory({
      capturedAt: "2026-07-13T12:00:00+09:30",
      personalUsageBySurface: {
        points: [
          {
            date: "2026-07-12",
            values: [
              { id: "desktop", label: "Desktop", value: 80 },
              { id: "extension", label: "Extension", value: 40 },
            ],
          },
          {
            date: "2026-07-11",
            values: [{ id: "desktop", label: "Desktop", value: 25 }],
          },
          {
            date: "2026-07-12",
            values: [{ id: "desktop", label: "Desktop", value: 60 }],
          },
        ],
      },
      turns: {
        total: 42.9,
        byModel: [
          {
            date: "2026-07-12",
            values: [{ id: "gpt", label: "GPT", value: "12.8" }],
          },
        ],
        bySurface: [],
      },
    });

    expect(history).toMatchObject({
      capturedAt: "2026-07-13T02:30:00.000Z",
      rangeStart: "2026-07-11",
      rangeEnd: "2026-07-12",
      personalUsageBySurface: {
        points: [
          { date: "2026-07-11" },
          {
            date: "2026-07-12",
            values: [{ id: "desktop", label: "Desktop", value: 60 }],
          },
        ],
      },
      turns: {
        total: 42,
        byModel: [
          {
            values: [{ id: "gpt", label: "GPT", value: 12 }],
          },
        ],
      },
    });
  });

  it("rejects history without a valid capture time or daily points", () => {
    expect(normalizeProviderUsageHistory({ capturedAt: "invalid" })).toBeUndefined();
    expect(
      normalizeProviderUsageHistory({
        capturedAt: "2026-07-13T00:00:00.000Z",
        personalUsageBySurface: { points: [] },
        turns: { total: 0, byModel: [], bySurface: [] },
      }),
    ).toBeUndefined();
  });

  it("preserves the last valid module when a refresh captures only one endpoint", () => {
    const previous = normalizeProviderUsageHistory({
      capturedAt: "2026-07-14T00:00:00.000Z",
      personalUsageBySurface: {
        points: [
          {
            date: "2026-07-14",
            values: [{ id: "desktop", label: "Desktop", value: 40 }],
          },
        ],
      },
      turns: null,
    });
    const current = normalizeProviderUsageHistory({
      capturedAt: "2026-07-15T00:00:00.000Z",
      personalUsageBySurface: null,
      turns: {
        total: 12,
        byModel: [
          {
            date: "2026-07-15",
            values: [{ id: "gpt", label: "GPT", value: 12 }],
          },
        ],
        bySurface: [],
      },
    });

    const merged = mergeProviderUsageHistoryModules(current, previous);

    expect(merged).toMatchObject({
      capturedAt: "2026-07-15T00:00:00.000Z",
      rangeStart: "2026-07-14",
      rangeEnd: "2026-07-15",
      personalUsageBySurface: {
        points: [{ date: "2026-07-14" }],
      },
      turns: {
        total: 12,
        byModel: [{ date: "2026-07-15" }],
      },
    });
  });
});
