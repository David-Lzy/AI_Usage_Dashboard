import { useEffect } from "react";

import type {
  ActionBadgeSelection,
  AppLocalePreference,
} from "../providers/types";
import {
  buildDashboardSummaryLabels,
  createRuntimeI18n,
  DEFAULT_APP_LOCALE_PREFERENCE,
  getQuickThemeToggleCopy,
  syncRuntimeLocaleAttributes,
} from "../shared/i18n";
import { isFullPageSurfaceSearch } from "../shared/extension-surface-paths";
import { buildQuickThemeToggle } from "../shared/theme";
import { buildProviderSourceDisplayLocalizedCopy } from "../shared/localized-copy";
import { Toast } from "./components/Toast";
import { DashboardPage } from "./routes/DashboardPage";
import { ProviderDetailPage } from "./routes/ProviderDetailPage";
import { SettingsPage } from "./routes/SettingsPage";
import {
  buildSidePanelHash,
  parseSidePanelHash,
  type SidePanelRouteState,
} from "./route-state";
import { createStandardAppActions } from "./standard-app-actions";
import { useStandardAppRuntime } from "./use-standard-app-runtime";
import {
  buildSummaryItems,
  getProviderViewModel,
  getVisibleProviders,
} from "./view-models";
import { SETTINGS_SECTION_IDS } from "./settings-section-ids";

type StandardRouteAppProps = {
  locationHash: string;
};

