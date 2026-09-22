import { mkdtemp, rm, symlink, utimes, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  fetchLocalCompanionBridgeHealth,
  fetchLocalCompanionBridgeSource,
  fetchLocalCompanionBridgeSourceIndex,
  pairLocalCompanionBridge,
  revokeLocalCompanionBridgePairing,
} from "../../src/shared/local-companion-bridge";
import { createLocalCompanionBridge } from "./local-companion-bridge-server.mjs";

const runningBridges = [];
const tempDirectories = [];

async function createSourceFile(payload = {}) {
  const directory = await mkdtemp(path.join(tmpdir(), "ai-usage-bridge-"));
  tempDirectories.push(directory);
  const filePath = path.join(directory, "source.json");
  await writeFile(
    filePath,
    JSON.stringify({
      schema: "ai-usage-dashboard.custom-source.v1",
      id: "build",
      label: "Build quota",
      status: "ok",
      quota: { unit: "minutes", remaining: 90, total: 100 },
      ...payload,
    }),
  );
  return filePath;
}

async function createCcusageFile(payload) {
  const directory = await mkdtemp(path.join(tmpdir(), "ai-usage-ccusage-"));
  tempDirectories.push(directory);
  const filePath = path.join(directory, "daily.json");
  await writeFile(filePath, JSON.stringify(payload));
  return filePath;
}

function ccusageDailyRow(overrides = {}) {
  return {
    date: "2026-09-20",
    inputTokens: 10,
    outputTokens: 20,
    cacheCreationTokens: 30,
    cacheReadTokens: 40,
    totalTokens: 100,
    totalCost: 1.25,
    ...overrides,
  };
}

async function startBridge(options = {}) {
  const filePath = options.filePath ?? (await createSourceFile());
  const bridge = createLocalCompanionBridge({
    host: "127.0.0.1",
    port: 0,
    sources: [
      { sourceId: "custom:build", label: "Build quota", filePath },
    ],
    ...options,
  });
  runningBridges.push(bridge);
  const address = await bridge.start();
  return { bridge, address, filePath };
}

