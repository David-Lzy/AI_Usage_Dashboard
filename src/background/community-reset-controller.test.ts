import { describe, expect, it, vi } from "vitest";
import { createCommunityResetController } from "./community-reset-controller";
import { normalizeCommunityResetStore, type CommunityResetStore } from "../shared/community-reset-feeds";

const now = Date.parse("2026-10-13T06:00:00Z");
function setup(enabled = false) {
  let store = normalizeCommunityResetStore(undefined);
  if (enabled) store.preferences.mode = "in_app";
  const fetcher = vi.fn(async (url: string, _init: RequestInit) => new Response(JSON.stringify(url.includes("/v1/")
    ? { meta: { api_version: "v1", generated_at: new Date(now).toISOString() }, data: url.includes("status") ? { latest_reset: null, scheduled_reset: null, active_watch: null } : [] }
    : url.includes("timeline") ? { events: [] } : { updated_at: new Date(now).toISOString(), probabilities: { rounded_24h: 19, rounded_48h: 34 } })));
  const hostAccess = vi.fn(async (_source: string) => true);
  const schedule = vi.fn(async (_enabled: boolean) => undefined);
  const deps = { readStore: async () => store, writeStore: async (next: CommunityResetStore) => { store = next; },
    fetcher, hostAccess, schedule, suppressed: async () => false, now: () => now };
  return { controller: createCommunityResetController(deps), deps, fetcher, hostAccess, schedule, read: () => store };
}
describe("optional community background controller", () => {
  it("makes no request or permission prompt while off and clears its alarm", async () => {
    const { controller, fetcher, hostAccess, schedule } = setup();
    await controller.poll();
    expect(fetcher).not.toHaveBeenCalled();
    expect(hostAccess).not.toHaveBeenCalled();
    expect(schedule).toHaveBeenCalledWith(false);
  });
  it("coalesces polling and uses separate endpoint caches across worker restarts", async () => {
    const { controller, deps, fetcher, read } = setup(true);
    await Promise.all([controller.poll(), controller.poll()]);
    expect(fetcher).toHaveBeenCalledTimes(4);
    expect(Object.keys(read().caches)).toHaveLength(4);
    await createCommunityResetController(deps).poll();
    expect(fetcher).toHaveBeenCalledTimes(4);
  });
  it("works with one denied source without requesting permission in the background", async () => {
    const { controller, hostAccess, fetcher, read } = setup(true);
    hostAccess.mockImplementation(async (source) => source === "codex-reset");
    await controller.poll();
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(read().caches.status?.failure).toBe("permission");
    expect(read().caches.timeline?.failure).toBeNull();
  });
  it("abort/late responses cannot restore an off source, and disabling does not wait for I/O", async () => {
    const { controller, fetcher, read } = setup(true);
    let resolve!: (response: Response) => void;
    fetcher.mockImplementationOnce(async (_url, init) => new Promise<Response>((done) => {
      resolve = done; expect(init.signal!.aborted).toBe(false);
    }));
    const poll = controller.poll();
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
    const change = await controller.handle({ type: "community-resets:update", preferences: { mode: "off", sources: ["codex-reset"] } });
    expect(change.ok).toBe(true);
    expect(read().preferences.mode).toBe("off");
    resolve(new Response(JSON.stringify({ meta: { api_version: "v1", generated_at: new Date(now).toISOString() }, data: {} })));
    await poll;
    expect(read().caches).toEqual({});
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("does not poll during screenshot lock or recreate denied/off alarms", async () => {
    const { deps, fetcher, schedule } = setup(true);
    const controller = createCommunityResetController({ ...deps, suppressed: async () => true });
    await controller.poll();
    expect(fetcher).not.toHaveBeenCalled();
    expect(schedule).toHaveBeenCalledWith(false);
  });
  it("honors durable backoff after both sources fail", async () => {
    const { controller, deps, fetcher, read } = setup(true);
    fetcher.mockImplementation(async () => new Response(null, { status: 503, headers: { "retry-after": "3600" } }));
    await controller.poll();
    expect(Object.values(read().caches).every((cache) => cache!.failure === "rate_limited")).toBe(true);
    await createCommunityResetController({ ...deps, now: () => now + 10 * 60_000 }).poll();
    expect(fetcher).toHaveBeenCalledTimes(4);
  });
  it("drops a final response if source permission was revoked mid-flight", async () => {
    const { controller, hostAccess, fetcher, read } = setup(true);
    fetcher.mockImplementationOnce(async () => { hostAccess.mockResolvedValue(false); return new Response(JSON.stringify({
      meta: { api_version: "v1", generated_at: new Date(now).toISOString() }, data: { latest_reset: null, scheduled_reset: null, active_watch: null },
    })); });
    await controller.poll();
    expect(read().caches.status).toMatchObject({ fragment: null, failure: "permission" });
  });
  it("rejects an outdated preference draft rather than re-enabling another window's source", async () => {
    const { controller, read, fetcher } = setup(true);
    expect((await controller.handle({ type: "community-resets:update", expectedRevision: 0, preferences: { mode: "off", sources: ["codex-reset"] } })).ok).toBe(true);
    expect((await controller.handle({ type: "community-resets:update", expectedRevision: 0, preferences: { mode: "desktop", sources: ["codex-resets"] } })).ok).toBe(false);
    expect(read().revision).toBe(1);
    expect(read().preferences).toEqual({ mode: "off", sources: ["codex-reset"] });
    expect(fetcher).not.toHaveBeenCalled();
  });
});
