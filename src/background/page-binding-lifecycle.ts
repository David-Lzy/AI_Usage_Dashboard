import type { AppState, ProviderId, ProviderSetting } from "../providers/types";
import { markPageBindingStale } from "../shared/page-bindings";
import {
  doesUrlMatchRouteHints,
  getSessionPagePlan,
} from "../shared/provider-sources";
import { seedAppStateIfEmpty, writeAppState } from "../shared/storage";

type PageBindingLifecycleResult = {
  state: AppState;
  changedProviderIds: ProviderId[];
};

function isBoundToTab(provider: ProviderSetting, tabId: number): boolean {
  return (
    provider.pageBinding.status === "bound" &&
    provider.pageBinding.tabId === tabId
  );
}

function markProviderBindingStale(provider: ProviderSetting): ProviderSetting {
  return {
    ...provider,
    pageBinding: markPageBindingStale(provider.pageBinding),
  };
}

export function reconcilePageBindingsForRemovedTab(
  state: AppState,
  tabId: number,
): PageBindingLifecycleResult {
  const changedProviderIds: ProviderId[] = [];
  const providerSettings = state.providerSettings.map((provider) => {
    if (!isBoundToTab(provider, tabId)) {
      return provider;
    }

    changedProviderIds.push(provider.id);
    return markProviderBindingStale(provider);
  });

  return {
    state:
      changedProviderIds.length > 0
        ? {
            ...state,
            providerSettings,
          }
        : state,
    changedProviderIds,
  };
}

export function reconcilePageBindingsForTabUrlChange(
  state: AppState,
  tabId: number,
  nextUrl: string,
): PageBindingLifecycleResult {
  const changedProviderIds: ProviderId[] = [];
  const providerSettings = state.providerSettings.map((provider) => {
    if (!isBoundToTab(provider, tabId)) {
      return provider;
    }

    const sessionPagePlan = getSessionPagePlan(provider.id);

    if (
      sessionPagePlan &&
      doesUrlMatchRouteHints(nextUrl, sessionPagePlan.routeHints)
    ) {
      return provider;
    }

    changedProviderIds.push(provider.id);
    return markProviderBindingStale(provider);
  });

  return {
    state:
      changedProviderIds.length > 0
        ? {
            ...state,
            providerSettings,
          }
        : state,
    changedProviderIds,
  };
}

export async function markProviderBindingsStaleForRemovedTab(
  tabId: number,
): Promise<AppState | null> {
  const current = await seedAppStateIfEmpty();
  const result = reconcilePageBindingsForRemovedTab(current, tabId);

  if (result.changedProviderIds.length === 0) {
    return null;
  }

  return writeAppState(result.state);
}

export async function markProviderBindingsStaleForTabUrlChange(
  tabId: number,
  nextUrl: string,
): Promise<AppState | null> {
  const current = await seedAppStateIfEmpty();
  const result = reconcilePageBindingsForTabUrlChange(current, tabId, nextUrl);

  if (result.changedProviderIds.length === 0) {
    return null;
  }

  return writeAppState(result.state);
}
