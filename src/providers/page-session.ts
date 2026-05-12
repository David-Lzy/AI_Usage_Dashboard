import type { ProviderId } from "./types";
import {
  closeOpenedPageSessionTab,
  normalizeReloadOptions,
  openMissingPageSessionTab,
  reloadPageSessionTab,
} from "./page-session-tab-lifecycle";
import { sortTabsByPriority } from "./page-session-tab-priority";
import type {
  PageSessionNetworkObserverExtraction,
  PageSessionObservedNetworkState,
} from "./page-session-network-observer";
import {
  installNetworkObserverBridge,
  readNetworkObserverBridge,
} from "./page-session-network-observer";
import type {
  PageSessionCapturedScriptMap,
  PageSessionCapturedWindowMap,
  PageSessionScriptingApi,
} from "./page-session-script-capture";
import {
  readIsolatedPageSnapshot,
  readMainWorldWindowValues,
  uniqueStrings,
} from "./page-session-script-capture";

export type {
  PageSessionNetworkObserverExtraction,
  PageSessionObservedNetworkEntry,
  PageSessionObservedNetworkState,
} from "./page-session-network-observer";

export type {
  PageSessionCapturedScriptMap,
  PageSessionCapturedWindowMap,
} from "./page-session-script-capture";

export type PageSessionExtractionMode =
  | "dom"
  | "boot_data"
  | "network_observer";

export type PageSessionMatchStatus = "matched" | "logged_out" | "unmatched";

export type PageSessionBindingMode = "auto" | "bound";

export type PageSessionCapturedPage = {
  url: string;
  title: string;
  heading: string | null;
  html: string;
  bootData?: {
    scripts: PageSessionCapturedScriptMap;
    windowValues: PageSessionCapturedWindowMap;
  };
  observedNetwork?: PageSessionObservedNetworkState;
};

export type PageSessionAttemptStatus =
  | "matched"
  | "logged_out"
  | "unmatched"
  | "binding_missing"
  | "capture_failed";

export type PageSessionAttempt = {
  tabId: number;
  bindingMode: PageSessionBindingMode;
  status: PageSessionAttemptStatus;
  url?: string;
  title?: string;
  error?: string;
};

export type PageSessionTarget = {
  tabId: number;
  bindingMode: PageSessionBindingMode;
  active: boolean;
  lastAccessed: number | null;
};

export type PageSessionOpenWhenMissing = {
  url: string;
  active?: boolean;
  closeOnUnmatched?: boolean;
  waitForLoadTimeoutMs?: number;
  loadPollIntervalMs?: number;
};

export type PageSessionReloadOptions = {
  waitForLoadTimeoutMs?: number;
  loadPollIntervalMs?: number;
  postLoadDelayMs?: number;
  bypassCache?: boolean;
};

export type PageSessionReloadOnCaptureFailure = PageSessionReloadOptions;

export type PageSessionReloadBeforeCapture = PageSessionReloadOptions;

export type PageSessionResult =
  | {
      status: "matched";
      page: PageSessionCapturedPage;
      target: PageSessionTarget;
      attempts: PageSessionAttempt[];
    }
  | {
      status: "logged_out" | "not_found" | "capture_unavailable";
      attempts: PageSessionAttempt[];
    };

export type PageSessionBinding = {
  mode: PageSessionBindingMode;
  tabId: number | null;
  matchedUrl?: string | null;
  matchedTitle?: string | null;
};

export type PageSessionDomExtraction = {
  mode: "dom";
};

export type PageSessionBootDataExtraction = {
  mode: "boot_data";
  scriptSelectors?: string[];
  windowKeys?: string[];
  maxSerializedLength?: number;
};

export type PageSessionExtraction =
  | PageSessionDomExtraction
  | PageSessionBootDataExtraction
  | PageSessionNetworkObserverExtraction;

export type PageSessionDefinition = {
  providerId: ProviderId;
  pageLabel: string;
  urlPatterns: string[];
  binding?: PageSessionBinding;
  openWhenMissing?: PageSessionOpenWhenMissing;
  reloadBeforeCapture?: boolean | PageSessionReloadBeforeCapture;
  reloadOnCaptureFailure?: boolean | PageSessionReloadOnCaptureFailure;
  extraction: PageSessionExtraction;
  match: (page: PageSessionCapturedPage) => PageSessionMatchStatus;
};

type PageSessionTabQueryResult = {
  id?: number;
  active?: boolean;
  lastAccessed?: number;
  status?: string;
  url?: string;
  title?: string;
};

