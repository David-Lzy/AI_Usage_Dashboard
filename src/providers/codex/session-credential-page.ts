import {
  buildCodexSessionCredential,
  type CodexSessionCredential,
} from "./session-credential";
import {
  executeScriptResult,
  type PageSessionScriptingApi,
} from "../page-session-script-capture";

type TabsApi = {
  query: (queryInfo: { url?: string | string[] }) => Promise<chrome.tabs.Tab[]>;
};

export type CodexPageCredentialAcquisitionOptions = {
  scriptingApi?: PageSessionScriptingApi;
  tabsApi?: TabsApi;
};

type RawPageCredential = {
  accessToken: string | null;
  accountId: string | null;
  source: "web_session" | "observed_request";
};

function getTabsApi(): TabsApi | null {
  return typeof chrome !== "undefined" && typeof chrome.tabs?.query === "function"
    ? chrome.tabs
    : null;
}

function getScriptingApi(): PageSessionScriptingApi | null {
  return typeof chrome !== "undefined" &&
    typeof chrome.scripting?.executeScript === "function"
    ? chrome.scripting
    : null;
}

function sortCandidateTabs(tabs: chrome.tabs.Tab[]): chrome.tabs.Tab[] {
  return [...tabs]
    .filter((tab) => typeof tab.id === "number")
    .sort((left, right) => {
      if (left.active !== right.active) {
        return left.active ? -1 : 1;
      }
      return (right.lastAccessed ?? 0) - (left.lastAccessed ?? 0);
    });
}

async function acquireFromTab(
  tabId: number,
  scriptingApi: PageSessionScriptingApi,
): Promise<CodexSessionCredential | null> {
  const raw = await executeScriptResult<RawPageCredential | null>(scriptingApi, {
    tabId,
    world: "MAIN",
    func: async () => {
      if (globalThis.location.hostname !== "chatgpt.com") {
        return null;
      }

      const root = globalThis as typeof globalThis & {
        __AI_USAGE_DASHBOARD_CODEX_CREDENTIAL__?: {
          accessToken?: unknown;
          accountId?: unknown;
        };
      };
      const observed = root.__AI_USAGE_DASHBOARD_CODEX_CREDENTIAL__;

      if (typeof observed?.accessToken === "string") {
        return {
          accessToken: observed.accessToken,
          accountId:
            typeof observed.accountId === "string" ? observed.accountId : null,
          source: "observed_request" as const,
        };
      }

      try {
        const response = await globalThis.fetch("/api/auth/session", {
          cache: "no-store",
          credentials: "include",
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          return null;
        }

        const body = (await response.json()) as Record<string, unknown>;
        const accessToken =
          typeof body.accessToken === "string"
            ? body.accessToken
            : typeof body.access_token === "string"
              ? body.access_token
              : null;
        const account =
          typeof body.account === "object" && body.account !== null
            ? (body.account as Record<string, unknown>)
            : null;
        const user =
          typeof body.user === "object" && body.user !== null
            ? (body.user as Record<string, unknown>)
            : null;
        const accountId =
          typeof account?.id === "string"
            ? account.id
            : typeof body.accountId === "string"
              ? body.accountId
              : typeof user?.id === "string"
                ? user.id
                : null;

        return accessToken
          ? {
              accessToken,
              accountId,
              source: "web_session" as const,
            }
          : null;
      } catch {
        return null;
      }
    },
  });

  return raw?.accessToken
    ? buildCodexSessionCredential({
        accessToken: raw.accessToken,
        accountId: raw.accountId,
        source: raw.source,
      })
    : null;
}

export async function acquireCodexCredentialFromOpenTabs(
  options: CodexPageCredentialAcquisitionOptions = {},
): Promise<CodexSessionCredential | null> {
  const tabsApi = options.tabsApi ?? getTabsApi();
  const scriptingApi = options.scriptingApi ?? getScriptingApi();

  if (!tabsApi || !scriptingApi) {
    return null;
  }

  let tabs: chrome.tabs.Tab[];

  try {
    tabs = await tabsApi.query({ url: "https://chatgpt.com/*" });
  } catch {
    return null;
  }

  for (const tab of sortCandidateTabs(tabs)) {
    try {
      const credential = await acquireFromTab(tab.id!, scriptingApi);

      if (credential) {
        return credential;
      }
    } catch {
      // Try the next existing ChatGPT tab without opening or activating one.
    }
  }

  return null;
}
