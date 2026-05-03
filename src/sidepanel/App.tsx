import { useEffect, useState } from "react";

import type { AppMessage } from "../background/message-bus";
import type {
  ActionBadgeSelection,
  ApiKeyProviderId,
  AppLocalePreference,
  AppSettings,
  AppState,
  ProviderId,
  ProviderSourcePreference,
  ProviderSetting,
} from "../providers/types";
import { sendAppMessage } from "../shared/app-client";
import {
  buildDashboardSummaryLabels,
  createRuntimeI18n,
  DEFAULT_APP_LOCALE_PREFERENCE,
  getQuickThemeToggleCopy,
  syncRuntimeLocaleAttributes,
} from "../shared/i18n";
import { isFullPageSurfaceSearch } from "../shared/extension-surface-paths";
import {
  clearPageBinding,
  createPageBindingFromTab,
} from "../shared/page-bindings";
import {
  buildQuickThemeToggle,
  normalizeThemeSettings,
  startThemeSettingsSync,
} from "../shared/theme";
import { buildProviderSourceDisplayLocalizedCopy } from "../shared/localized-copy";
import {
  doesUrlMatchRouteHints,
  getOpenableRouteHint,
  getSessionPagePlan,
} from "../shared/provider-sources";
import {
  reloadSourcePageTabBeforeRefresh,
  shouldRefreshAfterSourcePageRecovery,
  shouldReloadBeforeSourcePageRecoveryRefresh,
  type SourcePageRecoverySourceState,
} from "../shared/source-page-recovery";
import { Toast } from "./components/Toast";
import {
  hasDirectPermissionControl,
  hasTabNavigationControl,
  openFullPageRoute,
  sortTabsByPriority,
} from "./app-browser-controls";
import { DashboardPage } from "./routes/DashboardPage";
import { ProviderDetailPage } from "./routes/ProviderDetailPage";
import { SettingsPage } from "./routes/SettingsPage";
import {
  buildSidePanelHash,
  parseSidePanelHash,
  type SidePanelRouteState,
} from "./route-state";
import { isStoreScreenshotSeedLockEnabled } from "./store-screenshot-seed";
import {
  getSpecialSidePanelRoute,
  SpecialRouteApp,
} from "./special-route-app";
import {
  buildSummaryItems,
  getProviderViewModel,
  getVisibleProviders,
} from "./view-models";

type AppToast = {
  tone: "success" | "error";
  title: string;
  message: string;
};

