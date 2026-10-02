import { useEffect, useLayoutEffect, useRef, useState } from "react";

import type { AppMessage } from "../shared/app-message-types";
import type { AppState } from "../providers/types";
import { sendAppMessage } from "../shared/app-client";
import { subscribeToAppStateStorageChanges } from "../shared/app-state-storage-events";
import {
  normalizeThemeSettings,
  startThemeSettingsSync,
} from "../shared/theme";
import { isStoreScreenshotSeedLockEnabled } from "./store-screenshot-lock";
import {
  SettingsSaveTracker,
  StateResponseFence,
} from "./settings-save-feedback";

export type AppToast = {
  tone: "success" | "error";
  title: string;
  message: string;
};

export type StandardAppBootstrapPlan = {
  initialMessage: Extract<
    AppMessage,
    { type: "app:init" } | { type: "app:read-state" }
  >;
  backgroundMessage?: Extract<AppMessage, { type: "app:init" }>;
};

type UseStandardAppRuntimeOptions = {
  preferCachedBootstrap?: boolean;
  inlinePreferenceFeedback?: boolean;
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
  const [settingsTracker] = useState(() => new SettingsSaveTracker());
  const [responseFence] = useState(() => new StateResponseFence());
  const [settingsSaveFeedback, setSettingsSaveFeedback] = useState(
    settingsTracker.feedback,
  );
  const preferCachedBootstrap = options.preferCachedBootstrap ?? true;
  const inlinePreferenceFeedback = useRef(options.inlinePreferenceFeedback);
  inlinePreferenceFeedback.current = options.inlinePreferenceFeedback;

  useEffect(() => {
    let disposed = false;
    const bootstrapPlan = getStandardAppBootstrapPlan(preferCachedBootstrap);

    async function initializeApp() {
      setIsLoading(true);
      backgroundBootstrapStartedRef.current = false;

      const ticket = responseFence.begin();
      const response = await sendAppMessage(bootstrapPlan.initialMessage);

      if (disposed) {
        return;
      }

      if (response.ok) {
        if (responseFence.accept(ticket)) setAppState(response.state);
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

    const ticket = responseFence.begin();
    void sendAppMessage(bootstrapPlan.backgroundMessage).then((response) => {
      if (disposed) {
        return;
      }

      if (response.ok) {
        if (responseFence.accept(ticket)) setAppState(response.state);
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

  useEffect(
    () =>
      subscribeToAppStateStorageChanges((nextAppState) => {
        responseFence.storageChanged();
        setAppState(nextAppState);
        setLoadError(null);
      }),
    [],
  );

  useLayoutEffect(() => {
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
  ): Promise<AppState | null> {
    const ticket = responseFence.begin();
    const preferenceCheckpoint = settingsTracker.checkpoint;
    const preferenceRequest =
      message.type === "app:update-settings"
        ? settingsTracker.begin(message.settings)
        : null;
    if (preferenceRequest !== null)
      setSettingsSaveFeedback(settingsTracker.feedback);
    const response = await sendAppMessage(message).catch(() => ({
      ok: false as const,
      error: "The background request could not be completed.",
    }));

    const ownsPreferenceRequest =
      preferenceRequest !== null && settingsTracker.owns(preferenceRequest);
    const confirmedPatch =
      preferenceRequest !== null
        ? settingsTracker.finish(
            preferenceRequest,
            response.ok ? response.state.settings : undefined,
          )
        : {};
    if (preferenceRequest !== null)
      setSettingsSaveFeedback(settingsTracker.feedback);

    if (!response.ok) {
      if (
        preferenceRequest === null ||
        (ownsPreferenceRequest && !inlinePreferenceFeedback.current)
      ) {
        setToast({
          tone: "error",
          title: "State update failed",
          message: response.error,
        });
      }
      return null;
    }

    if (responseFence.accept(ticket)) {
      setAppState(response.state);
    } else if (
      preferenceRequest !== null &&
      responseFence.storageUnchanged(ticket)
    ) {
      // Web preview transports have no same-document storage event. Merge only
      // settings still owned by this reply, never its stale provider snapshot.
      setAppState((current) =>
        current
          ? { ...current, settings: { ...current.settings, ...confirmedPatch } }
          : current,
      );
    }
    setLoadError(null);

    if (
      message.type === "app:import-configuration-backup" ||
      message.type === "app:restore-configuration-from-sync"
    ) {
      settingsTracker.discardThrough(preferenceCheckpoint);
      setSettingsSaveFeedback(settingsTracker.feedback);
    }

    if (preferenceRequest !== null) return response.state;

    if (response.notice) {
      setToast(response.notice);
      return response.state;
    }

    if (successToast) {
      setToast(successToast);
    }

    return response.state;
  }

  function handleRetryInitialization() {
    setAppState(null);
    setLoadError(null);
    setIsLoading(true);
    backgroundBootstrapStartedRef.current = false;
    const bootstrapPlan = getStandardAppBootstrapPlan(preferCachedBootstrap);

    void applyMessage(bootstrapPlan.initialMessage, {
      tone: "success",
      title: "State reloaded",
      message: "The local dashboard state has been loaded again.",
    }).finally(() => {
      setIsLoading(false);
    });
  }

  return {
    appState,
    toast,
    isLoading,
    loadError,
    applyMessage,
    settingsSaveFeedback,
    retrySettingsSave: () => {
      const patch = settingsTracker.feedback.retryPatch;
      if (Object.keys(patch).length)
        void applyMessage({ type: "app:update-settings", settings: patch });
    },
    handleRetryInitialization,
    setToast,
  };
}
