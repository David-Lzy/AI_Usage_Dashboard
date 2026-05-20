import type { AppMessage } from "../background/message-bus";
import type {
  AppState,
  ProviderId,
  ProviderSetting,
} from "../providers/types";
import { getProviderDefinition } from "../providers/provider-definitions";
import {
  clearPageBinding,
  createPageBindingFromTab,
} from "../shared/page-bindings";
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
import { getExtensionTabsApi } from "../shared/extension-api";
import {
  hasTabNavigationControl,
  sortTabsByPriority,
} from "./app-browser-controls";
import type { AppToast } from "./use-standard-app-runtime";

type ApplyAppMessage = (
  message: AppMessage,
  successToast?: AppToast,
) => Promise<boolean>;

type StandardAppSessionPageActionsOptions = {
  appState: AppState | null;
  applyMessage: ApplyAppMessage;
  isFullPageSurface: boolean;
  setToast: (toast: AppToast | null) => void;
};

function getProviderLabel(
  providerSettings: ProviderSetting[],
  providerId: ProviderId,
): string {
  const provider = providerSettings.find((setting) => setting.id === providerId);

  return provider ? getProviderDefinition(provider.id).shortLabel : providerId;
}

export function createStandardAppSessionPageActions({
  appState,
  applyMessage,
  isFullPageSurface,
  setToast,
}: StandardAppSessionPageActionsOptions) {
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

    const tabsApi = getExtensionTabsApi();

    if (!hasTabNavigationControl() || !tabsApi) {
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
        const matchedTabs = await tabsApi.query?.({
          url: sessionPagePlan.routeHints,
        }) ?? [];
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
          await tabsApi.update?.(preferredTab.id, { active: true });
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

        const createdTab = await tabsApi.create?.({
          url: preferredRoute,
          active: true,
        });
        await applyMessage(
          {
            type: "app:set-provider-page-binding",
            providerId,
            pageBinding:
              typeof createdTab?.id === "number"
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

    const tabsApi = getExtensionTabsApi();

    if (!hasTabNavigationControl() || !tabsApi) {
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
        const [activeTab] = await tabsApi.query?.({
          active: true,
          currentWindow: true,
        }) ?? [];
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

  const sessionPageNavigationAvailable = hasTabNavigationControl();

  return {
    activeSessionPageAttachAvailable:
      !isFullPageSurface && sessionPageNavigationAvailable,
    handleAttachActiveSessionPage,
    handleOpenSessionPage,
    sessionPageNavigationAvailable,
  };
}
