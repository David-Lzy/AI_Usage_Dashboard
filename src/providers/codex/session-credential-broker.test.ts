import { describe, expect, it, vi } from "vitest";

import { buildCodexSessionCredential } from "./session-credential";
import {
  CODEX_AUTH_FAILURE_COOLDOWN_MS,
  CODEX_SESSION_CREDENTIAL_STORAGE_KEY,
  createCodexCredentialBroker,
  type CodexSessionStorageArea,
} from "./session-credential-broker";

function createStorage(initial?: unknown): CodexSessionStorageArea & {
  values: Record<string, unknown>;
} {
  const values: Record<string, unknown> = {};
  if (initial !== undefined) {
    values[CODEX_SESSION_CREDENTIAL_STORAGE_KEY] = initial;
  }

  return {
    values,
    async get(key) {
      return { [key]: values[key] };
    },
    async set(items) {
      Object.assign(values, items);
    },
    async remove(key) {
      delete values[key];
    },
  };
}

function createOpaqueCredential(source: "web_session" | "manual_session" = "web_session") {
  return buildCodexSessionCredential({
    accessToken: "opaque-session-token",
    source,
  })!;
}

describe("Codex credential broker", () => {
  it("reuses the session-stored credential without reacquiring", async () => {
    const storage = createStorage(createOpaqueCredential());
    const acquire = vi.fn();
    const broker = createCodexCredentialBroker({
      storage,
      acquireFromWebSession: acquire,
    });

    await expect(broker.getCredential()).resolves.toMatchObject({ ok: true });
    expect(acquire).not.toHaveBeenCalled();
  });

  it("coalesces concurrent credential acquisition", async () => {
    let resolveCredential: (value: ReturnType<typeof createOpaqueCredential>) => void =
      () => {};
    const acquisition = new Promise<ReturnType<typeof createOpaqueCredential>>(
      (resolve) => {
        resolveCredential = resolve;
      },
    );
    const acquire = vi.fn(() => acquisition);
    const broker = createCodexCredentialBroker({
      storage: createStorage(),
      acquireFromWebSession: acquire,
    });

    const first = broker.getCredential();
    const second = broker.getCredential();
    resolveCredential(createOpaqueCredential());

    await expect(first).resolves.toMatchObject({ ok: true });
    await expect(second).resolves.toMatchObject({ ok: true });
    expect(acquire).toHaveBeenCalledTimes(1);
  });

  it("applies an automatic cooldown after missing auth and allows a bypass", async () => {
    let now = 1_000;
    const acquire = vi
      .fn<() => Promise<ReturnType<typeof createOpaqueCredential> | null>>()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(createOpaqueCredential());
    const broker = createCodexCredentialBroker({
      now: () => now,
      storage: createStorage(),
      acquireFromWebSession: acquire,
    });

    await expect(broker.getCredential()).resolves.toEqual({
      ok: false,
      code: "auth_missing",
      retryAt: now + CODEX_AUTH_FAILURE_COOLDOWN_MS,
    });
    await expect(broker.getCredential()).resolves.toMatchObject({
      ok: false,
      code: "auth_cooldown",
    });
    expect(acquire).toHaveBeenCalledTimes(1);

    now += 1;
    await expect(
      broker.getCredential({ bypassCooldown: true }),
    ).resolves.toMatchObject({ ok: true });
    expect(acquire).toHaveBeenCalledTimes(2);
  });

  it("falls back to memory when session storage throws", async () => {
    const storage: CodexSessionStorageArea = {
      get: vi.fn(async () => {
        throw new Error("blocked");
      }),
      set: vi.fn(async () => {
        throw new Error("blocked");
      }),
      remove: vi.fn(async () => {
        throw new Error("blocked");
      }),
    };
    const acquire = vi.fn(async () => createOpaqueCredential());
    const broker = createCodexCredentialBroker({ storage, acquireFromWebSession: acquire });

    await expect(broker.getCredential()).resolves.toMatchObject({ ok: true });
    await expect(broker.getCredential()).resolves.toMatchObject({ ok: true });
    expect(acquire).toHaveBeenCalledTimes(1);
  });

  it("stores and clears manual session credentials only in session storage", async () => {
    const storage = createStorage();
    const broker = createCodexCredentialBroker({ storage });

    await expect(
      broker.setManualCredential("manual-temporary-token"),
    ).resolves.toMatchObject({
      ok: true,
      credential: { source: "manual_session" },
    });
    expect(storage.values[CODEX_SESSION_CREDENTIAL_STORAGE_KEY]).toMatchObject({
      accessToken: "manual-temporary-token",
    });

    await broker.clearCredential();
    expect(storage.values[CODEX_SESSION_CREDENTIAL_STORAGE_KEY]).toBeUndefined();
  });
});
