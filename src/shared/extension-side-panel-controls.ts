export async function getActiveTabId(): Promise<number | null> {
  if (typeof chrome.tabs?.query !== "function") {
    return null;
  }

  try {
    const [activeTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    return typeof activeTab?.id === "number" ? activeTab.id : null;
  } catch {
    return null;
  }
}

export async function getCurrentWindowId(): Promise<number | null> {
  if (typeof chrome.windows?.getCurrent !== "function") {
    return null;
  }

  try {
    const currentWindow = await chrome.windows.getCurrent();

    return typeof currentWindow.id === "number" ? currentWindow.id : null;
  } catch {
    return null;
  }
}

type SidePanelCloseTarget = chrome.sidePanel.CloseOptions;

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
  if (
    typeof chrome === "undefined" ||
    !chrome.runtime?.id ||
    typeof chrome.sidePanel?.close !== "function"
  ) {
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
      await chrome.sidePanel.close(closeTarget);
    } catch {
      // Chrome versions before sidePanel.close should still complete navigation.
    }
  }
}
