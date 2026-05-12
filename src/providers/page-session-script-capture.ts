export type PageSessionCapturedScriptMap = Record<string, string | null>;

export type PageSessionCapturedWindowMap = Record<string, string | null>;

export type PageSessionScriptingApi = {
  executeScript: (injection: {
    target: { tabId: number };
    world?: `${chrome.scripting.ExecutionWorld}`;
    func: (...args: unknown[]) => unknown;
    args?: unknown[];
  }) => Promise<Array<{ result?: unknown }>>;
};

export type PageSessionIsolatedPageSnapshot = {
  url: string;
  title: string;
  heading: string | null;
  html: string;
  scripts: PageSessionCapturedScriptMap;
};

export async function executeScriptResult<T>(
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

export function uniqueStrings(values: string[] | undefined): string[] {
  return [...new Set((values ?? []).filter(Boolean))];
}

export async function readIsolatedPageSnapshot(
  tabId: number,
  scriptingApi: PageSessionScriptingApi,
  scriptSelectors: string[],
): Promise<PageSessionIsolatedPageSnapshot> {
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
