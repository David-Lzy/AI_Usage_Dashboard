import { describe, expect, it, vi } from "vitest";
import { createDefaultAppState } from "../shared/constants";
import { buildConfigurationBackup } from "../shared/configuration-backup";
import { normalizeAppState } from "../shared/storage";
import type { LocalCompanionPairing } from "../shared/local-companion-pairing";
import type { AppState } from "../providers/types";
import { createLocalCompanionController } from "./local-companion-controller";

const baseUrl = "http://127.0.0.1:47831";
const sourceId = "custom:ccusage" as const;
const token = "private-token-sentinel-".repeat(3);
const schema = "ai-usage-dashboard.local-bridge.v1";
const now = new Date("2026-09-22T12:00:00Z");
const payload = {
  schema: "ai-usage-dashboard.custom-source.v1", id: sourceId, label: "ccusage daily", status: "ok",
  syncedAt: "2026-09-22T10:00:00Z", quota: { label: "Tokens", unit: "tokens", used: 123 },
  balances: [{ label: "Estimated cost", unit: "USD", used: 1.25 }],
};
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

function setup() {
  let state = createDefaultAppState(); state.settings.userLevel = "developer";
  let pairing: LocalCompanionPairing | null = null;
  let replacement = 0;
  const writes: AppState[] = [];
  let route: (url: string, init?: RequestInit) => Response | Promise<Response> = (url) => {
    if (url.endsWith("/pair")) return json({ schema, token });
    if (url.endsWith("/health")) return json({ schema, status: "ok", bridgeVersion: "test", sourceCount: 1 });
    if (url.endsWith("/sources")) return json({ schema, sources: [{ sourceId, label: "ccusage daily" }] });
    if (url.endsWith("/revoke")) return json({ schema, status: "revoked" });
    return json(payload);
  };
  const fetchImpl = vi.fn((url: RequestInfo | URL, init?: RequestInit) => Promise.resolve(route(String(url), init)));
  const hasAccess = vi.fn(async () => true);
  const controller = createLocalCompanionController({
    readState: async () => structuredClone(state),
    updateState: async (update) => { state = normalizeAppState(update(structuredClone(state))); writes.push(structuredClone(state)); return structuredClone(state); },
    readPairing: async () => pairing ? structuredClone(pairing) : null,
    writePairing: async (value) => { pairing = value ? structuredClone(value) : null; },
    hasAccess, fetchImpl, now: () => now, replacement: () => replacement,
  });
  return { controller, fetchImpl, hasAccess, writes, get state() { return state; }, set state(value) { state = value; }, get pairing() { return pairing; }, setRoute: (value: typeof route) => { route = value; }, replace: () => { replacement++; }, pair: () => controller.handle({ action: "pair", baseUrl, pairingCode: "ABCD-EFGH" }) };
}

