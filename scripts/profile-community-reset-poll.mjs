import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import path from "node:path";
import { createServer } from "vite";

// Exercise the production controller with bounded synthetic transport, never a live service.
const root = path.resolve(".local/qa/provider-insights/824/community-poll");
await mkdir(root, { recursive: true });
const output = await mkdtemp(path.join(root, "run-"));
const server = await createServer({ configFile: false, logLevel: "error", cacheDir: path.join(output, "vite-cache"),
  optimizeDeps: { noDiscovery: true, include: [], entries: [] }, server: { middlewareMode: true } });
try {
  const { createCommunityResetController } = await server.ssrLoadModule("/src/background/community-reset-controller.ts");
  const { normalizeCommunityResetStore, COMMUNITY_RESET_INTERVAL_MS } = await server.ssrLoadModule("/src/shared/community-reset-feeds.ts");
  let now = Date.parse("2026-10-13T06:00:00Z"), store = normalizeCommunityResetStore(undefined), limited = false;
  const requests = [], samples = [], alarms = [];
  const controller = createCommunityResetController({
    readStore: async () => store, writeStore: async (next) => { store = next; },
    suppressed: async () => false, hostAccess: async () => true,
    schedule: async (enabled) => { alarms.push(enabled); }, now: () => now,
    fetcher: async (url, init) => {
      const headers = Object.fromEntries(new Headers(init.headers));
      assert.equal(init.method, "GET"); assert.equal(init.credentials, "omit");
      assert.equal(init.referrerPolicy, "no-referrer"); assert.equal(init.redirect, "error");
      assert(!("authorization" in headers)); assert.equal(init.body, undefined);
      assert.match(url, /^https:\/\/codex-resets?\.com\/api\//);
      const request = { url, headers, credentials: init.credentials, referrerPolicy: init.referrerPolicy, responseBytes: 0 };
      requests.push(request);
      await new Promise((resolve) => setTimeout(resolve, 5));
      if (limited) return new Response(null, { status: 429, headers: { "retry-after": "3600" } });
      if (headers["if-none-match"]) return new Response(null, { status: 304 });
      const generated = new Date(now).toISOString();
      const body = JSON.stringify(url.includes("/v1/")
        ? { meta: { api_version: "v1", generated_at: generated }, data: url.includes("status") ? { latest_reset: null, scheduled_reset: null, active_watch: null } : [] }
        : url.includes("timeline") ? { events: [] } : { updated_at: generated, probabilities: { rounded_24h: 19, rounded_48h: 34 } });
      request.responseBytes = Buffer.byteLength(body);
      return new Response(body, { headers: { "content-type": "application/json", etag: '"synthetic-public-v1"' } });
    },
  });
  async function sample(id, expected) {
    const start = performance.now(), cpu = process.cpuUsage(), before = requests.length;
    await Promise.all(Array.from({ length: 50 }, () => controller.poll()));
    const used = process.cpuUsage(cpu), count = requests.length - before;
    assert.equal(count, expected, id);
    samples.push({ id, simultaneousPolls: 50, requests: count, responseBytes: requests.slice(before).reduce((sum, request) => sum + request.responseBytes, 0),
      wallMs: performance.now() - start, processCpuMs: (used.user + used.system) / 1000 });
  }
  await sample("initial-off", 0);
  await controller.handle({ type: "community-resets:update", preferences: { mode: "in_app", sources: ["codex-resets", "codex-reset"] } });
  await sample("first-enabled", 4);
  for (let minute = 1; minute < 5; minute++) { now += 60_000; await sample(`cached-minute-${minute}`, 0); }
  now += 60_000; await sample("five-minute-conditional", 4);
  assert(requests.slice(4).every((request) => request.headers["if-none-match"] === '"synthetic-public-v1"'));
  await controller.handle({ type: "community-resets:update", preferences: { mode: "in_app", sources: ["codex-reset"] } });
  now += COMMUNITY_RESET_INTERVAL_MS; await sample("one-selected-source", 2);
  limited = true; now += COMMUNITY_RESET_INTERVAL_MS; await sample("rate-limit", 2);
  now += COMMUNITY_RESET_INTERVAL_MS; await sample("retry-after-backoff", 0);
  await controller.handle({ type: "community-resets:update", preferences: { mode: "off", sources: ["codex-reset"] } });
  await sample("disabled-again", 0); assert.equal(alarms.at(-1), false);
  await writeFile(path.join(output, "result.json"), JSON.stringify({ passed: true, synthetic: true,
    scope: "Node production-controller microprofile; excludes real network latency, browser worker/OS CPU and personal provider refresh cost. Baseline has no community feature; default-off packaged startup/renderer cost is measured separately.",
    intervalMs: COMMUNITY_RESET_INTERVAL_MS, samples, requests }, null, 2));
  console.log(`PASS: coalescing, selected-only, five-minute cache, conditional requests, backoff, off=0. Evidence: ${output}`);
} finally { await server.close(); }
