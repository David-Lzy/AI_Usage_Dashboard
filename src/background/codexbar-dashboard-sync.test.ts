import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SAMPLE_APP_STATE } from "../shared/constants";
import {
  resetCodexBarDashboardConnectionMemoryForTests,
  writeCodexBarDashboardConnection,
} from "../shared/codexbar-dashboard-connection";
import type { WebStorageLike } from "../shared/local-storage";
import {
  resetLocalCompanionSecretMemoryForTests,
  writeLocalCompanionToken,
} from "../shared/local-companion-secrets";
import {
  connectCodexBarDashboard,
  disconnectCodexBarDashboard,
  resetCodexBarDashboardInFlightForTests,
  syncCodexBarDashboardSources,
} from "./codexbar-dashboard-sync";

const ENDPOINT = "http://127.0.0.1:8080/dashboard/v1/snapshot";
const ORIGIN = "http://127.0.0.1:8080";
const TOKEN = "t".repeat(64);
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
});
