import type { AppMessage } from "../background/message-bus";
import type {
  ApiKeyProviderId,
  AppSettings,
  AppState,
  ProviderId,
  ProviderSourcePreference,
  ProviderSetting,
} from "../providers/types";
import type { RuntimeI18n } from "../shared/i18n";
import {
  hasDirectPermissionControl,
  openFullPageRoute,
} from "./app-browser-controls";
import type { SidePanelRouteState } from "./route-state";
import { createStandardAppSessionPageActions } from "./standard-app-session-page-actions";
import type { AppToast } from "./use-standard-app-runtime";

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
  return (
    providerSettings.find((provider) => provider.id === providerId)?.label ??
    providerId
  );
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

    void applyMessage(
      { type: "app:request-refresh", providerId },
      {
        tone: "success",
        title: `${providerLabel} refreshed`,
        message:
          "The provider state was refreshed through the shared sync flow.",
      },
    );
  }

  function handleOpenCurrentRouteInFullPage() {
    if (isFullPageSurface) {
      return;
    }

    void openFullPageRoute(route);
  }

  function handleUpdateSettings(partialSettings: Partial<AppSettings>) {
    void applyMessage({
      type: "app:update-settings",
      settings: partialSettings,
    });
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

    void applyMessage(
      {
        type: "app:set-provider-enabled",
        providerId,
        enabled: !target.enabled,
      },
      {
        tone: "success",
        title: target.enabled
          ? `${target.label} hidden`
          : `${target.label} enabled`,
        message: target.enabled
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

    if (
      !hasDirectPermissionControl() ||
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
          const removed = await chrome.permissions.remove({
            origins: target.hostOrigins,
          });

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

        const granted = await chrome.permissions.request({
          origins: target.hostOrigins,
        });

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

  function handleSetSourcePreference(
    providerId: ProviderId,
    sourcePreference: ProviderSourcePreference,
  ) {
    if (!appState) {
      return;
    }

    const target =
      appState.providerSettings.find((provider) => provider.id === providerId) ??
      null;

    if (!target || target.sourcePreference === sourcePreference) {
      return;
    }

    void applyMessage({
      type: "app:set-provider-source-preference",
      providerId,
      sourcePreference,
    });
  }

  function handleClearPageBinding(providerId: ProviderId) {
    if (!appState) {
      return;
    }

    const target =
      appState.providerSettings.find((provider) => provider.id === providerId) ??
      null;

    if (!target || target.pageBinding.status === "unbound") {
      return;
    }

    void applyMessage(
      {
        type: "app:clear-provider-page-binding",
        providerId,
      },
      {
        tone: "success",
        title: `${target.label} binding cleared`,
        message:
          "The saved session-page binding was removed. Future reconnects will use auto discovery until you attach a page again.",
      },
    );
  }

  function handleSaveProviderAdminApiKey(
    providerId: ApiKeyProviderId,
    apiKey: string,
  ) {
    void applyMessage({
      type: "app:set-provider-admin-api-key",
      providerId,
      apiKey,
    });
  }

  function handleClearProviderAdminApiKey(providerId: ApiKeyProviderId) {
    void applyMessage({
      type: "app:set-provider-admin-api-key",
      providerId,
      apiKey: null,
    });
  }

  function handleSaveCodexWorkspaceConfig(
    analyticsApiKey: string,
    workspaceId: string,
  ) {
    void applyMessage({
      type: "app:set-codex-workspace-config",
      analyticsApiKey,
      workspaceId,
    });
  }

  function handleClearCodexWorkspaceConfig() {
    void applyMessage({
      type: "app:set-codex-workspace-config",
      analyticsApiKey: null,
      workspaceId: null,
    });
  }

  function handleSavePreferences() {
    setToast({
      tone: "success",
      title: runtimeI18n.t("settings.toast.preferences_saved_title"),
      message: runtimeI18n.t("settings.toast.preferences_saved_detail"),
    });
  }

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
    handleClearCodexWorkspaceConfig,
    handleClearPageBinding,
    handleClearProviderAdminApiKey,
    handleOpenCurrentRouteInFullPage,
    handleOpenSessionPage: sessionPageActions.handleOpenSessionPage,
    handleRefresh,
    handleSaveCodexWorkspaceConfig,
    handleSavePreferences,
    handleSaveProviderAdminApiKey,
    handleSetSourcePreference,
    handleTogglePermission,
    handleToggleProvider,
    handleUpdateSettings,
    sessionPageNavigationAvailable:
      sessionPageActions.sessionPageNavigationAvailable,
  };
}
