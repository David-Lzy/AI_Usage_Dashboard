export async function getActiveTabId(): Promise<number | null> {
  if (typeof chrome.tabs?.query !== "function") {
    return null;
  }

  const [activeTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  return typeof activeTab?.id === "number" ? activeTab.id : null;
}

export async function getCurrentWindowId(): Promise<number | null> {
  if (typeof chrome.windows?.getCurrent !== "function") {
    return null;
  }

  const currentWindow = await chrome.windows.getCurrent();

  return typeof currentWindow.id === "number" ? currentWindow.id : null;
}

type SidePanelCloseTarget = chrome.sidePanel.CloseOptions;

export async function resolveSidePanelCloseTarget(): Promise<SidePanelCloseTarget | null> {
  const activeTabId = await getActiveTabId();

  if (activeTabId !== null) {
    return { tabId: activeTabId };
  }

  const currentWindowId = await getCurrentWindowId();

  return currentWindowId !== null ? { windowId: currentWindowId } : null;
}

export async function closeSidePanelBestEffort(
  target?: SidePanelCloseTarget | null,
): Promise<void> {
  if (
    typeof chrome === "undefined" ||
    !chrome.runtime?.id ||
    typeof chrome.sidePanel?.close !== "function"
  ) {
    return;
  }

  try {
    const closeTarget = target ?? await resolveSidePanelCloseTarget();

    if (closeTarget !== null) {
      await chrome.sidePanel.close(closeTarget);
    }
  } catch {
    // Chrome versions before sidePanel.close should still complete navigation.
  }
}
