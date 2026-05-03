import { useEffect, useState } from "react";

import type { AppMessage } from "../background/message-bus";
import type { AppState } from "../providers/types";
import { sendAppMessage } from "../shared/app-client";
import {
  normalizeThemeSettings,
  startThemeSettingsSync,
} from "../shared/theme";
import { isStoreScreenshotSeedLockEnabled } from "./store-screenshot-seed";

export type AppToast = {
  tone: "success" | "error";
  title: string;
  message: string;
};

export function getStandardAppBootstrapMessage(): Extract<
  AppMessage,
  { type: "app:init" } | { type: "app:read-state" }
> {
  return isStoreScreenshotSeedLockEnabled()
    ? { type: "app:read-state" }
    : { type: "app:init" };
}

export function useStandardAppRuntime() {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [toast, setToast] = useState<AppToast | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;

    async function initializeApp() {
      setIsLoading(true);

      const response = await sendAppMessage(getStandardAppBootstrapMessage());

      if (disposed) {
        return;
      }

      if (response.ok) {
        setAppState(response.state);
        setLoadError(null);
      } else {
        setLoadError(response.error);
        setToast({
          tone: "error",
          title: "Initialization failed",
          message: response.error,
        });
      }

      setIsLoading(false);
    }

    void initializeApp();

    return () => {
      disposed = true;
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined" || typeof window === "undefined") {
      return undefined;
    }

    return startThemeSettingsSync(
      normalizeThemeSettings(appState?.settings),
      document.documentElement,
      window,
    );
  }, [
    appState?.settings.themeCustomSeedHex,
    appState?.settings.themeMode,
    appState?.settings.themePreset,
  ]);

  async function applyMessage(
    message: AppMessage,
    successToast?: AppToast,
  ): Promise<boolean> {
    const response = await sendAppMessage(message);

    if (!response.ok) {
      setToast({
        tone: "error",
        title: "State update failed",
        message: response.error,
      });
      return false;
    }

    setAppState(response.state);
    setLoadError(null);

    if (response.notice) {
      setToast(response.notice);
      return true;
    }

    if (successToast) {
      setToast(successToast);
    }

    return true;
  }

  function handleRetryInitialization() {
    setAppState(null);
    setLoadError(null);
    setIsLoading(true);

    void applyMessage(
      getStandardAppBootstrapMessage(),
      {
        tone: "success",
        title: "State reloaded",
        message: "The local dashboard state has been loaded again.",
      },
    ).finally(() => {
      setIsLoading(false);
    });
  }

  return {
    appState,
    toast,
    isLoading,
    loadError,
    applyMessage,
    handleRetryInitialization,
    setToast,
  };
}
