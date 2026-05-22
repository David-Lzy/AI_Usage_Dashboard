import { useEffect, useRef, useState } from "react";

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

export type StandardAppBootstrapPlan = {
  initialMessage: Extract<AppMessage, { type: "app:init" } | { type: "app:read-state" }>;
  backgroundMessage?: Extract<AppMessage, { type: "app:init" }>;
};

type UseStandardAppRuntimeOptions = {
  preferCachedBootstrap?: boolean;
};

export function getStandardAppBootstrapPlan(
  preferCachedBootstrap = true,
): StandardAppBootstrapPlan {
  if (isStoreScreenshotSeedLockEnabled()) {
    return {
      initialMessage: { type: "app:read-state" },
    };
  }

  if (preferCachedBootstrap) {
    return {
      initialMessage: { type: "app:read-state" },
      backgroundMessage: { type: "app:init" },
    };
  }

  return {
    initialMessage: { type: "app:init" },
  };
}

export function getStandardAppBootstrapMessage(): Extract<
  AppMessage,
  { type: "app:init" } | { type: "app:read-state" }
> {
  return getStandardAppBootstrapPlan().initialMessage;
}

export function useStandardAppRuntime(
  options: UseStandardAppRuntimeOptions = {},
) {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [toast, setToast] = useState<AppToast | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const backgroundBootstrapStartedRef = useRef(false);
  const preferCachedBootstrap = options.preferCachedBootstrap ?? true;

  useEffect(() => {
    let disposed = false;
    const bootstrapPlan = getStandardAppBootstrapPlan(preferCachedBootstrap);

    async function initializeApp() {
      setIsLoading(true);
      backgroundBootstrapStartedRef.current = false;

      const response = await sendAppMessage(bootstrapPlan.initialMessage);

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
  }, [preferCachedBootstrap]);

  useEffect(() => {
    const bootstrapPlan = getStandardAppBootstrapPlan(preferCachedBootstrap);

    if (
      !bootstrapPlan.backgroundMessage ||
      !appState ||
      isLoading ||
      backgroundBootstrapStartedRef.current
    ) {
      return undefined;
    }

    let disposed = false;
    backgroundBootstrapStartedRef.current = true;

    void sendAppMessage(bootstrapPlan.backgroundMessage).then((response) => {
      if (disposed) {
        return;
      }

      if (response.ok) {
        setAppState(response.state);
        setLoadError(null);
        return;
      }

      setToast({
        tone: "error",
        title: "Initialization failed",
        message: response.error,
      });
    });

    return () => {
      disposed = true;
    };
  }, [appState, isLoading, preferCachedBootstrap]);

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
    appState?.settings.uiFontFamily,
    appState?.settings.motionMode,
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
    backgroundBootstrapStartedRef.current = false;
    const bootstrapPlan = getStandardAppBootstrapPlan(preferCachedBootstrap);

    void applyMessage(
      bootstrapPlan.initialMessage,
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