describe("authenticated local companion lifecycle", () => {
  it("pairs, indexes, refreshes only the selected source and keeps old file age and credentials private", async () => {
    const test = setup();
    expect((await test.controller.handle({ action: "status" })).localCompanion.status).toBe("disconnected");
    expect(test.fetchImpl).not.toHaveBeenCalled();
    expect((await test.pair()).localCompanion.sources).toEqual([{ sourceId, label: "ccusage daily", managedId: null }]);
    expect(test.state.customSources).toEqual([]);
    const response = await test.controller.handle({ action: "refresh-source", sourceId });
    const setting = response.state.customSources![0]!;
    expect(setting.id).toMatch(/^custom:companion-[a-f0-9]{40}$/);
    expect(setting.managedBy).toBe("local-companion");
    expect(response.localCompanion.sources[0]!.managedId).toBe(setting.id);
    expect(response.state.customSourceStates![0]).toMatchObject({ stale: true, lastAttemptAt: now.toISOString(), lastSuccessAt: "2026-09-22T10:00:00.000Z", snapshot: { used: 123, endpointId: null } });
    expect(JSON.stringify(response)).not.toContain(token);
    expect(JSON.stringify(buildConfigurationBackup(response.state))).not.toContain("companion-");
    expect(test.fetchImpl.mock.calls.filter(([url]) => String(url).includes("/sources/")).length).toBe(1);
    await test.controller.handle({ action: "refresh-source", sourceId });
    expect(test.state.customSourceStates![0]!.lastSuccessAt).toBe("2026-09-22T10:00:00.000Z");
    await test.controller.handle({ action: "refresh-source", sourceId: setting.id });
    expect(String(test.fetchImpl.mock.calls.at(-1)![0])).toBe(`${baseUrl}/v1/sources/custom%3Accusage`);
  });

  it("merges a successful held source response into the latest settings", async () => {
    const test = setup(); await test.pair();
    let release!: (response: Response) => void;
    let started!: () => void; const reached = new Promise<void>((resolve) => { started = resolve; });
    test.setRoute(() => { started(); return new Promise<Response>((resolve) => { release = resolve; }); });
    const pending = test.controller.handle({ action: "refresh-source", sourceId }); await reached;
    test.state.settings.warningThresholdPercent = 68;
    const count = test.writes.length;
    release(json(payload)); await pending;
    expect(test.writes.slice(count).every((state) => state.settings.warningThresholdPercent === 68)).toBe(true);
    expect(test.state.customSources).toHaveLength(1);
  });

  it("preserves concurrent settings and never resurrects a source after removal", async () => {
    const test = setup(); await test.pair(); await test.controller.handle({ action: "refresh-source", sourceId });
    const writesBefore = test.writes.length;
    let release!: (response: Response) => void;
    let started!: () => void; const reached = new Promise<void>((resolve) => { started = resolve; });
    test.setRoute(() => { started(); return new Promise<Response>((resolve) => { release = resolve; }); });
    const pending = test.controller.handle({ action: "refresh-source", sourceId });
    await reached;
    test.state = { ...test.state, settings: { ...test.state.settings, warningThresholdPercent: 67 } };
    const removed = test.controller.handle({ action: "remove-source", sourceId });
    release(json(payload));
    expect((await pending).localCompanion.failure).toBe("superseded");
    await removed;
    expect(test.state.customSources).toEqual([]);
    expect(test.writes.slice(writesBefore).every((state) => state.settings.warningThresholdPercent === 67)).toBe(true);
    expect(test.state.settings.warningThresholdPercent).toBe(67);
  });

  it("fences a held refresh when application configuration is replaced", async () => {
    const test = setup(); await test.pair();
    let release!: (response: Response) => void;
    let started!: () => void; const reached = new Promise<void>((resolve) => { started = resolve; });
    test.setRoute(() => { started(); return new Promise<Response>((resolve) => { release = resolve; }); });
    const pending = test.controller.handle({ action: "refresh-source", sourceId }); await reached;
    test.replace(); test.state = createDefaultAppState(); release(json(payload));
    expect((await pending).localCompanion.failure).toBe("superseded");
    expect(test.state.customSources ?? []).toEqual([]);
  });

  it("marks service-restart authorization loss expired without relabeling cached data as fresh", async () => {
    const test = setup(); await test.pair(); await test.controller.handle({ action: "refresh-source", sourceId });
    test.setRoute(() => json({ error: "raw-private-error" }, 401));
    const result = await test.controller.handle({ action: "refresh-index" });
    expect(result.localCompanion).toMatchObject({ status: "expired", failure: "unauthorized" });
    expect(test.pairing!.token).toBeNull();
    expect(test.state.customSourceStates![0]).toMatchObject({ stale: true, lastSuccessAt: "2026-09-22T10:00:00.000Z", lastFailureReason: "unauthorized" });
    expect(JSON.stringify(result)).not.toContain("raw-private-error");
  });

  it("rejects unsafe URLs, missing permissions and non-developer settings before HTTP", async () => {
    const test = setup();
    expect((await test.controller.handle({ action: "pair", baseUrl: "https://remote.example", pairingCode: "ABCD-EFGH" })).localCompanion.failure).toBe("invalid_base_url");
    test.hasAccess.mockResolvedValue(false);
    expect((await test.pair()).localCompanion.failure).toBe("permission_required");
    test.state.settings.userLevel = "advanced";
    expect((await test.pair()).localCompanion.failure).toBe("developer_required");
    expect(test.fetchImpl).not.toHaveBeenCalled();
  });

  it("retains unavailable captures as unknown and does not fetch a source outside the index", async () => {
    const test = setup(); await test.pair();
    const count = test.fetchImpl.mock.calls.length;
    expect((await test.controller.handle({ action: "refresh-source", sourceId: "custom:unmapped" })).localCompanion.failure).toBe("source_missing");
    expect(test.fetchImpl).toHaveBeenCalledTimes(count);
    test.setRoute(() => json({ ...payload, syncedAt: undefined }));
    await test.controller.handle({ action: "refresh-source", sourceId });
    expect(test.state.customSourceStates![0]).toMatchObject({ lastSuccessAt: null, stale: true, snapshot: { syncedAt: "" } });
  });

  it("disconnects locally even when remote revocation fails and leaves other managed protocols intact", async () => {
    const test = setup(); await test.pair(); await test.controller.handle({ action: "refresh-source", sourceId });
    const codexbar = { ...test.state.customSources![0]!, id: "custom:codexbar-test" as const, managedBy: "codexbar-dashboard" as const };
    test.state.customSources!.push(codexbar);
    test.setRoute(() => { throw new Error("offline"); });
    const result = await test.controller.handle({ action: "disconnect" });
    expect(test.pairing).toBeNull();
    expect(result.localCompanion.status).toBe("disconnected");
    expect(result.state.customSources).toEqual([codexbar]);
  });
});
