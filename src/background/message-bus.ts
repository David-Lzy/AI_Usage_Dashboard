import type { AppState, ProviderId } from "../providers/types";
import type {
  AppMessage,
  AppMessageResponse,
} from "../shared/app-message-types";
import {
  deleteSub2ApiAccountSecret,
  setCodexWorkspaceConfig,
  setProviderAdminApiKey,
  setSub2ApiKey,
} from "../shared/provider-secrets";
import { clearPageBinding, normalizePageBinding } from "../shared/page-bindings";
import {
  seedAppStateIfEmpty,
  updateAppState,
} from "../shared/storage";
import { normalizeCustomSourceSettings } from "../shared/custom-sources";
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
import {
  reconcileAppStateHealth,
  runSyncEngine,
  shouldReconcileHealthAfterSettingsUpdate,
} from "./sync-engine";
import {
  applyConfigurationBackupToState,
  buildConfigurationBackup,
  parseConfigurationBackupJson,
  readConfigurationBackupFromChromeSync,
  writeConfigurationBackupToChromeSync,
} from "../shared/configuration-backup";
import { codexCredentialBroker } from "../providers/codex/session-credential-broker";
import { validateCodexManualSessionToken } from "../providers/codex/session-credential";
import { syncProviderServiceStatuses } from "./provider-service-status-sync";
import {
  getActiveProviderAccountId,
  selectActiveProviderAccount,
  setProviderDisplayEnabled,
} from "../shared/provider-accounts";
import { runProviderAccountManualSyncSerial } from "../shared/provider-account-sync";
import {
  invalidateAllProviderSyncIdentities,
  invalidateProviderSyncIdentity,
  getAppStateReplacementGeneration,
} from "../shared/provider-sync-identity";
import {
  disconnectSub2ApiDeployment,
  removeSub2ApiDeployment,
  saveSub2ApiDeployment,
  setSub2ApiMeteringDisplayPreferences,
  SUB2API_PROVIDER_ID,
} from "../shared/sub2api-deployments";
import {
  clearCodexBarDashboardToken,
  connectCodexBarDashboard,
  disconnectCodexBarDashboard,
  getCodexBarDashboardGeneration,
} from "./codexbar-dashboard-sync";
import { mergeBackgroundSyncState } from "./background-state-merge";
import { quotaNotificationController } from "./quota-notification-runtime";

export type {
  AppMessage,
  AppMessageResponse,
} from "../shared/app-message-types";

function getCodexManualTokenValidationError(accessToken: string): string | null {
  const validation = validateCodexManualSessionToken(accessToken);

  if (validation === "ok") {
    return null;
  }

  if (validation === "authorization_header") {
    return "Paste only the token value, without 'Bearer' or an Authorization header.";
  }
  if (validation === "cookie") {
    return "Cookie text is not accepted. Paste only a temporary ChatGPT access token.";
  }
  if (validation === "auth_json") {
    return "Authentication JSON is not accepted. Paste only the access token value.";
  }
  if (validation === "refresh_token") {
    return "Refresh tokens are not accepted. Use only a temporary access token.";
  }

  return "Enter one temporary access token without spaces or surrounding data.";
}

