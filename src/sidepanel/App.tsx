import { useEffect, useState } from "react";

import type { AppMessage } from "../background/message-bus";
import type {
  ApiKeyProviderId,
  AppState,
  ProviderId,
  ProviderSourcePreference,
  ProviderSetting,
} from "../providers/types";
import { sendAppMessage } from "../shared/app-client";
import {
  clearPageBinding,
  createPageBindingFromTab,
} from "../shared/page-bindings";
import {
  getOpenableRouteHint,
  getSessionPagePlan,
} from "../shared/provider-sources";
import { Toast } from "./components/Toast";
import { CodexFixtureCapturePage } from "./routes/CodexFixtureCapturePage";
import { CursorFixtureCapturePage } from "./routes/CursorFixtureCapturePage";
import { DashboardPage } from "./routes/DashboardPage";
import { InteractionAuditPage } from "./routes/InteractionAuditPage";
import { JetBrainsFixtureCapturePage } from "./routes/JetBrainsFixtureCapturePage";
import { ProviderDetailPage } from "./routes/ProviderDetailPage";
import { SettingsPage } from "./routes/SettingsPage";
import {
  buildSidePanelHash,
  parseSidePanelHash,
  type SidePanelRouteState,
} from "./route-state";
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

function getProviderLabel(
  providerSettings: ProviderSetting[],
  providerId: ProviderId,
): string {
  return (
    providerSettings.find((provider) => provider.id === providerId)?.label ??
    providerId
  );
}

function hasDirectPermissionControl(): boolean {
  return (
    typeof chrome !== "undefined" &&
    Boolean(chrome.runtime?.id) &&
    typeof chrome.permissions?.contains === "function" &&
    typeof chrome.permissions?.request === "function" &&
    typeof chrome.permissions?.remove === "function"
  );
}

function hasTabNavigationControl(): boolean {
  return (
    typeof chrome !== "undefined" &&
    Boolean(chrome.runtime?.id) &&
    typeof chrome.tabs?.query === "function" &&
    typeof chrome.tabs?.create === "function" &&
    typeof chrome.tabs?.update === "function"
  );
}

function scoreTab(tab: chrome.tabs.Tab): number {
  return (tab.active ? 10_000 : 0) + (tab.lastAccessed ?? 0);
}

function sortTabsByPriority(tabs: chrome.tabs.Tab[]): chrome.tabs.Tab[] {
  return [...tabs].sort((left, right) => scoreTab(right) - scoreTab(left));
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

  if (locationHash === "#debug-capture-codex") {
    return <CodexFixtureCapturePage />;
  }

  if (locationHash === "#debug-capture-cursor") {
    return <CursorFixtureCapturePage />;
  }

  if (locationHash === "#debug-capture-jetbrains") {
    return <JetBrainsFixtureCapturePage />;
  }

  if (locationHash === "#debug-interaction-audit") {
    return <InteractionAuditPage />;
  }

  const [appState, setAppState] = useState<AppState | null>(null);
  const [toast, setToast] = useState<AppToast | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const route = parseSidePanelHash(locationHash) ?? { name: "dashboard" };

  function navigateToRoute(nextRoute: SidePanelRouteState) {
    const nextHash = buildSidePanelHash(nextRoute);

    if (typeof window === "undefined") {
      setLocationHash(nextHash);
      return;
    }

    if (window.location.hash === nextHash) {
      setLocationHash(nextHash);
      return;
    }

    window.location.hash = nextHash;
  }

  useEffect(() => {
    let disposed = false;

    async function initializeApp() {
      setIsLoading(true);

      const response = await sendAppMessage({ type: "app:init" });

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
  ): Promise<void> {
    const response = await sendAppMessage(message);

    if (!response.ok) {
      setToast({
        tone: "error",
        title: "State update failed",
        message: response.error,
      });
      return;
    }

    setAppState(response.state);
    setLoadError(null);

    if (response.notice) {
      setToast(response.notice);
      return;
    }

    if (successToast) {
      setToast(successToast);
    }
  }

  function handleRetryInitialization() {
    setAppState(null);
    setLoadError(null);
    setIsLoading(true);

    void applyMessage(
      { type: "app:init" },
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

  function handleUpdateSettings(partialSettings: {
    syncIntervalMinutes?: number;
    warningThresholdPercent?: number;
  }) {
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
      title: "Preferences saved",
      message:
        "Settings are now persisted in local dashboard state for the preview.",
    });
  }

  function handleOpenSessionPage(providerId: ProviderId) {
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
          await applyMessage(
            {
              type: "app:set-provider-page-binding",
              providerId,
              pageBinding: createPageBindingFromTab({
                mode: "bound",
                tabId: preferredTab.id,
                matchedUrl: preferredTab.url ?? preferredRoute ?? null,
                matchedTitle: preferredTab.title ?? null,
                updatedAt: new Date().toISOString(),
              }),
            },
            {
              tone: "success",
              title: `${providerLabel} page attached`,
              message:
                "A matching logged-in tab is already open. The binding was saved; refresh the provider after the page settles if you want an immediate sync.",
            },
          );
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

  if (isLoading && !appState) {
    return (
      <main className="app-shell">
        <section className="hero-card">
          <p className="section-label">Loading</p>
          <h1 className="display-headline">Preparing dashboard state</h1>
          <p className="body-copy">
            Initializing the dashboard store and message bus.
          </p>
        </section>
      </main>
    );
  }

  if (!appState) {
    return (
      <>
        <main className="app-shell">
          <section className="status-card">
            <p className="section-label">State Unavailable</p>
            <h1 className="section-title">Initialization did not complete</h1>
            <p className="body-copy">
              {loadError ??
                "The app state could not be loaded from extension storage or local preview storage."}
            </p>
            <button
              className="text-button"
              type="button"
              onClick={handleRetryInitialization}
            >
              Retry
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

  const summaryItems = buildSummaryItems(appState);
  const visibleProviders = getVisibleProviders(appState);
  const selectedProvider =
    route.name === "provider-detail"
      ? getProviderViewModel(appState, route.providerId)
      : null;

  return (
    <>
      {route.name === "settings" ? (
        <SettingsPage
          onBack={() => navigateToRoute({ name: "dashboard" })}
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
          onToggleProvider={handleToggleProvider}
          onTogglePermission={handleTogglePermission}
          onSetSourcePreference={handleSetSourcePreference}
          onSaveProviderAdminApiKey={handleSaveProviderAdminApiKey}
          onClearProviderAdminApiKey={handleClearProviderAdminApiKey}
          onSaveCodexWorkspaceConfig={handleSaveCodexWorkspaceConfig}
          onClearCodexWorkspaceConfig={handleClearCodexWorkspaceConfig}
          onClearPageBinding={handleClearPageBinding}
          onOpenSessionPage={handleOpenSessionPage}
          sessionPageNavigationAvailable={hasTabNavigationControl()}
        />
      ) : route.name === "provider-detail" && selectedProvider ? (
        <ProviderDetailPage
          provider={selectedProvider}
          onBack={() => navigateToRoute({ name: "dashboard" })}
          onRefresh={handleRefresh}
        />
      ) : (
        <DashboardPage
          summaryItems={summaryItems}
          providers={visibleProviders}
          onOpenProvider={(providerId) =>
            navigateToRoute({ name: "provider-detail", providerId })
          }
          onOpenSettings={() => navigateToRoute({ name: "settings" })}
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