type PageSessionTabsApi = {
  query: (queryInfo: { url?: string | string[] }) => Promise<PageSessionTabQueryResult[]>;
  get?: (tabId: number) => Promise<PageSessionTabQueryResult>;
  create?: (createProperties: {
    url: string;
    active?: boolean;
  }) => Promise<PageSessionTabQueryResult>;
  reload?: (
    tabId: number,
    reloadProperties?: { bypassCache?: boolean },
  ) => Promise<void>;
  remove?: (tabId: number) => Promise<void>;
};

export type PageSessionClientOptions = {
  tabsApi?: PageSessionTabsApi;
  scriptingApi?: PageSessionScriptingApi;
};

const NETWORK_BRIDGE_SCRIPT_ID = "__ai_usage_dashboard_page_session_bridge__";

function hasPageSessionApis(): boolean {
  return (
    typeof chrome !== "undefined" &&
    typeof chrome.tabs?.query === "function" &&
    typeof chrome.scripting?.executeScript === "function"
  );
}

function getTabsApi(
  tabsApi?: PageSessionClientOptions["tabsApi"],
): PageSessionTabsApi {
  if (tabsApi) {
    return tabsApi;
  }

  if (!hasPageSessionApis()) {
    throw new Error(
      "Live page-session capture requires the extension runtime with tabs and scripting access.",
    );
  }

  return chrome.tabs;
}

function getScriptingApi(
  scriptingApi?: PageSessionClientOptions["scriptingApi"],
): PageSessionScriptingApi {
  if (scriptingApi) {
    return scriptingApi;
  }

  if (!hasPageSessionApis()) {
    throw new Error(
      "Live page-session capture requires the extension runtime with tabs and scripting access.",
    );
  }

  return chrome.scripting;
}

async function capturePageSessionPage(
  tabId: number,
  scriptingApi: PageSessionScriptingApi,
  extraction: PageSessionExtraction,
): Promise<PageSessionCapturedPage> {
  const scriptSelectors =
    extraction.mode === "boot_data"
      ? uniqueStrings(extraction.scriptSelectors)
      : [];
  const baseSnapshot = await readIsolatedPageSnapshot(
    tabId,
    scriptingApi,
    scriptSelectors,
  );
  let bootData:
    | {
        scripts: PageSessionCapturedScriptMap;
        windowValues: PageSessionCapturedWindowMap;
      }
    | undefined;
  let observedNetwork: PageSessionObservedNetworkState | undefined;

  if (extraction.mode === "boot_data") {
    const windowValues = await readMainWorldWindowValues(
      tabId,
      scriptingApi,
      uniqueStrings(extraction.windowKeys),
      extraction.maxSerializedLength ?? 20_000,
    );

    bootData = {
      scripts: baseSnapshot.scripts,
      windowValues,
    };
  }

  if (extraction.mode === "network_observer") {
    await installNetworkObserverBridge(tabId, scriptingApi, extraction);
    observedNetwork = await readNetworkObserverBridge(tabId, scriptingApi);
  }

  return {
    url: baseSnapshot.url,
    title: baseSnapshot.title,
    heading: baseSnapshot.heading,
    html: baseSnapshot.html,
    ...(bootData ? { bootData } : {}),
    ...(observedNetwork ? { observedNetwork } : {}),
  };
}

