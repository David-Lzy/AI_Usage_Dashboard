import { describe, expect, it, vi } from "vitest";

import type { AppMessage } from "../background/message-bus";
import { SAMPLE_APP_STATE } from "../shared/constants";
import { createRuntimeI18n } from "../shared/i18n";
import type { AppToast } from "./use-standard-app-runtime";
import { createStandardAppSettingsActions } from "./standard-app-settings-actions";

function createSettingsActionHarness(
  overrides: Partial<Parameters<typeof createStandardAppSettingsActions>[0]> = {},
) {
  const applyMessage = vi.fn(
    async (_message: AppMessage, _successToast?: AppToast) => true,
  );
  const setToast = vi.fn();
  const appState = structuredClone(SAMPLE_APP_STATE);
  const actions = createStandardAppSettingsActions({
    appState,
    applyMessage,
    runtimeI18n: createRuntimeI18n("en"),
    setToast,
    ...overrides,
  });

  return { actions, appState, applyMessage, setToast };
}

describe("createStandardAppSettingsActions", () => {
  it("dispatches settings updates without changing settings locally", () => {
    const { actions, appState, applyMessage } = createSettingsActionHarness();

    actions.handleUpdateSettings({ syncIntervalMinutes: 45 });

    expect(applyMessage).toHaveBeenCalledWith({
      type: "app:update-settings",
      settings: { syncIntervalMinutes: 45 },
    });
    expect(appState.settings.syncIntervalMinutes).not.toBe(45);
  });

  it("dispatches source preference changes only when the value differs from current state", () => {
    const { actions, applyMessage } = createSettingsActionHarness();

    actions.handleSetSourcePreference("codex-enterprise-api", "official_api");
    actions.handleSetSourcePreference("codex-enterprise-api", "auto");

    expect(applyMessage).toHaveBeenCalledTimes(1);
    expect(applyMessage).toHaveBeenCalledWith({
      type: "app:set-provider-source-preference",
      providerId: "codex-enterprise-api",
      sourcePreference: "auto",
    });
  });

  it("dispatches credential and Codex workspace updates", () => {
    const { actions, applyMessage } = createSettingsActionHarness();

    actions.handleSaveProviderAdminApiKey("cursor-team-api", "cursor-key");
    actions.handleClearProviderAdminApiKey("cursor-team-api");
    actions.handleSaveCodexWorkspaceConfig("codex-key", "workspace-id");
    actions.handleClearCodexWorkspaceConfig();

    expect(applyMessage).toHaveBeenCalledWith({
      type: "app:set-provider-admin-api-key",
      providerId: "cursor-team-api",
      apiKey: "cursor-key",
    });
    expect(applyMessage).toHaveBeenCalledWith({
      type: "app:set-provider-admin-api-key",
      providerId: "cursor-team-api",
      apiKey: null,
    });
    expect(applyMessage).toHaveBeenCalledWith({
      type: "app:set-codex-workspace-config",
      analyticsApiKey: "codex-key",
      workspaceId: "workspace-id",
    });
    expect(applyMessage).toHaveBeenCalledWith({
      type: "app:set-codex-workspace-config",
      analyticsApiKey: null,
      workspaceId: null,
    });
  });

  it("saves preference feedback through a localized toast", () => {
    const { actions, setToast } = createSettingsActionHarness();

    actions.handleSavePreferences();

    expect(setToast).toHaveBeenCalledWith({
      tone: "success",
      title: "Preferences saved",
      message: "Settings are now persisted in local dashboard state for the preview.",
    });
  });
});
