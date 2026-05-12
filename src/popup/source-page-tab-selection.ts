function sortTabsByPriority(tabs: chrome.tabs.Tab[]): chrome.tabs.Tab[] {
  return [...tabs].sort((left, right) => {
    if (left.active !== right.active) {
      return left.active ? -1 : 1;
    }

    return (right.lastAccessed ?? 0) - (left.lastAccessed ?? 0);
  });
}

export function selectPreferredSourcePageTab(
  matchedTabs: chrome.tabs.Tab[],
  preferredRoute: string,
): chrome.tabs.Tab | null {
  const exactTabs = matchedTabs.filter((tab) =>
    tab.url?.startsWith(preferredRoute),
  );
  const preferredTabs = sortTabsByPriority(
    exactTabs.length > 0 ? exactTabs : matchedTabs,
  );

  return preferredTabs.find((tab) => typeof tab.id === "number") ?? null;
}
