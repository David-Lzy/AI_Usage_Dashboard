import type { ProviderId } from "../providers/types";
import { sendAppMessage } from "../shared/app-client";
import {
  clearPageBinding,
  createPageBindingFromTab,
} from "../shared/page-bindings";
import {
  getOpenableRouteHint,
  getSessionPagePlan,
} from "../shared/provider-sources";
import {
  reloadSourcePageTabBeforeRefresh,
  shouldRefreshAfterSourcePageRecovery,
  shouldReloadBeforeSourcePageRecoveryRefresh,
  type SourcePageRecoverySourceState,
} from "../shared/source-page-recovery";
import {
  getExtensionPermissionsApi,
  getExtensionTabsApi,
  hasExtensionRuntime,
} from "../shared/extension-api";
import { openProviderDetail } from "./popup-route-actions";
import { selectPreferredSourcePageTab } from "./source-page-tab-selection";

type PopupSourcePageActionDeps = {
  now?: () => string;
  openProviderDetail?: (providerId: ProviderId) => Promise<void>;
  sendMessage?: typeof sendAppMessage;
  skipExistingTabRefresh?: boolean;
};

function hasSourcePageNavigationControl(): boolean {
  const tabsApi = getExtensionTabsApi();

  return (
    hasExtensionRuntime() &&
    typeof tabsApi?.query === "function" &&
    typeof tabsApi.create === "function" &&
    typeof tabsApi.update === "function"
  );
}

async function addHostAccessRequest(
  tabId: number,
  sourcePageUrl: string,
): Promise<void> {
  const permissionsApi = getExtensionPermissionsApi();

  if (typeof permissionsApi?.addHostAccessRequest !== "function") {
    return;
  }

  try {
    const pattern = `${new URL(sourcePageUrl).origin}/*`;
    await permissionsApi.addHostAccessRequest({ tabId, pattern });
  } catch {
    // Older browsers and already-granted sites keep the existing flow.
  }
}

export async function openProviderSourcePage(
  providerId: ProviderId,
  sourceStateKind?: SourcePageRecoverySourceState,
  {
    now = () => new Date().toISOString(),
    openProviderDetail: openDetail = openProviderDetail,
    sendMessage = sendAppMessage,
    skipExistingTabRefresh = false,
  }: PopupSourcePageActionDeps = {},
) {
  const sessionPagePlan = getSessionPagePlan(providerId);

  if (!sessionPagePlan || sessionPagePlan.rolloutStage !== "shipped") {
    await openDetail(providerId);
    return;
  }

  const preferredRoute = getOpenableRouteHint(sessionPagePlan.routeHints);

  if (!preferredRoute) {
    await openDetail(providerId);
    return;
  }

  const tabsApi = getExtensionTabsApi();

  if (!hasSourcePageNavigationControl() || !tabsApi) {
    window.open(preferredRoute, "_blank", "noopener,noreferrer");
    return;
  }

  const matchedTabs = await tabsApi.query?.({
    url: sessionPagePlan.routeHints,
  }) ?? [];
  const preferredTab = selectPreferredSourcePageTab(
    matchedTabs,
    preferredRoute,
  );

  if (preferredTab?.id !== undefined) {
    await addHostAccessRequest(
      preferredTab.id,
      preferredTab.url ?? preferredRoute,
    );
    const pageBinding = createPageBindingFromTab({
      mode: "bound",
      tabId: preferredTab.id,
      matchedUrl: preferredTab.url ?? preferredRoute,
      matchedTitle: preferredTab.title ?? null,
      updatedAt: now(),
    });

    if (skipExistingTabRefresh) {
      await tabsApi.update?.(preferredTab.id, { active: true });
      await sendMessage({
        type: "app:set-provider-page-binding",
        providerId,
        pageBinding,
      });
      window.close();
      return;
    }

    if (
      shouldReloadBeforeSourcePageRecoveryRefresh(
        "existing-tab",
        sourceStateKind,
      )
    ) {
      await reloadSourcePageTabBeforeRefresh(preferredTab.id);
    }

    const bindingResponse = await sendMessage({
      type: "app:set-provider-page-binding",
      providerId,
      pageBinding,
    });

    if (
      bindingResponse.ok &&
      shouldRefreshAfterSourcePageRecovery("existing-tab")
    ) {
      await sendMessage({
        type: "app:request-refresh",
        providerId,
      });
    }

    await tabsApi.update?.(preferredTab.id, { active: true });
    window.close();
    return;
  }

  const createdTab = await tabsApi.create?.({
    url: preferredRoute,
    active: true,
  });
  if (typeof createdTab?.id === "number") {
    await addHostAccessRequest(
      createdTab.id,
      createdTab.url ?? preferredRoute,
    );
  }
  await sendMessage({
    type: "app:set-provider-page-binding",
    providerId,
    pageBinding:
      typeof createdTab?.id === "number"
        ? createPageBindingFromTab({
            mode: "bound",
            tabId: createdTab.id,
            matchedUrl: createdTab.url ?? preferredRoute,
            matchedTitle: createdTab.title ?? null,
            updatedAt: now(),
          })
        : clearPageBinding(),
  });
  window.close();
}
