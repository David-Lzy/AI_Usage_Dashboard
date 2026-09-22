import { afterEach, describe, expect, it, vi } from "vitest";

import { SAMPLE_APP_STATE } from "./demo-state";
import { getAppStateReplacementGeneration } from "./provider-sync-identity";
import { clearAppState, readAppState, seedAppStateIfEmpty, updateAppState, writeAppState } from "./storage";

afterEach(() => vi.unstubAllGlobals());

describe("serialized app state writes", () => {
  it("preserves independent concurrent settings edits", async () => {
    await writeAppState(SAMPLE_APP_STATE);
    await Promise.all([
      updateAppState((state) => ({ ...state, settings: { ...state.settings, warningThresholdPercent: 77 } })),
      updateAppState((state) => ({ ...state, settings: { ...state.settings, locale: "zh-CN" } })),
      updateAppState((state) => ({ ...state, settings: { ...state.settings, themeMode: "dark" } })),
    ]);
    expect((await readAppState())?.settings).toMatchObject({
      warningThresholdPercent: 77, locale: "zh-CN", themeMode: "dark",
    });
  });

  it("recovers after updater and storage errors", async () => {
    await writeAppState(SAMPLE_APP_STATE);
    await expect(updateAppState(() => { throw new Error("updater failed"); })).rejects.toThrow("updater failed");
    const local = {
      get: vi.fn(async () => ({})),
      set: vi.fn().mockRejectedValueOnce(new Error("write failed")).mockResolvedValue(undefined),
    };
    vi.stubGlobal("chrome", { storage: { local } });
    await expect(updateAppState((state) => state)).rejects.toThrow("write failed");
    await expect(updateAppState((state) => state)).resolves.toBeDefined();
    expect(local.set).toHaveBeenCalledTimes(2);
  });

  it("orders clearing, seeding and edits without duplicate first-run writes", async () => {
    const values: Record<string, unknown> = {};
    const local = {
      get: vi.fn(async () => structuredClone(values)),
      set: vi.fn(async (next: Record<string, unknown>) => Object.assign(values, structuredClone(next))),
      remove: vi.fn(async (key: string) => { delete values[key]; }),
    };
    vi.stubGlobal("chrome", { storage: { local } });
    await Promise.all([clearAppState(), seedAppStateIfEmpty(), seedAppStateIfEmpty()]);
    expect(local.set).toHaveBeenCalledTimes(1);
    await Promise.all([
      clearAppState(),
      updateAppState((state) => ({ ...state, settings: { ...state.settings, warningThresholdPercent: 73 } })),
    ]);
    expect((await readAppState())?.settings.warningThresholdPercent).toBe(73);
  });

  it("invalidates outstanding requests only for explicit full replacement", async () => {
    const initial = getAppStateReplacementGeneration();
    await writeAppState(SAMPLE_APP_STATE);
    const replaced = getAppStateReplacementGeneration();
    expect(replaced).toBeGreaterThan(initial);
    await updateAppState((state) => state);
    expect(getAppStateReplacementGeneration()).toBe(replaced);
    await clearAppState();
    expect(getAppStateReplacementGeneration()).toBeGreaterThan(replaced);
  });
});
