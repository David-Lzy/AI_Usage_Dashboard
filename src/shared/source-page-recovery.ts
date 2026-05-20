import { getExtensionTabsApi } from "./extension-api";

export type SourcePageRecoveryTarget = "existing-tab" | "created-tab";

export type SourcePageRecoverySourceState =
  | "capture_unavailable"
  | "credential_missing"
  | "host_access_missing"
  | "logged_out"
  | "open_page_required"
  | "policy_only"
  | "ready"
  | "sync_error";

export function shouldRefreshAfterSourcePageRecovery(
  target: SourcePageRecoveryTarget,
): boolean {
  return target === "existing-tab";
}

export function shouldReloadBeforeSourcePageRecoveryRefresh(
  target: SourcePageRecoveryTarget,
  sourceStateKind: SourcePageRecoverySourceState | null | undefined,
): boolean {
  return target === "existing-tab" && sourceStateKind === "capture_unavailable";
}

export async function reloadSourcePageTabBeforeRefresh(
  tabId: number,
  timeoutMs = 8_000,
): Promise<boolean> {
  const tabsApi = getExtensionTabsApi();

  if (typeof tabsApi?.reload !== "function") {
    return false;
  }

  if (
    typeof tabsApi.onUpdated?.addListener !== "function" ||
    typeof tabsApi.onUpdated?.removeListener !== "function"
  ) {
    await tabsApi.reload(tabId);
    return false;
  }

  let timeout: ReturnType<typeof setTimeout> | null = null;
  let handleUpdated:
    | ((updatedTabId: number, changeInfo: { status?: string }) => void)
    | null = null;

  const cleanup = () => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }

    if (handleUpdated !== null) {
      tabsApi.onUpdated?.removeListener?.(handleUpdated);
      handleUpdated = null;
    }
  };

  const waitForReload = new Promise<boolean>((resolve) => {
    let settled = false;

    const finish = (completed: boolean) => {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      resolve(completed);
    };

    handleUpdated = (
      updatedTabId: number,
      changeInfo: { status?: string },
    ) => {
      if (updatedTabId === tabId && changeInfo.status === "complete") {
        finish(true);
      }
    };

    timeout = setTimeout(() => finish(false), timeoutMs);

    tabsApi.onUpdated?.addListener?.(handleUpdated);
  });

  try {
    await tabsApi.reload(tabId);
  } catch (error) {
    cleanup();
    throw error;
  }

  return waitForReload;
}
