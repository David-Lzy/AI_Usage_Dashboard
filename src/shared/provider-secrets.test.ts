import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SAMPLE_PROVIDER_SECRETS } from "./constants";
import { readProviderSecrets, writeProviderSecrets } from "./provider-secrets";
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
});
