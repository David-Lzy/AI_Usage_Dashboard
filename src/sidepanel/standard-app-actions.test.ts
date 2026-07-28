import { afterEach, describe, expect, it, vi } from "vitest";

import type { AppMessage } from "../shared/app-message-types";
import { SAMPLE_APP_STATE } from "../shared/constants";
import { createRuntimeI18n } from "../shared/i18n";
import type { AppToast } from "./use-standard-app-runtime";
import { createStandardAppActions } from "./standard-app-actions";

function createActionHarness(
  overrides: Partial<Parameters<typeof createStandardAppActions>[0]> = {},
) {
  const appState = structuredClone(SAMPLE_APP_STATE);
  const applyMessage = vi.fn(
    async (_message: AppMessage, _successToast?: AppToast) => appState,
  );
  const setToast = vi.fn();
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

    actions.handleRefresh("codex-personal-page");
    actions.handleToggleProvider("codex-personal-page");

    expect(applyMessage).not.toHaveBeenCalled();
  });

  it("dispatches provider refresh through the shared sync flow", async () => {
    const { actions, applyMessage } = createActionHarness();

    actions.handleRefresh("codex-personal-page");

    await vi.waitFor(() => {
      expect(applyMessage).toHaveBeenCalledWith(
        { type: "app:request-refresh", providerId: "codex-personal-page" },
        expect.objectContaining({
          title: "Codex refreshed",
        }),
      );
    });
  });

  it("reports the refreshed Sub2API deployment health without a generic success toast", async () => {
    const appState = structuredClone(SAMPLE_APP_STATE);
    const snapshot = appState.providers.find(
      ({ providerId }) => providerId === "sub2api-api-key",
    );
    if (!snapshot) {
      throw new Error("Missing Sub2API sample snapshot.");
    }
    snapshot.syncStatus = "ok";
    const applyMessage = vi.fn(async () => appState);
    const { actions } = createActionHarness({ appState, applyMessage });

    await expect(actions.handleTestSub2ApiDeployment()).resolves.toBe(true);
    expect(applyMessage).toHaveBeenCalledWith(
      { type: "app:request-refresh", providerId: "sub2api-api-key" },
      undefined,
    );

    snapshot.syncStatus = "warning";
    await expect(actions.handleTestSub2ApiDeployment()).resolves.toBe(false);
  });

  it("requests missing host access before refreshing one provider", async () => {
    const appState = structuredClone(SAMPLE_APP_STATE);
    const codex = appState.providerSettings.find(
      (provider) => provider.id === "codex-personal-page",
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

    actions.handleRefresh("codex-personal-page");

    await vi.waitFor(() => {
      expect(request).toHaveBeenCalledWith({
        origins: codex.hostOrigins,
      });
      expect(applyMessage).toHaveBeenCalledWith(
        { type: "app:request-refresh", providerId: "codex-personal-page" },
        expect.objectContaining({
          title: "Codex refreshed",
        }),
      );
    });
  });

  it("stops refresh when the host access request is denied", async () => {
    const appState = structuredClone(SAMPLE_APP_STATE);
    const codex = appState.providerSettings.find(
      (provider) => provider.id === "codex-personal-page",
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

    actions.handleRefresh("codex-personal-page");

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

  it("refreshes the provider immediately after its permission toggle is granted", async () => {
    const appState = structuredClone(SAMPLE_APP_STATE);
    const codex = appState.providerSettings.find(
      (provider) => provider.id === "codex-personal-page",
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

    actions.handleTogglePermission("codex-personal-page");

    await vi.waitFor(() => {
      expect(applyMessage).toHaveBeenCalledWith(
        {
          type: "app:request-refresh",
          providerId: "codex-personal-page",
        },
        expect.objectContaining({
          title: `${codex.label} access granted`,
          message: expect.stringContaining("immediate refresh"),
        }),
      );
    });
  });

  it("does not refresh after its permission toggle is denied", async () => {
    const appState = structuredClone(SAMPLE_APP_STATE);
    const codex = appState.providerSettings.find(
      (provider) => provider.id === "codex-personal-page",
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

    actions.handleTogglePermission("codex-personal-page");

    await vi.waitFor(() => {
      expect(setToast).toHaveBeenCalledWith(
        expect.objectContaining({
          tone: "error",
          title: `${codex.label} access denied`,
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

  it("dispatches custom source updates through the app message bus", () => {
    const { actions, applyMessage } = createActionHarness();
    const customSources = [
      {
        id: "custom:build_quota" as const,
        label: "Build Quota",
        description: "Internal build minutes",
        endpointUrl: "https://example.com/quota.json",
        displayEnabled: true,
        refreshIntervalMinutes: 30,
        createdAt: "2026-06-26T00:00:00.000Z",
        updatedAt: "2026-06-26T01:00:00.000Z",
      },
    ];

    actions.handleUpdateCustomSources(customSources);

    expect(applyMessage).toHaveBeenCalledWith({
      type: "app:update-custom-sources",
      customSources,
    });
  });

  it("saves a Sub2API deployment before requesting its exact host origin", async () => {
    const contains = vi.fn(async () => false);
    const request = vi.fn(async () => true);
    vi.stubGlobal("chrome", {
      runtime: { id: "extension-id" },
      permissions: {
        contains,
        request,
        remove: vi.fn(),
      },
    });
    const { actions, applyMessage } = createActionHarness();

    actions.handleSaveSub2ApiDeployment(
      {
        accountId: null,
        displayLabel: "Private gateway",
        baseUrl: "https://gateway.example.test:8443",
        apiKey: "local-only-key",
        insecureTransportAcknowledged: false,
      },
      true,
    );

    await vi.waitFor(() => {
      expect(applyMessage).toHaveBeenNthCalledWith(1, {
        type: "app:save-sub2api-deployment",
        accountId: null,
        displayLabel: "Private gateway",
        baseUrl: "https://gateway.example.test:8443",
        apiKey: "local-only-key",
        insecureTransportAcknowledged: false,
      });
      expect(request).toHaveBeenCalledWith({
        origins: ["https://gateway.example.test/*"],
      });
      expect(applyMessage).toHaveBeenNthCalledWith(
        2,
        {
          type: "app:request-refresh",
          providerId: "sub2api-api-key",
        },
        expect.objectContaining({ title: "Deployment test finished" }),
      );
    });
  });

  it("toggles provider visibility using current provider state", () => {
    const { actions, appState, applyMessage } = createActionHarness();
    const codex = appState.providerSettings.find(
      (provider) => provider.id === "codex-personal-page",
    );

    expect(codex?.displayEnabled).toBe(true);

    actions.handleToggleProvider("codex-personal-page");

    expect(applyMessage).toHaveBeenCalledWith(
      {
        type: "app:set-provider-enabled",
        providerId: "codex-personal-page",
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
