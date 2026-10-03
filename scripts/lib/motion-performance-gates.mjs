import assert from "node:assert/strict";

export function resolveMotionSampling({ smoke = false, startupCount, cpuCount } = {}) {
  if (smoke) {
    assert(startupCount === undefined && cpuCount === undefined, "Smoke uses fixed preliminary sample counts");
    return { repeats: 1, cpuRepeats: 1, intervalMs: 1000 };
  }
  const repeats = Number(startupCount ?? 10);
  const cpuRepeats = Number(cpuCount ?? 3);
  assert(Number.isInteger(repeats) && repeats >= 10 && repeats <= 100, "Startup repeats must be an integer from 10 to 100");
  assert(Number.isInteger(cpuRepeats) && cpuRepeats >= 3 && cpuRepeats <= 12, "CPU repeats must be an integer from 3 to 12");
  return { repeats, cpuRepeats, intervalMs: 30000 };
}

export function evaluateMotionPerformance(startup, cpu) {
  const results = [];
  const pair = (rows, key) => {
    const groups = new Map();
    for (const row of rows) {
      assert(["baseline", "current"].includes(row.variant), "Unknown benchmark variant");
      const id = key(row);
      const group = groups.get(id) ?? {};
      assert(!group[row.variant], `Duplicate benchmark variant: ${id}/${row.variant}`);
      group[row.variant] = row;
      groups.set(id, group);
    }
    for (const [id, group] of groups) assert(group.baseline && group.current, `Missing paired measurement: ${id}`);
    return groups;
  };
  const validSummary = (summary, count) => summary?.count >= count &&
    Number.isFinite(summary.median) && summary.median >= 0;
  for (const [id, { baseline, current }] of pair(startup, (row) => `${row.locale}-${row.width}-${row.count}`)) {
    for (const kind of ["cold", "warm"]) {
      const before = baseline[`${kind}Summary`];
      const after = current[`${kind}Summary`];
      const valid = validSummary(before, 10) && validSummary(after, 10);
      const limit = valid ? Math.max(before.median * 0.1, 50) : null;
      const increment = valid ? after.median - before.median : null;
      results.push({ id, kind, unit: "ms", baseline: before?.median, current: after?.median,
        increment, limit, samplesValid: valid, passed: valid && increment <= limit });
    }
  }
  for (const [id, { baseline, current }] of pair(cpu, (row) => row.id)) {
    assert(["idle", "glide", "hover-paused", "reduced"].includes(id), "Unknown CPU scenario");
    const valid = validSummary(baseline.summary, 3) && validSummary(current.summary, 3);
    const limit = valid ? id === "glide" ? baseline.summary.median * 0.1 : 0.5 : null;
    const increment = valid ? current.summary.median - baseline.summary.median : null;
    results.push({ id, kind: "cpu", unit: "single-core percentage points", baseline: baseline.summary?.median,
      current: current.summary?.median, increment, limit, samplesValid: valid, passed: valid && increment <= limit });
  }
  assert(results.length > 0, "No paired measurements");
  return { passed: results.every((result) => result.passed), results };
}
