import { lstat, open, readdir, realpath } from "node:fs/promises";
import path from "node:path";

export const CODEX_PRICE_DATE = "2026-09-24";
export const CODEX_PRICE_SOURCE = "https://developers.openai.com/api/docs/pricing";
const MAX_FILES = 1000;
const MAX_APPEND_BYTES = 1024 * 1024;

// USD per million tokens, pinned to the cited official price date.
const PRICES = Object.freeze({
  "gpt-5.3-codex": { input: 1.75, cached: 0.175, output: 14, fast: { input: 3.5, cached: 0.35, output: 28 } },
  "gpt-5.2-codex": { input: 1.75, cached: 0.175, output: 14 },
  "gpt-5.1-codex": { input: 1.25, cached: 0.125, output: 10 },
  "gpt-5.1-codex-mini": { input: 0.25, cached: 0.025, output: 2 },
  "gpt-5-codex": { input: 1.25, cached: 0.125, output: 10 },
  "gpt-5.4": { input: 2.5, cached: 0.25, output: 15, long: { input: 5, cached: 0.5, output: 22.5 } },
  "gpt-5.5": { input: 5, cached: 0.5, output: 30, long: { input: 10, cached: 1, output: 45 } },
  "gpt-5.6-sol": { input: 4, cached: 0.4, cacheWrite: 5, output: 20, long: { input: 8, cached: 0.8, cacheWrite: 10, output: 30 } },
});

