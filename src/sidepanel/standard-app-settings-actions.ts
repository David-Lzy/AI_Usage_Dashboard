import type { AppMessage } from "../background/message-bus";
import type {
  ApiKeyProviderId,
  AppSettings,
  AppState,
  ProviderId,
  ProviderSourcePreference,
} from "../providers/types";
import type { RuntimeI18n } from "../shared/i18n";
import {
  buildConfigurationBackup,
  buildConfigurationBackupFilename,
} from "../shared/configuration-backup";
import { downloadTextFile } from "./download-text-file";
import type { AppToast } from "./use-standard-app-runtime";

type ApplyAppMessage = (
  message: AppMessage,
  successToast?: AppToast,
) => Promise<boolean>;

type StandardAppSettingsActionsOptions = {
  appState: AppState | null;
  applyMessage: ApplyAppMessage;
  runtimeI18n: RuntimeI18n;
  setToast: (toast: AppToast | null) => void;
};

export function createStandardAppSettingsActions({
  appState,
  applyMessage,
  runtimeI18n,
  setToast,
}: StandardAppSettingsActionsOptions) {
  function handleUpdateSettings(partialSettings: Partial<AppSettings>) {
    void applyMessage({
      type: "app:update-settings",
      settings: partialSettings,
    });
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

  function handleExportConfiguration() {
    if (!appState) {
      setToast({
        tone: "error",
        title: "Configuration export failed",
        message: "The current app state is not loaded yet.",
      });
      return;
    }

    const backup = buildConfigurationBackup(appState, {
      includeCustomToolbarIconImage: true,
    });
    const didDownload = downloadTextFile(
      buildConfigurationBackupFilename(new Date(backup.exportedAt)),
      `${JSON.stringify(backup, null, 2)}\n`,
      "application/json",
    );

    setToast(
      didDownload
        ? {
            tone: "success",
            title: "Configuration exported",
            message:
              "Portable settings were downloaded as JSON. Secrets, permissions, page bindings, and runtime snapshots are not included.",
          }
        : {
            tone: "error",
            title: "Configuration export failed",
            message:
              "This browser context could not start a JSON download.",
          },
    );
  }

  function handleImportConfigurationJson(rawJson: string) {
    void applyMessage({
      type: "app:import-configuration-backup",
      rawJson,
    });
  }

  function handleSaveConfigurationToChromeSync() {
    void applyMessage({
      type: "app:save-configuration-to-sync",
    });
  }

  function handleRestoreConfigurationFromChromeSync() {
    void applyMessage({
      type: "app:restore-configuration-from-sync",
    });
  }

  return {
    handleClearCodexWorkspaceConfig,
    handleClearPageBinding,
    handleClearProviderAdminApiKey,
    handleExportConfiguration,
    handleImportConfigurationJson,
    handleRestoreConfigurationFromChromeSync,
    handleSaveCodexWorkspaceConfig,
    handleSaveConfigurationToChromeSync,
    handleSavePreferences,
    handleSaveProviderAdminApiKey,
    handleSetSourcePreference,
    handleUpdateSettings,
  };
}
