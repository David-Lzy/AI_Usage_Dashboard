export type BrowserTarget = "chrome" | "firefox";

export type BrowserCapabilityFlags = {
  supportsChromeSidePanel: boolean;
  supportsFirefoxSidebar: boolean;
  supportsProviderFaviconIcon: boolean;
  supportsActionOpenPopup: boolean;
  supportsStorageSync: boolean;
};

type SidePanelCloseTarget = {
  tabId?: number;
  windowId?: number;
};

type ExtensionTabsApi = {
  query?: (queryInfo: {
    active?: boolean;
    currentWindow?: boolean;
  }) => Promise<Array<{ id?: number; active?: boolean; lastAccessed?: number }>>;
  create?: (createProperties: {
    url: string;
    active?: boolean;
  }) => Promise<unknown>;
  getCurrent?: () => Promise<{ id?: number } | undefined>;
  remove?: (tabId: number) => Promise<void>;
};

type ExtensionWindowsApi = {
  getCurrent?: () => Promise<{ id?: number } | undefined>;
};

type ExtensionRuntimeApi = {
  id?: string;
  getURL?: (path: string) => string;
};

type FirefoxSidebarActionApi = {
  open?: () => Promise<void> | void;
  setPanel?: (details: { panel: string }) => Promise<void> | void;
};

type ExtensionApiNamespace = {
  runtime?: ExtensionRuntimeApi;
  tabs?: ExtensionTabsApi;
  windows?: ExtensionWindowsApi;
  sidebarAction?: FirefoxSidebarActionApi;
  storage?: {
    sync?: unknown;
  };
};

type ChromeSidePanelApi = {
  open?: (options: SidePanelCloseTarget) => Promise<void>;
  setOptions?: (options: {
    enabled: boolean;
    path: string;
    tabId?: number;
  }) => Promise<void>;
  close?: (options: SidePanelCloseTarget) => Promise<void>;
  setPanelBehavior?: (options: {
    openPanelOnActionClick: boolean;
  }) => Promise<void>;
};

type ChromeActionApi = {
  openPopup?: () => Promise<void>;
  setIcon?: (...args: unknown[]) => Promise<void> | void;
};

type ChromeApiNamespace = ExtensionApiNamespace & {
  action?: ChromeActionApi;
  sidePanel?: ChromeSidePanelApi;
};

function getChromeApi(): ChromeApiNamespace | null {
  return typeof chrome !== "undefined" ? (chrome as unknown as ChromeApiNamespace) : null;
}

function getExtensionApi(): ExtensionApiNamespace | null {
  const globalScope = globalThis as typeof globalThis & {
    browser?: ExtensionApiNamespace;
  };

  return globalScope.browser ?? getChromeApi();
}

function hasExtensionRuntime(api: ExtensionApiNamespace | null): boolean {
  return Boolean(api?.runtime?.id);
}

function hasChromeSidePanelApi(
  chromeApi: ChromeApiNamespace | null = getChromeApi(),
): boolean {
  return (
    hasExtensionRuntime(chromeApi) &&
    typeof chromeApi?.sidePanel?.open === "function" &&
    typeof chromeApi.sidePanel.setOptions === "function"
  );
}

function getFirefoxSidebarActionApi(): FirefoxSidebarActionApi | null {
  const api = getExtensionApi();

  return hasExtensionRuntime(api) &&
    typeof api?.sidebarAction?.open === "function" &&
    typeof api.sidebarAction.setPanel === "function"
    ? api.sidebarAction
    : null;
}

export function detectBrowserTarget(): BrowserTarget {
  if (hasChromeSidePanelApi()) {
    return "chrome";
  }

  if (getFirefoxSidebarActionApi()) {
    return "firefox";
  }

  return "chrome";
}

export function getBrowserCapabilities(): BrowserCapabilityFlags {
  const chromeApi = getChromeApi();
  const extensionApi = getExtensionApi();

  return {
    supportsChromeSidePanel: hasChromeSidePanelApi(chromeApi),
    supportsFirefoxSidebar: getFirefoxSidebarActionApi() !== null,
    supportsProviderFaviconIcon:
      typeof chromeApi?.runtime?.getURL === "function" &&
      detectBrowserTarget() === "chrome",
    supportsActionOpenPopup:
      typeof chromeApi?.action?.openPopup === "function",
    supportsStorageSync:
      hasExtensionRuntime(extensionApi) &&
      typeof extensionApi?.storage?.sync !== "undefined",
  };
}

export async function getActiveTabId(): Promise<number | null> {
  const api = getExtensionApi();

  if (typeof api?.tabs?.query !== "function") {
    return null;
  }

  try {
    const [activeTab] = await api.tabs.query({
      active: true,
      currentWindow: true,
    });

    return typeof activeTab?.id === "number" ? activeTab.id : null;
  } catch {
    return null;
  }
}

export async function getCurrentWindowId(): Promise<number | null> {
  const api = getExtensionApi();

  if (typeof api?.windows?.getCurrent !== "function") {
    return null;
  }

  try {
    const currentWindow = await api.windows.getCurrent();

    return typeof currentWindow?.id === "number" ? currentWindow.id : null;
  } catch {
    return null;
  }
}

function addUniqueCloseTarget(
  targets: SidePanelCloseTarget[],
  nextTarget: SidePanelCloseTarget | null,
): void {
  if (nextTarget === null) {
    return;
  }

  const alreadyAdded = targets.some((target) => {
    if ("tabId" in target && "tabId" in nextTarget) {
      return target.tabId === nextTarget.tabId;
    }

    if ("windowId" in target && "windowId" in nextTarget) {
      return target.windowId === nextTarget.windowId;
    }

    return false;
  });

  if (!alreadyAdded) {
    targets.push(nextTarget);
  }
}