async function getCandidateTabs(
  tabsApi: PageSessionTabsApi,
  definition: PageSessionDefinition,
): Promise<{
  candidates: Array<PageSessionTabQueryResult & { bindingMode: PageSessionBindingMode }>;
  bindingMissing: boolean;
}> {
  const binding = definition.binding ?? {
    mode: "auto",
    tabId: null,
  };
  const candidates: Array<
    PageSessionTabQueryResult & { bindingMode: PageSessionBindingMode }
  > = [];
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

export type PageSessionClient = {
  capture: (definition: PageSessionDefinition) => Promise<PageSessionResult>;
};

export function createPageSessionClient(
  options: PageSessionClientOptions = {},
): PageSessionClient {
  return {
    async capture(definition) {
      const tabsApi = getTabsApi(options.tabsApi);
      const scriptingApi = getScriptingApi(options.scriptingApi);
      const { candidates, bindingMissing } = await getCandidateTabs(
        tabsApi,
        definition,
      );
      let candidateTabs = candidates;
      const attempts: PageSessionAttempt[] = [];
      let sawLoggedOut = false;
      let sawCaptureFailure = false;
      let openedTabId: number | null = null;
      const reloadBeforeCapture = normalizeReloadOptions(
        definition.reloadBeforeCapture,
      );
      const reloadOnCaptureFailure = normalizeReloadOptions(
        definition.reloadOnCaptureFailure,
      );
      const reloadedBeforeCaptureTabIds = new Set<number>();
      const reloadedAfterCaptureFailureTabIds = new Set<number>();

      if (
        bindingMissing &&
        definition.binding?.mode === "bound" &&
        typeof definition.binding.tabId === "number"
      ) {
        attempts.push({
          tabId: definition.binding.tabId,
          bindingMode: "bound",
          status: "binding_missing",
          url: definition.binding.matchedUrl ?? undefined,
          title: definition.binding.matchedTitle ?? undefined,
        });
      }

      if (candidateTabs.length === 0 && definition.openWhenMissing) {
        const openedTab = await openMissingPageSessionTab(
          tabsApi,
          definition.openWhenMissing,
        ).catch(() => null);

        if (openedTab) {
          openedTabId = openedTab.id;
          candidateTabs = [openedTab];
        }
      }

      if (candidateTabs.length === 0) {
        return {
          status: "not_found",
          attempts,
        };
      }

      for (const tab of candidateTabs) {
        if (typeof tab.id !== "number") {
          continue;
        }

        try {
          let currentTab = tab;

          if (
            reloadBeforeCapture &&
            typeof tabsApi.reload === "function" &&
            tab.id !== openedTabId &&
            !reloadedBeforeCaptureTabIds.has(tab.id)
          ) {
            reloadedBeforeCaptureTabIds.add(tab.id);

            const reloadedTab = await reloadPageSessionTab(
              tabsApi,
              tab.id,
              reloadBeforeCapture,
            );

            currentTab = {
              ...currentTab,
              ...reloadedTab,
              id: tab.id,
              bindingMode: tab.bindingMode,
            };
          }

          const page = await capturePageSessionPage(
            tab.id,
            scriptingApi,
            definition.extraction,
          );
          const matchStatus = definition.match(page);

          attempts.push({
            tabId: tab.id,
            bindingMode: tab.bindingMode,
            status: matchStatus === "matched" ? "matched" : matchStatus,
            url: page.url,
            title: page.title,
          });

          if (matchStatus === "matched") {
            return {
              status: "matched",
              page,
              target: {
                tabId: tab.id,
                bindingMode: tab.bindingMode,
                active: Boolean(currentTab.active),
                lastAccessed:
                  typeof currentTab.lastAccessed === "number"
                    ? currentTab.lastAccessed
                    : null,
              },
              attempts,
            };
          }

          if (matchStatus === "logged_out") {
            sawLoggedOut = true;
          }
        } catch (error) {
          sawCaptureFailure = true;
          attempts.push({
            tabId: tab.id,
            bindingMode: tab.bindingMode,
            status: "capture_failed",
            error: error instanceof Error ? error.message : "Unknown page capture failure",
          });

          if (
            reloadOnCaptureFailure &&
            typeof tabsApi.reload === "function" &&
            !reloadedAfterCaptureFailureTabIds.has(tab.id)
          ) {
            reloadedAfterCaptureFailureTabIds.add(tab.id);

            try {
              const reloadedTab =
                await reloadPageSessionTab(
                  tabsApi,
                  tab.id,
                  reloadOnCaptureFailure,
                );
              const page = await capturePageSessionPage(
                tab.id,
                scriptingApi,
                definition.extraction,
              );
              const matchStatus = definition.match(page);

              attempts.push({
                tabId: tab.id,
                bindingMode: tab.bindingMode,
                status: matchStatus === "matched" ? "matched" : matchStatus,
                url: page.url,
                title: page.title,
              });

              if (matchStatus === "matched") {
                return {
                  status: "matched",
                  page,
                  target: {
                    tabId: tab.id,
                    bindingMode: tab.bindingMode,
                    active: Boolean(reloadedTab?.active ?? tab.active),
                    lastAccessed:
                      typeof reloadedTab?.lastAccessed === "number"
                        ? reloadedTab.lastAccessed
                        : typeof tab.lastAccessed === "number"
                          ? tab.lastAccessed
                          : null,
                  },
                  attempts,
                };
              }

              if (matchStatus === "logged_out") {
                sawLoggedOut = true;
              }
            } catch (retryError) {
              attempts.push({
                tabId: tab.id,
                bindingMode: tab.bindingMode,
                status: "capture_failed",
                error:
                  retryError instanceof Error
                    ? `After reload: ${retryError.message}`
                    : "After reload: unknown page capture failure",
              });
            }
          }
        }
      }

      const finalStatus = sawLoggedOut
        ? "logged_out"
        : sawCaptureFailure
          ? "capture_unavailable"
          : "not_found";

      if (definition.openWhenMissing?.closeOnUnmatched) {
        await closeOpenedPageSessionTab(tabsApi, openedTabId);
      }

      return {
        status: finalStatus,
        attempts,
      };
    },
  };
}
