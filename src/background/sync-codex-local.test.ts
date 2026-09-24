import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_APP_STATE } from "../shared/constants";
import { syncCodexBySelectedSource } from "./sync-engine";
import { readLocalCompanionPairing } from "../shared/local-companion-pairing";
import { getProviderSyncAdapter } from "../providers/registry";
import { syncCodexLocalProvider } from "../providers/codex/local-companion-adapter";
import { codexCredentialBroker } from "../providers/codex/session-credential-broker";
import { computeCodexAccountDigest } from "../shared/codex-local-bridge";

vi.mock("../shared/local-companion-pairing", () => ({ readLocalCompanionPairing: vi.fn() }));
vi.mock("../providers/registry", () => ({ getProviderSyncAdapter: vi.fn() }));
vi.mock("../providers/codex/local-companion-adapter", () => ({ syncCodexLocalProvider: vi.fn() }));
vi.mock("../providers/codex/session-credential-broker", () => ({ codexCredentialBroker: { peekCredential: vi.fn() } }));
vi.mock("../shared/codex-local-bridge", () => ({ computeCodexAccountDigest: vi.fn() }));

const provider = DEFAULT_APP_STATE.providers.find((item) => item.providerId === "codex-personal-page")!;
const setting = DEFAULT_APP_STATE.providerSettings.find((item) => item.id === "codex-personal-page")!;
const localSnapshot = { ...provider, syncSource: "local_companion" as const, syncStatus: "ok" as const, usageHistory: undefined };
const pairing = { baseUrl: "http://127.0.0.1:47831", token: "test-token", codexAvailable: true, codexMode: "local" as const, status: "connected" as const, checkedAt: null, sources: [] };

describe("Codex source routing", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(readLocalCompanionPairing).mockResolvedValue(pairing);
    vi.mocked(syncCodexLocalProvider).mockResolvedValue({ snapshot: localSnapshot, accountDigest: "digest-a" });
    vi.mocked(getProviderSyncAdapter).mockReturnValue({ sync: vi.fn() } as never);
  });

  const run = () => syncCodexBySelectedSource(provider, setting, DEFAULT_APP_STATE, "default", {} as never, "manual", new Date("2026-09-24T10:00:00.000Z"));

  it("never invokes the browser adapter in local-only mode", async () => {
    const result = await run();
    expect(result.snapshot.syncSource).toBe("local_companion");
    expect(getProviderSyncAdapter).not.toHaveBeenCalled();
    expect(codexCredentialBroker.peekCredential).not.toHaveBeenCalled();
  });

  it("does not silently fall back when local-only refresh fails", async () => {
    vi.mocked(syncCodexLocalProvider).mockResolvedValue({ snapshot: { ...localSnapshot, syncStatus: "error" }, accountDigest: null });
    expect((await run()).snapshot.syncStatus).toBe("error");
    expect(getProviderSyncAdapter).not.toHaveBeenCalled();
  });

  it("rejects browser history when the hybrid account binding differs", async () => {
    vi.mocked(readLocalCompanionPairing).mockResolvedValue({ ...pairing, codexMode: "hybrid" });
    vi.mocked(codexCredentialBroker.peekCredential!).mockResolvedValue({ accountId: "browser-account" } as never);
    vi.mocked(computeCodexAccountDigest).mockResolvedValue("digest-other");
    vi.mocked(getProviderSyncAdapter).mockReturnValue({ sync: vi.fn().mockResolvedValue({ snapshot: { ...provider, syncStatus: "ok", lastSuccessAt: "2026-09-24T10:00:00.000Z", usageHistory: { turns: { total: 3 } } } }) } as never);
    const result = await run();
    expect(result.snapshot.usageHistory).toBeUndefined();
    expect(result.snapshot.syncSource).toBe("local_companion");
  });
});