function nonnegative(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

export function priceCodexTokenDelta(model, serviceTier, usage) {
  const known = PRICES[model];
  if (!known || !usage || !nonnegative(usage.input_tokens) || !nonnegative(usage.cached_input_tokens) || !nonnegative(usage.output_tokens)) return null;
  if (usage.cached_input_tokens > usage.input_tokens) return null;
  if (serviceTier && !["default", "standard", "fast", "priority"].includes(serviceTier)) return null;
  const isFast = serviceTier === "fast" || serviceTier === "priority";
  const input = usage.input_tokens;
  if (known.long && input > 272_000 && usage.singleCall !== true) return null;
  const rates = isFast ? known.fast : known.long && input > 272_000 ? known.long : known;
  if (!rates) return null;
  const write = usage.cache_write_input_tokens ?? 0;
  if (!nonnegative(write) || write > input - usage.cached_input_tokens) return null;
  if (known.cacheWrite && usage.cache_write_input_tokens === undefined) return null;
  if (write > 0 && rates.cacheWrite === undefined) return null;
  const normalInput = input - usage.cached_input_tokens - write;
  return (normalInput * rates.input + usage.cached_input_tokens * rates.cached + write * (rates.cacheWrite ?? 0) + usage.output_tokens * rates.output) / 1_000_000;
}

function usageCounters(raw) {
  if (!raw || !nonnegative(raw.input_tokens) || !nonnegative(raw.cached_input_tokens) || !nonnegative(raw.output_tokens)) return null;
  if (raw.cached_input_tokens > raw.input_tokens) return null;
  const write = raw.cache_write_input_tokens;
  if (write !== undefined && (!nonnegative(write) || write > raw.input_tokens - raw.cached_input_tokens)) return null;
  return { input_tokens: raw.input_tokens, cached_input_tokens: raw.cached_input_tokens, output_tokens: raw.output_tokens, ...(write === undefined ? {} : { cache_write_input_tokens: write }) };
}

export function createCodexUsageCounter() {
  let prior = null;
  let model = null;
  let serviceTier = null;
  let creatorAccountId = null;
  let forked = false;
  return {
    ingest(line, expectedAccountId = null) {
      if (!line || typeof line !== "object") return { cost: 0, gap: false };
      if (line.type === "session_meta") {
        creatorAccountId = typeof line.payload?.creator_account_id === "string" ? line.payload.creator_account_id : null;
        forked = typeof line.payload?.forked_from_id === "string" && line.payload.forked_from_id.length > 0;
        prior = null;
        model = null;
        serviceTier = null;
        return { cost: 0, gap: false };
      }
      if (line.type === "turn_context") {
        model = typeof line.payload?.model === "string" ? line.payload.model : null;
        serviceTier = line.payload?.service_tier ?? null;
        return { cost: 0, gap: false };
      }
      if (line.type === "event_msg" && line.payload?.type === "thread_settings_applied") {
        const settings = line.payload.thread_settings;
        model = typeof settings?.model === "string" ? settings.model : null;
        serviceTier = settings?.service_tier ?? null;
        return { cost: 0, gap: false };
      }
      if (line.type !== "event_msg" || line.payload?.type !== "token_count" || !line.payload.info) return { cost: 0, gap: false };
      const current = usageCounters(line.payload.info.total_token_usage);
      if (!current) return { cost: 0, gap: true };
      if (expectedAccountId && creatorAccountId !== expectedAccountId) {
        prior = current;
        return creatorAccountId ? { cost: 0, gap: false } : { cost: 0, gap: true, unpriced: true };
      }
      if (forked) {
        prior = current;
        return { cost: 0, gap: true, unpriced: true };
      }
      if (!prior) { prior = current; return { cost: 0, gap: false }; }
      const delta = {};
      for (const field of ["input_tokens", "cached_input_tokens", "output_tokens", "cache_write_input_tokens"]) {
        if (current[field] === undefined && prior[field] === undefined) continue;
        if (current[field] === undefined || prior[field] === undefined || current[field] < prior[field]) {
          prior = current;
          return { cost: 0, gap: true };
        }
        delta[field] = current[field] - prior[field];
      }
      prior = current;
      if (Object.values(delta).every((value) => value === 0)) return { cost: 0, gap: false };
      const last = usageCounters(line.payload.info.last_token_usage);
      const singleCall = last !== null && ["input_tokens", "cached_input_tokens", "output_tokens", "cache_write_input_tokens"]
        .every((field) => last[field] === delta[field]);
      const cost = priceCodexTokenDelta(model, serviceTier, { ...delta, singleCall });
      return cost === null ? { cost: 0, gap: true, unpriced: true } : { cost, gap: false };
    },
  };
}

async function dateFolders(root, firstDay, lastDay) {
  const folders = [];
  for (let time = firstDay; time <= lastDay; time += 86_400_000) {
    const date = new Date(time);
    folders.push(path.join(root, "sessions", date.getUTCFullYear().toString(), String(date.getUTCMonth() + 1).padStart(2, "0"), String(date.getUTCDate()).padStart(2, "0")));
  }
  return folders;
}

export function createCodexObservedEstimator({ codexHome, now = () => new Date() }) {
  const files = new Map();
  let startedAt = null;
  let accountId = null;
  let totalCost = 0;
  let pricedEvents = 0;
  let generation = 0;
  const anchors = new Map();
  let gap = false;
  let unpriced = false;

  async function discover() {
    const startDay = Date.parse(startedAt.slice(0, 10));
    const endDay = Date.parse(now().toISOString().slice(0, 10));
    if (endDay < startDay) throw new Error("codex_log_range_invalid");
    const seen = [];
    for (const folder of await dateFolders(codexHome, Math.max(startDay, endDay - 8 * 86_400_000), endDay)) {
      let names;
      try {
        const resolved = await realpath(folder);
        if (!resolved.startsWith(`${codexHome}${path.sep}`)) throw new Error("codex_log_path_outside_home");
        names = await readdir(folder);
      } catch (error) {
        if (error.code === "ENOENT") continue;
        throw error;
      }
      for (const name of names) {
        if (!/^rollout-[\w.-]+\.jsonl$/u.test(name)) continue;
        seen.push(path.join(folder, name));
        if (seen.length > MAX_FILES) throw new Error("codex_too_many_logs");
      }
    }
    for (const file of files.keys()) {
      if (!seen.includes(file)) seen.push(file);
    }
    return seen;
  }

  async function inspect(filePath, isBaseline) {
    const metadata = await lstat(filePath);
    if (!metadata.isFile()) return;
    const resolved = await realpath(filePath);
    if (!resolved.startsWith(`${codexHome}${path.sep}`)) throw new Error("codex_log_path_outside_home");
    let file = files.get(filePath);
    if (!file) {
      file = { offset: isBaseline ? metadata.size : 0, remainder: Buffer.alloc(0), counter: createCodexUsageCounter(), inode: metadata.ino };
      files.set(filePath, file);
      if (isBaseline) {
        const handle = await open(filePath, "r");
        try {
          const bytes = Buffer.alloc(Math.min(metadata.size, 64 * 1024));
          const { bytesRead } = await handle.read(bytes, 0, bytes.length, 0);
          const newline = bytes.subarray(0, bytesRead).indexOf(10);
          if (newline >= 0) {
            const header = JSON.parse(bytes.subarray(0, newline).toString("utf8"));
            if (header?.type === "session_meta") file.counter.ingest(header);
          }
        } catch { /* An unreadable header stays unverified; no historical usage is counted. */ }
        finally { await handle.close(); }
        return;
      }
    }
    if (metadata.ino !== file.inode || metadata.size < file.offset) {
      file.offset = metadata.size;
      file.remainder = Buffer.alloc(0);
      file.counter = createCodexUsageCounter();
      file.inode = metadata.ino;
      gap = true;
      return;
    }
    const size = metadata.size - file.offset;
    if (!size) return;
    if (size > MAX_APPEND_BYTES) {
      file.offset = metadata.size;
      file.remainder = Buffer.alloc(0);
      gap = true;
      return;
    }
    const handle = await open(filePath, "r");
    let bytes;
    try {
      const buffer = Buffer.alloc(size);
      const { bytesRead } = await handle.read(buffer, 0, size, file.offset);
      if (bytesRead !== size) { gap = true; return; }
      bytes = Buffer.concat([file.remainder, buffer]);
    } finally { await handle.close(); }
    file.offset += size;
    let start = 0;
    const lines = [];
    for (let index = 0; index < bytes.length; index += 1) {
      if (bytes[index] !== 10) continue;
      lines.push(bytes.subarray(start, index).toString("utf8"));
      start = index + 1;
    }
    file.remainder = Buffer.from(bytes.subarray(start));
    if (file.remainder.length > 64 * 1024) { file.remainder = Buffer.alloc(0); gap = true; }
    for (const line of lines) {
      if (!line) continue;
      try {
        const event = JSON.parse(line);
        const eventTime = typeof event?.timestamp === "string" ? Date.parse(event.timestamp) : NaN;
        if (!Number.isFinite(eventTime) || eventTime < Date.parse(startedAt)) continue;
        const result = file.counter.ingest(event, accountId);
        totalCost += result.cost;
        if (result.cost > 0) pricedEvents += 1;
        if (result.cost > 0) unpriced = false;
        if (result.gap) gap = true;
        if (result.unpriced) unpriced = true;
      } catch { gap = true; }
    }
  }

  return {
    async start() {
      startedAt = now().toISOString();
      files.clear();
      anchors.clear();
      accountId = null;
      totalCost = 0;
      pricedEvents = 0;
      generation = 0;
      gap = false;
      unpriced = false;
      for (const file of await discover()) await inspect(file, true);
    },
    async sample(quota) {
      if (!startedAt) throw new Error("codex_not_paired");
      if (!quota.accountId) return quota.windows.map((window) => ({ windowId: window.id, status: "unverified" }));
      if (accountId !== quota.accountId) {
        accountId = quota.accountId;
        anchors.clear();
        generation += 1;
      }
      try { for (const file of await discover()) await inspect(file, false); }
      catch { gap = true; }
      if (gap) {
        anchors.clear();
        generation += 1;
        gap = false;
      }
      return quota.windows.map((window) => {
        const key = `${window.id}\0${window.resetAt ?? ""}`;
        const anchor = anchors.get(key);
        if (!anchor || anchor.generation !== generation || window.usedPercent < anchor.usedPercent) {
          anchors.set(key, { usedPercent: window.usedPercent, totalCost, pricedEvents, generation });
          return { windowId: window.id, status: unpriced ? "unpriced" : "learning" };
        }
        const movement = window.usedPercent - anchor.usedPercent;
        const observedCost = totalCost - anchor.totalCost;
        if (unpriced) return { windowId: window.id, status: "unpriced" };
        if (movement < 5 || observedCost <= 0) return { windowId: window.id, status: "learning" };
        const full = observedCost * 100 / movement;
        return {
          windowId: window.id,
          status: "ready",
          usedEquivalentUsd: full * window.usedPercent / 100,
          fullEquivalentUsd: full,
          fullLowerUsd: observedCost * 100 / Math.min(100, movement + 1),
          fullUpperUsd: observedCost * 100 / Math.max(1, movement - 1),
          observedCostUsd: observedCost,
          observedPercentPoints: movement,
          sampleCount: Math.min(1_000_000, pricedEvents - anchor.pricedEvents),
          confidence: pricedEvents - anchor.pricedEvents >= 3 ? "medium" : "low",
          priceDate: CODEX_PRICE_DATE,
        };
      });
    },
  };
}
