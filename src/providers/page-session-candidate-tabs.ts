import { sortTabsByPriority } from "./page-session-tab-priority";

export type PageSessionCandidateBindingMode = "auto" | "bound";

export type PageSessionCandidateTab = {
  id?: number;
  active?: boolean;
  lastAccessed?: number;
  status?: string;
  url?: string;
  title?: string;
};

export type PageSessionCandidateBinding = {
  mode: PageSessionCandidateBindingMode;
  tabId: number | null;
  matchedUrl?: string | null;
  matchedTitle?: string | null;
};

export type PageSessionCandidateDefinition = {
  urlPatterns: string[];
  binding?: PageSessionCandidateBinding;
};

export type PageSessionCandidateTabsApi = {
  query: (queryInfo: { url?: string | string[] }) => Promise<PageSessionCandidateTab[]>;
  get?: (tabId: number) => Promise<PageSessionCandidateTab>;
};

export type PageSessionCandidateTabResult = PageSessionCandidateTab & {
  bindingMode: PageSessionCandidateBindingMode;
};

export type PageSessionCandidateTabsResult = {
  candidates: PageSessionCandidateTabResult[];
  bindingMissing: boolean;
};

export async function getCandidateTabs(
  tabsApi: PageSessionCandidateTabsApi,
  definition: PageSessionCandidateDefinition,
): Promise<PageSessionCandidateTabsResult> {
  const binding = definition.binding ?? {
    mode: "auto",
    tabId: null,
  };
  const candidates: PageSessionCandidateTabResult[] = [];
  let bindingMissing = false;
  const seenTabIds = new Set<number>();

  if (binding.mode === "bound" && typeof binding.tabId === "number") {
    if (typeof tabsApi.get === "function") {
      try {
        const tab = await tabsApi.get(binding.tabId);
        candidates.push({
          ...tab,
          id: binding.tabId,
          bindingMode: "bound",
        });
        seenTabIds.add(binding.tabId);
      } catch {
        bindingMissing = true;
      }
    } else {
      const tabs = await tabsApi.query({
        url: definition.urlPatterns,
      });
      const matchedTab = tabs.find((tab) => tab.id === binding.tabId) ?? null;

      if (matchedTab?.id === binding.tabId) {
        candidates.push({
          ...matchedTab,
          bindingMode: "bound",
        });
        seenTabIds.add(binding.tabId);
      } else {
        bindingMissing = true;
      }
    }
  }

  const autoTabs = sortTabsByPriority(
    (
      await tabsApi.query({
        url: definition.urlPatterns,
      })
    )
      .filter((tab) =>
        typeof tab.id === "number" ? !seenTabIds.has(tab.id) : true,
      )
      .map((tab) => ({ ...tab, bindingMode: "auto" as const })),
    binding,
  );

  return {
    candidates: [...candidates, ...autoTabs],
    bindingMissing,
  };
}
