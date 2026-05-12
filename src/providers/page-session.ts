import type { ProviderId } from "./types";
import { sortTabsByPriority } from "./page-session-tab-priority";

export type PageSessionExtractionMode =
  | "dom"
  | "boot_data"
  | "network_observer";

export type PageSessionMatchStatus = "matched" | "logged_out" | "unmatched";

export type PageSessionBindingMode = "auto" | "bound";

export type PageSessionCapturedScriptMap = Record<string, string | null>;

export type PageSessionCapturedWindowMap = Record<string, string | null>;

export type PageSessionObservedNetworkEntry = {
  url: string;
  method: string;
  status: number | null;
  ok: boolean | null;
  contentType: string | null;
  bodyText: string | null;
  capturedAt: string;
  transport: "fetch" | "xhr";
};

export type PageSessionObservedNetworkState = {
  matchUrlSubstrings: string[];
  maxEntries: number;
  entries: PageSessionObservedNetworkEntry[];
};

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

export type PageSessionNetworkObserverExtraction = {
  mode: "network_observer";
  matchUrlSubstrings: string[];
  maxEntries?: number;
  maxBodyLength?: number;
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

type PageSessionScriptingApi = {
  executeScript: (injection: {
    target: { tabId: number };
    world?: `${chrome.scripting.ExecutionWorld}`;
    func: (...args: unknown[]) => unknown;
    args?: unknown[];
  }) => Promise<Array<{ result?: unknown }>>;
};

export type PageSessionClientOptions = {
  tabsApi?: PageSessionTabsApi;
  scriptingApi?: PageSessionScriptingApi;
};

type IsolatedPageSnapshot = {
  url: string;
  title: string;
  heading: string | null;
  html: string;
  scripts: PageSessionCapturedScriptMap;
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

async function executeScriptResult<T>(
  scriptingApi: PageSessionScriptingApi,
  injection: {
    tabId: number;
    world?: `${chrome.scripting.ExecutionWorld}`;
    func: (...args: unknown[]) => T;
    args?: unknown[];
  },
): Promise<T> {
  const [result] = await scriptingApi.executeScript({
    target: { tabId: injection.tabId },
    world: injection.world,
    func: injection.func,
    args: injection.args,
  });

  if (typeof result?.result === "undefined") {
    throw new Error("Page-session script did not return a result.");
  }

  return result.result as T;
}

function uniqueStrings(values: string[] | undefined): string[] {
  return [...new Set((values ?? []).filter(Boolean))];
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function truncateSerializedValue(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength)}…` : value;
}

async function readIsolatedPageSnapshot(
  tabId: number,
  scriptingApi: PageSessionScriptingApi,
  scriptSelectors: string[],
): Promise<IsolatedPageSnapshot> {
  const snapshot = await executeScriptResult<IsolatedPageSnapshot>(scriptingApi, {
    tabId,
    func: (rawSelectors: unknown) => {
      const selectors = Array.isArray(rawSelectors)
        ? rawSelectors.filter((value): value is string => typeof value === "string")
        : [];
      const scripts = Object.fromEntries(
        selectors.map((selector) => [
          selector,
          globalThis.document.querySelector(selector)?.textContent ?? null,
        ]),
      );

      return {
        url: globalThis.location.href,
        title: globalThis.document.title,
        heading:
          globalThis.document.querySelector("h1")?.textContent?.trim() ?? null,
        html: globalThis.document.documentElement.outerHTML,
        scripts,
      };
    },
    args: [scriptSelectors],
  });

  if (
    typeof snapshot?.url !== "string" ||
    typeof snapshot.title !== "string" ||
    typeof snapshot.html !== "string"
  ) {
    throw new Error("Page-session isolated capture returned an invalid page snapshot.");
  }

  return {
    ...snapshot,
    scripts:
      typeof snapshot.scripts === "object" && snapshot.scripts !== null
        ? (snapshot.scripts as PageSessionCapturedScriptMap)
        : {},
  };
}

async function readMainWorldWindowValues(
  tabId: number,
  scriptingApi: PageSessionScriptingApi,
  windowKeys: string[],
  maxSerializedLength: number,
): Promise<PageSessionCapturedWindowMap> {
  if (windowKeys.length === 0) {
    return {};
  }

  return executeScriptResult<PageSessionCapturedWindowMap>(scriptingApi, {
    tabId,
    world: "MAIN",
    func: (rawWindowKeys: unknown, rawMaxSerializedLength: unknown) => {
      const keys = Array.isArray(rawWindowKeys)
        ? rawWindowKeys.filter((value): value is string => typeof value === "string")
        : [];
      const maxLength =
        typeof rawMaxSerializedLength === "number" && rawMaxSerializedLength > 0
          ? rawMaxSerializedLength
          : 20_000;

      function serialize(value: unknown): string | null {
        if (typeof value === "undefined") {
          return null;
        }

        try {
          const serialized =
            typeof value === "string" ? value : JSON.stringify(value);
          return serialized.length > maxLength
            ? `${serialized.slice(0, maxLength)}…`
            : serialized;
        } catch {
          return null;
        }
      }

      return Object.fromEntries(
        keys.map((key) => [key, serialize((globalThis as Record<string, unknown>)[key])]),
      );
    },
    args: [windowKeys, maxSerializedLength],
  });
}

async function installNetworkObserverBridge(
  tabId: number,
  scriptingApi: PageSessionScriptingApi,
  extraction: PageSessionNetworkObserverExtraction,
): Promise<void> {
  await executeScriptResult(scriptingApi, {
    tabId,
    world: "MAIN",
    func: (
      rawBridgeScriptId: unknown,
      rawMatchUrlSubstrings: unknown,
      rawMaxEntries: unknown,
      rawMaxBodyLength: unknown,
    ) => {
      const bridgeScriptId =
        typeof rawBridgeScriptId === "string"
          ? rawBridgeScriptId
          : "__ai_usage_dashboard_page_session_bridge__";
      const matchUrlSubstrings = Array.isArray(rawMatchUrlSubstrings)
        ? rawMatchUrlSubstrings.filter(
            (value): value is string => typeof value === "string" && value.length > 0,
          )
        : [];
      const maxEntries =
        typeof rawMaxEntries === "number" && rawMaxEntries > 0
          ? rawMaxEntries
          : 20;
      const maxBodyLength =
        typeof rawMaxBodyLength === "number" && rawMaxBodyLength > 0
          ? rawMaxBodyLength
          : 20_000;
      const globalStoreKey = "__AI_USAGE_DASHBOARD_PAGE_SESSION__";
      const bridgeEventName = "ai-usage-dashboard:page-session-updated";
      const root = globalThis as typeof globalThis & {
        [globalStoreKey]?: {
          installed: boolean;
          matchUrlSubstrings: string[];
          maxEntries: number;
          maxBodyLength: number;
          entries: PageSessionObservedNetworkEntry[];
          originalFetch?: typeof fetch;
          xhrPatched?: boolean;
        };
      };

      if (!root[globalStoreKey]) {
        root[globalStoreKey] = {
          installed: false,
          matchUrlSubstrings: [],
          maxEntries,
          maxBodyLength,
          entries: [],
        };
      }

      const store = root[globalStoreKey]!;
      store.matchUrlSubstrings = Array.from(
        new Set([...store.matchUrlSubstrings, ...matchUrlSubstrings]),
      );
      store.maxEntries = Math.max(store.maxEntries, maxEntries);
      store.maxBodyLength = Math.max(store.maxBodyLength, maxBodyLength);

      function shouldCapture(url: string): boolean {
        return store.matchUrlSubstrings.some((substring) => url.includes(substring));
      }

      function reflectStore() {
        const script =
          globalThis.document.getElementById(bridgeScriptId) ??
          (() => {
            const nextScript = globalThis.document.createElement("script");
            nextScript.id = bridgeScriptId;
            nextScript.type = "application/json";
            globalThis.document.documentElement.appendChild(nextScript);
            return nextScript;
          })();

        const snapshot = {
          matchUrlSubstrings: store.matchUrlSubstrings,
          maxEntries: store.maxEntries,
          entries: store.entries,
        };

        script.textContent = JSON.stringify(snapshot);
        globalThis.dispatchEvent(
          new CustomEvent(bridgeEventName, {
            detail: {
              entryCount: store.entries.length,
            },
          }),
        );
      }

      function pushEntry(entry: PageSessionObservedNetworkEntry) {
        store.entries = [entry, ...store.entries].slice(0, store.maxEntries);
        reflectStore();
      }

      async function captureFetchResponse(
        response: Response,
      ): Promise<PageSessionObservedNetworkEntry> {
        const contentType = response.headers.get("content-type");
        let bodyText: string | null = null;

        try {
          bodyText = await response.clone().text();
          bodyText =
            bodyText.length > store.maxBodyLength
              ? `${bodyText.slice(0, store.maxBodyLength)}…`
              : bodyText;
        } catch {
          bodyText = null;
        }

        return {
          url: response.url,
          method: "GET",
          status: response.status,
          ok: response.ok,
          contentType,
          bodyText,
          capturedAt: new Date().toISOString(),
          transport: "fetch",
        };
      }

      if (!store.installed) {
        store.originalFetch = globalThis.fetch.bind(globalThis);
        globalThis.fetch = async (...args) => {
          const response = await store.originalFetch!(...args);
          const requestUrl =
            typeof args[0] === "string"
              ? args[0]
              : args[0] instanceof Request
                ? args[0].url
                : String(args[0]);

          if (shouldCapture(requestUrl)) {
            try {
              const entry = await captureFetchResponse(response);
              entry.method =
                args[1]?.method ??
                (args[0] instanceof Request ? args[0].method : "GET");
              pushEntry(entry);
            } catch {
              // Ignore observer failures; page fetches should not break.
            }
          }

          return response;
        };

        const originalOpen = XMLHttpRequest.prototype.open;
        const originalSend = XMLHttpRequest.prototype.send;

        XMLHttpRequest.prototype.open = function patchedOpen(
          method: string,
          url: string | URL,
          ...rest: unknown[]
        ) {
          const urlString = String(url);
          const asyncValue =
            typeof rest[0] === "boolean" ? rest[0] : true;
          const username =
            typeof rest[1] === "string" || rest[1] === null
              ? rest[1]
              : undefined;
          const password =
            typeof rest[2] === "string" || rest[2] === null
              ? rest[2]
              : undefined;

          Object.defineProperty(this, "__aiUsageDashboardRequestMeta__", {
            value: {
              method,
              url: urlString,
            },
            configurable: true,
            enumerable: false,
            writable: true,
          });

          return originalOpen.call(
            this,
            method,
            urlString,
            asyncValue,
            username,
            password,
          );
        };

        XMLHttpRequest.prototype.send = function patchedSend(...rest: unknown[]) {
          this.addEventListener(
            "loadend",
            () => {
              const meta = (this as XMLHttpRequest & {
                __aiUsageDashboardRequestMeta__?: { method: string; url: string };
              }).__aiUsageDashboardRequestMeta__;

              if (!meta || !shouldCapture(meta.url)) {
                return;
              }

              let bodyText: string | null = null;

              try {
                bodyText =
                  typeof this.responseText === "string"
                    ? this.responseText.slice(0, store.maxBodyLength)
                    : null;
              } catch {
                bodyText = null;
              }

              pushEntry({
                url: meta.url,
                method: meta.method,
                status: this.status || null,
                ok: this.status >= 200 && this.status < 400,
                contentType: this.getResponseHeader("content-type"),
                bodyText,
                capturedAt: new Date().toISOString(),
                transport: "xhr",
              });
            },
            { once: true },
          );

          if (rest.length === 0) {
            return originalSend.call(this);
          }

          return originalSend.call(
            this,
            rest[0] as Document | XMLHttpRequestBodyInit | null | undefined,
          );
        };

        store.installed = true;
        store.xhrPatched = true;
      }

      reflectStore();

      return {
        installed: store.installed,
        entryCount: store.entries.length,
      };
    },
    args: [
      NETWORK_BRIDGE_SCRIPT_ID,
      extraction.matchUrlSubstrings,
      extraction.maxEntries ?? 20,
      extraction.maxBodyLength ?? 20_000,
    ],
  });
}

async function readNetworkObserverBridge(
  tabId: number,
  scriptingApi: PageSessionScriptingApi,
): Promise<PageSessionObservedNetworkState> {
  const rawValue = await executeScriptResult<string | null>(scriptingApi, {
    tabId,
    func: (rawBridgeScriptId: unknown) => {
      const bridgeScriptId =
        typeof rawBridgeScriptId === "string"
          ? rawBridgeScriptId
          : "__ai_usage_dashboard_page_session_bridge__";

      return (
        globalThis.document.getElementById(bridgeScriptId)?.textContent ?? null
      );
    },
    args: [NETWORK_BRIDGE_SCRIPT_ID],
  });

  if (!rawValue) {
    return {
      matchUrlSubstrings: [],
      maxEntries: 0,
      entries: [],
    };
  }

  try {
    const parsed = JSON.parse(rawValue) as PageSessionObservedNetworkState;

    return {
      matchUrlSubstrings: Array.isArray(parsed.matchUrlSubstrings)
        ? parsed.matchUrlSubstrings
        : [],
      maxEntries:
        typeof parsed.maxEntries === "number" && parsed.maxEntries >= 0
          ? parsed.maxEntries
          : 0,
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
    };
  } catch {
    return {
      matchUrlSubstrings: [],
      maxEntries: 0,
      entries: [],
    };
  }
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

async function waitForOpenedTabLoad(
  tabsApi: PageSessionTabsApi,
  tabId: number,
  openWhenMissing: PageSessionOpenWhenMissing,
): Promise<PageSessionTabQueryResult | null> {
  if (typeof tabsApi.get !== "function") {
    return null;
  }

  const timeoutMs = Math.max(0, openWhenMissing.waitForLoadTimeoutMs ?? 10_000);
  const pollIntervalMs = Math.max(
    50,
    openWhenMissing.loadPollIntervalMs ?? 250,
  );
  const deadline = Date.now() + timeoutMs;
  let lastTab: PageSessionTabQueryResult | null = null;
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

function normalizeReloadOptions(
  reloadOptions:
    | PageSessionDefinition["reloadBeforeCapture"]
    | PageSessionDefinition["reloadOnCaptureFailure"]
    | undefined,
): PageSessionReloadOptions | null {
  if (!reloadOptions) {
    return null;
  }

  if (reloadOptions === true) {
    return {};
  }

  return reloadOptions;
}

async function waitForReloadedTabLoad(
  tabsApi: PageSessionTabsApi,
  tabId: number,
  reloadOptions: PageSessionReloadOnCaptureFailure,
): Promise<PageSessionTabQueryResult | null> {
  if (typeof tabsApi.get !== "function") {
    return null;
  }

  const timeoutMs = Math.max(0, reloadOptions.waitForLoadTimeoutMs ?? 10_000);
  const pollIntervalMs = Math.max(
    50,
    reloadOptions.loadPollIntervalMs ?? 250,
  );
  const deadline = Date.now() + timeoutMs;
  let lastTab: PageSessionTabQueryResult | null = null;

  const finish = async (tab: PageSessionTabQueryResult | null) => {
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

async function reloadPageSessionTab(
  tabsApi: PageSessionTabsApi,
  tabId: number,
  reloadOptions: PageSessionReloadOptions,
): Promise<PageSessionTabQueryResult | null> {
  if (typeof tabsApi.reload !== "function") {
    return null;
  }

  await tabsApi.reload(tabId, {
    bypassCache: reloadOptions.bypassCache ?? true,
  });

  return waitForReloadedTabLoad(tabsApi, tabId, reloadOptions);
}

async function openMissingPageSessionTab(
  tabsApi: PageSessionTabsApi,
  openWhenMissing: PageSessionOpenWhenMissing,
): Promise<
  | (PageSessionTabQueryResult & {
      id: number;
      bindingMode: PageSessionBindingMode;
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

async function closeOpenedPageSessionTab(
  tabsApi: PageSessionTabsApi,
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
