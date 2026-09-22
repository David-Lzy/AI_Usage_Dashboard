import { beforeEach, describe, expect, it, vi } from "vitest";

import { SAMPLE_APP_STATE, SAMPLE_PROVIDER_SECRETS } from "../shared/demo-state";
import { setSub2ApiKey } from "../shared/provider-secrets";
import { clearAppState, readAppState, updateAppState, writeAppState } from "../shared/storage";
import { handleAppMessage } from "./message-bus";

vi.mock("../shared/provider-secrets", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../shared/provider-secrets")>()),
  setSub2ApiKey: vi.fn(),
}));
vi.mock("./provider-permissions", () => ({ syncStoredProviderPermissions: vi.fn() }));
vi.mock("./provider-credentials", () => ({ syncStoredProviderCredentials: vi.fn() }));

function gate() {
  let release = () => {};
  const promise = new Promise<void>((resolve) => { release = resolve; });
  return { promise, release };
}

describe("message state ownership", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await clearAppState();
    await writeAppState(SAMPLE_APP_STATE);
    vi.mocked(setSub2ApiKey).mockResolvedValue(SAMPLE_PROVIDER_SECRETS);
  });

  it("preserves settings changed while a deployment credential is saved", async () => {
    const started = gate();
    const pending = gate();
    vi.mocked(setSub2ApiKey).mockImplementation(async () => {
      started.release();
      await pending.promise;
      return SAMPLE_PROVIDER_SECRETS;
    });
    const save = handleAppMessage({ type: "app:save-sub2api-deployment", accountId: "default",
      displayLabel: "Synthetic gateway", baseUrl: "https://example.test", apiKey: "synthetic-key",
      insecureTransportAcknowledged: false });
    await started.promise;
    await updateAppState((state) => ({ ...state, settings: { ...state.settings, warningThresholdPercent: 77 } }));
    pending.release();
    expect((await save).ok).toBe(true);
    const state = (await readAppState())!;
    expect(state.settings.warningThresholdPercent).toBe(77);
    expect(state.providerAccounts?.["sub2api-api-key"]?.accounts[0].apiGatewayConnection?.baseUrl).toBe("https://example.test");
  });

  it("does not commit an old deployment save over a full configuration replacement", async () => {
    const started = gate();
    const pending = gate();
    vi.mocked(setSub2ApiKey).mockImplementation(async () => {
      started.release();
      await pending.promise;
      return SAMPLE_PROVIDER_SECRETS;
    });
    const save = handleAppMessage({ type: "app:save-sub2api-deployment", accountId: "default",
      displayLabel: "Obsolete gateway", baseUrl: "https://obsolete.example.test", apiKey: "synthetic-key",
      insecureTransportAcknowledged: false });
    await started.promise;
    const replacement = structuredClone(SAMPLE_APP_STATE);
    replacement.settings.warningThresholdPercent = 73;
    await writeAppState(replacement);
    pending.release();
    expect((await save).ok).toBe(false);
    const state = (await readAppState())!;
    expect(state.settings.warningThresholdPercent).toBe(73);
    expect(state.providerAccounts?.["sub2api-api-key"]?.accounts.some((a) => a.label === "Obsolete gateway")).toBe(false);
  });
});
