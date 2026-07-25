import { mkdtemp, rm, writeFile } from "node:fs/promises";
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
});
