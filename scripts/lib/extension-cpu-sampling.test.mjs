import { describe, expect, it } from "vitest";
import { collectDescendants, isExtensionRenderer, parseCpuTicks, parseProcessCpuIdentity, processCpuDelta, sampleRendererCpu } from "./extension-cpu-sampling.mjs";
import { summarizeMeasurements } from "./performance-statistics.mjs";

describe("owned renderer CPU samples", () => {
  it("does not include unrelated extension renderers", () => {
    const rows = [{ pid: 1, ppid: 0 }, { pid: 2, ppid: 1 }, { pid: 3, ppid: 2, args: "--type=renderer --extension-process" }, { pid: 4, ppid: 0, args: "--type=renderer --extension-process" }];
    expect(collectDescendants(rows, 1).map((row) => row.pid)).toEqual([2, 3]);
    expect(isExtensionRenderer(rows[2])).toBe(true);
    expect(isExtensionRenderer({ args: "--type=renderer" })).toBe(false);
  });
  it("parses process names containing spaces and parentheses", () => {
    expect(parseCpuTicks(`42 (chrome (renderer)) ${["R", ...Array(10).fill("0"), "123", "7"].join(" ")}`)).toBe(130);
    expect(parseCpuTicks("bad")).toBeNull();
  });
  it("reports missing samples as unknown, never zero", async () => {
    expect(await sampleRendererCpu(async () => [], { intervalMs: 1, clockTicksPerSecond: 100 }))
      .toMatchObject({ cpuPercent: null, coverageComplete: false, pids: [] });
  });
  it("rejects a reused PID even when its new tick count increased", () => {
    const before = { startedAt: "100", ticks: 20 };
    expect(processCpuDelta(before, { startedAt: "200", ticks: 30 })).toBeNull();
    expect(processCpuDelta(before, { startedAt: "100", ticks: 30 })).toBe(10);
    expect(processCpuDelta(before, { startedAt: "100", ticks: 10 })).toBeNull();
    expect(processCpuDelta(null, before)).toBeNull();
    expect(parseProcessCpuIdentity("bad")).toBeNull();
    expect(parseProcessCpuIdentity(`42 (renderer) ${["R", ...Array(10).fill("0"), "123", "7", ...Array(6).fill("0"), "987654"].join(" ")}`)).toEqual({ ticks: 130, startedAt: "987654" });
  });
  it("summarizes finite values with nearest-rank p95 and explicit noise", () => {
    expect(summarizeMeasurements([1, 2, 3, 4, null, NaN])).toEqual({ count: 4, median: 2.5, p95: 4, min: 1, max: 4, spread: 3 });
    expect(summarizeMeasurements([]).median).toBeNull();
  });
});
