export type PageSessionTabLifecycleTab = {
  id?: number;
  active?: boolean;
  lastAccessed?: number;
  status?: string;
  url?: string;
  title?: string;
};

export type PageSessionTabLifecycleTabsApi = {
  get?: (tabId: number) => Promise<PageSessionTabLifecycleTab>;
  create?: (createProperties: {
    url: string;
    active?: boolean;
  }) => Promise<PageSessionTabLifecycleTab>;
  reload?: (
    tabId: number,
    reloadProperties?: { bypassCache?: boolean },
  ) => Promise<void>;
  remove?: (tabId: number) => Promise<void>;
};

export type PageSessionTabLifecycleOpenWhenMissing = {
  url: string;
  active?: boolean;
  closeOnUnmatched?: boolean;
  waitForLoadTimeoutMs?: number;
  loadPollIntervalMs?: number;
};

export type PageSessionTabLifecycleReloadOptions = {
  waitForLoadTimeoutMs?: number;
  loadPollIntervalMs?: number;
  postLoadDelayMs?: number;
  bypassCache?: boolean;
};

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function waitForOpenedTabLoad(
  tabsApi: PageSessionTabLifecycleTabsApi,
  tabId: number,
  openWhenMissing: PageSessionTabLifecycleOpenWhenMissing,
): Promise<PageSessionTabLifecycleTab | null> {
  if (typeof tabsApi.get !== "function") {
    return null;
  }

  const timeoutMs = Math.max(0, openWhenMissing.waitForLoadTimeoutMs ?? 10_000);
  const pollIntervalMs = Math.max(
    50,
    openWhenMissing.loadPollIntervalMs ?? 250,
  );
  const deadline = Date.now() + timeoutMs;
  let lastTab: PageSessionTabLifecycleTab | null = null;
  let didPoll = false;

  while (!didPoll || Date.now() <= deadline) {
    didPoll = true;

    try {
      lastTab = await tabsApi.get(tabId);

      if (lastTab.status === "complete") {
        return lastTab;
      }
    } catch {
      return lastTab;
    }

    if (timeoutMs === 0) {
      return lastTab;
    }

    await delay(Math.min(pollIntervalMs, Math.max(0, deadline - Date.now())));
  }

  return lastTab;
}

export function normalizeReloadOptions(
  reloadOptions: boolean | PageSessionTabLifecycleReloadOptions | undefined,
): PageSessionTabLifecycleReloadOptions | null {
  if (!reloadOptions) {
    return null;
  }

  if (reloadOptions === true) {
    return {};
  }

  return reloadOptions;
}

async function waitForReloadedTabLoad(
  tabsApi: PageSessionTabLifecycleTabsApi,
  tabId: number,
  reloadOptions: PageSessionTabLifecycleReloadOptions,
): Promise<PageSessionTabLifecycleTab | null> {
  if (typeof tabsApi.get !== "function") {
    return null;
  }

  const timeoutMs = Math.max(0, reloadOptions.waitForLoadTimeoutMs ?? 10_000);
  const pollIntervalMs = Math.max(
    50,
    reloadOptions.loadPollIntervalMs ?? 250,
  );
  const deadline = Date.now() + timeoutMs;
  let lastTab: PageSessionTabLifecycleTab | null = null;

  const finish = async (tab: PageSessionTabLifecycleTab | null) => {
    const postLoadDelayMs = Math.max(0, reloadOptions.postLoadDelayMs ?? 0);

    if (postLoadDelayMs > 0) {
      await delay(postLoadDelayMs);
    }

    return tab;
  };

  while (Date.now() <= deadline) {
    try {
      lastTab = await tabsApi.get(tabId);

      if (lastTab.status === "complete") {
        return finish(lastTab);
      }
    } catch {
      return finish(lastTab);
    }

    if (timeoutMs === 0) {
      return finish(lastTab);
    }

    await delay(Math.min(pollIntervalMs, Math.max(0, deadline - Date.now())));
  }

  return finish(lastTab);
}

export async function reloadPageSessionTab(
  tabsApi: PageSessionTabLifecycleTabsApi,
  tabId: number,
  reloadOptions: PageSessionTabLifecycleReloadOptions,
): Promise<PageSessionTabLifecycleTab | null> {
  if (typeof tabsApi.reload !== "function") {
    return null;
  }

  await tabsApi.reload(tabId, {
    bypassCache: reloadOptions.bypassCache ?? true,
  });

  return waitForReloadedTabLoad(tabsApi, tabId, reloadOptions);
}

export async function openMissingPageSessionTab(
  tabsApi: PageSessionTabLifecycleTabsApi,
  openWhenMissing: PageSessionTabLifecycleOpenWhenMissing,
): Promise<
  | (PageSessionTabLifecycleTab & {
      id: number;
      bindingMode: "auto";
    })
  | null
> {
  if (typeof tabsApi.create !== "function") {
    return null;
  }

  const createdTab = await tabsApi.create({
    url: openWhenMissing.url,
    active: openWhenMissing.active ?? false,
  });

  if (typeof createdTab.id !== "number") {
    return null;
  }

  const loadedTab = await waitForOpenedTabLoad(
    tabsApi,
    createdTab.id,
    openWhenMissing,
  );

  return {
    ...createdTab,
    ...loadedTab,
    id: createdTab.id,
    active: loadedTab?.active ?? createdTab.active ?? false,
    bindingMode: "auto",
  };
}

export async function closeOpenedPageSessionTab(
  tabsApi: PageSessionTabLifecycleTabsApi,
  tabId: number | null,
): Promise<void> {
  if (tabId === null || typeof tabsApi.remove !== "function") {
    return;
  }

  try {
    await tabsApi.remove(tabId);
  } catch {
    // The user may close the tab before cleanup runs.
  }
}
