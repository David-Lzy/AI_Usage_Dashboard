import { describe, expect, it, vi } from "vitest";

import {
  executeScriptResult,
  readIsolatedPageSnapshot,
  readMainWorldWindowValues,
  uniqueStrings,
  type PageSessionScriptingApi,
} from "./page-session-script-capture";

function createResultApi(result: unknown): PageSessionScriptingApi {
  return {
    executeScript: vi.fn().mockResolvedValue([{ result }]),
  };
}

function createExecutingApi(): PageSessionScriptingApi {
  return {
    executeScript: vi.fn(async (injection) => [
      {
        result: injection.func(...(injection.args ?? [])),
      },
    ]),
  };
}

describe("page-session script capture helpers", () => {
  it("throws when a script returns no result", async () => {
    const scriptingApi: PageSessionScriptingApi = {
      executeScript: vi.fn().mockResolvedValue([]),
    };

    await expect(
      executeScriptResult(scriptingApi, {
        tabId: 1,
        func: () => "unused",
      }),
    ).rejects.toThrow("Page-session script did not return a result.");
  });

  it("deduplicates non-empty string lists in order", () => {
    expect(uniqueStrings(["#a", "", "#b", "#a"])).toEqual(["#a", "#b"]);
    expect(uniqueStrings(undefined)).toEqual([]);
  });

  it("normalizes isolated snapshot scripts to an empty map", async () => {
    await expect(
      readIsolatedPageSnapshot(7, createResultApi({
        url: "https://cursor.com/dashboard",
        title: "Cursor",
        heading: null,
        html: "<html></html>",
        scripts: null,
      }), ["#__NEXT_DATA__"]),
    ).resolves.toEqual({
      url: "https://cursor.com/dashboard",
      title: "Cursor",
      heading: null,
      html: "<html></html>",
      scripts: {},
    });
  });

  it("rejects invalid isolated snapshots", async () => {
    await expect(
      readIsolatedPageSnapshot(7, createResultApi({
        url: null,
        title: "Cursor",
        html: "<html></html>",
      }), []),
    ).rejects.toThrow("Page-session isolated capture returned an invalid page snapshot.");
  });

  it("serializes only whitelisted new Codex aggregates and never asks for the full HTML", async () => {
    const api = createResultApi({ sourceUrl: "https://chatgpt.com/settings/usage", rows: [
      { key: "quota.weekly", label: "Weekly limit", value: 70, unit: "percent", direction: "remaining" },
      { key: "function.tasks", label: "Tasks", value: 74.7, unit: "percent" },
    ], rangeStart: "2026-10-07", rangeEnd: "2026-10-13", sharedPlan: true, loggedOut: false,
      html: "private-conversation-title", title: "private-conversation-title" });
    const result = await readIsolatedPageSnapshot(7, api, [], "codex");
    expect(result.html).toContain("70% remaining");
    expect(result.usageInsights?.distribution?.values).toEqual([{ id: "tasks", label: "Tasks", value: 74.7 }]);
    expect(JSON.stringify(result)).not.toContain("private-");
    expect(api.executeScript).toHaveBeenCalledTimes(1);
  });

  it("skips main-world execution when no window keys are requested", async () => {
    const scriptingApi = createExecutingApi();

    await expect(
      readMainWorldWindowValues(3, scriptingApi, [], 20_000),
    ).resolves.toEqual({});

    expect(scriptingApi.executeScript).not.toHaveBeenCalled();
  });

  it("serializes and truncates main-world window values", async () => {
    const scriptingApi = createExecutingApi();
    const testKey = "__AI_USAGE_DASHBOARD_TEST_WINDOW_VALUE__";
    const objectKey = "__AI_USAGE_DASHBOARD_TEST_OBJECT_VALUE__";

    try {
      (globalThis as Record<string, unknown>)[testKey] = "abcdef";
      (globalThis as Record<string, unknown>)[objectKey] = { ok: true };

      await expect(
        readMainWorldWindowValues(3, scriptingApi, [testKey, objectKey], 3),
      ).resolves.toEqual({
        [testKey]: "abc…",
        [objectKey]: '{"o…',
      });
    } finally {
      delete (globalThis as Record<string, unknown>)[testKey];
      delete (globalThis as Record<string, unknown>)[objectKey];
    }
  });
});
