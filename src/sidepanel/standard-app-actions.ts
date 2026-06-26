import type { AppMessage } from "../shared/app-message-types";
import type {
  AppState,
  ProviderId,
  ProviderSetting,
} from "../providers/types";
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

type ApplyAppMessage = (
  message: AppMessage,
  successToast?: AppToast,
) => Promise<boolean>;

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
  function handleRefresh(providerId?: ProviderId) {
    if (!appState) {
      return;
    }

    const providerLabel = providerId
      ? getProviderLabel(appState.providerSettings, providerId)
      : "All providers";

    void (async () => {
      const hostAccessCandidate = findHostAccessRefreshCandidate(
        appState,
        providerId,
      );

      if (hostAccessCandidate && hasDirectPermissionControl()) {
        try {
          const granted =
            await requestHostAccessForProvider(hostAccessCandidate);

          if (!granted) {
            setToast({
              tone: "error",
              title: `${getProviderDefinition(hostAccessCandidate.id).shortLabel} access denied`,
              message:
                "The permission request was dismissed or denied, so refresh cannot read the provider page yet.",
            });
            return;
          }
        } catch (error) {
          setToast({
            tone: "error",
            title: `${hostAccessCandidate.label} access failed`,
            message:
              error instanceof Error
                ? error.message
                : "The browser rejected the host access request.",
          });
          return;
        }
      }

      await applyMessage(
        { type: "app:request-refresh", providerId },
        {
          tone: "success",
          title: `${providerLabel} refreshed`,
          message:
            "The provider state was refreshed through the shared sync flow.",
        },
      );
    })();
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

        await applyMessage(
          {
            type: "app:request-refresh",
            providerId,
          },
          granted
            ? {
                tone: "success",
                title: `${target.label} access granted`,
                message:
                  "The extension can now request the configured host origins.",
              }
            : {
                tone: "error",
                title: `${target.label} access denied`,
                message:
                  "The permission request was dismissed or denied, so live host access is still unavailable.",
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
    handleSaveConfigurationToChromeSync:
      settingsActions.handleSaveConfigurationToChromeSync,
    handleSavePreferences: settingsActions.handleSavePreferences,
    handleSaveProviderAdminApiKey:
      settingsActions.handleSaveProviderAdminApiKey,
    handleSetSourcePreference: settingsActions.handleSetSourcePreference,
    handleTogglePermission,
    handleToggleProvider,
    handleUpdateCustomSources,
    handleUpdateSettings: settingsActions.handleUpdateSettings,
    sessionPageNavigationAvailable:
      sessionPageActions.sessionPageNavigationAvailable,
  };
}
