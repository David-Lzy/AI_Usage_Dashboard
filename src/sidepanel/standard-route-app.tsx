import { lazy, Suspense, useEffect, useRef } from "react";

import type {
  ActionBadgeSelectionMode,
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
import {
  DEFAULT_ACTION_BADGE_SELECTION,
  DEFAULT_ACTION_BADGE_SELECTIONS,
} from "../shared/action-badge-preferences";
import { buildProviderSourceDisplayLocalizedCopy } from "../shared/provider-source-display-localized-copy";
import { buildQuickThemeToggle } from "../shared/theme";
import { Toast } from "./components/Toast";
import {
  buildSurfaceSessionKey,
  restoreSurfaceSessionState,
  type SurfaceSessionState,
} from "../shared/surface-session-state";
import { DashboardPage } from "./routes/DashboardPage";
import { ProviderDetailPage } from "./routes/ProviderDetailPage";
import {
  buildSidePanelHash,
  parseSidePanelHash,
  type SidePanelRouteState,
} from "./route-state";
import { restoreSurfaceScrollPositionAfterLayout } from "./surface-scroll-position";
import { createStandardAppActions } from "./standard-app-actions";
import { useStandardAppRuntime } from "./use-standard-app-runtime";
import {
  buildSummaryItems,
  getProviderViewModel,
  getVisibleProviders,
} from "./view-models";
import { getVisibleCustomSources } from "../shared/custom-source-view-models";
import { SETTINGS_SECTION_IDS } from "./settings-section-ids";

const SettingsPage = lazy(() =>
  import("./routes/SettingsPage").then((module) => ({
    default: module.SettingsPage,
  })),
);

type StandardRouteAppProps = {
  locationHash: string;
};

function StandardRouteLoading({
  eyebrow,
  title,
  detail,
}: {
  eyebrow: string;
  title: string;
  detail: string;
}) {
  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="section-label">{eyebrow}</p>
        <h1 className="display-headline">{title}</h1>
        <p className="body-copy">{detail}</p>
      </section>
    </main>
  );
}

export function shouldRestoreSurfaceSessionStateForRoute(
  route: SidePanelRouteState,
  state: SurfaceSessionState | null,
): boolean {
  if (!state || state.routeName !== route.name) {
    return false;
  }

  if (state.routeKey !== buildSidePanelHash(route)) {
    return false;
  }

  if (route.name === "settings" && route.focus) {
    return false;
  }

  if (route.name === "provider-detail") {
    return state.providerDetail?.providerId === route.providerId;
  }

  return true;
}

