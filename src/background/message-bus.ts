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
import {
  seedAppStateIfEmpty,
  updateAppState,
  writeAppState,
} from "../shared/storage";
import { readStoreScreenshotRuntimeLock } from "../shared/store-screenshot-runtime-lock";
import {
  ensureActionBadgeRotationAlarm,
  ensurePeriodicSyncAlarm,
} from "./alarms";
import { syncStoredProviderCredentials } from "./provider-credentials";
import {
  syncStoredProviderPermissions,
  toggleProviderPermission,
} from "./provider-permissions";
import { reconcileAppStateHealth, runSyncEngine } from "./sync-engine";
import {
  applyConfigurationBackupToState,
  buildConfigurationBackup,
  parseConfigurationBackupJson,
  readConfigurationBackupFromChromeSync,
  writeConfigurationBackupToChromeSync,
} from "../shared/configuration-backup";

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
  | { type: "app:import-configuration-backup"; rawJson: string }
  | { type: "app:save-configuration-to-sync" }
  | { type: "app:restore-configuration-from-sync" }
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

  async function ensureBackgroundAlarms(state: AppState): Promise<void> {
    await ensurePeriodicSyncAlarm(state.settings);
    await ensureActionBadgeRotationAlarm(state);
  }

  switch (message.type) {
    case "app:init": {
      if (isStoreScreenshotRuntimeLocked) {
        const state = await seedAppStateIfEmpty();
        await ensureBackgroundAlarms(state);
        return { ok: true, state };
      }

      await syncStoredProviderPermissions();
      await syncStoredProviderCredentials();
      const state = await runSyncEngine({
        trigger: "bootstrap",
      });
      await ensureBackgroundAlarms(state);
      return { ok: true, state };
    }

    case "app:read-state": {
      if (isStoreScreenshotRuntimeLocked) {
        const state = await seedAppStateIfEmpty();
        await ensureBackgroundAlarms(state);
        return { ok: true, state };
      }

      await syncStoredProviderPermissions();
      await syncStoredProviderCredentials();
      const state = await seedAppStateIfEmpty();
      await ensureBackgroundAlarms(state);
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
      await ensureBackgroundAlarms(state);

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
              ? { ...provider, displayEnabled: message.enabled }
              : provider,
          ),
        }),
      );
      await ensureBackgroundAlarms(state);

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
        message.providerId === "cursor-team-api"
          ? "Cursor Admin API key"
          : message.providerId === "claude-code-admin-api"
            ? "Claude Admin API key"
            : "Codex analytics config";

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
        providerId: "codex-enterprise-api",
      });
      const providerSetting =
        state.providerSettings.find(
          (provider) => provider.id === "codex-enterprise-api",
        ) ?? null;

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

    case "app:import-configuration-backup": {
      const parsedBackup = parseConfigurationBackupJson(message.rawJson);

      if (!parsedBackup.ok) {
        return { ok: false, error: parsedBackup.error };
      }

      const currentState = await seedAppStateIfEmpty();
      const importedState = await writeAppState(
        reconcileAppStateHealth(
          applyConfigurationBackupToState(currentState, parsedBackup.backup),
        ),
      );
      await ensureBackgroundAlarms(importedState);

      return {
        ok: true,
        state: importedState,
        notice: {
          tone: "success",
          title: "Configuration imported",
          message:
            "Portable settings and provider display preferences were restored. API keys, permissions, and page bindings stay local to this browser.",
        },
      };
    }

    case "app:save-configuration-to-sync": {
      const state = await seedAppStateIfEmpty();
      const backup = buildConfigurationBackup(state, {
        includeCustomToolbarIconImage: false,
      });

      try {
        await writeConfigurationBackupToChromeSync(backup);
      } catch (error) {
        return {
          ok: false,
          error:
            error instanceof Error
              ? error.message
              : "Configuration could not be saved to Chrome Sync.",
        };
      }

      return {
        ok: true,
        state,
        notice: {
          tone: "success",
          title: "Configuration saved to Chrome Sync",
          message:
            "Chrome will sync the portable configuration with this signed-in browser profile when extension sync is enabled.",
        },
      };
    }

    case "app:restore-configuration-from-sync": {
      let backup;

      try {
        backup = await readConfigurationBackupFromChromeSync();
      } catch (error) {
        return {
          ok: false,
          error:
            error instanceof Error
              ? error.message
              : "Configuration could not be restored from Chrome Sync.",
        };
      }

      if (!backup) {
        return {
          ok: false,
          error:
            "No AI Usage Dashboard configuration backup was found in Chrome Sync.",
        };
      }

      const currentState = await seedAppStateIfEmpty();
      const restoredState = await writeAppState(
        reconcileAppStateHealth(
          applyConfigurationBackupToState(currentState, backup),
        ),
      );
      await ensureBackgroundAlarms(restoredState);

      return {
        ok: true,
        state: restoredState,
        notice: {
          tone: "success",
          title: "Configuration restored from Chrome Sync",
          message:
            "Portable settings and provider display preferences were restored. API keys, permissions, and page bindings stay local to this browser.",
        },
      };
    }

    case "app:open-action-popup": {
      const state = await seedAppStateIfEmpty();
      await ensureBackgroundAlarms(state);

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
