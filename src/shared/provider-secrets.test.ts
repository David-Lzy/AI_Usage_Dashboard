import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SAMPLE_PROVIDER_SECRETS } from "./constants";
import {
  deleteSub2ApiAccountSecret,
  readProviderSecrets,
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
