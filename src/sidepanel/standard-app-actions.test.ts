import { afterEach, describe, expect, it, vi } from "vitest";

import type { AppMessage } from "../background/message-bus";
import { SAMPLE_APP_STATE } from "../shared/constants";
import { createRuntimeI18n } from "../shared/i18n";
import type { AppToast } from "./use-standard-app-runtime";
import { createStandardAppActions } from "./standard-app-actions";

function createActionHarness(
  overrides: Partial<Parameters<typeof createStandardAppActions>[0]> = {},
) {
  const applyMessage = vi.fn(
    async (_message: AppMessage, _successToast?: AppToast) => true,
  );
  const setToast = vi.fn();
  const appState = structuredClone(SAMPLE_APP_STATE);
  const actions = createStandardAppActions({
    appState,
    applyMessage,
    isFullPageSurface: false,
    route: { name: "dashboard" },
    runtimeI18n: createRuntimeI18n("en"),
    setToast,
    ...overrides,
  });

  return { actions, appState, applyMessage, setToast };
}

describe("createStandardAppActions", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reports session-page controls unavailable outside extension mode", () => {
    const { actions } = createActionHarness();

    expect(actions.sessionPageNavigationAvailable).toBe(false);
    expect(actions.activeSessionPageAttachAvailable).toBe(false);
  });

  it("does not dispatch provider actions before app state is loaded", () => {
    const { actions, applyMessage } = createActionHarness({
      appState: null,
    });

    actions.handleRefresh("codex");
    actions.handleToggleProvider("codex");

    expect(applyMessage).not.toHaveBeenCalled();
  });

  it("dispatches provider refresh through the shared sync flow", async () => {
    const { actions, applyMessage } = createActionHarness();

    actions.handleRefresh("codex");

    await vi.waitFor(() => {
      expect(applyMessage).toHaveBeenCalledWith(
        { type: "app:request-refresh", providerId: "codex" },
        expect.objectContaining({
          title: "Codex refreshed",
        }),
      );
    });
  });

  it("requests missing host access before refreshing one provider", async () => {
    const appState = structuredClone(SAMPLE_APP_STATE);
    const codex = appState.providerSettings.find(
      (provider) => provider.id === "codex",
    );

    if (!codex) {
      throw new Error("Missing Codex provider setting.");
    }

    codex.status = "missing";

    const request = vi.fn(async () => true);

    vi.stubGlobal("chrome", {
      runtime: { id: "extension-id" },
      permissions: {
        request,
        contains: vi.fn(),
        remove: vi.fn(),
      },
    });

    const { actions, applyMessage } = createActionHarness({ appState });

    actions.handleRefresh("codex");

    await vi.waitFor(() => {
      expect(request).toHaveBeenCalledWith({
        origins: codex.hostOrigins,
      });
      expect(applyMessage).toHaveBeenCalledWith(
        { type: "app:request-refresh", providerId: "codex" },
        expect.objectContaining({
          title: "Codex refreshed",
        }),
      );
    });
  });

  it("stops refresh when the host access request is denied", async () => {
    const appState = structuredClone(SAMPLE_APP_STATE);
    const codex = appState.providerSettings.find(
      (provider) => provider.id === "codex",
    );

    if (!codex) {
      throw new Error("Missing Codex provider setting.");
    }

    codex.status = "missing";

    vi.stubGlobal("chrome", {
      runtime: { id: "extension-id" },
      permissions: {
        request: vi.fn(async () => false),
        contains: vi.fn(),
        remove: vi.fn(),
      },
    });

    const { actions, applyMessage, setToast } = createActionHarness({ appState });

    actions.handleRefresh("codex");

    await vi.waitFor(() => {
      expect(setToast).toHaveBeenCalledWith(
        expect.objectContaining({
          tone: "error",
          title: "Codex access denied",
        }),
      );
    });
    expect(applyMessage).not.toHaveBeenCalled();
  });

  it("dispatches settings updates without changing settings locally", () => {
    const { actions, appState, applyMessage } = createActionHarness();

    actions.handleUpdateSettings({ syncIntervalMinutes: 45 });

    expect(applyMessage).toHaveBeenCalledWith({
      type: "app:update-settings",
      settings: { syncIntervalMinutes: 45 },
    });
    expect(appState.settings.syncIntervalMinutes).not.toBe(45);
  });

  it("toggles provider visibility using current provider state", () => {
    const { actions, appState, applyMessage } = createActionHarness();
    const codex = appState.providerSettings.find(
      (provider) => provider.id === "codex",
    );

    expect(codex?.enabled).toBe(true);

    actions.handleToggleProvider("codex");

    expect(applyMessage).toHaveBeenCalledWith(
      {
        type: "app:set-provider-enabled",
        providerId: "codex",
        enabled: false,
      },
      expect.objectContaining({
        title: "Codex hidden",
      }),
    );
  });

  it("saves preference feedback through a localized toast", () => {
    const { actions, setToast } = createActionHarness();

    actions.handleSavePreferences();

    expect(setToast).toHaveBeenCalledWith({
      tone: "success",
      title: "Preferences saved",
      message: "Settings are now persisted in local dashboard state for the preview.",
    });
  });
});