export async function resolveSidePanelCloseTargets(options?: {
  preferWindow?: boolean;
}): Promise<SidePanelCloseTarget[]> {
  const currentWindowId = await getCurrentWindowId();
  const activeTabId = await getActiveTabId();
  const windowTarget =
    currentWindowId !== null ? { windowId: currentWindowId } : null;
  const tabTarget = activeTabId !== null ? { tabId: activeTabId } : null;
  const targets: SidePanelCloseTarget[] = [];

  if (options?.preferWindow) {
    addUniqueCloseTarget(targets, windowTarget);
    addUniqueCloseTarget(targets, tabTarget);
  } else {
    addUniqueCloseTarget(targets, tabTarget);
    addUniqueCloseTarget(targets, windowTarget);
  }

  return targets;
}

export async function resolveSidePanelCloseTarget(): Promise<SidePanelCloseTarget | null> {
  const [target] = await resolveSidePanelCloseTargets();

  return target ?? null;
}

export async function closeSidePanelBestEffort(
  target?: SidePanelCloseTarget | SidePanelCloseTarget[] | null,
): Promise<void> {
  const chromeApi = getChromeApi();

  if (!hasExtensionRuntime(chromeApi) || typeof chromeApi?.sidePanel?.close !== "function") {
    return;
  }

  const closeTargets =
    target === undefined
      ? await resolveSidePanelCloseTargets()
      : Array.isArray(target)
        ? target
        : target !== null
          ? [target]
          : [];

  for (const closeTarget of closeTargets) {
    try {
      await chromeApi.sidePanel.close(closeTarget);
    } catch {
      // Chrome versions before sidePanel.close should still complete navigation.
    }
  }
}

async function closeCurrentExtensionTabBestEffort(): Promise<void> {
  const api = getExtensionApi();

  if (
    !hasExtensionRuntime(api) ||
    typeof api?.tabs?.getCurrent !== "function" ||
    typeof api.tabs.remove !== "function"
  ) {
    return;
  }

  try {
    const currentTab = await api.tabs.getCurrent();

    if (typeof currentTab?.id === "number") {
      await api.tabs.remove(currentTab.id);
    }
  } catch {
    // If the current surface is not a normal extension tab, keep it open.
  }
}

async function openChromeSidePanelPath(
  path: string,
  options: { preferWindow?: boolean },
): Promise<boolean> {
  const chromeApi = getChromeApi();

  if (!hasChromeSidePanelApi(chromeApi)) {
    return false;
  }

  const sidePanel = chromeApi?.sidePanel;

  if (!sidePanel) {
    return false;
  }

  for (const targetKind of options.preferWindow
    ? (["window", "tab"] as const)
    : (["tab", "window"] as const)) {
    const target =
      targetKind === "window"
        ? await getCurrentWindowId().then((windowId) =>
            windowId !== null ? { windowId } : null,
          )
        : await getActiveTabId().then((tabId) =>
            tabId !== null ? { tabId } : null,
          );

    if (!target) {
      continue;
    }

    if ("tabId" in target) {
      await sidePanel.setOptions?.({
        enabled: true,
        path,
        tabId: target.tabId,
      });
      await sidePanel.open?.({ tabId: target.tabId });
      return true;
    }

    await sidePanel.setOptions?.({
      enabled: true,
      path,
    });
    await sidePanel.open?.({ windowId: target.windowId });
    return true;
  }

  return false;
}

async function openFirefoxSidebarPath(path: string): Promise<boolean> {
  const sidebarAction = getFirefoxSidebarActionApi();

  if (!sidebarAction) {
    return false;
  }

  await sidebarAction.setPanel?.({ panel: path });
  await sidebarAction.open?.();
  return true;
}

export async function openSideSurfacePath(
  path: string,
  options: {
    preferWindow?: boolean;
    closeCurrentExtensionTab?: boolean;
  } = {},
): Promise<boolean> {
  if (await openChromeSidePanelPath(path, options)) {
    if (options.closeCurrentExtensionTab) {
      await closeCurrentExtensionTabBestEffort();
    }

    return true;
  }

  if (await openFirefoxSidebarPath(path)) {
    if (options.closeCurrentExtensionTab) {
      await closeCurrentExtensionTabBestEffort();
    }

    return true;
  }

  return false;
}

export function buildExtensionUrl(path: string): string | null {
  const api = getExtensionApi();

  return hasExtensionRuntime(api) && typeof api?.runtime?.getURL === "function"
    ? api.runtime.getURL(path)
    : null;
}

export async function openExtensionTabPath(path: string): Promise<boolean> {
  const api = getExtensionApi();
  const url = buildExtensionUrl(path);

  if (!url || typeof api?.tabs?.create !== "function") {
    return false;
  }

  await api.tabs.create({
    url,
    active: true,
  });
  return true;
}

export async function configureChromeSidePanelActionBehavior(): Promise<void> {
  const chromeApi = getChromeApi();

  if (
    !hasExtensionRuntime(chromeApi) ||
    typeof chromeApi?.sidePanel?.setPanelBehavior !== "function"
  ) {
    return;
  }

  await chromeApi.sidePanel.setPanelBehavior({
    openPanelOnActionClick: false,
  });
}
