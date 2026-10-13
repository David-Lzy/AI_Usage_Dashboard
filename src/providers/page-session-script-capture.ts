import type { ProviderUsageInsights } from "./types";
import { buildUsageInsightsFromDom, readUsageInsightsDom, type UsageInsightsDomCapture } from "./usage-insights-dom";

export type PageSessionCapturedScriptMap = Record<string, string | null>;

export type PageSessionCapturedWindowMap = Record<string, string | null>;

export type PageSessionScriptingApi = {
  executeScript: (injection: {
    target: { tabId: number };
    world?: `${chrome.scripting.ExecutionWorld}`;
    func: (...args: unknown[]) => unknown;
    args?: unknown[];
  }) => Promise<Array<{ result?: unknown }>>;
  registerContentScripts?: (
    scripts: Array<{
      id: string;
      matches: string[];
      js: string[];
      runAt?: "document_start" | "document_end" | "document_idle";
      world?: `${chrome.scripting.ExecutionWorld}`;
      allFrames?: boolean;
      persistAcrossSessions?: boolean;
    }>,
  ) => Promise<void>;
  unregisterContentScripts?: (filter?: { ids?: string[] }) => Promise<void>;
};

export type PageSessionIsolatedPageSnapshot = {
  url: string;
  title: string;
  heading: string | null;
  html: string;
  scripts: PageSessionCapturedScriptMap;
  usageInsights?: ProviderUsageInsights;
};

export async function executeScriptResult<T>(
  scriptingApi: PageSessionScriptingApi,
  injection: {
    tabId: number;
    world?: `${chrome.scripting.ExecutionWorld}`;
    func: (...args: unknown[]) => T | Promise<T>;
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

export function uniqueStrings(values: string[] | undefined): string[] {
  return [...new Set((values ?? []).filter(Boolean))];
}

export async function readIsolatedPageSnapshot(
  tabId: number,
  scriptingApi: PageSessionScriptingApi,
  scriptSelectors: string[],
  usageProvider?: "codex" | "claude" | "cursor",
): Promise<PageSessionIsolatedPageSnapshot> {
  if (usageProvider) {
    const data = await executeScriptResult<UsageInsightsDomCapture>(scriptingApi, {
      tabId, func: readUsageInsightsDom, args: [usageProvider, "new_codex_only"],
    });
    if (usageProvider !== "codex" || /^https:\/\/chatgpt\.com\/settings\/usage\/?$/.test(data.sourceUrl ?? "")) {
      const escape = (value: string) => value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
      const quota = (data.rows ?? []).filter((row) => row.key.startsWith("quota.") && row.unit === "percent" && row.direction !== null && row.value !== null)
        .map((row) => {
          const quotaLabel = usageProvider === "claude" ? ({ "quota.five_hour": "5-hour usage limit", "quota.weekly": "Weekly limit", "quota.sonnet_weekly": "Sonnet weekly limit" } as Record<string, string>)[row.key] ?? row.label : row.label;
          return `<p>${escape(quotaLabel)}</p><p>${row.direction === "remaining" ? row.value : 100 - row.value!}% remaining</p>${row.resetText ? `<p>${escape(row.resetText)}</p>` : ""}`;
        }).join("");
      const flex = (data.rows ?? []).find((row) => row.key === "balance.flex" && row.unit === "count");
      const routine = (data.rows ?? []).find((row) => row.key === "quota.routine_runs" && row.unit === "count" && row.value !== null && row.total !== null && row.total > 0 && row.value <= row.total);
      const label = usageProvider === "codex" ? "Codex usage" : `${usageProvider} usage`;
      return { url: data.sourceUrl ?? "", title: label, heading: label, scripts: {},
        html: `<h1>${label}</h1>${data.planLabel ? `<p>${escape(data.planLabel)}</p>` : ""}${quota}${routine ? `<p>Daily included routine runs</p><p>${routine.value} of ${routine.total}</p>` : ""}${flex ? `<p>Credit balance</p><p>${flex.value}</p>` : ""}${data.loggedOut ? "<button>Log in</button>" : ""}${data.blocked ? "cf-turnstile" : ""}`,
        usageInsights: buildUsageInsightsFromDom(usageProvider, data, new Date().toISOString()) ?? undefined };
    }
  }
  const snapshot = await executeScriptResult<PageSessionIsolatedPageSnapshot>(
    scriptingApi,
    {
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
    },
  );

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

export async function readMainWorldWindowValues(
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
