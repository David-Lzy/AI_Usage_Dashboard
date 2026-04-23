import { beforeEach, describe, expect, it } from "vitest";

import { SAMPLE_APP_STATE } from "../shared/constants";
import {
  setCodexWorkspaceConfig,
  setProviderAdminApiKey,
} from "../shared/provider-secrets";
import { writeAppState } from "../shared/storage";
import { syncStoredProviderCredentials } from "./provider-credentials";

describe("provider credentials", () => {
  beforeEach(async () => {
    await writeAppState(SAMPLE_APP_STATE);
    await setProviderAdminApiKey("cursor", null);
    await setProviderAdminApiKey("claude-code", null);
    await setCodexWorkspaceConfig(null, null);
  });

  it("marks Cursor configured when a team admin key is stored", async () => {
    await setProviderAdminApiKey("cursor", "  cursor-live-key  ");

    const state = await syncStoredProviderCredentials();

    expect(
      state.providerSettings.find((provider) => provider.id === "cursor")
        ?.credentialStatus,
    ).toBe("configured");
    expect(
      state.providerSettings.find((provider) => provider.id === "jetbrains")
        ?.credentialStatus,
    ).toBe("not_required");
  });

  it("marks Cursor and Claude Code missing when no admin keys are stored", async () => {
    const state = await syncStoredProviderCredentials();

    expect(
      state.providerSettings.find((provider) => provider.id === "cursor")
        ?.credentialStatus,
    ).toBe("missing");
    expect(
      state.providerSettings.find((provider) => provider.id === "claude-code")
        ?.credentialStatus,
    ).toBe("missing");
    expect(
      state.providerSettings.find((provider) => provider.id === "codex")
        ?.credentialStatus,
    ).toBe("missing");
  });

  it("marks Claude Code configured when an Admin API key is stored", async () => {
    await setProviderAdminApiKey("claude-code", " sk-ant-admin-live ");

    const state = await syncStoredProviderCredentials();

    expect(
      state.providerSettings.find((provider) => provider.id === "claude-code")
        ?.credentialStatus,
    ).toBe("configured");
  });

  it("marks Codex configured only when both analytics key and workspace ID are stored", async () => {
    await setCodexWorkspaceConfig(" sk-codex-live ", " ws_123 ");

    const state = await syncStoredProviderCredentials();

    expect(
      state.providerSettings.find((provider) => provider.id === "codex")
        ?.credentialStatus,
    ).toBe("configured");
  });
});
