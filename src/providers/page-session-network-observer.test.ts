import { describe, expect, it, vi } from "vitest";

import {
  cleanupPreparedNetworkObserver,
  installNetworkObserverBridge,
  prepareNetworkObserverForReload,
  readNetworkObserverBridge,
  recoverNetworkObserverFromPerformanceResources,
  type PageSessionObservedNetworkEntry,
} from "./page-session-network-observer";
import type { PageSessionScriptingApi } from "./page-session-script-capture";

function createResultApi(result: unknown): PageSessionScriptingApi {
  return {
    executeScript: vi.fn().mockResolvedValue([{ result }]),
  };
}

describe("page-session network observer helpers", () => {
  it("returns an empty observer state for missing or invalid bridge snapshots", async () => {
    await expect(readNetworkObserverBridge(7, createResultApi(null))).resolves.toEqual({
      matchUrlSubstrings: [],
      maxEntries: 0,
      entries: [],
    });

    await expect(
      readNetworkObserverBridge(7, createResultApi("{not-json")),
    ).resolves.toEqual({
      matchUrlSubstrings: [],
      maxEntries: 0,
      entries: [],
    });
  });

  it("normalizes malformed bridge snapshots without throwing", async () => {
    await expect(
      readNetworkObserverBridge(
        7,
        createResultApi(JSON.stringify({
          matchUrlSubstrings: "not-array",
          maxEntries: -1,
          entries: "not-array",
        })),
      ),
    ).resolves.toEqual({
      matchUrlSubstrings: [],
      maxEntries: 0,
      entries: [],
    });
  });

  it("parses a valid bridge snapshot", async () => {
    const entry: PageSessionObservedNetworkEntry = {
      url: "https://console.cloud.google.com/api/metrics",
      method: "GET",
      status: 200,
      ok: true,
      contentType: "application/json",
      bodyText: "{\"series\":[1,2,3]}",
      capturedAt: "2026-04-21T10:00:00.000Z",
      transport: "fetch",
    };

    await expect(
      readNetworkObserverBridge(
        7,
        createResultApi(JSON.stringify({
          matchUrlSubstrings: ["/metrics"],
          maxEntries: 5,
          entries: [entry],
        })),
      ),
    ).resolves.toEqual({
      matchUrlSubstrings: ["/metrics"],
      maxEntries: 5,
      entries: [entry],
    });
  });

  it("recovers only missing matched same-origin resources", async () => {
    const capturedEntry: PageSessionObservedNetworkEntry = {
      url: "https://chatgpt.com/backend-api/wham/usage/daily-token-usage-breakdown?days=31",
      method: "GET",
      status: 200,
      ok: true,
      contentType: "application/json",
      bodyText: '{"data":[]}',
      capturedAt: "2026-07-13T00:00:00.000Z",
      transport: "fetch",
    };
    const recoveredEntry: PageSessionObservedNetworkEntry = {
      url: "https://chatgpt.com/backend-api/wham/analytics/daily-workspace-usage-counts?days=31",
      method: "GET",
      status: 200,
      ok: true,
      contentType: "application/json",
      bodyText: '{"data":[]}',
      capturedAt: "2026-07-13T00:00:01.000Z",
      transport: "fetch",
    };
    const scriptingApi = createResultApi([recoveredEntry]);
    const result = await recoverNetworkObserverFromPerformanceResources(
      31,
      scriptingApi,
      {
        mode: "network_observer",
        matchUrlSubstrings: [
          "/daily-token-usage-breakdown",
          "/daily-workspace-usage-counts",
        ],
        maxEntries: 4,
        maxBodyLength: 200_000,
        recoverFromPerformanceResources: true,
      },
      {
        matchUrlSubstrings: ["/daily-token-usage-breakdown"],
        maxEntries: 4,
        entries: [capturedEntry],
      },
    );

    expect(result.entries).toEqual([capturedEntry, recoveredEntry]);
    expect(scriptingApi.executeScript).toHaveBeenCalledWith(
      expect.objectContaining({
        target: { tabId: 31 },
        world: "MAIN",
        args: [["/daily-workspace-usage-counts"], 4, 200_000],
      }),
    );
  });

  it("installs the observer bridge with stable defaults", async () => {
    const executeScript = vi.fn().mockResolvedValue([
      {
        result: {
          installed: true,
          entryCount: 0,
        },
      },
    ]);

    await installNetworkObserverBridge(11, { executeScript }, {
      mode: "network_observer",
      matchUrlSubstrings: ["/metrics"],
    });

    expect(executeScript).toHaveBeenCalledTimes(1);
    expect(executeScript).toHaveBeenCalledWith(
      expect.objectContaining({
        target: { tabId: 11 },
        world: "MAIN",
        args: [
          "__ai_usage_dashboard_page_session_bridge__",
          ["/metrics"],
          20,
          20_000,
        ],
      }),
    );
  });

  it("registers and cleans up a bounded document-start observer", async () => {
    const executeScript = vi.fn().mockResolvedValue([{ result: true }]);
    const registerContentScripts = vi.fn().mockResolvedValue(undefined);
    const unregisterContentScripts = vi.fn().mockResolvedValue(undefined);
    const scriptingApi: PageSessionScriptingApi = {
      executeScript,
      registerContentScripts,
      unregisterContentScripts,
    };

    const prepared = await prepareNetworkObserverForReload(
      23,
      scriptingApi,
      {
        mode: "network_observer",
        matchUrlSubstrings: ["/daily-usage"],
        maxEntries: 4,
        maxBodyLength: 200_000,
        observeReload: true,
      },
      ["https://chatgpt.com/codex/*"],
    );

    expect(prepared).toEqual({
      registrationId: "ai-usage-dashboard-network-23",
    });
    expect(registerContentScripts).toHaveBeenCalledWith([
      expect.objectContaining({
        id: "ai-usage-dashboard-network-23",
        matches: ["https://chatgpt.com/codex/*"],
        js: ["page-session-network-observer-document-start.js"],
        runAt: "document_start",
        world: "MAIN",
        persistAcrossSessions: false,
      }),
    ]);

    await cleanupPreparedNetworkObserver(23, scriptingApi, prepared);

    expect(unregisterContentScripts).toHaveBeenLastCalledWith({
      ids: ["ai-usage-dashboard-network-23"],
    });
  });
});
