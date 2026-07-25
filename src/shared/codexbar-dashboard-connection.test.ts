import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CODEXBAR_DASHBOARD_CONNECTION_STORAGE_KEY } from "./constants";
import type { WebStorageLike } from "./local-storage";
import {
  clearCodexBarDashboardConnection,
  readCodexBarDashboardConnection,
  resetCodexBarDashboardConnectionMemoryForTests,
  writeCodexBarDashboardConnection,
} from "./codexbar-dashboard-connection";

const ENDPOINT = "http://127.0.0.1:8080/dashboard/v1/snapshot";

function createStorage() {
  const values = new Map<string, string>();
  const storage: WebStorageLike = {
    getItem: (key) => values.get(key) ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  };
  return { values, storage };
}

describe("CodexBar dashboard connection storage", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    resetCodexBarDashboardConnectionMemoryForTests();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    resetCodexBarDashboardConnectionMemoryForTests();
  });

  it("stores only the validated non-secret loopback endpoint", async () => {
    const { values, storage } = createStorage();
    vi.stubGlobal("window", { localStorage: storage });

    await expect(writeCodexBarDashboardConnection(ENDPOINT)).resolves.toBe(true);
    await expect(readCodexBarDashboardConnection()).resolves.toEqual({
      schemaVersion: 1,
      enabled: true,
      endpointUrl: ENDPOINT,
    });
    expect(
      JSON.parse(
        values.get(CODEXBAR_DASHBOARD_CONNECTION_STORAGE_KEY) ?? "{}",
      ),
    ).not.toHaveProperty("token");
  });

  it("rejects non-loopback endpoints and clears the connection", async () => {
    await expect(
      writeCodexBarDashboardConnection(
        "http://192.168.1.10:8080/dashboard/v1/snapshot",
      ),
    ).resolves.toBe(false);

    const { storage } = createStorage();
    vi.stubGlobal("window", { localStorage: storage });
    await writeCodexBarDashboardConnection(ENDPOINT);
    await clearCodexBarDashboardConnection();
    await expect(readCodexBarDashboardConnection()).resolves.toBeNull();
  });
});
