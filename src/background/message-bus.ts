import type {
  ApiKeyProviderId,
  AppSettings,
  AppState,
  ProviderId,
  ProviderPageBinding,
  ProviderSourcePreference,
} from "../providers/types";
import {
  setCodexWorkspaceConfig,
  setProviderAdminApiKey,
} from "../shared/provider-secrets";
import { clearPageBinding, normalizePageBinding } from "../shared/page-bindings";
import { seedAppStateIfEmpty, updateAppState } from "../shared/storage";
import { readStoreScreenshotRuntimeLock } from "../shared/store-screenshot-runtime-lock";
import { ensurePeriodicSyncAlarm } from "./alarms";
import { syncStoredProviderCredentials } from "./provider-credentials";
import {
  syncStoredProviderPermissions,
  toggleProviderPermission,
} from "./provider-permissions";
import { reconcileAppStateHealth, runSyncEngine } from "./sync-engine";

export type AppMessage =
  | { type: "app:init" }
  | { type: "app:read-state" }
  | { type: "app:update-settings"; settings: Partial<AppSettings> }
  | { type: "app:set-provider-enabled"; providerId: ProviderId; enabled: boolean }
  | {
      type: "app:set-provider-source-preference";
      providerId: ProviderId;
      sourcePreference: ProviderSourcePreference;
    }
  | {
      type: "app:set-provider-page-binding";
      providerId: ProviderId;
      pageBinding: ProviderPageBinding;
    }
  | { type: "app:clear-provider-page-binding"; providerId: ProviderId }
  | {
      type: "app:set-provider-admin-api-key";
      providerId: ApiKeyProviderId;
      apiKey: string | null;
    }
  | {
      type: "app:set-codex-workspace-config";
      analyticsApiKey: string | null;
      workspaceId: string | null;
    }
  | { type: "app:toggle-provider-permission"; providerId: ProviderId }
  | { type: "app:request-refresh"; providerId?: ProviderId }
  | { type: "app:open-action-popup" };

export type AppMessageResponse =
  | {
      ok: true;
      state: AppState;
      notice?: {
        tone: "success" | "error";
        title: string;
        message: string;
      };
    }
  | { ok: false; error: string };

