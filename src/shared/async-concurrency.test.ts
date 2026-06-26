import { describe, expect, it } from "vitest";

import { mapWithConcurrency } from "./async-concurrency";

describe("mapWithConcurrency", () => {
  it("preserves input ordering while capping concurrent work", async () => {
    let activeCount = 0;
    let maxActiveCount = 0;
    const result = await mapWithConcurrency([3, 1, 2, 4], 2, async (value) => {
      activeCount += 1;
      maxActiveCount = Math.max(maxActiveCount, activeCount);

      await new Promise((resolve) => setTimeout(resolve, value));

      activeCount -= 1;
      return value * 10;
    });

    expect(result).toEqual([30, 10, 20, 40]);
    expect(maxActiveCount).toBeLessThanOrEqual(2);
    expect(maxActiveCount).toBeGreaterThan(1);
  });

  it("falls back to one worker for invalid limits", async () => {
    let activeCount = 0;
    let maxActiveCount = 0;

    await mapWithConcurrency([1, 2, 3], Number.NaN, async () => {
      activeCount += 1;
      maxActiveCount = Math.max(maxActiveCount, activeCount);
      await new Promise((resolve) => setTimeout(resolve, 0));
      activeCount -= 1;
    });

    expect(maxActiveCount).toBe(1);
  });
});