export function StandardRouteApp({ locationHash }: StandardRouteAppProps) {
  const isFullPageSurface =
    typeof window !== "undefined" &&
    isFullPageSurfaceSearch(window.location.search);
  const {
    appState,
    toast,
    isLoading,
    loadError,
    applyMessage,
    handleRetryInitialization,
    setToast,
  } = useStandardAppRuntime({
    preferCachedBootstrap: true,
  });
  const route = parseSidePanelHash(locationHash) ?? { name: "dashboard" };

  function navigateToRoute(nextRoute: SidePanelRouteState) {
    const nextHash = buildSidePanelHash(nextRoute);

    if (typeof window === "undefined") {
      return;
    }

    if (window.location.hash === nextHash) {
      return;
    }

    window.location.hash = nextHash;
  }

  useEffect(() => {
    if (
      route.name === "provider-detail" &&
      appState &&
      !appState.providers.some(
        (provider) => provider.providerId === route.providerId,
      )
    ) {
      navigateToRoute({ name: "dashboard" });
    }
  }, [appState, route]);

  const localePreference: AppLocalePreference =
    appState?.settings.locale ?? DEFAULT_APP_LOCALE_PREFERENCE;
  const runtimeI18n = createRuntimeI18n(
    localePreference,
    typeof window !== "undefined" ? window : undefined,
  );

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    syncRuntimeLocaleAttributes(
      runtimeI18n,
      document.documentElement,
      document.body,
    );
  }, [runtimeI18n.resolvedLocale, runtimeI18n.resolvedTextDirection]);

  const standardAppActions = createStandardAppActions({
    appState,
    applyMessage,
    isFullPageSurface,
    route,
    runtimeI18n,
    setToast,
  });
  const {
    activeSessionPageAttachAvailable,
    handleAttachActiveSessionPage,
    handleClearCodexWorkspaceConfig,
    handleClearPageBinding,
    handleClearProviderAdminApiKey,
    handleOpenCurrentRouteInFullPage,
    handleOpenSessionPage,
    handleRefresh,
    handleSaveCodexWorkspaceConfig,
    handleSavePreferences,
    handleSaveProviderAdminApiKey,
    handleSetSourcePreference,
    handleTogglePermission,
    handleToggleProvider,
    handleUpdateSettings,
    sessionPageNavigationAvailable,
  } = standardAppActions;

  if (isLoading && !appState) {
    return (
      <main className="app-shell">
        <section className="hero-card">
          <p className="section-label">{runtimeI18n.t("app.loading.eyebrow")}</p>
          <h1 className="display-headline">{runtimeI18n.t("app.loading.title")}</h1>
          <p className="body-copy">{runtimeI18n.t("app.loading.detail")}</p>
        </section>
      </main>
    );
  }

  if (!appState) {
    return (
      <>
        <main className="app-shell">
          <section className="status-card">
            <p className="section-label">{runtimeI18n.t("app.error.eyebrow")}</p>
            <h1 className="section-title">{runtimeI18n.t("app.error.title")}</h1>
            <p className="body-copy">
              {loadError ?? runtimeI18n.t("app.error.detail_fallback")}
            </p>
            <button
              className="text-button"
              type="button"
              onClick={handleRetryInitialization}
            >
              {runtimeI18n.t("common.actions.retry")}
            </button>
          </section>
        </main>

        {toast ? (
          <Toast
            tone={toast.tone}
            title={toast.title}
            message={toast.message}
            onDismiss={() => setToast(null)}
          />
        ) : null}
      </>
    );
  }

  const summaryItems = buildSummaryItems(
    appState,
    buildDashboardSummaryLabels(runtimeI18n),
    runtimeI18n.formatNumber,
  );
  const providerSourceDisplayCopy =
    buildProviderSourceDisplayLocalizedCopy(runtimeI18n);
  const providerDisplaySurface = isFullPageSurface ? "fullPage" : "sidebar";
  const visibleProviders = getVisibleProviders(
    appState,
    providerSourceDisplayCopy,
    providerDisplaySurface,
  );
  const selectedProvider =
    route.name === "provider-detail"
      ? getProviderViewModel(
          appState,
          route.providerId,
          providerSourceDisplayCopy,
        )
      : null;
  const quickThemeToggle = buildQuickThemeToggle(
    appState.settings.themeMode,
    typeof window !== "undefined" ? window : undefined,
  );
  const quickThemeToggleCopy = getQuickThemeToggleCopy(
    quickThemeToggle.nextMode,
    runtimeI18n,
  );
  const progressDisplayStyle = isFullPageSurface
    ? appState.settings.fullPageProgressStyle
    : appState.settings.sidebarProgressStyle;

  return (
    <>
      {route.name === "settings" ? (
        <SettingsPage
          onBack={() => navigateToRoute({ name: "dashboard" })}
          routeFocus={route.focus}
          onLocalePreferenceChange={(locale) =>
            handleUpdateSettings({ locale })
          }
          onUserLevelChange={(userLevel) =>
            handleUpdateSettings({ userLevel })
          }
          themeActionLabel={quickThemeToggleCopy.label}
          themeActionTitle={quickThemeToggleCopy.title}
          onToggleThemeMode={() =>
            handleUpdateSettings({ themeMode: quickThemeToggle.nextMode })
          }
          onOpenFullPage={
            isFullPageSurface ? undefined : handleOpenCurrentRouteInFullPage
          }
          settings={appState.settings}
          providers={appState.providerSettings}
          snapshots={appState.providers}
          toast={toast}
          onDismissToast={() => setToast(null)}
          onSavePreferences={handleSavePreferences}
          onSyncIntervalChange={(minutes) =>
            handleUpdateSettings({ syncIntervalMinutes: minutes })
          }
          onWarningThresholdChange={(percent) =>
            handleUpdateSettings({ warningThresholdPercent: percent })
          }
          onThemeModeChange={(themeMode) =>
            handleUpdateSettings({ themeMode })
          }
          onThemePresetChange={(themePreset) =>
            handleUpdateSettings({ themePreset })
          }
          onPopupProgressStyleChange={(popupProgressStyle) =>
            handleUpdateSettings({ popupProgressStyle })
          }
          onSidebarProgressStyleChange={(sidebarProgressStyle) =>
            handleUpdateSettings({ sidebarProgressStyle })
          }
          onFullPageProgressStyleChange={(fullPageProgressStyle) =>
            handleUpdateSettings({ fullPageProgressStyle })
          }
          onPopupSizePresetChange={(popupSizePreset) =>
            handleUpdateSettings({ popupSizePreset })
          }
          onPopupCornerStyleChange={(popupCornerStyle) =>
            handleUpdateSettings({ popupCornerStyle })
          }
          onPopupShadowStyleChange={(popupShadowStyle) =>
            handleUpdateSettings({ popupShadowStyle })
          }
          onProviderOrderBySurfaceChange={(providerOrderBySurface) =>
            handleUpdateSettings({ providerOrderBySurface })
          }
          onProgressItemsBySurfaceChange={(progressItemsBySurface) =>
            handleUpdateSettings({ progressItemsBySurface })
          }
          onActionBadgeSelectionChange={(
            actionBadgeSelection: ActionBadgeSelection,
          ) => handleUpdateSettings({ actionBadgeSelection })}
          onSaveThemeCustomSeed={(themeCustomSeedHex) =>
            handleUpdateSettings({
              themePreset: "custom",
              themeCustomSeedHex,
            })
          }
          onResetThemeCustomSeed={() =>
            handleUpdateSettings({
              themePreset: "default",
              themeCustomSeedHex: null,
            })
          }
          onToggleProvider={handleToggleProvider}
          onTogglePermission={handleTogglePermission}
          onSetSourcePreference={handleSetSourcePreference}
          onSaveProviderAdminApiKey={handleSaveProviderAdminApiKey}
          onClearProviderAdminApiKey={handleClearProviderAdminApiKey}
          onSaveCodexWorkspaceConfig={handleSaveCodexWorkspaceConfig}
          onClearCodexWorkspaceConfig={handleClearCodexWorkspaceConfig}
          onClearPageBinding={handleClearPageBinding}
          onOpenSessionPage={handleOpenSessionPage}
          onAttachActiveSessionPage={handleAttachActiveSessionPage}
          sessionPageNavigationAvailable={sessionPageNavigationAvailable}
          activeSessionPageAttachAvailable={activeSessionPageAttachAvailable}
        />
      ) : route.name === "provider-detail" && selectedProvider ? (
        <ProviderDetailPage
          localePreference={localePreference}
          progressDisplayStyle={progressDisplayStyle}
          provider={selectedProvider}
          onBack={() => navigateToRoute({ name: "dashboard" })}
          themeActionLabel={quickThemeToggleCopy.label}
          themeActionTitle={quickThemeToggleCopy.title}
          onToggleThemeMode={() =>
            handleUpdateSettings({ themeMode: quickThemeToggle.nextMode })
          }
          onOpenFullPage={
            isFullPageSurface ? undefined : handleOpenCurrentRouteInFullPage
          }
          onOpenSourcePage={handleOpenSessionPage}
          onRefresh={handleRefresh}
        />
      ) : (
        <DashboardPage
          localePreference={localePreference}
          progressDisplayStyle={progressDisplayStyle}
          summaryItems={summaryItems}
          providers={visibleProviders}
          onOpenProvider={(providerId) =>
            navigateToRoute({ name: "provider-detail", providerId })
          }
          themeActionLabel={quickThemeToggleCopy.label}
          themeActionTitle={quickThemeToggleCopy.title}
          onToggleThemeMode={() =>
            handleUpdateSettings({ themeMode: quickThemeToggle.nextMode })
          }
          onOpenFullPage={
            isFullPageSurface ? undefined : handleOpenCurrentRouteInFullPage
          }
          onOpenSettings={() => navigateToRoute({ name: "settings" })}
          onOpenQuickSetup={() =>
            navigateToRoute({
              name: "settings",
              focus: {
                kind: "section",
                sectionId: SETTINGS_SECTION_IDS.quickSetup,
              },
            })
          }
          onOpenSourcePage={handleOpenSessionPage}
          onRefreshProvider={handleRefresh}
          onRefreshAll={() => handleRefresh()}
        />
      )}

      {route.name !== "settings" && toast ? (
        <Toast
          tone={toast.tone}
          title={toast.title}
          message={toast.message}
          onDismiss={() => setToast(null)}
        />
      ) : null}
    </>
  );
}
