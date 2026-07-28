import type { AppMessage } from "../shared/app-message-types";
import type {
  ApiGatewayMeteringDisplayPreferences,
  AppState,
  ProviderAccountId,
  ProviderId,
  ProviderSetting,
} from "../providers/types";
import {
  getSub2ApiHostOriginPattern,
  normalizeSub2ApiConnection,
} from "../providers/sub2api/connection";
import { getProviderDefinition } from "../providers/provider-definitions";
import type { RuntimeI18n } from "../shared/i18n";
import {
  hasDirectPermissionControl,
  openFullPageRoute,
  openSidePanelRoute,
} from "./app-browser-controls";
import {
  findHostAccessRefreshCandidate,
  requestHostAccessForProvider,
} from "../shared/host-access-request";
import { getExtensionPermissionsApi } from "../shared/extension-api";
import type { SidePanelRouteState } from "./route-state";
import { createStandardAppSettingsActions } from "./standard-app-settings-actions";
import { createStandardAppSessionPageActions } from "./standard-app-session-page-actions";
import type { AppToast } from "./use-standard-app-runtime";
import type { CustomSourceSetting } from "../shared/custom-sources";
import {
  SUB2API_PROVIDER_ID,
  type Sub2ApiDeploymentDraft,
} from "../shared/sub2api-deployments";

type ApplyAppMessage = (
  message: AppMessage,
  successToast?: AppToast,
) => Promise<AppState | null>;

type StandardAppActionsOptions = {
  appState: AppState | null;
  applyMessage: ApplyAppMessage;
  isFullPageSurface: boolean;
  route: SidePanelRouteState;
  runtimeI18n: RuntimeI18n;
  setToast: (toast: AppToast | null) => void;
};

function getProviderLabel(
  providerSettings: ProviderSetting[],
  providerId: ProviderId,
): string {
  const provider = providerSettings.find((setting) => setting.id === providerId);

  return provider ? getProviderDefinition(provider.id).shortLabel : providerId;
}