type StandardAppProps = {
  locationHash: string;
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

function getStandardAppBootstrapMessage(): Extract<
  AppMessage,
  { type: "app:init" } | { type: "app:read-state" }
> {
  return isStoreScreenshotSeedLockEnabled()
    ? { type: "app:read-state" }
    : { type: "app:init" };
}

function StandardApp({ locationHash }: StandardAppProps) {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [toast, setToast] = useState<AppToast | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const route = parseSidePanelHash(locationHash) ?? { name: "dashboard" };
  const isFullPageSurface =
    typeof window !== "undefined" &&
    isFullPageSurfaceSearch(window.location.search);

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
    let disposed = false;

    async function initializeApp() {
      setIsLoading(true);

      const response = await sendAppMessage(getStandardAppBootstrapMessage());

      if (disposed) {
        return;
      }

      if (response.ok) {
        setAppState(response.state);
        setLoadError(null);
      } else {
        setLoadError(response.error);
        setToast({
          tone: "error",
          title: "Initialization failed",
          message: response.error,
        });
      }

      setIsLoading(false);
    }

    void initializeApp();

    return () => {
      disposed = true;
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined" || typeof window === "undefined") {
      return undefined;
    }

    return startThemeSettingsSync(
      normalizeThemeSettings(appState?.settings),
      document.documentElement,
      window,
    );
  }, [
    appState?.settings.themeCustomSeedHex,
    appState?.settings.themeMode,
    appState?.settings.themePreset,
  ]);

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

  async function applyMessage(
    message: AppMessage,
    successToast?: AppToast,
  ): Promise<boolean> {
    const response = await sendAppMessage(message);

    if (!response.ok) {
      setToast({
        tone: "error",
        title: "State update failed",
        message: response.error,
      });
      return false;
    }

    setAppState(response.state);
    setLoadError(null);

    if (response.notice) {
      setToast(response.notice);
      return true;
    }

    if (successToast) {
      setToast(successToast);
    }

    return true;
  }

  function handleRetryInitialization() {
    setAppState(null);
    setLoadError(null);
    setIsLoading(true);

    void applyMessage(
      getStandardAppBootstrapMessage(),
      {
        tone: "success",
        title: "State reloaded",
        message: "The local dashboard state has been loaded again.",
      },
    ).finally(() => {
      setIsLoading(false);
    });
  }

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

  function handleOpenSessionPage(
    providerId: ProviderId,
    sourceStateKind?: SourcePageRecoverySourceState,
  ) {
    if (!appState) {
      return;
    }

    const providerLabel = getProviderLabel(appState.providerSettings, providerId);
    const sessionPagePlan = getSessionPagePlan(providerId);

    if (!sessionPagePlan) {
      setToast({
        tone: "error",
        title: `${providerLabel} has no session page`,
        message:
          "This provider does not expose a logged-in page route in the current source blueprint.",
      });
      return;
    }

    if (sessionPagePlan.rolloutStage !== "shipped") {
      setToast({
        tone: "error",
        title: `${providerLabel} session page is not active`,
        message:
          "This route is documented for a later track, but the current build does not use it for live sync yet.",
      });
      return;
    }

    if (!hasTabNavigationControl()) {
      setToast({
        tone: "error",
        title: `${providerLabel} page helper unavailable`,
        message:
          "Open-page helpers require extension mode with Chrome tabs access. The browser preview cannot drive provider tabs.",
      });
      return;
    }

    void (async () => {
      try {
        const matchedTabs = await chrome.tabs.query({
          url: sessionPagePlan.routeHints,
        });
        const preferredRoute = getOpenableRouteHint(sessionPagePlan.routeHints);
        const exactTabs =
          preferredRoute !== null
            ? matchedTabs.filter((tab) => tab.url?.startsWith(preferredRoute))
            : matchedTabs;
        const preferredTabs = sortTabsByPriority(
          exactTabs.length > 0 ? exactTabs : matchedTabs,
        );
        const preferredTab =
          preferredTabs.find((tab) => typeof tab.id === "number") ?? null;

        if (preferredTab?.id !== undefined) {
          await chrome.tabs.update(preferredTab.id, { active: true });
          const shouldReloadBeforeRefresh =
            shouldReloadBeforeSourcePageRecoveryRefresh(
              "existing-tab",
              sourceStateKind,
            );

          if (shouldReloadBeforeRefresh) {
            await reloadSourcePageTabBeforeRefresh(preferredTab.id);
          }

          const attached = await applyMessage({
            type: "app:set-provider-page-binding",
            providerId,
            pageBinding: createPageBindingFromTab({
              mode: "bound",
              tabId: preferredTab.id,
              matchedUrl: preferredTab.url ?? preferredRoute ?? null,
              matchedTitle: preferredTab.title ?? null,
              updatedAt: new Date().toISOString(),
            }),
          });

          if (!attached) {
            return;
          }

          if (shouldRefreshAfterSourcePageRecovery("existing-tab")) {
            await applyMessage(
              {
                type: "app:request-refresh",
                providerId,
              },
              {
                tone: "success",
                title: `${providerLabel} page attached`,
                message:
                  shouldReloadBeforeRefresh
                    ? "A matching source tab was reloaded, the binding was saved, and the provider was refreshed immediately."
                    : "A matching logged-in tab is already open. The binding was saved and the provider was refreshed immediately.",
              },
            );
          }
          return;
        }

        if (!preferredRoute) {
          setToast({
            tone: "error",
            title: `${providerLabel} page route unavailable`,
            message:
              "The current source blueprint does not include a concrete page URL to open automatically.",
          });
          return;
        }

        const createdTab = await chrome.tabs.create({
          url: preferredRoute,
          active: true,
        });
        await applyMessage(
          {
            type: "app:set-provider-page-binding",
            providerId,
            pageBinding:
              typeof createdTab.id === "number"
                ? createPageBindingFromTab({
                    mode: "bound",
                    tabId: createdTab.id,
                    matchedUrl: createdTab.url ?? preferredRoute,
                    matchedTitle: createdTab.title ?? null,
                    updatedAt: new Date().toISOString(),
                  })
                : clearPageBinding(),
          },
          {
            tone: "success",
            title: `${providerLabel} page opened`,
            message:
              "The candidate session page was opened and its binding was saved. Finish logging in or navigating to the required page, then refresh again.",
          },
        );
      } catch (error) {
        setToast({
          tone: "error",
          title: `${providerLabel} page helper failed`,
          message:
            error instanceof Error
              ? error.message
              : "The browser rejected the provider page helper request.",
        });
      }
    })();
  }

  function handleAttachActiveSessionPage(providerId: ProviderId) {
    if (!appState) {
      return;
    }

    const providerLabel = getProviderLabel(appState.providerSettings, providerId);
    const sessionPagePlan = getSessionPagePlan(providerId);

    if (!sessionPagePlan) {
      setToast({
        tone: "error",
        title: `${providerLabel} has no session page`,
        message:
          "This provider does not expose a logged-in page route in the current source blueprint.",
      });
      return;
    }

    if (sessionPagePlan.rolloutStage !== "shipped") {
      setToast({
        tone: "error",
        title: `${providerLabel} session page is not active`,
        message:
          "This route is documented for a later track, but the current build does not use it for live sync yet.",
      });
      return;
    }

    if (!hasTabNavigationControl()) {
      setToast({
        tone: "error",
        title: `${providerLabel} active-page attach unavailable`,
        message:
          "Active-page binding requires extension mode with Chrome tabs access. The browser preview cannot inspect the current provider tab.",
      });
      return;
    }

    if (isFullPageSurface) {
      setToast({
        tone: "error",
        title: `${providerLabel} active-page attach unavailable`,
        message:
          "Use this action from the side panel while the provider usage page is the active Chrome tab.",
      });
      return;
    }

    void (async () => {
      try {
        const [activeTab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        const preferredRoute = getOpenableRouteHint(sessionPagePlan.routeHints);

        if (typeof activeTab?.id !== "number" || !activeTab.url) {
          setToast({
            tone: "error",
            title: `${providerLabel} active page unavailable`,
            message:
              "Chrome did not expose a usable active tab URL for this window.",
          });
          return;
        }

        if (!doesUrlMatchRouteHints(activeTab.url, sessionPagePlan.routeHints)) {
          setToast({
            tone: "error",
            title: `${providerLabel} active page does not match`,
            message: preferredRoute
              ? `Open ${preferredRoute} in the active tab, then attach it again.`
              : "The active tab does not match any shipped session-page route for this provider.",
          });
          return;
        }

        const attached = await applyMessage({
          type: "app:set-provider-page-binding",
          providerId,
          pageBinding: createPageBindingFromTab({
            mode: "bound",
            tabId: activeTab.id,
            matchedUrl: activeTab.url,
            matchedTitle: activeTab.title ?? null,
            updatedAt: new Date().toISOString(),
          }),
        });

        if (!attached) {
          return;
        }

        await applyMessage(
          {
            type: "app:request-refresh",
            providerId,
          },
          {
            tone: "success",
            title: `${providerLabel} active page attached`,
            message:
              "The active matching tab was saved as the session-page binding and the provider was refreshed immediately.",
          },
        );
      } catch (error) {
        setToast({
          tone: "error",
          title: `${providerLabel} active-page attach failed`,
          message:
            error instanceof Error
              ? error.message
              : "The browser rejected the active-tab binding request.",
        });
      }
    })();
  }

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
  const visibleProviders = getVisibleProviders(
    appState,
    providerSourceDisplayCopy,
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
          onLocalePreferenceChange={(locale) =>
            handleUpdateSettings({ locale })
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
          sessionPageNavigationAvailable={hasTabNavigationControl()}
          activeSessionPageAttachAvailable={
            !isFullPageSurface && hasTabNavigationControl()
          }
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

export function App() {
  const [locationHash, setLocationHash] = useState(() =>
    typeof window !== "undefined" ? window.location.hash : "",
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleHashChange = () => {
      setLocationHash(window.location.hash);
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const specialRoute = getSpecialSidePanelRoute(locationHash);

  if (specialRoute) {
    return <SpecialRouteApp route={specialRoute} />;
  }

  return <StandardApp locationHash={locationHash} />;
}
