import type { AppState } from "../providers/types";
import { APP_STATE_STORAGE_KEY } from "./constants";

type AppStateStorageChange = {
  newValue?: unknown;
};

function isStoredAppState(value: unknown): value is AppState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<AppState>;

  return (
    Array.isArray(candidate.providers) &&
    Array.isArray(candidate.providerSettings) &&
    Boolean(candidate.settings && typeof candidate.settings === "object")
  );
}

export function readAppStateFromChromeStorageChanges(
  changes: Record<string, AppStateStorageChange>,
  areaName: string,
): AppState | null {
  if (areaName !== "local") {
    return null;
  }

  const value = changes[APP_STATE_STORAGE_KEY]?.newValue;
  return isStoredAppState(value) ? value : null;
}

export function readAppStateFromWindowStorageEvent(
  event: Pick<StorageEvent, "key" | "newValue">,
): AppState | null {
  if (event.key !== APP_STATE_STORAGE_KEY || !event.newValue) {
    return null;
  }

  try {
    const value = JSON.parse(event.newValue) as unknown;
    return isStoredAppState(value) ? value : null;
  } catch {
    return null;
  }
}

export function subscribeToAppStateStorageChanges(
  onChange: (appState: AppState) => void,
): () => void {
  const handleWindowStorageChange = (event: StorageEvent) => {
    const appState = readAppStateFromWindowStorageEvent(event);

    if (appState) {
      onChange(appState);
    }
  };

  const handleChromeStorageChange = (
    changes: Record<string, chrome.storage.StorageChange>,
    areaName: string,
  ) => {
    const appState = readAppStateFromChromeStorageChanges(changes, areaName);

    if (appState) {
      onChange(appState);
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("storage", handleWindowStorageChange);
  }

  const chromeStorageChanges =
    typeof chrome !== "undefined" &&
    typeof chrome.storage?.onChanged?.addListener === "function"
      ? chrome.storage.onChanged
      : null;

  chromeStorageChanges?.addListener(handleChromeStorageChange);

  return () => {
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", handleWindowStorageChange);
    }

    chromeStorageChanges?.removeListener(handleChromeStorageChange);
  };
}
