import { lazy, Suspense, useEffect, useState } from "react";

import type { AppLocalePreference, AppSettings } from "../providers/types";
import { sendAppMessage } from "../shared/app-client";
import { APP_STATE_STORAGE_KEY } from "../shared/constants";
import {
  createRuntimeI18n,
  DEFAULT_APP_LOCALE_PREFERENCE,
  normalizeAppLocalePreference,
  syncRuntimeLocaleAttributes,
} from "../shared/i18n";
import {
  DEFAULT_THEME_SETTINGS,
  normalizeThemeSettings,
  startThemeSettingsSync,
  type ThemeSettings,
} from "../shared/theme";

const CodexFixtureCapturePage = lazy(() =>
  import("./routes/CodexFixtureCapturePage").then((module) => ({
    default: module.CodexFixtureCapturePage,
  })),
);
const CursorFixtureCapturePage = lazy(() =>
  import("./routes/CursorFixtureCapturePage").then((module) => ({
    default: module.CursorFixtureCapturePage,
  })),
);
const InteractionAuditPage = lazy(() =>
  import("./routes/InteractionAuditPage").then((module) => ({
    default: module.InteractionAuditPage,
  })),
);
const JetBrainsFixtureCapturePage = lazy(() =>
  import("./routes/JetBrainsFixtureCapturePage").then((module) => ({
    default: module.JetBrainsFixtureCapturePage,
  })),
);
const StoreScreenshotNativePopupProbePage = lazy(() =>
  import("./routes/StoreScreenshotNativePopupProbePage").then((module) => ({
    default: module.StoreScreenshotNativePopupProbePage,
  })),
);
const StoreScreenshotSeedPage = lazy(() =>
  import("./routes/StoreScreenshotSeedPage").then((module) => ({
    default: module.StoreScreenshotSeedPage,
  })),
);
const ThemeRecoveryReviewPage = lazy(() =>
  import("./routes/ThemeRecoveryReviewPage").then((module) => ({
    default: module.ThemeRecoveryReviewPage,
  })),
);

export type SpecialSidePanelRoute =
  | "debug-capture-codex"
  | "debug-capture-cursor"
  | "debug-capture-jetbrains"
  | "debug-interaction-audit"
  | "debug-store-screenshot-seed"
  | "debug-native-popup-probe"
  | "debug-theme-recovery-review";

export function getSpecialSidePanelRoute(
  locationHash: string,
): SpecialSidePanelRoute | null {
  switch (locationHash) {
    case "#debug-capture-codex":
      return "debug-capture-codex";
    case "#debug-capture-cursor":
      return "debug-capture-cursor";
    case "#debug-capture-jetbrains":
      return "debug-capture-jetbrains";
    case "#debug-interaction-audit":
      return "debug-interaction-audit";
    case "#debug-store-screenshot-seed":
      return "debug-store-screenshot-seed";
    case "#debug-native-popup-probe":
      return "debug-native-popup-probe";
    case "#debug-theme-recovery-review":
      return "debug-theme-recovery-review";
    default:
      return null;
  }
}

function readThemeSettingsFromStoredAppState(value: unknown): ThemeSettings {
  if (!value || typeof value !== "object" || !("settings" in value)) {
    return DEFAULT_THEME_SETTINGS;
  }

  return normalizeThemeSettings(
    (value as { settings?: Partial<AppSettings> | null }).settings,
  );
}

function readLocalePreferenceFromStoredAppState(
  value: unknown,
): AppLocalePreference {
  if (!value || typeof value !== "object" || !("settings" in value)) {
    return DEFAULT_APP_LOCALE_PREFERENCE;
  }

  const locale = (value as { settings?: Partial<AppSettings> | null }).settings
    ?.locale;

  return normalizeAppLocalePreference(locale);
}

function parseStoredThemeSettings(rawValue: string | null): ThemeSettings {
  if (!rawValue) {
    return DEFAULT_THEME_SETTINGS;
  }

  try {
    return readThemeSettingsFromStoredAppState(JSON.parse(rawValue) as unknown);
  } catch {
    return DEFAULT_THEME_SETTINGS;
  }
}

function parseStoredLocalePreference(rawValue: string | null): AppLocalePreference {
  if (!rawValue) {
    return DEFAULT_APP_LOCALE_PREFERENCE;
  }

  try {
    return readLocalePreferenceFromStoredAppState(JSON.parse(rawValue) as unknown);
  } catch {
    return DEFAULT_APP_LOCALE_PREFERENCE;
  }
}

