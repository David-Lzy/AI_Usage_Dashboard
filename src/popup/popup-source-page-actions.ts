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
import { getExtensionTabsApi, hasExtensionRuntime } from "../shared/extension-api";
import { openProviderDetail } from "./popup-route-actions";
import { selectPreferredSourcePageTab } from "./source-page-tab-selection";

type PopupSourcePageActionDeps = {
  now?: () => string;
  openProviderDetail?: (providerId: ProviderId) => Promise<void>;
  sendMessage?: typeof sendAppMessage;
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

export async function openProviderSourcePage(
  providerId: ProviderId,
  sourceStateKind?: SourcePageRecoverySourceState,
  {
    now = () => new Date().toISOString(),
    openProviderDetail: openDetail = openProviderDetail,
    sendMessage = sendAppMessage,
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
      pageBinding: createPageBindingFromTab({
        mode: "bound",
        tabId: preferredTab.id,
        matchedUrl: preferredTab.url ?? preferredRoute,
        matchedTitle: preferredTab.title ?? null,
        updatedAt: now(),
      }),
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
