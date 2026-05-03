import type { AppMessage } from "../background/message-bus";
import type {
  ApiKeyProviderId,
  AppSettings,
  AppState,
  ProviderId,
  ProviderSourcePreference,
} from "../providers/types";
import type { RuntimeI18n } from "../shared/i18n";
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

  return {
    handleClearCodexWorkspaceConfig,
    handleClearPageBinding,
    handleClearProviderAdminApiKey,
    handleSaveCodexWorkspaceConfig,
    handleSavePreferences,
    handleSaveProviderAdminApiKey,
    handleSetSourcePreference,
    handleUpdateSettings,
  };
}