export async function handleAppMessage(
  message: AppMessage,
): Promise<AppMessageResponse> {
  const isStoreScreenshotRuntimeLocked = await readStoreScreenshotRuntimeLock();

  switch (message.type) {
    case "app:init": {
      if (isStoreScreenshotRuntimeLocked) {
        const state = await seedAppStateIfEmpty();
        await ensurePeriodicSyncAlarm(state.settings);
        return { ok: true, state };
      }

      await syncStoredProviderPermissions();
      await syncStoredProviderCredentials();
      const state = await runSyncEngine({
        trigger: "bootstrap",
      });
      await ensurePeriodicSyncAlarm(state.settings);
      return { ok: true, state };
    }

    case "app:read-state": {
      if (isStoreScreenshotRuntimeLocked) {
        const state = await seedAppStateIfEmpty();
        await ensurePeriodicSyncAlarm(state.settings);
        return { ok: true, state };
      }

      await syncStoredProviderPermissions();
      await syncStoredProviderCredentials();
      const state = await seedAppStateIfEmpty();
      await ensurePeriodicSyncAlarm(state.settings);
      return { ok: true, state };
    }

    case "app:update-settings": {
      const state = await updateAppState((current) => ({
        ...reconcileAppStateHealth({
          ...current,
          settings: {
            ...current.settings,
            ...message.settings,
          },
        }),
      }));
      await ensurePeriodicSyncAlarm(state.settings);

      return {
        ok: true,
        state,
        notice:
          typeof message.settings.themeMode === "string" ||
          typeof message.settings.themePreset === "string" ||
          "themeCustomSeedHex" in message.settings ||
          "uiFontFamily" in message.settings
            ? {
                tone: "success",
                title: "Appearance preferences updated",
                message:
                  "The shared appearance preferences now apply across the side panel, popup, and audit hub.",
              }
            : undefined,
      };
    }

    case "app:set-provider-enabled": {
      const state = await updateAppState((current) =>
        reconcileAppStateHealth({
          ...current,
          providerSettings: current.providerSettings.map((provider) =>
            provider.id === message.providerId
              ? { ...provider, enabled: message.enabled }
              : provider,
          ),
        }),
      );

      return { ok: true, state };
    }

    case "app:set-provider-source-preference": {
      const stateWithPreference = await updateAppState((current) =>
        reconcileAppStateHealth({
          ...current,
          providerSettings: current.providerSettings.map((provider) =>
            provider.id === message.providerId
              ? { ...provider, sourcePreference: message.sourcePreference }
              : provider,
          ),
        }),
      );
      await syncStoredProviderPermissions();
      await syncStoredProviderCredentials();
      const state = await runSyncEngine({
        trigger: "manual",
        providerId: message.providerId,
      });
      const providerSetting =
        state.providerSettings.find(
          (provider) => provider.id === message.providerId,
        ) ??
        stateWithPreference.providerSettings.find(
          (provider) => provider.id === message.providerId,
        ) ??
        null;
      const providerLabel = providerSetting?.label ?? message.providerId;

      return {
        ok: true,
        state,
        notice: {
          tone: "success",
          title: `${providerLabel} source preference updated`,
          message:
            "The provider was refreshed immediately using the new hybrid-source preference.",
        },
      };
    }

    case "app:set-provider-page-binding": {
      const state = await updateAppState((current) =>
        reconcileAppStateHealth({
          ...current,
          providerSettings: current.providerSettings.map((provider) =>
            provider.id === message.providerId
              ? {
                  ...provider,
                  pageBinding: normalizePageBinding(message.pageBinding),
                }
              : provider,
          ),
        }),
      );

      return { ok: true, state };
    }

    case "app:clear-provider-page-binding": {
      const state = await updateAppState((current) =>
        reconcileAppStateHealth({
          ...current,
          providerSettings: current.providerSettings.map((provider) =>
            provider.id === message.providerId
              ? {
                  ...provider,
                  pageBinding: clearPageBinding(),
                }
              : provider,
          ),
        }),
      );

      return { ok: true, state };
    }

    case "app:toggle-provider-permission": {
      const { state, notice } = await toggleProviderPermission(message.providerId);

      return { ok: true, state, notice };
    }

    case "app:set-provider-admin-api-key": {
      await setProviderAdminApiKey(message.providerId, message.apiKey);
      await syncStoredProviderPermissions();
      await syncStoredProviderCredentials();

      const state = await runSyncEngine({
        trigger: "manual",
        providerId: message.providerId,
      });
      const providerSetting =
        state.providerSettings.find(
          (provider) => provider.id === message.providerId,
        ) ??
        null;
      const providerLabel = providerSetting?.label ?? message.providerId;
      const keyLabel =
        message.providerId === "cursor"
          ? "Cursor Admin API key"
          : "Claude Admin API key";

      return {
        ok: true,
        state,
        notice:
          message.apiKey !== null
            ? {
                tone: "success",
                title: `${providerLabel} API key saved`,
                message:
                  providerSetting?.status === "granted"
                    ? `The ${keyLabel} was stored locally. Check the ${providerLabel} card for the latest live sync result.`
                    : `The ${keyLabel} was stored locally. Grant the required host access before live sync can run.`,
              }
            : {
                tone: "success",
                title: `${providerLabel} API key cleared`,
                message:
                  `The stored ${keyLabel} was removed. ${providerLabel} will stay in a clear missing-credential state until a new key is added.`,
              },
      };
    }

    case "app:set-codex-workspace-config": {
      await setCodexWorkspaceConfig(
        message.analyticsApiKey,
        message.workspaceId,
      );
      await syncStoredProviderPermissions();
      await syncStoredProviderCredentials();

      const state = await runSyncEngine({
        trigger: "manual",
        providerId: "codex",
      });
      const providerSetting =
        state.providerSettings.find((provider) => provider.id === "codex") ?? null;

      return {
        ok: true,
        state,
        notice:
          message.analyticsApiKey !== null || message.workspaceId !== null
            ? {
                tone: "success",
                title: "Codex analytics config saved",
                message:
                  providerSetting?.status === "granted"
                    ? "The Codex analytics key and workspace ID were stored locally. Check the Codex card for the latest workspace analytics result."
                    : "The Codex analytics key and workspace ID were stored locally. Grant api.chatgpt.com host access before live sync can run.",
              }
            : {
                tone: "success",
                title: "Codex analytics config cleared",
                message:
                  "The stored Codex analytics key and workspace ID were removed. Codex will stay in a clear missing-configuration state until both values are added again.",
              },
      };
    }

    case "app:request-refresh": {
      await syncStoredProviderPermissions();
      await syncStoredProviderCredentials();
      const state = await runSyncEngine({
        trigger: "manual",
        providerId: message.providerId,
      });

      return { ok: true, state };
    }

    case "app:open-action-popup": {
      const state = await seedAppStateIfEmpty();
      await ensurePeriodicSyncAlarm(state.settings);

      if (typeof chrome.action?.openPopup !== "function") {
        return {
          ok: false,
          error:
            "The current Chrome runtime does not expose chrome.action.openPopup for the native popup probe.",
        };
      }

      try {
        await chrome.action.openPopup();
      } catch (error) {
        return {
          ok: false,
          error:
            error instanceof Error
              ? error.message
              : "The native popup probe could not open the action popup.",
        };
      }

      return {
        ok: true,
        state,
        notice: {
          tone: "success",
          title: "Native popup requested",
          message:
            "The background service worker asked Chrome to open the toolbar action popup.",
        },
      };
    }

    default: {
      return { ok: false, error: "Unsupported message type" };
    }
  }
}