function SpecialRouteLoadingFallback({
  runtimeI18n,
}: {
  runtimeI18n: ReturnType<typeof createRuntimeI18n>;
}) {
  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="section-label">{runtimeI18n.t("app.loading.eyebrow")}</p>
        <h1 className="display-headline">
          {runtimeI18n.t("app.loading.title")}
        </h1>
        <p className="body-copy">{runtimeI18n.t("app.loading.detail")}</p>
      </section>
    </main>
  );
}

export function SpecialRouteApp({
  route,
}: {
  route: SpecialSidePanelRoute;
}) {
  const [themeSettings, setThemeSettings] =
    useState<ThemeSettings>(DEFAULT_THEME_SETTINGS);
  const [localePreference, setLocalePreference] = useState<AppLocalePreference>(
    DEFAULT_APP_LOCALE_PREFERENCE,
  );
  const runtimeI18n = createRuntimeI18n(
    localePreference,
    typeof window !== "undefined" ? window : undefined,
  );

  useEffect(() => {
    if (route === "debug-store-screenshot-seed") {
      return undefined;
    }

    let disposed = false;

    async function hydrateThemeSettings() {
      const response = await sendAppMessage({ type: "app:read-state" });

      if (disposed || !response.ok) {
        return;
      }

      setThemeSettings(normalizeThemeSettings(response.state.settings));
      setLocalePreference(response.state.settings.locale);
    }

    void hydrateThemeSettings();

    return () => {
      disposed = true;
    };
  }, [route]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== APP_STATE_STORAGE_KEY) {
        return;
      }

      setThemeSettings(parseStoredThemeSettings(event.newValue));
      setLocalePreference(parseStoredLocalePreference(event.newValue));
    };

    window.addEventListener("storage", handleStorage);

    let removeChromeStorageListener = () => {};

    if (
      typeof chrome !== "undefined" &&
      typeof chrome.storage?.onChanged?.addListener === "function"
    ) {
      const handleChromeStorageChange = (
        changes: Record<string, chrome.storage.StorageChange>,
        areaName: string,
      ) => {
        if (areaName !== "local" || !(APP_STATE_STORAGE_KEY in changes)) {
          return;
        }

        setThemeSettings(
          readThemeSettingsFromStoredAppState(
            changes[APP_STATE_STORAGE_KEY]?.newValue,
          ),
        );
        setLocalePreference(
          readLocalePreferenceFromStoredAppState(
            changes[APP_STATE_STORAGE_KEY]?.newValue,
          ),
        );
      };

      chrome.storage.onChanged.addListener(handleChromeStorageChange);
      removeChromeStorageListener = () => {
        chrome.storage.onChanged.removeListener(handleChromeStorageChange);
      };
    }

    return () => {
      window.removeEventListener("storage", handleStorage);
      removeChromeStorageListener();
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined" || typeof window === "undefined") {
      return undefined;
    }

    return startThemeSettingsSync(
      themeSettings,
      document.documentElement,
      window,
    );
  }, [
    themeSettings.themeCustomSeedHex,
    themeSettings.themeMode,
    themeSettings.themePreset,
    themeSettings.uiFontFamily,
  ]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    syncRuntimeLocaleAttributes(
      runtimeI18n,
      document.documentElement,
      document.body,
    );
  }, [runtimeI18n.resolvedLocale, runtimeI18n.resolvedTextDirection]);

  const routeContent = (() => {
    switch (route) {
      case "debug-capture-codex":
        return <CodexFixtureCapturePage />;
      case "debug-capture-cursor":
        return <CursorFixtureCapturePage />;
      case "debug-capture-jetbrains":
        return <JetBrainsFixtureCapturePage />;
      case "debug-interaction-audit":
        return <InteractionAuditPage i18n={runtimeI18n} />;
      case "debug-store-screenshot-seed":
        return <StoreScreenshotSeedPage i18n={runtimeI18n} />;
      case "debug-native-popup-probe":
        return <StoreScreenshotNativePopupProbePage i18n={runtimeI18n} />;
      case "debug-theme-recovery-review":
        return <ThemeRecoveryReviewPage i18n={runtimeI18n} />;
      default:
        return null;
    }
  })();

  return (
    <Suspense
      fallback={<SpecialRouteLoadingFallback runtimeI18n={runtimeI18n} />}
    >
      {routeContent}
    </Suspense>
  );
}