export function createStandardAppActions({
  appState,
  applyMessage,
  isFullPageSurface,
  route,
  runtimeI18n,
  setToast,
}: StandardAppActionsOptions) {
  async function handleRefresh(
    providerId?: ProviderId,
    showSuccessToast = true,
  ): Promise<AppState | null> {
    if (!appState) {
      return null;
    }

    const hostAccessCandidate = findHostAccessRefreshCandidate(
      appState,
      providerId,
    );
    let refreshProviderId = providerId;

    if (hostAccessCandidate && hasDirectPermissionControl()) {
      try {
        const granted = await requestHostAccessForProvider(hostAccessCandidate);

        if (!granted) {
          setToast({
            tone: "error",
            title: `${getProviderDefinition(hostAccessCandidate.id).shortLabel} access denied`,
            message:
              "The permission request was dismissed or denied, so refresh cannot read the provider page yet.",
          });
          return null;
        }

        // Make the permission grant useful immediately. A global refresh can
        // still run on the next scheduled/manual cycle, while this bounded
        // request opens and captures the newly authorized provider first.
        refreshProviderId = hostAccessCandidate.id;
      } catch (error) {
        setToast({
          tone: "error",
          title: `${hostAccessCandidate.label} access failed`,
          message:
            error instanceof Error
              ? error.message
              : "The browser rejected the host access request.",
        });
        return null;
      }
    }

    const providerLabel = refreshProviderId
      ? getProviderLabel(appState.providerSettings, refreshProviderId)
      : "All providers";

    return applyMessage(
      { type: "app:request-refresh", providerId: refreshProviderId },
      showSuccessToast
        ? {
            tone: "success",
            title: `${providerLabel} refreshed`,
            message:
              "The provider state was refreshed through the shared sync flow.",
          }
        : undefined,
    );
  }

  async function handleTestSub2ApiDeployment(): Promise<boolean> {
    const refreshedState = await handleRefresh(SUB2API_PROVIDER_ID, false);
    const snapshot = refreshedState?.providers.find(
      ({ providerId }) => providerId === SUB2API_PROVIDER_ID,
    );

    return snapshot?.syncStatus === "ok";
  }

  function handleOpenCurrentRouteInFullPage() {
    if (isFullPageSurface) {
      return;
    }

    void openFullPageRoute(route);
  }

  function handleOpenCurrentRouteInSidePanel() {
    if (!isFullPageSurface) {
      return;
    }

    void openSidePanelRoute(route);
  }

  function handleToggleProvider(providerId: ProviderId) {
    if (!appState) {
      return;
    }

    const target = appState.providerSettings.find(
      (provider) => provider.id === providerId,
    );

    if (!target) {
      return;
    }
    const providerLabel = getProviderDefinition(target.id).shortLabel;

    void applyMessage(
      {
        type: "app:set-provider-enabled",
        providerId,
        enabled: !target.displayEnabled,
      },
      {
        tone: "success",
        title: target.displayEnabled
          ? `${providerLabel} hidden`
          : `${providerLabel} enabled`,
        message: target.displayEnabled
          ? "The provider was removed from the visible dashboard feed."
          : "The provider is visible in the dashboard feed again.",
      },
    );
  }

  function handleSelectProviderAccount(
    providerId: ProviderId,
    accountId: ProviderAccountId,
  ) {
    void applyMessage({
      type: "app:set-provider-active-account",
      providerId,
      accountId,
    });
  }

  function handleSaveSub2ApiDeployment(
    draft: Sub2ApiDeploymentDraft,
    testConnection: boolean,
  ) {
    void (async () => {
      const connection = normalizeSub2ApiConnection(draft);
      if (!connection.ok) {
        setToast({
          tone: "error",
          title: "Deployment validation failed",
          message: connection.message,
        });
        return;
      }

      const saved = await applyMessage({
        type: "app:save-sub2api-deployment",
        ...draft,
      });
      if (!saved || !testConnection) {
        return;
      }

      const permissionsApi = getExtensionPermissionsApi();
      const origin = getSub2ApiHostOriginPattern(connection.value);
      try {
        const alreadyGranted =
          (await permissionsApi?.contains?.({ origins: [origin] })) ?? false;
        const granted = alreadyGranted
          ? true
          : (await permissionsApi?.request?.({ origins: [origin] })) ??
            !hasDirectPermissionControl();
        if (!granted) {
          setToast({
            tone: "error",
            title: "Deployment access denied",
            message:
              "The deployment was saved, but Chrome did not grant access to its origin.",
          });
          return;
        }

        await applyMessage(
          { type: "app:request-refresh", providerId: "sub2api-api-key" },
          {
            tone: "success",
            title: "Deployment test finished",
            message:
              "Check the Sub2API card for authentication, compatibility, scope, or transport diagnostics.",
          },
        );
      } catch (error) {
        setToast({
          tone: "error",
          title: "Deployment test failed",
          message:
            error instanceof Error
              ? error.message
              : "Chrome rejected the deployment permission request.",
        });
      }
    })();
  }

  function handleDisconnectSub2ApiDeployment(
    accountId: ProviderAccountId,
    retainCachedSummary: boolean,
  ) {
    void applyMessage({
      type: "app:disconnect-sub2api-deployment",
      accountId,
      retainCachedSummary,
    });
  }

  function handleRemoveSub2ApiDeployment(accountId: ProviderAccountId) {
    void applyMessage({
      type: "app:remove-sub2api-deployment",
      accountId,
    });
  }

  function handleSetSub2ApiMeteringDisplayPreferences(
    accountId: ProviderAccountId,
    preferences: ApiGatewayMeteringDisplayPreferences,
  ) {
    void applyMessage({
      type: "app:set-sub2api-metering-display-preferences",
      accountId,
      preferences,
    });
  }

  function handleTogglePermission(providerId: ProviderId) {
    if (!appState) {
      return;
    }

    const target =
      appState.providerSettings.find((provider) => provider.id === providerId) ??
      null;

    if (!target) {
      return;
    }

    const permissionsApi = getExtensionPermissionsApi();

    if (
      !hasDirectPermissionControl() ||
      !permissionsApi ||
      !Array.isArray(target.hostOrigins) ||
      target.hostOrigins.length === 0
    ) {
      void applyMessage({
        type: "app:toggle-provider-permission",
        providerId,
      });
      return;
    }

    void (async () => {
      try {
        if (target.status === "granted") {
          const removed = await permissionsApi.remove?.({
            origins: target.hostOrigins,
          }) ?? false;

          await applyMessage(
            {
              type: "app:request-refresh",
              providerId,
            },
            removed
              ? {
                  tone: "success",
                  title: `${target.label} access removed`,
                  message: "The extension host access grant was removed.",
                }
              : {
                  tone: "error",
                  title: `${target.label} access removal failed`,
                  message: "The browser kept the existing host access grant.",
                },
          );

          return;
        }

        const granted = await permissionsApi.request?.({
          origins: target.hostOrigins,
        }) ?? false;

        if (!granted) {
          setToast({
            tone: "error",
            title: `${target.label} access denied`,
            message:
              "The permission request was dismissed or denied, so live host access is still unavailable.",
          });
          return;
        }

        await applyMessage(
          {
            type: "app:request-refresh",
            providerId,
          },
          {
            tone: "success",
            title: `${target.label} access granted`,
            message:
              "The extension can now request the configured host origins and started an immediate refresh.",
          },
        );
      } catch (error) {
        setToast({
          tone: "error",
          title: `${target.label} access failed`,
          message:
            error instanceof Error
              ? error.message
              : "The browser rejected the host access request.",
        });
      }
    })();
  }

  function handleUpdateCustomSources(customSources: CustomSourceSetting[]) {
    void applyMessage({
      type: "app:update-custom-sources",
      customSources,
    });
  }

  const settingsActions = createStandardAppSettingsActions({
    appState,
    applyMessage,
    runtimeI18n,
    setToast,
  });
  const sessionPageActions = createStandardAppSessionPageActions({
    appState,
    applyMessage,
    isFullPageSurface,
    setToast,
  });

  return {
    activeSessionPageAttachAvailable:
      sessionPageActions.activeSessionPageAttachAvailable,
    handleAttachActiveSessionPage:
      sessionPageActions.handleAttachActiveSessionPage,
    handleClearCodexWorkspaceConfig:
      settingsActions.handleClearCodexWorkspaceConfig,
    handleClearCodexSessionToken:
      settingsActions.handleClearCodexSessionToken,
    handleClearPageBinding: settingsActions.handleClearPageBinding,
    handleClearProviderAdminApiKey:
      settingsActions.handleClearProviderAdminApiKey,
    handleExportConfiguration: settingsActions.handleExportConfiguration,
    handleImportConfigurationJson:
      settingsActions.handleImportConfigurationJson,
    handleOpenCurrentRouteInFullPage,
    handleOpenCurrentRouteInSidePanel,
    handleOpenSessionPage: sessionPageActions.handleOpenSessionPage,
    handleRefresh,
    handleResetConfigurationToInitial:
      settingsActions.handleResetConfigurationToInitial,
    handleRestoreConfigurationFromChromeSync:
      settingsActions.handleRestoreConfigurationFromChromeSync,
    handleSaveCodexWorkspaceConfig:
      settingsActions.handleSaveCodexWorkspaceConfig,
    handleSaveCodexSessionToken:
      settingsActions.handleSaveCodexSessionToken,
    handleSaveConfigurationToChromeSync:
      settingsActions.handleSaveConfigurationToChromeSync,
    handleSavePreferences: settingsActions.handleSavePreferences,
    handleSaveProviderAdminApiKey:
      settingsActions.handleSaveProviderAdminApiKey,
    handleSaveSub2ApiDeployment,
    handleTestSub2ApiDeployment,
    handleSelectProviderAccount,
    handleSetSub2ApiMeteringDisplayPreferences,
    handleSetSourcePreference: settingsActions.handleSetSourcePreference,
    handleTogglePermission,
    handleToggleProvider,
    handleDisconnectSub2ApiDeployment,
    handleRemoveSub2ApiDeployment,
    handleUpdateCustomSources,
    handleUpdateSettings: settingsActions.handleUpdateSettings,
    sessionPageNavigationAvailable:
      sessionPageActions.sessionPageNavigationAvailable,
  };
}