export function StandardRouteApp({ locationHash }: StandardRouteAppProps) {
  const restoredRouteKeysRef = useRef(new Set<string>());
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
  const routeKey = buildSidePanelHash(route);

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

  useEffect(() => {
    if (
      !appState ||
      typeof window === "undefined" ||
      restoredRouteKeysRef.current.has(routeKey)
    ) {
      return undefined;
    }

    let cancelled = false;
    restoredRouteKeysRef.current.add(routeKey);

    void (async () => {
      const state = await restoreSurfaceSessionState(
        buildSurfaceSessionKey(routeKey),
      );
      const scrollY = state?.scrollY ?? null;
      const scrollProgress = state?.scrollProgress ?? null;

      if (
        cancelled ||
        (scrollProgress === null && scrollY === null) ||
        !shouldRestoreSurfaceSessionStateForRoute(route, state)
      ) {
        return;
      }

      await restoreSurfaceScrollPositionAfterLayout({
        scrollProgress,
        scrollY,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [appState, route, routeKey]);

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
    handleExportConfiguration,
    handleImportConfigurationJson,
    handleOpenCurrentRouteInFullPage,
    handleOpenCurrentRouteInSidePanel,
    handleOpenSessionPage,
    handleRefresh,
    handleResetConfigurationToInitial,
    handleRestoreConfigurationFromChromeSync,
    handleSaveCodexWorkspaceConfig,
    handleSaveConfigurationToChromeSync,
    handleSavePreferences,
    handleSaveProviderAdminApiKey,
    handleSetSourcePreference,
    handleTogglePermission,
    handleToggleProvider,
    handleUpdateCustomSources,
    handleUpdateSettings,
    sessionPageNavigationAvailable,
  } = standardAppActions;

  if (isLoading && !appState) {
    return (
      <StandardRouteLoading
        eyebrow={runtimeI18n.t("app.loading.eyebrow")}
        title={runtimeI18n.t("app.loading.title")}
        detail={runtimeI18n.t("app.loading.detail")}
      />
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
  const visibleCustomSources = getVisibleCustomSources(
    appState,
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
  const surfaceActionLabel = isFullPageSurface
    ? runtimeI18n.t("common.actions.sidebar")
    : runtimeI18n.t("common.actions.tab");
  const surfaceActionHandler = isFullPageSurface
    ? handleOpenCurrentRouteInSidePanel
    : handleOpenCurrentRouteInFullPage;

  return (
    <>
      {route.name === "settings" ? (
        <Suspense
          fallback={
            <StandardRouteLoading
              eyebrow={runtimeI18n.t("app.loading.eyebrow")}
              title={runtimeI18n.t("app.loading.title")}
              detail={runtimeI18n.t("app.loading.detail")}
            />
          }
        >
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
            onOpenFullPage={surfaceActionHandler}
            surfaceActionLabel={surfaceActionLabel}
            surfaceActionTitle={
              isFullPageSurface
                ? runtimeI18n.t("common.actions.open_sidebar")
                : runtimeI18n.t("common.actions.open_settings_tab")
            }
            settings={appState.settings}
            providers={appState.providerSettings}
            customSources={appState.customSources}
            customSourceStates={appState.customSourceStates}
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
            onMotionModeChange={(motionMode) =>
              handleUpdateSettings({ motionMode })
            }
            onThemePresetChange={(themePreset) =>
              handleUpdateSettings({ themePreset })
            }
            onUiFontFamilyChange={(uiFontFamily) =>
              handleUpdateSettings({ uiFontFamily })
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
            onPopupCircularProgressItemsPerRowChange={(
              popupCircularProgressItemsPerRow,
            ) => handleUpdateSettings({ popupCircularProgressItemsPerRow })}
            onPopupShadowStyleChange={(popupShadowStyle) =>
              handleUpdateSettings({ popupShadowStyle })
            }
            onProviderOrderBySurfaceChange={(providerOrderBySurface) =>
              handleUpdateSettings({ providerOrderBySurface })
            }
            onProgressItemsBySurfaceChange={(progressItemsBySurface) =>
              handleUpdateSettings({ progressItemsBySurface })
            }
            onUsageHistoryModulesBySurfaceChange={(
              usageHistoryModulesBySurface,
            ) => handleUpdateSettings({ usageHistoryModulesBySurface })}
            onCustomSourcesChange={handleUpdateCustomSources}
            onProgressThicknessPxChange={(progressThicknessPx) =>
              handleUpdateSettings({ progressThicknessPx })
            }
            onProgressColorAppearanceChange={(progressColorAppearance) =>
              handleUpdateSettings({ progressColorAppearance })
            }
            onProgressColorBandsChange={(progressColorBands) =>
              handleUpdateSettings({
                progressColorBands,
                progressColorAppearance: {
                  mode: "traditional",
                  bands: progressColorBands,
                },
              })
            }
            onActionBadgeSelectionsChange={(actionBadgeSelections) =>
              handleUpdateSettings({
                actionBadgeSelectionMode: "manual",
                actionBadgeSelection: actionBadgeSelections[0] ?? "attention",
                actionBadgeSelections,
              })
            }
            onActionBadgeSelectionModeChange={(
              actionBadgeSelectionMode: ActionBadgeSelectionMode,
            ) => {
              if (actionBadgeSelectionMode === "auto") {
                handleUpdateSettings({
                  actionBadgeSelectionMode: "auto",
                  actionBadgeSelection: DEFAULT_ACTION_BADGE_SELECTION,
                  actionBadgeSelections: [...DEFAULT_ACTION_BADGE_SELECTIONS],
                });
                return;
              }

              handleUpdateSettings({ actionBadgeSelectionMode: "manual" });
            }}
            onActionBadgeRotationIntervalSecondsChange={(
              actionBadgeRotationIntervalSeconds,
            ) => handleUpdateSettings({ actionBadgeRotationIntervalSeconds })}
            onExportConfiguration={handleExportConfiguration}
            onImportConfigurationJson={handleImportConfigurationJson}
            onSaveConfigurationToChromeSync={handleSaveConfigurationToChromeSync}
            onRestoreConfigurationFromChromeSync={
              handleRestoreConfigurationFromChromeSync
            }
            onResetConfigurationToInitial={handleResetConfigurationToInitial}
            onToolbarIconModeChange={(toolbarIconMode) =>
              handleUpdateSettings({ toolbarIconMode })
            }
            onToolbarIconProviderIdChange={(toolbarIconProviderId) =>
              handleUpdateSettings({ toolbarIconProviderId })
            }
            onToolbarIconCustomImageDataUrlChange={(
              toolbarIconCustomImageDataUrl,
            ) => handleUpdateSettings({ toolbarIconCustomImageDataUrl })}
            onSaveThemeCustomSeed={(themeCustomSeedHex) =>
              handleUpdateSettings({
                themePreset: "custom",
                themeCustomSeedHex,
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
        </Suspense>
      ) : route.name === "provider-detail" && selectedProvider ? (
        <ProviderDetailPage
          localePreference={localePreference}
          progressColorAppearance={appState.settings.progressColorAppearance}
          progressColorBands={appState.settings.progressColorBands}
          progressDisplayStyle={progressDisplayStyle}
          progressItemsBySurface={appState.settings.progressItemsBySurface}
          progressThicknessPx={appState.settings.progressThicknessPx}
          progressSurface={providerDisplaySurface}
          usageHistoryModulesBySurface={
            appState.settings.usageHistoryModulesBySurface
          }
          provider={selectedProvider}
          onBack={() => navigateToRoute({ name: "dashboard" })}
          themeActionLabel={quickThemeToggleCopy.label}
          themeActionTitle={quickThemeToggleCopy.title}
          onToggleThemeMode={() =>
            handleUpdateSettings({ themeMode: quickThemeToggle.nextMode })
          }
          onOpenFullPage={surfaceActionHandler}
          surfaceActionLabel={surfaceActionLabel}
          surfaceActionTitle={
            isFullPageSurface
              ? runtimeI18n.t("common.actions.open_sidebar")
              : undefined
          }
          onOpenSourcePage={handleOpenSessionPage}
          onRefresh={handleRefresh}
        />
      ) : (
        <DashboardPage
          localePreference={localePreference}
          progressColorAppearance={appState.settings.progressColorAppearance}
          progressColorBands={appState.settings.progressColorBands}
          progressDisplayStyle={progressDisplayStyle}
          progressItemsBySurface={appState.settings.progressItemsBySurface}
          progressThicknessPx={appState.settings.progressThicknessPx}
          progressSurface={providerDisplaySurface}
          usageHistoryModulesBySurface={
            appState.settings.usageHistoryModulesBySurface
          }
          summaryItems={summaryItems}
          providers={visibleProviders}
          customSources={visibleCustomSources}
          sourceOrder={
            appState.settings.providerOrderBySurface[providerDisplaySurface]
          }
          onOpenProvider={(providerId) =>
            navigateToRoute({ name: "provider-detail", providerId })
          }
          onOpenCustomSourcesSettings={() =>
            navigateToRoute({
              name: "settings",
              focus: {
                kind: "section",
                sectionId: SETTINGS_SECTION_IDS.providerDisplay,
              },
            })
          }
          themeActionLabel={quickThemeToggleCopy.label}
          themeActionTitle={quickThemeToggleCopy.title}
          onToggleThemeMode={() =>
            handleUpdateSettings({ themeMode: quickThemeToggle.nextMode })
          }
          onOpenFullPage={surfaceActionHandler}
          surfaceActionLabel={surfaceActionLabel}
          surfaceActionTitle={
            isFullPageSurface
              ? runtimeI18n.t("common.actions.open_sidebar")
              : runtimeI18n.t("common.actions.open_dashboard_tab")
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
