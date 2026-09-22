import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SAMPLE_APP_STATE } from "../shared/demo-state";
import {
  resetCodexBarDashboardConnectionMemoryForTests,
  readCodexBarDashboardConnection,
  writeCodexBarDashboardConnection,
} from "../shared/codexbar-dashboard-connection";
import type { WebStorageLike } from "../shared/local-storage";
import {
  readLocalCompanionToken,
  resetLocalCompanionSecretMemoryForTests,
  writeLocalCompanionToken,
} from "../shared/local-companion-secrets";
import {
  clearCodexBarDashboardToken,
  connectCodexBarDashboard,
  disconnectCodexBarDashboard,
  getCodexBarDashboardGeneration,
  resetCodexBarDashboardInFlightForTests,
  syncCodexBarDashboardSources,
} from "./codexbar-dashboard-sync";

const ENDPOINT = "http://127.0.0.1:8080/dashboard/v1/snapshot";
const ORIGIN = "http://127.0.0.1:8080";
const TOKEN = "t".repeat(64);
const SECOND_TOKEN = "u".repeat(64);
const NOW = new Date("2026-07-25T12:02:00.000Z");

function createStorage(): WebStorageLike {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  };
}

function createPayload() {
  return {
    schemaVersion: 1,
    generatedAt: "2026-07-25T12:00:00.000Z",
    staleAfterSeconds: 180,
    host: { codexBarVersion: "0.37.2", refreshIntervalSeconds: 60 },
    providers: [
      {
        id: "codex",
        name: "Codex",
        enabled: true,
        source: "oauth",
        status: null,
        identity: { accountEmail: "redacted@example.com", plan: "Pro" },
        windows: [
          {
            kind: "session",
            label: "Session",
            usedPercent: 25,
            remainingPercent: 75,
            resetAt: null,
          },
        ],
        credits: null,
        cost: null,
        display: { accentColor: "#000000", sortKey: 0, priority: "normal" },
        error: null,
        updatedAt: "2026-07-25T12:00:00.000Z",
      },
    ],
  };
}