afterEach(async () => {
  await Promise.all(runningBridges.splice(0).map((bridge) => bridge.stop()));
  await Promise.all(
    tempDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe("experimental local companion bridge", () => {
  it("returns fixed errors for malformed request paths without terminating the bridge", async () => {
    const { address } = await startBridge();
    expect((await fetch(`${address.baseUrl}//[`)).status).toBe(400);
    const paired = await pairLocalCompanionBridge(address.baseUrl, address.pairingCode);
    expect(paired.ok).toBe(true);
    const response = await fetch(`${address.baseUrl}/v1/sources/%`, { headers: { Authorization: `Bearer ${paired.value}` } });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "invalid_source_id" });
    expect(await fetchLocalCompanionBridgeHealth(address.baseUrl, paired.value)).toMatchObject({ ok: true });
  });
  it("pairs once and serves authenticated, validated custom-source data", async () => {
    const { address } = await startBridge();

    await expect(
      fetch(`${address.baseUrl}/v1/health`),
    ).resolves.toMatchObject({ status: 401 });
    const paired = await pairLocalCompanionBridge(
      address.baseUrl,
      address.pairingCode,
    );
    expect(paired).toMatchObject({ ok: true });
    if (!paired.ok) {
      throw new Error("Pairing failed in integration test.");
    }

    await expect(
      pairLocalCompanionBridge(address.baseUrl, address.pairingCode),
    ).resolves.toMatchObject({ ok: false, statusCode: 409 });
    await expect(
      fetchLocalCompanionBridgeHealth(address.baseUrl, paired.value),
    ).resolves.toMatchObject({ ok: true, value: { sourceCount: 1 } });
    await expect(
      fetchLocalCompanionBridgeSourceIndex(address.baseUrl, paired.value),
    ).resolves.toMatchObject({
      ok: true,
      value: {
        sources: [{ sourceId: "custom:build", label: "Build quota" }],
      },
    });
    await expect(
      fetchLocalCompanionBridgeSource(
        address.baseUrl,
        paired.value,
        "custom:build",
      ),
    ).resolves.toMatchObject({
      ok: true,
      value: { remaining: 90, total: 100 },
    });
  });

  it("revokes the bearer token and rotates to a new one-time code", async () => {
    const observedCodes = [];
    const { bridge, address } = await startBridge({
      onPairingCode: (code) => observedCodes.push(code),
    });
    const paired = await pairLocalCompanionBridge(
      address.baseUrl,
      address.pairingCode,
    );
    if (!paired.ok) {
      throw new Error("Pairing failed in integration test.");
    }

    await expect(
      revokeLocalCompanionBridgePairing(address.baseUrl, paired.value),
    ).resolves.toEqual({ ok: true, value: true });
    await expect(
      fetchLocalCompanionBridgeHealth(address.baseUrl, paired.value),
    ).resolves.toMatchObject({ ok: false, code: "unauthorized" });
    expect(bridge.getPairingCode()).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/u);
    expect(observedCodes).toEqual([bridge.getPairingCode()]);
  });

  it("rejects malformed and oversized explicitly configured files", async () => {
    const { address, filePath } = await startBridge();
    const paired = await pairLocalCompanionBridge(
      address.baseUrl,
      address.pairingCode,
    );
    if (!paired.ok) {
      throw new Error("Pairing failed in integration test.");
    }

    await writeFile(filePath, "{not-json");
    await expect(
      fetchLocalCompanionBridgeSource(
        address.baseUrl,
        paired.value,
        "custom:build",
      ),
    ).resolves.toMatchObject({ ok: false, statusCode: 422 });

    await writeFile(filePath, "x".repeat(128 * 1024 + 1));
    await expect(
      fetchLocalCompanionBridgeSource(
        address.baseUrl,
        paired.value,
        "custom:build",
      ),
    ).resolves.toMatchObject({ ok: false, statusCode: 413 });
  });

  it("serves only the converted ccusage payload with file mtime provenance", async () => {
    const filePath = await createCcusageFile({
      daily: [
        ccusageDailyRow({
          accountId: "secret-account-sentinel",
          modelBreakdowns: [{ modelName: "secret-model-sentinel" }],
        }),
      ],
      totals: {},
    });
    const mtime = new Date("2026-09-23T01:02:03.000Z");
    await utimes(filePath, mtime, mtime);
    const source = {
      sourceId: "custom:usage",
      label: "ccusage daily",
      filePath,
      format: "ccusage-daily.v1",
    };
    const { address } = await startBridge({ filePath, sources: [source] });
    source.filePath = "/not-the-configured-file";
    const paired = await pairLocalCompanionBridge(address.baseUrl, address.pairingCode);
    if (!paired.ok) {
      throw new Error("Pairing failed in integration test.");
    }

    await expect(
      fetchLocalCompanionBridgeSourceIndex(address.baseUrl, paired.value),
    ).resolves.toMatchObject({
      ok: true,
      value: { sources: [{ sourceId: "custom:usage", label: "ccusage usage" }] },
    });

    const response = await fetch(`${address.baseUrl}/v1/sources/custom%3Ausage`, {
      headers: { Authorization: `Bearer ${paired.value}` },
    });
    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      id: "custom:usage",
      syncedAt: mtime.toISOString(),
    });
    expect(payload.windows).toEqual(
      expect.arrayContaining([{ label: "Input tokens", unit: "tokens", used: 10 }]),
    );
    expect(payload.balances).toEqual([
      { label: "Estimated USD cost", unit: "USD", used: 1.25 },
    ]);
    expect(payload.facts).toEqual(
      expect.arrayContaining([
        { label: "Date range", value: "2026-09-20 to 2026-09-20" },
        { label: "Coverage", value: "1 day" },
        { label: "Export modified", value: mtime.toISOString() },
      ]),
    );
    expect(JSON.stringify(payload)).not.toContain("secret-");
    expect(payload).not.toHaveProperty("daily");
    expect(payload).not.toHaveProperty("totals");
    const normalized = await fetchLocalCompanionBridgeSource(
      address.baseUrl,
      paired.value,
      "custom:usage",
    );
    expect(normalized).toMatchObject({
      ok: true,
      value: { sourceId: "custom:usage", syncedAt: mtime.toISOString() },
    });
    if (!normalized.ok) {
      throw new Error("Converted source did not satisfy the custom-source client schema.");
    }
    expect(normalized.value.windows).toEqual(
      expect.arrayContaining([expect.objectContaining({ label: "Input tokens", used: 10 })]),
    );
  });

  it("bounds ccusage files and never follows or exposes unmapped file paths", async () => {
    const filePath = await createCcusageFile({ daily: [], totals: {} });
    const linkPath = path.join(path.dirname(filePath), "daily-link.json");
    await symlink(filePath, linkPath);
    const { address } = await startBridge({
      filePath,
      sources: [
        {
          sourceId: "custom:usage",
          label: "ccusage daily",
          filePath: linkPath,
          format: "ccusage-daily.v1",
        },
      ],
    });
    const paired = await pairLocalCompanionBridge(address.baseUrl, address.pairingCode);
    if (!paired.ok) {
      throw new Error("Pairing failed in integration test.");
    }

    const linked = await fetch(`${address.baseUrl}/v1/sources/custom%3Ausage`, {
      headers: { Authorization: `Bearer ${paired.value}` },
    });
    expect(linked.status).toBe(422);
    expect(await linked.json()).toEqual({ error: "source_invalid" });
    const unmapped = await fetch(`${address.baseUrl}/v1/sources/custom%3Aarbitrary`, {
      headers: { Authorization: `Bearer ${paired.value}` },
    });
    expect(unmapped.status).toBe(404);
    expect(await unmapped.json()).toEqual({ error: "source_not_found" });

    await writeFile(filePath, "x".repeat(1024 * 1024 + 1));
    const oversizedBridge = await startBridge({
      filePath,
      sources: [
        {
          sourceId: "custom:oversized",
          label: "ccusage daily",
          filePath,
          format: "ccusage-daily.v1",
        },
      ],
    });
    const oversizedPair = await pairLocalCompanionBridge(
      oversizedBridge.address.baseUrl,
      oversizedBridge.address.pairingCode,
    );
    if (!oversizedPair.ok) {
      throw new Error("Pairing failed in integration test.");
    }
    const oversized = await fetch(
      `${oversizedBridge.address.baseUrl}/v1/sources/custom%3Aoversized`,
      { headers: { Authorization: `Bearer ${oversizedPair.value}` } },
    );
    expect(oversized.status).toBe(413);
    expect(await oversized.json()).toEqual({ error: "source_too_large" });
  });

  it("rejects web origins even on loopback and enforces request limits", async () => {
    const { address } = await startBridge({ requestsPerMinute: 1 });
    const paired = await pairLocalCompanionBridge(
      address.baseUrl,
      address.pairingCode,
    );
    if (!paired.ok) {
      throw new Error("Pairing failed in integration test.");
    }

    await expect(
      fetch(`${address.baseUrl}/v1/health`, {
        headers: {
          Authorization: `Bearer ${paired.value}`,
          Origin: "https://example.com",
        },
      }),
    ).resolves.toMatchObject({ status: 403 });
    await expect(
      fetchLocalCompanionBridgeHealth(address.baseUrl, paired.value),
    ).resolves.toMatchObject({ ok: true });
    await expect(
      fetchLocalCompanionBridgeHealth(address.baseUrl, paired.value),
    ).resolves.toMatchObject({ ok: false, code: "rate_limited" });
  });

  it("refuses LAN binding, reports port collisions, and stops cleanly", async () => {
    const filePath = await createSourceFile();
    expect(() =>
      createLocalCompanionBridge({
        host: "0.0.0.0",
        port: 47_831,
        sources: [{ sourceId: "build", filePath }],
      }),
    ).toThrow(/127\.0\.0\.1 or ::1/u);

    const first = await startBridge({ filePath });
    const port = Number(new URL(first.address.baseUrl).port);
    const second = createLocalCompanionBridge({
      host: "127.0.0.1",
      port,
      sources: [{ sourceId: "build", filePath }],
    });
    runningBridges.push(second);
    await expect(second.start()).rejects.toMatchObject({ code: "EADDRINUSE" });

    await first.bridge.stop();
    await expect(fetch(`${first.address.baseUrl}/v1/health`)).rejects.toThrow();
  });

  it("requires a fresh pairing after a bridge process restart", async () => {
    const filePath = await createSourceFile();
    const first = await startBridge({ filePath });
    const paired = await pairLocalCompanionBridge(
      first.address.baseUrl,
      first.address.pairingCode,
    );
    if (!paired.ok) {
      throw new Error("Pairing failed in integration test.");
    }
    await first.bridge.stop();

    const restarted = createLocalCompanionBridge({
      host: "127.0.0.1",
      port: 0,
      sources: [{ sourceId: "custom:build", label: "Build quota", filePath }],
    });
    runningBridges.push(restarted);
    const address = await restarted.start();
    await expect(
      fetchLocalCompanionBridgeHealth(address.baseUrl, paired.value),
    ).resolves.toMatchObject({ ok: false, code: "unauthorized" });
    await expect(
      pairLocalCompanionBridge(address.baseUrl, address.pairingCode),
    ).resolves.toMatchObject({ ok: true });
  });
});
