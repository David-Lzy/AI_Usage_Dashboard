import { describe, expect, it, vi } from "vitest";

import {
  installNetworkObserverBridge,
  readNetworkObserverBridge,
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
});
