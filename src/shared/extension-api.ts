export type ExtensionPermissionsRequest = {
  origins?: string[];
  permissions?: string[];
};

export type ExtensionPermissionsApi = {
  contains?: (
    permissions: ExtensionPermissionsRequest,
  ) => boolean | Promise<boolean>;
  request?: (
    permissions: ExtensionPermissionsRequest,
  ) => boolean | Promise<boolean>;
  remove?: (
    permissions: ExtensionPermissionsRequest,
  ) => boolean | Promise<boolean>;
};

export type ExtensionTabsApi = {
  query?: (queryInfo: chrome.tabs.QueryInfo) => Promise<chrome.tabs.Tab[]>;
  get?: (tabId: number) => Promise<chrome.tabs.Tab>;
  create?: (
    createProperties: chrome.tabs.CreateProperties,
  ) => Promise<chrome.tabs.Tab>;
  update?: (
    tabId: number,
    updateProperties: chrome.tabs.UpdateProperties,
  ) => Promise<chrome.tabs.Tab>;
  reload?: (
    tabId: number,
    reloadProperties?: chrome.tabs.ReloadProperties,
  ) => Promise<void>;
  remove?: (tabId: number) => Promise<void>;
  onUpdated?: {
    addListener?: typeof chrome.tabs.onUpdated.addListener;
    removeListener?: typeof chrome.tabs.onUpdated.removeListener;
  };
};

export type ExtensionScriptingApi = {
  executeScript?: typeof chrome.scripting.executeScript;
};

export type ExtensionRuntimeApi = {
  id?: string;
  getURL?: (path: string) => string;
};

export type ExtensionApiNamespace = {
  runtime?: ExtensionRuntimeApi;
  permissions?: ExtensionPermissionsApi;
  tabs?: ExtensionTabsApi;
  scripting?: ExtensionScriptingApi;
};

function getGlobalExtensionNamespace(
  name: "browser" | "chrome",
): ExtensionApiNamespace | null {
  const globalScope = globalThis as typeof globalThis & {
    browser?: ExtensionApiNamespace;
    chrome?: ExtensionApiNamespace;
  };

  return globalScope[name] ?? null;
}

export function getExtensionApiNamespace(): ExtensionApiNamespace | null {
  const browserApi = getGlobalExtensionNamespace("browser");

  return browserApi?.runtime?.id
    ? browserApi
    : getGlobalExtensionNamespace("chrome");
}

export function hasExtensionRuntime(
  api: ExtensionApiNamespace | null = getExtensionApiNamespace(),
): boolean {
  return Boolean(api?.runtime?.id);
}

export function getExtensionPermissionsApi(): ExtensionPermissionsApi | null {
  const api = getExtensionApiNamespace();

  return hasExtensionRuntime(api) ? api?.permissions ?? null : null;
}

export function getExtensionTabsApi(): ExtensionTabsApi | null {
  const api = getExtensionApiNamespace();

  return hasExtensionRuntime(api) ? api?.tabs ?? null : null;
}

export function getExtensionScriptingApi(): ExtensionScriptingApi | null {
  const api = getExtensionApiNamespace();

  return hasExtensionRuntime(api) ? api?.scripting ?? null : null;
}
