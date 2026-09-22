import { afterEach, describe, expect, it, vi } from "vitest";
import { LOCAL_COMPANION_PAIRING_KEY, readLocalCompanionPairing, writeLocalCompanionPairing } from "./local-companion-pairing";

afterEach(() => vi.unstubAllGlobals());
describe("private local companion pairing store", () => {
  it("uses a separate local key, whitelists metadata and does not expose arbitrary fields", async () => {
    const store: Record<string, unknown> = { codexbar: "untouched" };
    vi.stubGlobal("chrome", { storage: { local: { get: async (key: string) => ({ [key]: store[key] }), set: async (value: Record<string, unknown>) => Object.assign(store, value), remove: async (key: string) => { delete store[key]; } } } });
    await writeLocalCompanionPairing({ baseUrl: "http://127.0.0.1:47831", token: "a".repeat(43), status: "connected", checkedAt: "2026-09-22T10:00:00Z", sources: [{ sourceId: "custom:test", label: "Test" }] });
    expect((await readLocalCompanionPairing())?.token).toBe("a".repeat(43));
    expect(Object.keys(store)).toEqual(["codexbar", LOCAL_COMPANION_PAIRING_KEY]);
    await writeLocalCompanionPairing(null);
    expect(store).toEqual({ codexbar: "untouched" });
  });
  it("rejects remote or credential-bearing URLs and corrupt source lists", async () => {
    vi.stubGlobal("chrome", { storage: { local: { get: async () => ({ [LOCAL_COMPANION_PAIRING_KEY]: { baseUrl: "http://evil.example:47831", token: "a".repeat(43), status: "connected", sources: [] } }) } } });
    expect(await readLocalCompanionPairing()).toBeNull();
  });
});
