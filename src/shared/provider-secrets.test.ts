import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PROVIDER_SECRETS_STORAGE_KEY } from "./constants";
import { SAMPLE_PROVIDER_SECRETS } from "./demo-state";
import {
  deleteSub2ApiAccountSecret,
  readProviderSecrets,
  setProviderAdminApiKey,
  setSub2ApiKey,
  writeProviderSecrets,
} from "./provider-secrets";
import { DEFAULT_PROVIDER_ACCOUNT_ID } from "./provider-accounts";
import type { WebStorageLike } from "./local-storage";

function createThrowingStorage(): WebStorageLike {
  return {
    getItem: () => {
      throw new Error("getItem failed");
    },
    removeItem: () => {
      throw new Error("removeItem failed");
    },
    setItem: () => {
      throw new Error("setItem failed");
    },
  };
}

describe("provider secrets storage", () => {
  beforeEach(async () => {
    vi.unstubAllGlobals();
    await writeProviderSecrets(SAMPLE_PROVIDER_SECRETS);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("falls back to memory when localStorage operations throw", async () => {
    vi.stubGlobal("window", {
      localStorage: createThrowingStorage(),
    });

    await writeProviderSecrets({
      ...SAMPLE_PROVIDER_SECRETS,
      "cursor-team-api": {
        adminApiKey: "cursor-test-key",
      },
    });

    await expect(readProviderSecrets()).resolves.toMatchObject({
      "cursor-team-api": {
        adminApiKey: "cursor-test-key",
      },
    });
  });

  it("drops malformed localStorage secrets when cleanup also throws", async () => {
    const removeItem = vi.fn(() => {
      throw new Error("removeItem failed");
    });

    vi.stubGlobal("window", {
      localStorage: {
        getItem: () => "{not-json",
        removeItem,
        setItem: () => {},
      } satisfies WebStorageLike,
    });

    await expect(readProviderSecrets()).resolves.toEqual(SAMPLE_PROVIDER_SECRETS);
    expect(removeItem).toHaveBeenCalledOnce();
  });

  it("isolates credentials by opaque account id", async () => {
    const secondAccountId = "account_87654321";
    await writeProviderSecrets(
      {
        ...SAMPLE_PROVIDER_SECRETS,
        "cursor-team-api": { adminApiKey: "second-account-key" },
      },
      { "cursor-team-api": secondAccountId },
    );

    await expect(
      readProviderSecrets({ "cursor-team-api": DEFAULT_PROVIDER_ACCOUNT_ID }),
    ).resolves.toMatchObject({
      "cursor-team-api": { adminApiKey: null },
    });
    await expect(
      readProviderSecrets({ "cursor-team-api": secondAccountId }),
    ).resolves.toMatchObject({
      "cursor-team-api": { adminApiKey: "second-account-key" },
    });
  });

  it("deletes one Sub2API deployment secret without touching another account", async () => {
    const secondAccountId = "account_sub2api_2";
    await setSub2ApiKey("default-sub2api-key", DEFAULT_PROVIDER_ACCOUNT_ID);
    await setSub2ApiKey("second-sub2api-key", secondAccountId);

    await deleteSub2ApiAccountSecret(secondAccountId);

    await expect(
      readProviderSecrets({
        "sub2api-api-key": DEFAULT_PROVIDER_ACCOUNT_ID,
      }),
    ).resolves.toMatchObject({
      "sub2api-api-key": { apiKey: "default-sub2api-key" },
    });
    await expect(
      readProviderSecrets({ "sub2api-api-key": secondAccountId }),
    ).resolves.toMatchObject({
      "sub2api-api-key": { apiKey: null },
    });
  });

  it("serializes simultaneous setters for separate providers", async () => {
    await Promise.all([
      setProviderAdminApiKey("cursor-team-api", "cursor-concurrent-key"),
      setProviderAdminApiKey("claude-code-admin-api", "claude-concurrent-key"),
    ]);

    await expect(readProviderSecrets()).resolves.toMatchObject({
      "cursor-team-api": { adminApiKey: "cursor-concurrent-key" },
      "claude-code-admin-api": { adminApiKey: "claude-concurrent-key" },
    });
  });

  it("serializes legacy migration reads with credential updates", async () => {
    const values: Record<string, unknown> = { [PROVIDER_SECRETS_STORAGE_KEY]: SAMPLE_PROVIDER_SECRETS };
    let releaseRead = () => {};
    const gate = new Promise<void>((resolve) => { releaseRead = resolve; });
    let firstRead = true;
    const get = vi.fn(async () => {
      const snapshot = structuredClone(values);
      if (firstRead) {
        firstRead = false;
        await gate;
      }
      return snapshot;
    });
    const set = vi.fn(async (next: Record<string, unknown>) => { Object.assign(values, structuredClone(next)); });
    vi.stubGlobal("chrome", { storage: { local: { get, set } } });
    const migratingRead = readProviderSecrets();
    await vi.waitFor(() => expect(get).toHaveBeenCalledOnce());
    const update = setProviderAdminApiKey("cursor-team-api", "after-migration-key");
    await Promise.resolve();
    expect(set).not.toHaveBeenCalled();
    releaseRead();
    await Promise.all([migratingRead, update]);
    expect((await readProviderSecrets())["cursor-team-api"].adminApiKey).toBe("after-migration-key");
  });

  it("serializes simultaneous Sub2API account updates", async () => {
    const firstAccountId = "account_sub2api-a";
    const secondAccountId = "account_sub2api-b";

    await Promise.all([
      setSub2ApiKey("first-concurrent-key", firstAccountId),
      setSub2ApiKey("second-concurrent-key", secondAccountId),
    ]);

    await expect(
      readProviderSecrets({ "sub2api-api-key": firstAccountId }),
    ).resolves.toMatchObject({
      "sub2api-api-key": { apiKey: "first-concurrent-key" },
    });
    await expect(
      readProviderSecrets({ "sub2api-api-key": secondAccountId }),
    ).resolves.toMatchObject({
      "sub2api-api-key": { apiKey: "second-concurrent-key" },
    });
  });

  it("serializes a Sub2API account deletion with another account update", async () => {
    const deletedAccountId = "account_sub2api-delete";
    const updatedAccountId = "account_sub2api-update";
    await setSub2ApiKey("deleted-account-key", deletedAccountId);
    await setSub2ApiKey("initial-update-key", updatedAccountId);

    await Promise.all([
      deleteSub2ApiAccountSecret(deletedAccountId),
      setSub2ApiKey("updated-account-key", updatedAccountId),
    ]);

    await expect(
      readProviderSecrets({ "sub2api-api-key": deletedAccountId }),
    ).resolves.toMatchObject({
      "sub2api-api-key": { apiKey: null },
    });
    await expect(
      readProviderSecrets({ "sub2api-api-key": updatedAccountId }),
    ).resolves.toMatchObject({
      "sub2api-api-key": { apiKey: "updated-account-key" },
    });
  });

  it("continues queued writes after a rejected storage write", async () => {
    const storage = new Map<string, unknown>();
    let shouldReject = true;
    vi.stubGlobal("chrome", {
      storage: {
        local: {
          get: async (key: string) => ({ [key]: storage.get(key) }),
          set: async (entries: Record<string, unknown>) => {
            if (shouldReject) {
              shouldReject = false;
              throw new Error("storage write failed");
            }
            Object.entries(entries).forEach(([key, value]) => storage.set(key, value));
          },
        },
      },
    });

    await expect(writeProviderSecrets(SAMPLE_PROVIDER_SECRETS)).rejects.toThrow(
      "storage write failed",
    );
    await expect(setSub2ApiKey("recovered-queue-key")).resolves.toMatchObject({
      "sub2api-api-key": { apiKey: "recovered-queue-key" },
    });
    await expect(readProviderSecrets()).resolves.toMatchObject({
      "sub2api-api-key": { apiKey: "recovered-queue-key" },
    });
  });

  it("migrates legacy flat secrets into the default account", async () => {
    const storage = new Map<string, string>();
    storage.set(
      "ai-usage-dashboard.provider-secrets",
      JSON.stringify({
        "cursor-team-api": { adminApiKey: "legacy-key" },
      }),
    );
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        removeItem: (key: string) => storage.delete(key),
        setItem: (key: string, value: string) => storage.set(key, value),
      } satisfies WebStorageLike,
    });

    await expect(readProviderSecrets()).resolves.toMatchObject({
      "cursor-team-api": { adminApiKey: "legacy-key" },
    });
    expect(
      JSON.parse(storage.get("ai-usage-dashboard.provider-secrets") ?? "{}"),
    ).toMatchObject({
      schemaVersion: 2,
      accounts: {
        "cursor-team-api": {
          default: { adminApiKey: "legacy-key" },
        },
      },
    });
  });
});
