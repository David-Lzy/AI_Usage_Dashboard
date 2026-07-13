(() => {
  "use strict";

  const configKey = "__ai_usage_dashboard_page_session_network_config__";
  const storeKey = "__AI_USAGE_DASHBOARD_PAGE_SESSION__";
  const bridgeScriptId = "__ai_usage_dashboard_page_session_bridge__";
  let rawConfig = null;

  try {
    rawConfig = globalThis.sessionStorage.getItem(configKey);
    globalThis.sessionStorage.removeItem(configKey);
  } catch {
    return;
  }

  if (!rawConfig) {
    return;
  }

  let parsedConfig;
  try {
    parsedConfig = JSON.parse(rawConfig);
  } catch {
    return;
  }

  const matchUrlSubstrings = Array.isArray(parsedConfig.matchUrlSubstrings)
    ? parsedConfig.matchUrlSubstrings.filter(
        (value) => typeof value === "string" && value.length > 0,
      )
    : [];
  const maxEntries =
    Number.isFinite(parsedConfig.maxEntries) && parsedConfig.maxEntries > 0
      ? Math.min(10, Math.floor(parsedConfig.maxEntries))
      : 4;
  const maxBodyLength =
    Number.isFinite(parsedConfig.maxBodyLength) && parsedConfig.maxBodyLength > 0
      ? Math.min(250000, Math.floor(parsedConfig.maxBodyLength))
      : 20000;

  if (matchUrlSubstrings.length === 0) {
    return;
  }

  const store = {
    installed: true,
    matchUrlSubstrings,
    maxEntries,
    maxBodyLength,
    entries: [],
    originalFetch: globalThis.fetch.bind(globalThis),
    patchedFetch: null,
    originalXhrOpen: XMLHttpRequest.prototype.open,
    originalXhrSend: XMLHttpRequest.prototype.send,
  };
  globalThis[storeKey] = store;

  function shouldCapture(url) {
    return store.matchUrlSubstrings.some((substring) => url.includes(substring));
  }

  function reflectStore() {
    const root = globalThis.document.documentElement;
    if (!root) {
      return;
    }

    let script = globalThis.document.getElementById(bridgeScriptId);
    if (!script) {
      script = globalThis.document.createElement("script");
      script.id = bridgeScriptId;
      script.type = "application/json";
      root.appendChild(script);
    }

    script.textContent = JSON.stringify({
      matchUrlSubstrings: store.matchUrlSubstrings,
      maxEntries: store.maxEntries,
      entries: store.entries,
    });
  }

  function pushEntry(entry) {
    store.entries = [entry, ...store.entries].slice(0, store.maxEntries);
    reflectStore();
  }

  async function captureResponse(response, requestUrl, method, transport) {
    const contentType = response.headers.get("content-type");
    if (contentType && !contentType.toLowerCase().includes("json")) {
      return;
    }

    let bodyText = null;
    try {
      const text = await response.clone().text();
      bodyText = text.slice(0, store.maxBodyLength);
    } catch {
      bodyText = null;
    }

    pushEntry({
      url: response.url || requestUrl,
      method,
      status: response.status,
      ok: response.ok,
      contentType,
      bodyText,
      capturedAt: new Date().toISOString(),
      transport,
    });
  }

  store.patchedFetch = async (...args) => {
    const response = await store.originalFetch(...args);
    const requestUrl =
      typeof args[0] === "string"
        ? args[0]
        : args[0] instanceof Request
          ? args[0].url
          : String(args[0]);

    if (shouldCapture(requestUrl)) {
      void captureResponse(
        response,
        requestUrl,
        args[1]?.method ?? (args[0] instanceof Request ? args[0].method : "GET"),
        "fetch",
      );
    }

    return response;
  };
  globalThis.fetch = store.patchedFetch;

  XMLHttpRequest.prototype.open = function patchedOpen(method, url, ...rest) {
    this.__aiUsageDashboardRequestMeta__ = { method, url: String(url) };
    return store.originalXhrOpen.call(this, method, url, ...rest);
  };

  XMLHttpRequest.prototype.send = function patchedSend(...args) {
    this.addEventListener(
      "loadend",
      () => {
        const meta = this.__aiUsageDashboardRequestMeta__;
        if (!meta || !shouldCapture(meta.url)) {
          return;
        }

        const contentType = this.getResponseHeader("content-type");
        if (contentType && !contentType.toLowerCase().includes("json")) {
          return;
        }

        let bodyText = null;
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
          contentType,
          bodyText,
          capturedAt: new Date().toISOString(),
          transport: "xhr",
        });
      },
      { once: true },
    );

    return store.originalXhrSend.apply(this, args);
  };

  if (globalThis.document.documentElement) {
    reflectStore();
  } else {
    globalThis.document.addEventListener("DOMContentLoaded", reflectStore, {
      once: true,
    });
  }
})();
