import { appendFile, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createCodexObservedEstimator, createCodexUsageCounter, priceCodexTokenDelta } from "./codex-observed-equivalent.mjs";

const roots = [];
afterEach(async () => { await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true }))); });

function event(model, input, cached, output, time = "2026-09-24T10:01:00.000Z") {
  return [
    { timestamp: time, type: "turn_context", payload: { model, service_tier: "default" } },
    { timestamp: time, type: "event_msg", payload: { type: "token_count", info: { total_token_usage: { input_tokens: input, cached_input_tokens: cached, output_tokens: output } } } },
  ];
}
function sessionMeta(accountId = "account-a", forkedFromId = null) {
  return { timestamp: "2026-09-24T10:00:01.000Z", type: "session_meta", payload: { creator_account_id: accountId, forked_from_id: forkedFromId } };
}
function quota(usedPercent, accountId = "account-a", resetAt = "2026-09-30T10:00:00.000Z") {
  return { accountId, windows: [{ id: "primary", usedPercent, resetAt }] };
}

describe("Codex observed API equivalent", () => {
  it("prices only known models and proven Fast tier, without counting cached input twice", () => {
    expect(priceCodexTokenDelta("gpt-5.3-codex", "default", { input_tokens: 1_000_000, cached_input_tokens: 500_000, output_tokens: 100_000 })).toBeCloseTo(2.3625);
    expect(priceCodexTokenDelta("gpt-5.3-codex", "fast", { input_tokens: 1_000_000, cached_input_tokens: 500_000, output_tokens: 100_000 })).toBeCloseTo(4.725);
    expect(priceCodexTokenDelta("gpt-5.4", "default", { input_tokens: 300_000, cached_input_tokens: 0, output_tokens: 10_000 })).toBeNull();
    expect(priceCodexTokenDelta("gpt-5.4", "default", { input_tokens: 300_000, cached_input_tokens: 0, output_tokens: 10_000, singleCall: true })).toBeCloseTo(1.725);
    expect(priceCodexTokenDelta("unknown-model", "default", { input_tokens: 1, cached_input_tokens: 0, output_tokens: 1 })).toBeNull();
    expect(priceCodexTokenDelta("gpt-5.6-sol", "default", { input_tokens: 1, cached_input_tokens: 0, output_tokens: 1 })).toBeNull();
  });

  it("uses cumulative deltas and ignores repeated rate-limit-only token events", () => {
    const counter = createCodexUsageCounter();
    const [context, first] = event("gpt-5.3-codex", 1000, 200, 100);
    const [, second] = event("gpt-5.3-codex", 2000, 400, 200);
    expect(counter.ingest(context)).toEqual({ cost: 0, gap: false });
    expect(counter.ingest(first)).toEqual({ cost: 0, gap: false });
    const priced = counter.ingest(second);
    expect(priced.cost).toBeGreaterThan(0);
    expect(counter.ingest(second)).toEqual({ cost: 0, gap: false });
    const [, reset] = event("gpt-5.3-codex", 1, 0, 1);
    expect(counter.ingest(reset).gap).toBe(true);
  });

  it("requires a matching per-call token record before pricing long context", () => {
    const counter = createCodexUsageCounter();
    const [context, first] = event("gpt-5.4", 1000, 0, 100);
    counter.ingest(context);
    counter.ingest(first);
    const [, second] = event("gpt-5.4", 301_000, 0, 10_100);
    expect(counter.ingest(second)).toMatchObject({ cost: 0, gap: true, unpriced: true });
    const pricedCounter = createCodexUsageCounter();
    pricedCounter.ingest(context);
    pricedCounter.ingest(first);
    const matching = { ...second, payload: { ...second.payload, info: { ...second.payload.info, last_token_usage: { input_tokens: 300_000, cached_input_tokens: 0, output_tokens: 10_000 } } } };
    expect(pricedCounter.ingest(matching).cost).toBeGreaterThan(0);
  });

  it("does not price another account or replayed fork history", () => {
    const counter = createCodexUsageCounter();
    const [context, first] = event("gpt-5.3-codex", 1000, 0, 100);
    const [, second] = event("gpt-5.3-codex", 2000, 0, 200);
    const unknown = createCodexUsageCounter();
    unknown.ingest(context);
    expect(unknown.ingest(first, "account-a")).toMatchObject({ cost: 0, gap: true, unpriced: true });
    counter.ingest(sessionMeta("account-b"));
    counter.ingest(context);
    expect(counter.ingest(first, "account-a")).toEqual({ cost: 0, gap: false });
    expect(counter.ingest(second, "account-a")).toEqual({ cost: 0, gap: false });
    counter.ingest(sessionMeta("account-a", "parent-id"));
    counter.ingest(context);
    expect(counter.ingest(first, "account-a")).toMatchObject({ cost: 0, gap: true, unpriced: true });
  });

  it("learns only from new records after pairing and five percentage points, then resets on gaps and account changes", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "codex-estimate-"));
    roots.push(root);
    const folder = path.join(root, "sessions", "2026", "09", "24");
    await mkdir(folder, { recursive: true });
    const file = path.join(folder, "rollout-test.jsonl");
    await writeFile(file, `${JSON.stringify(sessionMeta())}\n${event("gpt-5.3-codex", 9_000_000, 0, 500_000).map((line) => JSON.stringify(line)).join("\n")}\n`);
    const estimator = createCodexObservedEstimator({ codexHome: root, now: () => new Date("2026-09-24T10:00:00.000Z") });
    await estimator.start();
    await appendFile(file, `${event("gpt-5.3-codex", 1000, 100, 100).map((line) => JSON.stringify(line)).join("\n")}\n`);
    expect((await estimator.sample(quota(80)))[0].status).toBe("learning");
    const [, next] = event("gpt-5.3-codex", 101_000, 10_100, 20_100);
    await appendFile(file, `${JSON.stringify(next)}\n`);
    expect((await estimator.sample(quota(84)))[0].status).toBe("learning");
    const ready = (await estimator.sample(quota(85)))[0];
    expect(ready.status).toBe("ready");
    expect(ready.sampleCount).toBe(1);
    expect(ready.confidence).toBe("low");
    expect(ready.fullEquivalentUsd).toBeGreaterThan(ready.usedEquivalentUsd);
    expect((await estimator.sample(quota(86, "account-b")))[0].status).toBe("learning");
    expect((await estimator.sample(quota(90, "account-b", "2026-10-07T10:00:00.000Z")))[0].status).toBe("learning");
    const [unknownContext, unknownUsage] = event("unknown-model", 102_000, 10_200, 20_200);
    const [, nextUnknownUsage] = event("unknown-model", 103_000, 10_300, 20_300);
    await appendFile(file, `${JSON.stringify(sessionMeta("account-b"))}\n${JSON.stringify(unknownContext)}\n${JSON.stringify(unknownUsage)}\n${JSON.stringify(nextUnknownUsage)}\n`);
    expect((await estimator.sample(quota(95, "account-b", "2026-10-07T10:00:00.000Z")))[0].status).toBe("unpriced");
  });

  it("keeps subagent logs separate and never backfills them after restart", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "codex-estimate-"));
    roots.push(root);
    const folder = path.join(root, "sessions", "2026", "09", "24");
    await mkdir(folder, { recursive: true });
    const now = () => new Date("2026-09-24T10:00:00.000Z");
    const estimator = createCodexObservedEstimator({ codexHome: root, now });
    await estimator.start();
    await writeFile(path.join(folder, "rollout-parent.jsonl"), `${JSON.stringify(sessionMeta())}\n${event("gpt-5.3-codex", 100, 0, 10).map((line) => JSON.stringify(line)).join("\n")}\n`);
    await writeFile(path.join(folder, "rollout-child.jsonl"), `${JSON.stringify(sessionMeta("account-a"))}\n${event("gpt-5.3-codex", 200, 0, 20).map((line) => JSON.stringify(line)).join("\n")}\n`);
    expect((await estimator.sample(quota(70)))[0].status).toBe("learning");
    await estimator.start();
    expect((await estimator.sample(quota(75)))[0].status).toBe("learning");
  });

  it("does not count malformed timestamps as post-pairing observations", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "codex-estimate-"));
    roots.push(root);
    const folder = path.join(root, "sessions", "2026", "09", "24");
    await mkdir(folder, { recursive: true });
    const file = path.join(folder, "rollout-test.jsonl");
    const estimator = createCodexObservedEstimator({ codexHome: root, now: () => new Date("2026-09-24T10:00:00.000Z") });
    await estimator.start();
    await writeFile(file, `${JSON.stringify(sessionMeta())}\n${event("gpt-5.3-codex", 1000, 0, 100, "invalid").map((line) => JSON.stringify(line)).join("\n")}\n`);
    expect((await estimator.sample(quota(70)))[0].status).toBe("learning");
    const [, usage] = event("gpt-5.3-codex", 101_000, 0, 10_100);
    await appendFile(file, `${JSON.stringify(usage)}\n`);
    expect((await estimator.sample(quota(76)))[0].status).toBe("learning");
  });
});
