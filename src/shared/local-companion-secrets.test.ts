import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LOCAL_COMPANION_SECRETS_STORAGE_KEY } from "./constants";
import type { WebStorageLike } from "./local-storage";
import {
  clearLocalCompanionToken,
  readLocalCompanionToken,
  resetLocalCompanionSecretMemoryForTests,
  writeLocalCompanionToken,
} from "./local-companion-secrets";

const baseUrl = "http://127.0.0.1:47831";
const token = "t".repeat(43);

function createStorage(): {
  values: Map<string, string>;
  storage: WebStorageLike;
} {
  const values = new Map<string, string>();
  return {
    values,
    storage: {
      getItem: (key) => values.get(key) ?? null,
      removeItem: (key) => values.delete(key),
      setItem: (key, value) => values.set(key, value),
    },
  };
}

describe("local companion secret storage", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    resetLocalCompanionSecretMemoryForTests();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    resetLocalCompanionSecretMemoryForTests();
  });

  it("stores tokens outside AppState and isolates them by loopback origin", async () => {
    const { values, storage } = createStorage();
    vi.stubGlobal("window", { localStorage: storage });

    await expect(writeLocalCompanionToken(baseUrl, token)).resolves.toBe(true);
    await expect(readLocalCompanionToken(baseUrl)).resolves.toBe(token);
    await expect(
      readLocalCompanionToken("http://127.0.0.1:47832"),
    ).resolves.toBeNull();

    const stored = JSON.parse(
      values.get(LOCAL_COMPANION_SECRETS_STORAGE_KEY) ?? "{}",
    ) as Record<string, unknown>;
    expect(stored).toMatchObject({
      schemaVersion: 1,
      connections: { [baseUrl]: token },
    });
    expect(values.has("ai-usage-dashboard.app-state")).toBe(false);
  });

  it("rejects non-loopback origins and malformed tokens", async () => {
    await expect(
      writeLocalCompanionToken("http://192.168.1.2:47831", token),
    ).resolves.toBe(false);
    await expect(writeLocalCompanionToken(baseUrl, "short")).resolves.toBe(
      false,
    );
  });

  it("revokes a stored token", async () => {
    const { storage } = createStorage();
    vi.stubGlobal("window", { localStorage: storage });

    await writeLocalCompanionToken(baseUrl, token);
    await clearLocalCompanionToken(baseUrl);
    await expect(readLocalCompanionToken(baseUrl)).resolves.toBeNull();
  });

  it("falls back to memory when localStorage throws", async () => {
    vi.stubGlobal("window", {
      localStorage: {
        getItem: () => {
          throw new Error("blocked");
        },
        removeItem: () => {
          throw new Error("blocked");
        },
        setItem: () => {
          throw new Error("blocked");
        },
      } satisfies WebStorageLike,
    });

    await expect(writeLocalCompanionToken(baseUrl, token)).resolves.toBe(true);
    await expect(readLocalCompanionToken(baseUrl)).resolves.toBe(token);
  });
});
