import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ProviderSecrets } from "../providers/types";
import { SAMPLE_APP_STATE, SAMPLE_PROVIDER_SECRETS } from "../shared/demo-state";
import { readProviderSecrets } from "../shared/provider-secrets";
import { updateAppState, writeAppState } from "../shared/storage";
import { syncStoredProviderCredentials } from "./provider-credentials";

vi.mock("../shared/provider-secrets", () => ({
  readProviderSecrets: vi.fn(),
}));

vi.mock("../shared/storage", () => ({
  seedAppStateIfEmpty: vi.fn(),
  updateAppState: vi.fn(),
  writeAppState: vi.fn(),
}));

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
};

function createDeferred<T>(): Deferred<T> {
  let resolve = (_value: T) => {};
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
}

describe("provider credentials", () => {
  let secrets: ProviderSecrets;
  let stored: typeof SAMPLE_APP_STATE;

  beforeEach(async () => {
    vi.clearAllMocks();
    secrets = structuredClone(SAMPLE_PROVIDER_SECRETS);
    vi.mocked(readProviderSecrets).mockImplementation(async () =>
      structuredClone(secrets),
    );
    stored = structuredClone(SAMPLE_APP_STATE);
    vi.mocked(writeAppState).mockImplementation(async (state) => {
      stored = structuredClone(state);
      return structuredClone(stored);
    });
    vi.mocked(updateAppState).mockImplementation(async (updater) => {
      stored = updater(structuredClone(stored));
      return structuredClone(stored);
    });
    const { seedAppStateIfEmpty } = await import("../shared/storage");
    vi.mocked(seedAppStateIfEmpty).mockImplementation(async () =>
      structuredClone(stored),
    );
  });

  it("marks Cursor configured when a team admin key is stored", async () => {
    secrets["cursor-team-api"].adminApiKey = "cursor-test-key";

    const state = await syncStoredProviderCredentials();

    expect(
      state.providerSettings.find((provider) => provider.id === "cursor-team-api")
        ?.credentialStatus,
    ).toBe("configured");
    expect(
      state.providerSettings.find((provider) => provider.id === "jetbrains-org-page")
        ?.credentialStatus,
    ).toBe("not_required");
  });

  it("marks Cursor and Claude Code missing when no admin keys are stored", async () => {
    const state = await syncStoredProviderCredentials();

    expect(
      state.providerSettings.find((provider) => provider.id === "cursor-team-api")
        ?.credentialStatus,
    ).toBe("missing");
    expect(
      state.providerSettings.find((provider) => provider.id === "claude-code-admin-api")
        ?.credentialStatus,
    ).toBe("missing");
    expect(
      state.providerSettings.find((provider) => provider.id === "codex-enterprise-api")
        ?.credentialStatus,
    ).toBe("missing");
  });

  it("marks Claude Code configured when an Admin API key is stored", async () => {
    secrets["claude-code-admin-api"].adminApiKey = "claude-test-key";

    const state = await syncStoredProviderCredentials();

    expect(
      state.providerSettings.find((provider) => provider.id === "claude-code-admin-api")
        ?.credentialStatus,
    ).toBe("configured");
  });

  it("marks Codex configured only when both analytics key and workspace ID are stored", async () => {
    secrets["codex-enterprise-api"] = {
      analyticsApiKey: "codex-test-key",
      workspaceId: "workspace-test",
    };

    const state = await syncStoredProviderCredentials();

    expect(
      state.providerSettings.find((provider) => provider.id === "codex-enterprise-api")
        ?.credentialStatus,
    ).toBe("configured");
  });

  it("preserves newer settings and skips credentials read for a newly selected account", async () => {
    const credentialRead = createDeferred<ProviderSecrets>();
    vi.mocked(readProviderSecrets).mockReturnValueOnce(credentialRead.promise);

    const sync = syncStoredProviderCredentials();
    await vi.waitFor(() => {
      expect(readProviderSecrets).toHaveBeenCalledOnce();
    });

    await writeAppState({
      ...structuredClone(SAMPLE_APP_STATE),
      providerAccounts: {
        "cursor-team-api": {
          activeAccountId: "account_credentials-new-0001",
          accounts: [{
            id: "account_credentials-new-0001",
            label: "New account",
            createdAt: "2026-09-23T00:00:00.000Z",
            lastSuccessAt: null,
          }],
          inactiveAccounts: {},
        },
      },
      providerSettings: SAMPLE_APP_STATE.providerSettings.map((provider) =>
        provider.id === "cursor-team-api"
          ? { ...provider, credentialStatus: "missing" }
          : provider,
      ),
      settings: {
        ...SAMPLE_APP_STATE.settings,
        warningThresholdPercent: 77,
      },
    });
    credentialRead.resolve({
      ...structuredClone(SAMPLE_PROVIDER_SECRETS),
      "cursor-team-api": { adminApiKey: "cursor-test-key" },
    });

    const state = await sync;

    expect(state.settings.warningThresholdPercent).toBe(77);
    expect(
      state.providerSettings.find((provider) => provider.id === "cursor-team-api")
        ?.credentialStatus,
    ).toBe("missing");
  });
});
