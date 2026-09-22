import type { AppState, ProviderId, ProviderSetting } from "../providers/types";
import { markPageBindingStale } from "../shared/page-bindings";
import {
  doesUrlMatchRouteHints,
  getSessionPagePlan,
} from "../shared/provider-sources";
import { seedAppStateIfEmpty, updateAppState } from "../shared/storage";
import {
  captureProviderSyncIdentity,
  isProviderSyncIdentityCurrent,
  type ProviderSyncIdentity,
} from "../shared/provider-sync-identity";

type PageBindingLifecycleResult = {
  state: AppState;
  changedProviderIds: ProviderId[];
};

type ReplacementTab = {
  tabId: number;
  url?: string | null;
  title?: string | null;
};

type PageBindingUpdate = {
  providerId: ProviderId;
  identity: ProviderSyncIdentity;
  pageBinding: ProviderSetting["pageBinding"];
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

function moveProviderBindingToReplacementTab(
  provider: ProviderSetting,
  replacementTab: ReplacementTab,
  updatedAt: string,
): ProviderSetting {
  return {
    ...provider,
    pageBinding: {
      ...provider.pageBinding,
      status: "bound",
      tabId: replacementTab.tabId,
      matchedUrl: replacementTab.url ?? provider.pageBinding.matchedUrl,
      matchedTitle: replacementTab.title ?? provider.pageBinding.matchedTitle,
      updatedAt,
    },
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

export function reconcilePageBindingsForReplacedTab(
  state: AppState,
  removedTabId: number,
  replacementTab: ReplacementTab,
  updatedAt: string,
): PageBindingLifecycleResult {
  const changedProviderIds: ProviderId[] = [];
  const providerSettings = state.providerSettings.map((provider) => {
    if (!isBoundToTab(provider, removedTabId)) {
      return provider;
    }

    changedProviderIds.push(provider.id);

    const sessionPagePlan = getSessionPagePlan(provider.id);
    const nextUrl = replacementTab.url ?? null;

    if (
      sessionPagePlan &&
      nextUrl &&
      doesUrlMatchRouteHints(nextUrl, sessionPagePlan.routeHints)
    ) {
      return moveProviderBindingToReplacementTab(
        provider,
        replacementTab,
        updatedAt,
      );
    }

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

function capturePageBindingUpdates(
  state: AppState,
  result: PageBindingLifecycleResult,
): PageBindingUpdate[] {
  return result.changedProviderIds.flatMap((providerId) => {
    const provider = result.state.providerSettings.find(
      (setting) => setting.id === providerId,
    );

    return provider
      ? [{
          providerId,
          identity: captureProviderSyncIdentity(state, providerId),
          pageBinding: provider.pageBinding,
        }]
      : [];
  });
}

function arePageBindingsEqual(
  first: ProviderSetting["pageBinding"],
  second: ProviderSetting["pageBinding"],
): boolean {
  return (
    first.mode === second.mode &&
    first.status === second.status &&
    first.tabId === second.tabId &&
    first.matchedUrl === second.matchedUrl &&
    first.matchedTitle === second.matchedTitle &&
    first.updatedAt === second.updatedAt
  );
}

async function commitPageBindingUpdates(
  updates: readonly PageBindingUpdate[],
): Promise<AppState | null> {
  let applied = false;
  const state = await updateAppState((latest) => {
    const updatesByProviderId = new Map(
      updates.map((update) => [update.providerId, update]),
    );
    const providerSettings = latest.providerSettings.map((provider) => {
      const update = updatesByProviderId.get(provider.id);

      if (
        !update ||
        arePageBindingsEqual(provider.pageBinding, update.pageBinding) ||
        !isProviderSyncIdentityCurrent(latest, provider.id, update.identity)
      ) {
        return provider;
      }

      applied = true;
      return { ...provider, pageBinding: update.pageBinding };
    });

    return applied ? { ...latest, providerSettings } : latest;
  });

  return applied ? state : null;
}

export async function markProviderBindingsStaleForRemovedTab(
  tabId: number,
): Promise<AppState | null> {
  const current = await seedAppStateIfEmpty();
  const result = reconcilePageBindingsForRemovedTab(current, tabId);

  if (result.changedProviderIds.length === 0) {
    return null;
  }

  return commitPageBindingUpdates(capturePageBindingUpdates(current, result));
}

export async function reconcileProviderBindingsForReplacedTab(
  removedTabId: number,
  replacementTab: ReplacementTab,
  updatedAt: string,
): Promise<AppState | null> {
  const current = await seedAppStateIfEmpty();
  const result = reconcilePageBindingsForReplacedTab(
    current,
    removedTabId,
    replacementTab,
    updatedAt,
  );

  if (result.changedProviderIds.length === 0) {
    return null;
  }

  return commitPageBindingUpdates(capturePageBindingUpdates(current, result));
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

  return commitPageBindingUpdates(capturePageBindingUpdates(current, result));
}
