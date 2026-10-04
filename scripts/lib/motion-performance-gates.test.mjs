import { describe, expect, it } from "vitest";
import { evaluateMotionPerformance, resolveMotionSampling } from "./motion-performance-gates.mjs";

const startup = (variant, value, count = 10) => ({ variant, locale: "en", width: 392, count: 3,
  coldSummary: { median: value, count }, warmSummary: { median: value, count } });
const cpu = (variant, id, value, count = 3) => ({ variant, id, summary: { median: value, count } });

describe("motion performance acceptance gates", () => {
  it("preserves the default method and fixed preliminary smoke counts", () => {
    expect(resolveMotionSampling()).toEqual({ repeats: 10, cpuRepeats: 3, intervalMs: 30000 });
    expect(resolveMotionSampling({ smoke: true })).toEqual({ repeats: 1, cpuRepeats: 1, intervalMs: 1000 });
    expect(() => resolveMotionSampling({ smoke: true, startupCount: 40 })).toThrow("Smoke");
  });
  it("allows declared larger matrices without shortening CPU windows", () => {
    expect(resolveMotionSampling({ startupCount: "40", cpuCount: "6" })).toEqual({ repeats: 40, cpuRepeats: 6, intervalMs: 30000 });
  });
  it("rejects undersampling, invalid and unbounded repeat counts before launching browsers", () => {
    for (const count of [9, 101, 10.5, "invalid", Infinity]) expect(() => resolveMotionSampling({ startupCount: count })).toThrow("Startup");
    for (const count of [2, 13, 3.5, "invalid", Infinity]) expect(() => resolveMotionSampling({ cpuCount: count })).toThrow("CPU");
  });
  it("uses the larger of 10 percent or 50ms for both startup medians", () => {
    expect(evaluateMotionPerformance([startup("baseline", 200), startup("current", 250)], []).passed).toBe(true);
    expect(evaluateMotionPerformance([startup("baseline", 800), startup("current", 880)], []).passed).toBe(true);
    expect(evaluateMotionPerformance([startup("baseline", 200), startup("current", 251)], []).passed).toBe(false);
  });
  it("uses absolute single-core points for idle/paused and relative cost for glide", () => {
    const rows = [cpu("baseline", "idle", 2), cpu("current", "idle", 2.5),
      cpu("baseline", "hover-paused", 2), cpu("current", "hover-paused", 2.51),
      cpu("baseline", "glide", 10), cpu("current", "glide", 11)];
    const gates = evaluateMotionPerformance([], rows);
    expect(gates.results.map((row) => row.passed)).toEqual([true, false, true]);
    expect(gates.passed).toBe(false);
  });
  it("accepts improvements and does not accept incomplete or non-finite samples", () => {
    expect(evaluateMotionPerformance([startup("baseline", 500), startup("current", 300)], []).passed).toBe(true);
    expect(evaluateMotionPerformance([startup("baseline", 500, 1), startup("current", 300, 1)], []).passed).toBe(false);
    expect(evaluateMotionPerformance([], [cpu("baseline", "reduced", 2), cpu("current", "reduced", NaN)]).passed).toBe(false);
  });
  it("rejects missing, duplicated, unknown and empty pairs instead of treating absence as zero", () => {
    expect(() => evaluateMotionPerformance([startup("current", 300)], [])).toThrow("Missing paired measurement");
    expect(() => evaluateMotionPerformance([startup("current", 300), startup("current", 300)], [])).toThrow("Duplicate");
    expect(() => evaluateMotionPerformance([], [cpu("other", "idle", 2)])).toThrow("Unknown");
    expect(() => evaluateMotionPerformance([], [])).toThrow("No paired");
  });
});
