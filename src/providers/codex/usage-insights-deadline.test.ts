import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createCodexPersonalPageClient } from "./personal-page-client";
import { createEmptyPageBinding } from "../../shared/page-bindings";
import type { PageSessionClient } from "../page-session";

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-13T10:00:00Z")); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function setup(directMs: number) {
  const fixture = await createCodexPersonalPageClient({ source: "fixture" }).getUsageSnapshot();
  if (fixture.result.status !== "ok") throw new Error("Synthetic quota fixture is invalid");
  const result = fixture.result;
  const query = vi.fn(async () => [{ id: 88, url: "https://chatgpt.com/settings/usage", active: false }]);
  const execute = vi.fn<NonNullable<PageSessionClient["executeMainWorld"]>>();
  const capture = vi.fn<PageSessionClient["capture"]>();
  vi.stubGlobal("chrome", { runtime: { id: "synthetic-deadline-extension" }, tabs: { query } });
  const client = createCodexPersonalPageClient({ source: "live", deadlineMs: 1000,
    sessionApiClient: { getUsageSnapshot: async () => { await delay(directMs); return { ok: true, result, historyState: "unavailable", replacePreviousSnapshot: false }; } },
    pageSessionClient: { capture, executeMainWorld: execute as NonNullable<PageSessionClient["executeMainWorld"]> },
  });
  return { client, result, query, execute, capture };
}
describe("Codex optional insights share only the remaining refresh budget", () => {
  it("keeps a quota success in the last 10ms and skips browser enrichment", async () => {
    const { client, result, query, execute, capture } = await setup(990);
    const pending = client.getUsageSnapshot(createEmptyPageBinding());
    await vi.advanceTimersByTimeAsync(990);
    expect(await pending).toMatchObject({ captureSource: "session_api", result: { status: "ok", snapshot: result.snapshot } });
    expect(query).not.toHaveBeenCalled(); expect(execute).not.toHaveBeenCalled(); expect(capture).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("caps a slow tab query and does not execute a renderer when it later finishes", async () => {
    const { client, result, query, execute } = await setup(900);
    query.mockImplementation(async () => { await delay(500); return [{ id: 88, url: "https://chatgpt.com/settings/usage", active: false }]; });
    const pending = client.getUsageSnapshot();
    await vi.advanceTimersByTimeAsync(950);
    expect(await pending).toMatchObject({ captureSource: "session_api", result: { status: "ok", snapshot: result.snapshot } });
    expect(query).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1000);
    expect(execute).not.toHaveBeenCalled(); expect(vi.getTimerCount()).toBe(0);
  });
  it("ignores a late renderer result without overwriting an accepted quota capture", async () => {
    const { client, result, execute } = await setup(900);
    execute.mockImplementation(async () => { await delay(500); return { sourceUrl: "https://chatgpt.com/settings/usage", rows: [], rangeStart: null, rangeEnd: null, sharedScope: true }; });
    const pending = client.getUsageSnapshot();
    await vi.advanceTimersByTimeAsync(950);
    const accepted = await pending;
    expect(execute).toHaveBeenCalledTimes(1);
    expect(accepted).toMatchObject({ captureSource: "session_api", result: { status: "ok", snapshot: result.snapshot } });
    expect(accepted.result.status === "ok" && accepted.result.snapshot.usageInsights).toBeUndefined();
    await vi.advanceTimersByTimeAsync(1000);
    expect(accepted.result.status === "ok" && accepted.result.snapshot.usageInsights).toBeUndefined();
    expect(vi.getTimerCount()).toBe(0);
  });
});
