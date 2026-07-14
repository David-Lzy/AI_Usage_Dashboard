import {
  executeScriptResult,
  type PageSessionScriptingApi,
} from "./page-session-script-capture";

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

export type PageSessionNetworkObserverExtraction = {
  mode: "network_observer";
  matchUrlSubstrings: string[];
  maxEntries?: number;
  maxBodyLength?: number;
  observeReload?: boolean;
  requiredMatchUrlSubstrings?: string[];
  waitForRequiredEntriesTimeoutMs?: number;
};

const NETWORK_BRIDGE_SCRIPT_ID = "__ai_usage_dashboard_page_session_bridge__";
const NETWORK_CONFIG_SESSION_KEY =
  "__ai_usage_dashboard_page_session_network_config__";
const NETWORK_BRIDGE_EVENT_NAME =
  "ai-usage-dashboard:page-session-updated";
const NETWORK_DOCUMENT_START_SCRIPT =
  "page-session-network-observer-document-start.js";

export type PreparedPageSessionNetworkObserver = {
  registrationId: string;
};

function buildEmptyNetworkObserverState(): PageSessionObservedNetworkState {
  return {
    matchUrlSubstrings: [],
    maxEntries: 0,
    entries: [],
  };
}

export async function installNetworkObserverBridge(
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
          patchedFetch?: typeof fetch;
          originalXhrOpen?: typeof XMLHttpRequest.prototype.open;
          originalXhrSend?: typeof XMLHttpRequest.prototype.send;
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
        store.patchedFetch = async (...args) => {
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
        globalThis.fetch = store.patchedFetch;

        const originalOpen = XMLHttpRequest.prototype.open;
        const originalSend = XMLHttpRequest.prototype.send;
        store.originalXhrOpen = originalOpen;
        store.originalXhrSend = originalSend;

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

export async function prepareNetworkObserverForReload(
  tabId: number,
  scriptingApi: PageSessionScriptingApi,
  extraction: PageSessionNetworkObserverExtraction,
  matches: string[],
): Promise<PreparedPageSessionNetworkObserver | null> {
  if (
    !extraction.observeReload ||
    typeof scriptingApi.registerContentScripts !== "function" ||
    typeof scriptingApi.unregisterContentScripts !== "function"
  ) {
    return null;
  }

  const registrationId = `ai-usage-dashboard-network-${tabId}`;
  const config = {
    matchUrlSubstrings: extraction.matchUrlSubstrings,
    maxEntries: extraction.maxEntries ?? 20,
    maxBodyLength: extraction.maxBodyLength ?? 20_000,
  };

  await executeScriptResult(scriptingApi, {
    tabId,
    world: "MAIN",
    func: (rawKey: unknown, rawConfig: unknown) => {
      const key = typeof rawKey === "string" ? rawKey : "";
      if (!key) {
        return false;
      }

      try {
        globalThis.sessionStorage.setItem(key, JSON.stringify(rawConfig));
        return true;
      } catch {
        return false;
      }
    },
    args: [NETWORK_CONFIG_SESSION_KEY, config],
  });

  await scriptingApi.unregisterContentScripts({ ids: [registrationId] }).catch(
    () => undefined,
  );

  try {
    await scriptingApi.registerContentScripts([
      {
        id: registrationId,
        matches,
        js: [NETWORK_DOCUMENT_START_SCRIPT],
        runAt: "document_start",
        world: "MAIN",
        allFrames: false,
        persistAcrossSessions: false,
      },
    ]);
  } catch {
    await executeScriptResult(scriptingApi, {
      tabId,
      world: "MAIN",
      func: (rawKey: unknown) => {
        if (typeof rawKey === "string") {
          try {
            globalThis.sessionStorage.removeItem(rawKey);
          } catch {
            // Ignore unavailable session storage during cleanup.
          }
        }
        return true;
      },
      args: [NETWORK_CONFIG_SESSION_KEY],
    }).catch(() => undefined);
    return null;
  }

  return { registrationId };
}

export async function cleanupPreparedNetworkObserver(
  tabId: number,
  scriptingApi: PageSessionScriptingApi,
  prepared: PreparedPageSessionNetworkObserver | null,
): Promise<void> {
  await executeScriptResult(scriptingApi, {
    tabId,
    world: "MAIN",
    func: (rawStoreKey: unknown, rawBridgeScriptId: unknown, rawConfigKey: unknown) => {
      const storeKey = typeof rawStoreKey === "string" ? rawStoreKey : "";
      const bridgeScriptId =
        typeof rawBridgeScriptId === "string" ? rawBridgeScriptId : "";
      const configKey = typeof rawConfigKey === "string" ? rawConfigKey : "";
      const root = globalThis as typeof globalThis & Record<string, unknown>;
      const store = root[storeKey] as
        | {
            originalFetch?: typeof fetch;
            patchedFetch?: typeof fetch;
            originalXhrOpen?: typeof XMLHttpRequest.prototype.open;
            originalXhrSend?: typeof XMLHttpRequest.prototype.send;
          }
        | undefined;

      if (store?.originalFetch && globalThis.fetch === store.patchedFetch) {
        globalThis.fetch = store.originalFetch;
      }
      if (store?.originalXhrOpen) {
        XMLHttpRequest.prototype.open = store.originalXhrOpen;
      }
      if (store?.originalXhrSend) {
        XMLHttpRequest.prototype.send = store.originalXhrSend;
      }

      if (storeKey) {
        delete root[storeKey];
      }
      if (bridgeScriptId) {
        globalThis.document.getElementById(bridgeScriptId)?.remove();
      }
      if (configKey) {
        try {
          globalThis.sessionStorage.removeItem(configKey);
        } catch {
          // Ignore unavailable session storage during cleanup.
        }
      }

      return true;
    },
    args: [
      "__AI_USAGE_DASHBOARD_PAGE_SESSION__",
      NETWORK_BRIDGE_SCRIPT_ID,
      NETWORK_CONFIG_SESSION_KEY,
    ],
  }).catch(() => undefined);

  if (prepared && typeof scriptingApi.unregisterContentScripts === "function") {
    await scriptingApi
      .unregisterContentScripts({ ids: [prepared.registrationId] })
      .catch(() => undefined);
  }
}

export async function waitForRequiredNetworkObserverEntries(
  tabId: number,
  scriptingApi: PageSessionScriptingApi,
  extraction: PageSessionNetworkObserverExtraction,
): Promise<boolean> {
  const requiredMatchUrlSubstrings = [
    ...new Set(
      (extraction.requiredMatchUrlSubstrings ?? []).filter(Boolean),
    ),
  ];
  const timeoutMs = Math.min(
    30_000,
    Math.max(0, extraction.waitForRequiredEntriesTimeoutMs ?? 0),
  );

  if (requiredMatchUrlSubstrings.length === 0 || timeoutMs === 0) {
    return true;
  }

  try {
    return await executeScriptResult<boolean>(scriptingApi, {
      tabId,
      world: "MAIN",
      func: (
        rawStoreKey: unknown,
        rawEventName: unknown,
        rawRequiredMatches: unknown,
        rawTimeoutMs: unknown,
      ) => {
        const storeKey = typeof rawStoreKey === "string" ? rawStoreKey : "";
        const eventName = typeof rawEventName === "string" ? rawEventName : "";
        const requiredMatches = Array.isArray(rawRequiredMatches)
          ? rawRequiredMatches.filter(
              (value): value is string =>
                typeof value === "string" && value.length > 0,
            )
          : [];
        const boundedTimeoutMs =
          typeof rawTimeoutMs === "number" && rawTimeoutMs > 0
            ? Math.min(30_000, rawTimeoutMs)
            : 0;
        const root = globalThis as typeof globalThis & Record<string, unknown>;

        function hasRequiredEntries(): boolean {
          const store = root[storeKey] as
            | { entries?: Array<Record<string, unknown>> }
            | undefined;
          const entries = Array.isArray(store?.entries) ? store.entries : [];

          return requiredMatches.every((requiredMatch) =>
            entries.some(
              (entry) =>
                typeof entry.url === "string" &&
                entry.url.includes(requiredMatch) &&
                entry.ok === true &&
                typeof entry.bodyText === "string" &&
                entry.bodyText.trim().length > 0,
            ),
          );
        }

        if (requiredMatches.length === 0 || hasRequiredEntries()) {
          return Promise.resolve(true);
        }

        if (!storeKey || !eventName || boundedTimeoutMs === 0) {
          return Promise.resolve(false);
        }

        return new Promise<boolean>((resolve) => {
          let settled = false;

          const finish = (matched: boolean) => {
            if (settled) {
              return;
            }
            settled = true;
            globalThis.removeEventListener(eventName, handleUpdate);
            globalThis.clearTimeout(timeoutId);
            resolve(matched);
          };
          const handleUpdate = () => {
            if (hasRequiredEntries()) {
              finish(true);
            }
          };
          const timeoutId = globalThis.setTimeout(
            () => finish(hasRequiredEntries()),
            boundedTimeoutMs,
          );

          globalThis.addEventListener(eventName, handleUpdate);
          handleUpdate();
        });
      },
      args: [
        "__AI_USAGE_DASHBOARD_PAGE_SESSION__",
        NETWORK_BRIDGE_EVENT_NAME,
        requiredMatchUrlSubstrings,
        timeoutMs,
      ],
    });
  } catch {
    return false;
  }
}

export async function readNetworkObserverBridge(
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
    return buildEmptyNetworkObserverState();
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
    return buildEmptyNetworkObserverState();
  }
}