export async function handleAppMessage(
  message: AppMessage,
): Promise<AppMessageResponse> {
  if (message.type === "app:read-state") {
    const state = await seedAppStateIfEmpty();
    return { ok: true, state };
  }

  const isStoreScreenshotRuntimeLocked = await readStoreScreenshotRuntimeLock();

  switch (message.type) {
    case "app:set-provider-active-account":
    case "app:set-provider-enabled":
    case "app:set-provider-source-preference":
    case "app:set-provider-page-binding":
    case "app:clear-provider-page-binding":
    case "app:toggle-provider-permission":
      invalidateProviderSyncIdentity(message.providerId);
      break;
    case "app:save-sub2api-deployment":
    case "app:disconnect-sub2api-deployment":
    case "app:remove-sub2api-deployment":
      invalidateProviderSyncIdentity(SUB2API_PROVIDER_ID);
      break;
    case "app:set-codex-session-token":
      invalidateProviderSyncIdentity("codex-personal-page");
      break;
    case "app:import-configuration-backup":
    case "app:restore-configuration-from-sync":
      invalidateAllProviderSyncIdentities();
      break;
  }

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

    case "app:update-settings": {
      let state = await updateAppState((current) => {
        const nextState = {
          ...current,
          settings: {
            ...current.settings,
            ...message.settings,
          },
        };

        return shouldReconcileHealthAfterSettingsUpdate(message.settings)
          ? reconcileAppStateHealth(nextState)
          : nextState;
      });
      if (message.settings.providerServiceStatusVisibilityBySurface) {
        const before = state;
        const generation = getAppStateReplacementGeneration();
        const completed = await syncProviderServiceStatuses(before);
        state = await updateAppState((latest) =>
          generation === getAppStateReplacementGeneration()
            ? mergeBackgroundSyncState(before, completed, latest, { allowManagedSources: false })
            : latest,
        );
      }
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

    case "app:update-custom-sources": {
      const customSources = normalizeCustomSourceSettings(message.customSources);
      const customSourceIds = new Set(customSources.map((source) => source.id));
      const state = await updateAppState((current) =>
        reconcileAppStateHealth({
          ...current,
          customSources,
          customSourceStates: (current.customSourceStates ?? []).filter(
            (entry) => customSourceIds.has(entry.sourceId),
          ),
        }),
      );
      await ensureBackgroundAlarms(state);

      return {
        ok: true,
        state,
        notice: {
          tone: "success",
          title: "Custom sources updated",
          message:
            "Custom JSON sources were saved locally. Use refresh to fetch the latest endpoint data.",
        },
      };
    }

    case "app:connect-codexbar-dashboard": {
      const current = await seedAppStateIfEmpty();
      const replacement = getAppStateReplacementGeneration();
      const pending = connectCodexBarDashboard(
        current,
        message.endpointUrl,
        message.token,
      );
      const generation = getCodexBarDashboardGeneration();
      const result = await pending;
      const state = await updateAppState((latest) =>
        replacement === getAppStateReplacementGeneration() && generation === getCodexBarDashboardGeneration()
          ? mergeBackgroundSyncState(current, result.state, latest)
          : latest,
      );
      await ensureBackgroundAlarms(state);
      return {
        ok: true,
        state,
        notice: result.ok
          ? {
              tone: "success",
              title: "CodexBar connected",
              message: `${result.snapshot.sources.length} sanitized local source rows are available.`,
            }
          : {
              tone: "error",
              title: "CodexBar connection failed",
              message: result.failure.message,
            },
      };
    }

    case "app:disconnect-codexbar-dashboard": {
      const current = await seedAppStateIfEmpty();
      const replacement = getAppStateReplacementGeneration();
      const pending = disconnectCodexBarDashboard(current);
      const generation = getCodexBarDashboardGeneration();
      const completed = await pending;
      const state = await updateAppState((latest) =>
        replacement === getAppStateReplacementGeneration() && generation === getCodexBarDashboardGeneration()
          ? mergeBackgroundSyncState(current, completed, latest, { removeManagedSources: true })
          : latest,
      );
      return {
        ok: true,
        state,
        notice: {
          tone: "success",
          title: "CodexBar disconnected",
          message: "The local token and CodexBar-managed source rows were removed.",
        },
      };
    }

    case "app:clear-codexbar-dashboard-token": {
      const current = await seedAppStateIfEmpty();
      const replacement = getAppStateReplacementGeneration();
      const pending = clearCodexBarDashboardToken(current);
      const generation = getCodexBarDashboardGeneration();
      const completed = await pending;
      const state = await updateAppState((latest) =>
        replacement === getAppStateReplacementGeneration() && generation === getCodexBarDashboardGeneration()
          ? mergeBackgroundSyncState(current, completed, latest)
          : latest,
      );
      return {
        ok: true,
        state,
        notice: {
          tone: "success",
          title: "CodexBar token cleared",
          message: "The loopback connection stays configured but cannot refresh until a new token is saved.",
        },
      };
    }

    case "app:set-provider-enabled": {
      const state = await updateAppState((current) =>
        reconcileAppStateHealth(
          setProviderDisplayEnabled(
            current,
            message.providerId,
            message.enabled,
          ),
        ),
      );
      await ensureBackgroundAlarms(state);

      return { ok: true, state };
    }

    case "app:set-provider-active-account": {
      return runProviderAccountManualSyncSerial(
        message.providerId,
        message.accountId,
        async () => {
          const selectedState = await updateAppState((current) =>
            reconcileAppStateHealth(
              selectActiveProviderAccount(
                current,
                message.providerId,
                message.accountId,
              ),
            ),
          );
          await syncStoredProviderCredentials();
          const state = await runSyncEngine({
            trigger: "manual",
            providerId: message.providerId,
          });
          const accountLabel =
            selectedState.providerAccounts?.[
              message.providerId
            ]?.accounts.find((account) => account.id === message.accountId)
              ?.label ?? "Selected account";

          return {
            ok: true as const,
            state,
            notice: {
              tone: "success" as const,
              title: `${accountLabel} selected`,
              message:
                "All display surfaces now use this account's isolated provider snapshot.",
            },
          };
        },
      );
    }

    case "app:save-sub2api-deployment": {
      return runProviderAccountManualSyncSerial(SUB2API_PROVIDER_ID, message.accountId ?? "default", async () => {
        const current = await seedAppStateIfEmpty();
        const replacement = getAppStateReplacementGeneration();
        const result = saveSub2ApiDeployment(current, message);
        if (!result.ok) {
          return { ok: false, error: result.message };
        }
        if (message.apiKey !== null) {
          await setSub2ApiKey(message.apiKey, result.accountId);
        }
        try {
          await updateAppState((latest) => {
            if (replacement !== getAppStateReplacementGeneration()) {
              throw new Error("Configuration changed while saving. Review the deployment and try again.");
            }
            const updated = saveSub2ApiDeployment(latest, message, {
              createAccountId: () => result.accountId,
            });
            if (!updated.ok) throw new Error(updated.message);
            return reconcileAppStateHealth(updated.state);
          });
        } catch (error) {
          if (message.accountId === null) await deleteSub2ApiAccountSecret(result.accountId);
          return { ok: false as const, error: error instanceof Error ? error.message : "Deployment could not be saved." };
        }
        await syncStoredProviderPermissions();
        await syncStoredProviderCredentials();
        const state = await seedAppStateIfEmpty();
        await ensureBackgroundAlarms(state);

        return {
          ok: true as const,
          state,
          notice: {
            tone: "success" as const,
            title: `${message.displayLabel.trim()} saved`,
            message:
              "The deployment metadata and account-scoped credential were saved locally.",
          },
        };
      });
    }

    case "app:disconnect-sub2api-deployment": {
      return runProviderAccountManualSyncSerial(SUB2API_PROVIDER_ID, message.accountId, async () => {
        const replacement = getAppStateReplacementGeneration();
        await setSub2ApiKey(null, message.accountId);
        const state = await updateAppState((latest) => replacement === getAppStateReplacementGeneration() ?
          reconcileAppStateHealth(
            disconnectSub2ApiDeployment(
              latest,
              message.accountId,
              message.retainCachedSummary,
            ),
          ) : latest,
        );
        await syncStoredProviderCredentials();
        await ensureBackgroundAlarms(state);

        return {
          ok: true as const,
          state,
          notice: {
            tone: "success" as const,
            title: "Deployment disconnected",
            message: message.retainCachedSummary
              ? "The API key was cleared. The last nonsecret summary remains marked as saved data."
              : "The API key and cached nonsecret summary were cleared.",
          },
        };
      });
    }

    case "app:remove-sub2api-deployment": {
      return runProviderAccountManualSyncSerial(SUB2API_PROVIDER_ID, message.accountId, async () => {
        try {
          const state = await updateAppState((latest) =>
            reconcileAppStateHealth(
              removeSub2ApiDeployment(latest, message.accountId),
            ),
          );
          await deleteSub2ApiAccountSecret(message.accountId);
          await syncStoredProviderCredentials();
          await ensureBackgroundAlarms(state);
          return {
            ok: true as const,
            state,
            notice: {
              tone: "success" as const,
              title: "Deployment removed",
              message:
                "The deployment metadata, isolated snapshot, and local credential were removed.",
            },
          };
        } catch (error) {
          return {
            ok: false as const,
            error:
              error instanceof Error
                ? error.message
                : "The deployment could not be removed.",
          };
        }
      });
    }

    case "app:set-sub2api-metering-display-preferences": {
      const state = await updateAppState((current) =>
        setSub2ApiMeteringDisplayPreferences(
          current,
          message.accountId,
          message.preferences,
        ),
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
      const current = await seedAppStateIfEmpty();
      await setProviderAdminApiKey(
        message.providerId,
        message.apiKey,
        getActiveProviderAccountId(current, message.providerId),
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
      const current = await seedAppStateIfEmpty();
      await setCodexWorkspaceConfig(
        message.analyticsApiKey,
        message.workspaceId,
        getActiveProviderAccountId(current, "codex-enterprise-api"),
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

    case "app:set-codex-session-token": {
      if (message.accessToken === null) {
        await codexCredentialBroker.clearCredential();
        const state = await seedAppStateIfEmpty();

        return {
          ok: true,
          state,
          notice: {
            tone: "success",
            title: "Temporary Codex token cleared",
            message:
              "The session-only token was removed. The next refresh can try local ChatGPT session discovery again.",
          },
        };
      }

      const validationError = getCodexManualTokenValidationError(
        message.accessToken,
      );
      if (validationError) {
        return { ok: false, error: validationError };
      }

      const saved = await codexCredentialBroker.setManualCredential(
        message.accessToken,
      );
      if (!saved.ok) {
        return {
          ok: false,
          error:
            "The temporary Codex token is expired or could not be used for this browser session.",
        };
      }

      await syncStoredProviderPermissions();
      const state = await runSyncEngine({
        trigger: "manual",
        providerId: "codex-personal-page",
      });

      return {
        ok: true,
        state,
        notice: {
          tone: "success",
          title: "Temporary Codex token saved",
          message:
            "The token is available only for this browser session. Check the Codex card for the latest local sync result.",
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

      await quotaNotificationController.reset();

      const importedState = await updateAppState((currentState) => {
        invalidateAllProviderSyncIdentities();
        return reconcileAppStateHealth(
          applyConfigurationBackupToState(currentState, parsedBackup.backup),
        );
      });
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

      await quotaNotificationController.reset();

      const restoredState = await updateAppState((currentState) => {
        invalidateAllProviderSyncIdentities();
        return reconcileAppStateHealth(
          applyConfigurationBackupToState(currentState, backup),
        );
      });
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