function response(body = createPayload(), status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("CodexBar dashboard sync", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.stubGlobal("window", { localStorage: createStorage() });
    resetCodexBarDashboardConnectionMemoryForTests();
    resetLocalCompanionSecretMemoryForTests();
    resetCodexBarDashboardInFlightForTests();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    resetCodexBarDashboardConnectionMemoryForTests();
    resetLocalCompanionSecretMemoryForTests();
    resetCodexBarDashboardInFlightForTests();
  });

  it("connects and stores sanitized rows without placing the token in AppState", async () => {
    const result = await connectCodexBarDashboard(
      structuredClone(SAMPLE_APP_STATE),
      ENDPOINT,
      TOKEN,
      { fetchImpl: async () => response(), now: NOW },
    );

    expect(result).toMatchObject({
      ok: true,
      state: {
        customSources: [
          {
            managedBy: "codexbar-dashboard",
            endpointUrl: ENDPOINT,
            displayEnabled: true,
          },
        ],
        customSourceStates: [
          {
            status: "ok",
            snapshot: { remaining: 75 },
          },
        ],
      },
    });
    expect(JSON.stringify(result.ok && result.state)).not.toContain(TOKEN);
    expect(JSON.stringify(result.ok && result.state)).not.toContain(
      "redacted@example.com",
    );
  });

  it("coalesces simultaneous refreshes and preserves cached data on failure", async () => {
    const connected = await connectCodexBarDashboard(
      structuredClone(SAMPLE_APP_STATE),
      ENDPOINT,
      TOKEN,
      { fetchImpl: async () => response(), now: NOW },
    );
    if (!connected.ok) {
      throw new Error("Expected connection to succeed.");
    }

    let resolveFetch: ((value: Response) => void) | null = null;
    const fetchImpl = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        }),
    );
    const first = syncCodexBarDashboardSources(connected.state, {
      trigger: "manual",
      fetchImpl,
      now: new Date("2026-07-25T12:03:00.000Z"),
    });
    const second = syncCodexBarDashboardSources(connected.state, {
      trigger: "manual",
      fetchImpl,
      now: new Date("2026-07-25T12:03:00.000Z"),
    });
    await vi.waitFor(() => expect(fetchImpl).toHaveBeenCalledTimes(1));
    const completeFetch = resolveFetch as ((value: Response) => void) | null;
    if (!completeFetch) {
      throw new Error("Expected the coalesced fetch resolver to be available.");
    }
    completeFetch(response());
    await Promise.all([first, second]);

    const failed = await syncCodexBarDashboardSources(connected.state, {
      trigger: "manual",
      fetchImpl: async () => response({ error: "unauthorized" } as never, 401),
      now: new Date("2026-07-25T12:04:00.000Z"),
    });
    expect(failed.customSourceStates?.[0]).toMatchObject({
      status: "warning",
      stale: true,
      snapshot: { remaining: 75, syncStatus: "warning" },
      lastFailureReason: "CodexBar rejected the dashboard token.",
    });

    const duringCooldownFetch = vi.fn(async () => response());
    const duringCooldown = await syncCodexBarDashboardSources(failed, {
      trigger: "alarm",
      fetchImpl: duringCooldownFetch,
      now: new Date("2026-07-25T12:08:59.000Z"),
    });
    expect(duringCooldownFetch).not.toHaveBeenCalled();
    expect(duringCooldown).toBe(failed);

    const afterCooldownFetch = vi.fn(async () => response());
    await syncCodexBarDashboardSources(failed, {
      trigger: "alarm",
      fetchImpl: afterCooldownFetch,
      now: new Date("2026-07-25T12:09:00.000Z"),
    });
    expect(afterCooldownFetch).toHaveBeenCalledTimes(1);
  });

  it("does not request a disabled integration and disconnects cleanly", async () => {
    await writeCodexBarDashboardConnection(ENDPOINT);
    await writeLocalCompanionToken(ORIGIN, TOKEN);
    const hiddenState = {
      ...structuredClone(SAMPLE_APP_STATE),
      customSources: [
        {
          id: "custom:codexbar-codex-1a2b3c4d" as const,
          label: "CodexBar · Codex",
          description: null,
          endpointUrl: ENDPOINT,
          displayEnabled: false,
          refreshIntervalMinutes: 15,
          createdAt: NOW.toISOString(),
          updatedAt: NOW.toISOString(),
          managedBy: "codexbar-dashboard" as const,
        },
      ],
      customSourceStates: [],
    };
    const fetchImpl = vi.fn(async () => response());
    const unchanged = await syncCodexBarDashboardSources(hiddenState, {
      trigger: "manual",
      fetchImpl,
      now: NOW,
    });
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(unchanged).toBe(hiddenState);

    const disconnected = await disconnectCodexBarDashboard(hiddenState);
    expect(disconnected.customSources).toEqual([]);
    expect(disconnected.customSourceStates).toEqual([]);
  });

  it("leaves a zero-managed-row sync unchanged after a disconnect", async () => {
    await writeCodexBarDashboardConnection(ENDPOINT);
    await writeLocalCompanionToken(ORIGIN, TOKEN);
    const state = {
      ...structuredClone(SAMPLE_APP_STATE),
      customSources: [],
      customSourceStates: [],
    };
    let resolveFetch: ((value: Response) => void) | undefined;
    const sync = syncCodexBarDashboardSources(state, {
      trigger: "manual",
      now: NOW,
      fetchImpl: () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        }),
    });

    await vi.waitFor(() => expect(resolveFetch).toBeTypeOf("function"));
    const beforeDisconnect = getCodexBarDashboardGeneration();
    await disconnectCodexBarDashboard(state);
    expect(getCodexBarDashboardGeneration()).toBe(beforeDisconnect + 1);

    resolveFetch!(response());
    expect(await sync).toBe(state);
    expect(await readCodexBarDashboardConnection()).toBeNull();
    expect(await readLocalCompanionToken(ORIGIN)).toBeNull();
  });

  it("does not coalesce same-endpoint reconnects from different generations", async () => {
    const resolvers: Array<(value: Response) => void> = [];
    const fetchImpl = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolvers.push(resolve);
        }),
    );
    const state = structuredClone(SAMPLE_APP_STATE);
    const first = connectCodexBarDashboard(state, ENDPOINT, TOKEN, { fetchImpl, now: NOW });
    const firstGeneration = getCodexBarDashboardGeneration();
    const second = connectCodexBarDashboard(state, ENDPOINT, SECOND_TOKEN, {
      fetchImpl,
      now: NOW,
    });
    expect(getCodexBarDashboardGeneration()).toBe(firstGeneration + 1);

    await vi.waitFor(() => expect(fetchImpl).toHaveBeenCalledTimes(2));
    resolvers[1](response());
    expect((await second).ok).toBe(true);
    resolvers[0](response());
    await first;

    expect(await readCodexBarDashboardConnection()).toMatchObject({
      endpointUrl: ENDPOINT,
    });
    expect(await readLocalCompanionToken(ORIGIN)).toBe(SECOND_TOKEN);
  });

  it("does not let a late connect restore a disconnected connection", async () => {
    const state = structuredClone(SAMPLE_APP_STATE);
    let resolveFetch: ((value: Response) => void) | undefined;
    const lateConnect = connectCodexBarDashboard(
      state,
      ENDPOINT,
      TOKEN,
      {
        now: NOW,
        fetchImpl: () =>
          new Promise<Response>((resolve) => {
            resolveFetch = resolve;
          }),
      },
    );

    await vi.waitFor(() => expect(resolveFetch).toBeTypeOf("function"));
    await disconnectCodexBarDashboard(structuredClone(SAMPLE_APP_STATE));
    resolveFetch!(response());
    expect(await lateConnect).toMatchObject({ ok: false, state });

    expect(await readCodexBarDashboardConnection()).toBeNull();
    expect(await readLocalCompanionToken(ORIGIN)).toBeNull();
  });

  it("returns the original state when a disconnect is superseded", async () => {
    const state = structuredClone(SAMPLE_APP_STATE);
    const disconnecting = disconnectCodexBarDashboard(state);
    let resolveFetch: ((value: Response) => void) | undefined;
    const connecting = connectCodexBarDashboard(state, ENDPOINT, TOKEN, {
      now: NOW,
      fetchImpl: () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        }),
    });

    expect(await disconnecting).toBe(state);
    await vi.waitFor(() => expect(resolveFetch).toBeTypeOf("function"));
    resolveFetch!(response());
    expect((await connecting).ok).toBe(true);
  });

  it("rolls back a token write superseded during persistence", async () => {
    const stored = new Map<string, unknown>();
    let resolveFirstWrite: (() => void) | undefined;
    let writes = 0;
    vi.stubGlobal("chrome", {
      storage: {
        local: {
          get: async (key: string) => ({ [key]: stored.get(key) }),
          remove: async (key: string) => {
            stored.delete(key);
          },
          set: (values: Record<string, unknown>) => {
            writes += 1;
            const persist = () => {
              for (const [key, value] of Object.entries(values)) {
                stored.set(key, value);
              }
            };
            if (writes === 1) {
              return new Promise<void>((resolve) => {
                resolveFirstWrite = () => {
                  persist();
                  resolve();
                };
              });
            }
            persist();
            return Promise.resolve();
          },
        },
      },
    });
    const state = structuredClone(SAMPLE_APP_STATE);
    const connecting = connectCodexBarDashboard(state, ENDPOINT, TOKEN, {
      fetchImpl: async () => response(),
      now: NOW,
    });

    await vi.waitFor(() => expect(resolveFirstWrite).toBeTypeOf("function"));
    const disconnecting = disconnectCodexBarDashboard(state);
    resolveFirstWrite!();

    expect(await connecting).toMatchObject({ ok: false, state });
    await disconnecting;
    expect(await readCodexBarDashboardConnection()).toBeNull();
    expect(await readLocalCompanionToken(ORIGIN)).toBeNull();
  });

  it("keeps a reused token when an older token-null connect is superseded", async () => {
    const stored = new Map<string, unknown>();
    let deferNextWrite = false;
    let resolveWrite: (() => void) | undefined;
    vi.stubGlobal("chrome", {
      storage: {
        local: {
          get: async (key: string) => ({ [key]: stored.get(key) }),
          remove: async (key: string) => {
            stored.delete(key);
          },
          set: (values: Record<string, unknown>) => {
            const persist = () => {
              for (const [key, value] of Object.entries(values)) {
                stored.set(key, value);
              }
            };
            if (deferNextWrite) {
              deferNextWrite = false;
              return new Promise<void>((resolve) => {
                resolveWrite = () => {
                  persist();
                  resolve();
                };
              });
            }
            persist();
            return Promise.resolve();
          },
        },
      },
    });
    await writeCodexBarDashboardConnection(ENDPOINT);
    await writeLocalCompanionToken(ORIGIN, TOKEN);
    deferNextWrite = true;
    const fetchImpl = vi.fn(async () => response());
    const state = structuredClone(SAMPLE_APP_STATE);
    const first = connectCodexBarDashboard(state, ENDPOINT, null, { fetchImpl, now: NOW });

    await vi.waitFor(() => expect(resolveWrite).toBeTypeOf("function"));
    const second = connectCodexBarDashboard(state, ENDPOINT, null, { fetchImpl, now: NOW });
    await vi.waitFor(() => expect(fetchImpl).toHaveBeenCalledTimes(2));
    resolveWrite!();

    expect(await first).toMatchObject({ ok: false, state });
    expect((await second).ok).toBe(true);
    expect(await readLocalCompanionToken(ORIGIN)).toBe(TOKEN);
  });

  it("does not sync through an active connect generation", async () => {
    await writeCodexBarDashboardConnection(ENDPOINT);
    await writeLocalCompanionToken(ORIGIN, TOKEN);
    const state = {
      ...structuredClone(SAMPLE_APP_STATE),
      customSources: [],
      customSourceStates: [],
    };
    let resolveFetch: ((value: Response) => void) | undefined;
    const connecting = connectCodexBarDashboard(state, ENDPOINT, SECOND_TOKEN, {
      now: NOW,
      fetchImpl: () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        }),
    });

    await vi.waitFor(() => expect(resolveFetch).toBeTypeOf("function"));
    const syncFetch = vi.fn(async () => response());
    expect(
      await syncCodexBarDashboardSources(state, {
        trigger: "manual",
        fetchImpl: syncFetch,
        now: NOW,
      }),
    ).toBe(state);
    expect(syncFetch).not.toHaveBeenCalled();

    resolveFetch!(response());
    expect((await connecting).ok).toBe(true);
  });

  it("does not let a late connect overwrite a cleared and reconnected token", async () => {
    await writeCodexBarDashboardConnection(ENDPOINT);
    await writeLocalCompanionToken(ORIGIN, TOKEN);
    let resolveFetch: ((value: Response) => void) | undefined;
    const lateConnect = connectCodexBarDashboard(
      structuredClone(SAMPLE_APP_STATE),
      ENDPOINT,
      TOKEN,
      {
        now: NOW,
        fetchImpl: () =>
          new Promise<Response>((resolve) => {
            resolveFetch = resolve;
          }),
      },
    );

    await vi.waitFor(() => expect(resolveFetch).toBeTypeOf("function"));
    await clearCodexBarDashboardToken(structuredClone(SAMPLE_APP_STATE));
    expect(await readLocalCompanionToken(ORIGIN)).toBeNull();
    const reconnect = await connectCodexBarDashboard(
      structuredClone(SAMPLE_APP_STATE),
      ENDPOINT,
      SECOND_TOKEN,
      { fetchImpl: async () => response(), now: NOW },
    );
    expect(reconnect.ok).toBe(true);

    resolveFetch!(response());
    await lateConnect;
    expect(await readCodexBarDashboardConnection()).toMatchObject({
      endpointUrl: ENDPOINT,
    });
    expect(await readLocalCompanionToken(ORIGIN)).toBe(SECOND_TOKEN);
  });

  it("continues queued mutations after a storage write failure", async () => {
    const stored = new Map<string, unknown>();
    let rejectNextWrite = true;
    vi.stubGlobal("chrome", {
      storage: {
        local: {
          get: async (key: string) => ({ [key]: stored.get(key) }),
          remove: async (key: string) => {
            stored.delete(key);
          },
          set: async (values: Record<string, unknown>) => {
            if (rejectNextWrite) {
              rejectNextWrite = false;
              throw new Error("storage unavailable");
            }
            for (const [key, value] of Object.entries(values)) {
              stored.set(key, value);
            }
          },
        },
      },
    });

    const failed = await connectCodexBarDashboard(
      structuredClone(SAMPLE_APP_STATE),
      ENDPOINT,
      TOKEN,
      { fetchImpl: async () => response(), now: NOW },
    );
    expect(failed).toMatchObject({ ok: false, failure: { code: "unavailable" } });

    const recovered = await connectCodexBarDashboard(
      structuredClone(SAMPLE_APP_STATE),
      ENDPOINT,
      SECOND_TOKEN,
      { fetchImpl: async () => response(), now: NOW },
    );
    expect(recovered.ok).toBe(true);
    expect(await readLocalCompanionToken(ORIGIN)).toBe(SECOND_TOKEN);
  });
});
