import { useEffect, useState } from "react";

import type {
  AppLocalePreference,
  AppState,
  ProviderId,
  ProviderUsageHistoryModuleId,
} from "../providers/types";
import { sendAppMessage } from "../shared/app-client";
import {
  buildPopupSummaryLabels,
  createRuntimeI18n,
  DEFAULT_APP_LOCALE_PREFERENCE,
  getQuickThemeToggleCopy,
  syncRuntimeLocaleAttributes,
} from "../shared/i18n";
import { buildPopupLocalizedCopy } from "../shared/popup-localized-copy";
import { buildProviderSourceDisplayLocalizedCopy } from "../shared/provider-source-display-localized-copy";
import {
  buildQuickThemeToggle,
  DEFAULT_THEME_SETTINGS,
  startThemeSettingsSync,
} from "../shared/theme";
import { SummaryStrip } from "../shared/components/SummaryStrip";
import { getVisibleCustomSources } from "../shared/custom-source-view-models";
import { SETTINGS_SECTION_IDS } from "../shared/settings-section-ids";
import type { SettingsRouteFocus } from "../shared/sidepanel-route-state";
import { syncPopupAppearanceAttributes } from "../shared/popup-appearance";
import {
  buildPopupViewModel,
  localizePopupViewModel,
  type PopupGuidanceAction,
} from "./view-models";
import {
  findHostAccessRefreshCandidate,
  hasDirectHostAccessRequest,
  requestHostAccessForProvider,
} from "../shared/host-access-request";
import {
  getSettingsRouteFocusForPopupAction,
  getSettingsRouteFocusForPopupProvider,
} from "./settings-route-targets";
import {
  openDashboardSidebar,
  openFullDashboard,
  openFullDashboardTab,
  openSettings,
} from "./popup-route-actions";
import { runPopupRefreshAction } from "./popup-refresh-action";
import { runPopupThemeToggleAction } from "./popup-theme-toggle-action";
import { runPopupGuidanceAction } from "./popup-guidance-action";
import { PopupActionSection } from "./PopupActionSection";
import { PopupCustomSourceList } from "./PopupCustomSourceList";
import { PopupFeaturedProviderList } from "./PopupFeaturedProviderList";
import { PopupFeaturedSection } from "./PopupFeaturedSection";
import { PopupFooterSection } from "./PopupFooterSection";
import { PopupGuidanceCardSection } from "./PopupGuidanceCardSection";
import { PopupHeaderSection } from "./PopupHeaderSection";
import {
  PopupHideProviderFeedback,
  type PopupHideProviderFeedbackState,
} from "./PopupHideProviderFeedback";
import {
  PopupErrorCard,
  PopupLoadingCard,
} from "./PopupLoadStateCards";
import { PopupSnapshotStatusSection } from "./PopupSnapshotStatusSection";
import { PopupSetupCoverageSection } from "./PopupSetupCoverageSection";
import { PopupSurfaceRolesSection } from "./PopupSurfaceRolesSection";
import { buildPopupHideProviderFeedbackCopy } from "./popup-hide-provider-feedback-copy";
import {
  readPopupCollapsePreference,
  writePopupCollapsePreference,
} from "./popup-collapse-preferences";
import {
  decrementPopupRefreshCountdownSeconds,
  POPUP_REFRESH_COUNTDOWN_ALARM_RESYNC_MS,
  readPopupRefreshCountdownSeconds,
} from "./popup-refresh-schedule";
import { setProviderUsageHistoryModuleVisibility } from "../shared/usage-history-visibility";

type PopupLoadState =
  | { status: "loading" }
  | { status: "ready"; appState: AppState }
  | { status: "error"; message: string };

const HIDE_PROVIDER_UNDO_SECONDS = 3;
const HIDE_PROVIDER_NOTICE_MS = 4500;

export function PopupApp() {
  const [loadState, setLoadState] = useState<PopupLoadState>({
    status: "loading",
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isThemeTogglePending, setIsThemeTogglePending] = useState(false);
  const [areHeaderActionsCollapsed, setAreHeaderActionsCollapsed] = useState(
    () => readPopupCollapsePreference("headerActions"),
  );
  const [isFooterCollapsed, setIsFooterCollapsed] = useState(() =>
    readPopupCollapsePreference("footerInfo"),
  );
  const [refreshCountdownSeconds, setRefreshCountdownSeconds] = useState<
    number | null
  >(null);
  const [hideProviderFeedback, setHideProviderFeedback] =
    useState<PopupHideProviderFeedbackState | null>(null);

  useEffect(() => {
    let disposed = false;

    async function loadState() {
      const response = await sendAppMessage({ type: "app:read-state" });

      if (disposed) {
        return;
      }

      if (!response.ok) {
        setLoadState({ status: "error", message: response.error });
        return;
      }

      setLoadState({ status: "ready", appState: response.state });
    }

    void loadState();

    return () => {
      disposed = true;
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined" || typeof window === "undefined") {
      return undefined;
    }

    const themeSettings =
      loadState.status === "ready"
        ? loadState.appState.settings
        : DEFAULT_THEME_SETTINGS;

    return startThemeSettingsSync(themeSettings, document.documentElement, window);
  }, [loadState]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    if (loadState.status !== "ready") {
      return undefined;
    }

    return syncPopupAppearanceAttributes(
      loadState.appState.settings,
      document.documentElement,
    );
  }, [loadState]);

  useEffect(() => {
    if (loadState.status !== "ready") {
      setRefreshCountdownSeconds(null);
      return undefined;
    }

    let disposed = false;
    let refreshCountdownInFlight = false;

    function isPopupHidden() {
      return (
        typeof document !== "undefined" &&
        document.visibilityState === "hidden"
      );
    }

    async function syncRefreshCountdownFromAlarm() {
      if (loadState.status !== "ready") {
        return;
      }

      if (isPopupHidden()) {
        return;
      }

      if (refreshCountdownInFlight) {
        return;
      }

      refreshCountdownInFlight = true;

      try {
        const seconds = await readPopupRefreshCountdownSeconds(
          loadState.appState.settings.syncIntervalMinutes,
        );

        if (!disposed) {
          setRefreshCountdownSeconds((currentSeconds) =>
            currentSeconds === seconds ? currentSeconds : seconds,
          );
        }
      } catch {
        // The countdown is advisory; a failed read should not keep the popup busy.
      } finally {
        refreshCountdownInFlight = false;
      }
    }

    function tickRefreshCountdown() {
      if (isPopupHidden()) {
        return;
      }

      let shouldResyncAtZero = false;

      setRefreshCountdownSeconds((currentSeconds) => {
        const nextSeconds =
          decrementPopupRefreshCountdownSeconds(currentSeconds);

        shouldResyncAtZero =
          currentSeconds !== null &&
          currentSeconds > 0 &&
          nextSeconds === 0;

        return currentSeconds === nextSeconds ? currentSeconds : nextSeconds;
      });

      if (shouldResyncAtZero) {
        void syncRefreshCountdownFromAlarm();
      }
    }

    void syncRefreshCountdownFromAlarm();

    if (typeof window === "undefined") {
      return () => {
        disposed = true;
      };
    }

    const tickIntervalId = window.setInterval(tickRefreshCountdown, 1_000);
    const resyncIntervalId = window.setInterval(
      syncRefreshCountdownFromAlarm,
      POPUP_REFRESH_COUNTDOWN_ALARM_RESYNC_MS,
    );

    function handleVisibilityChange() {
      if (document.visibilityState !== "hidden") {
        void syncRefreshCountdownFromAlarm();
      }
    }

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    return () => {
      disposed = true;
      window.clearInterval(tickIntervalId);
      window.clearInterval(resyncIntervalId);

      if (typeof document !== "undefined") {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange,
        );
      }
    };
  }, [
    loadState.status,
    loadState.status === "ready"
      ? loadState.appState.settings.syncIntervalMinutes
      : null,
  ]);

  async function handleRefresh() {
    setIsRefreshing(true);

    const result = await runPopupRefreshAction(
      loadState.status === "ready" ? loadState.appState : null,
    );

    setLoadState(
      result.status === "ready"
        ? { status: "ready", appState: result.state }
        : { status: "error", message: result.message },
    );
    setIsRefreshing(false);
  }

  const localePreference: AppLocalePreference =
    loadState.status === "ready"
      ? loadState.appState.settings.locale
      : DEFAULT_APP_LOCALE_PREFERENCE;
  const runtimeI18n = createRuntimeI18n(
    localePreference,
    typeof window !== "undefined" ? window : undefined,
  );

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

  useEffect(() => {
    if (!hideProviderFeedback) {
      return undefined;
    }

    if (hideProviderFeedback.kind === "notice") {
      const timeoutId = setTimeout(() => {
        setHideProviderFeedback((current) =>
          current?.kind === "notice" &&
          current.providerId === hideProviderFeedback.providerId
            ? null
            : current,
        );
      }, HIDE_PROVIDER_NOTICE_MS);

      return () => {
        clearTimeout(timeoutId);
      };
    }

    const intervalId = setInterval(() => {
      setHideProviderFeedback((current) => {
        if (
          current?.kind !== "undo" ||
          current.providerId !== hideProviderFeedback.providerId
        ) {
          return current;
        }

        if (current.secondsRemaining <= 1) {
          return {
            kind: "notice",
            providerId: current.providerId,
            providerLabel: current.providerLabel,
          };
        }

        return {
          ...current,
          secondsRemaining: current.secondsRemaining - 1,
        };
      });
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [hideProviderFeedback?.kind, hideProviderFeedback?.providerId]);

  async function handleToggleThemeMode() {
    if (loadState.status !== "ready") {
      return;
    }

    setIsThemeTogglePending(true);
    const result = await runPopupThemeToggleAction(loadState.appState, {
      reader: typeof window !== "undefined" ? window : undefined,
    });

    setLoadState(
      result.status === "ready"
        ? { status: "ready", appState: result.state }
        : { status: "error", message: result.message },
    );
    setIsThemeTogglePending(false);
  }

  if (loadState.status === "loading") {
    return <PopupLoadingCard runtimeI18n={runtimeI18n} />;
  }

  if (loadState.status === "error") {
    return (
      <PopupErrorCard
        message={loadState.message}
        runtimeI18n={runtimeI18n}
        onOpenDashboard={openFullDashboard}
        onOpenSettings={openSettings}
        onRetry={handleRefresh}
      />
    );
  }

  const appState = loadState.appState;
  const popupCopy = buildPopupLocalizedCopy(runtimeI18n);
  const hideProviderFeedbackCopy =
    buildPopupHideProviderFeedbackCopy(runtimeI18n);
  const popupModel = localizePopupViewModel(
    buildPopupViewModel(
      appState,
      buildPopupSummaryLabels(runtimeI18n),
      runtimeI18n.formatNumber,
      buildProviderSourceDisplayLocalizedCopy(runtimeI18n),
    ),
    runtimeI18n,
  );
  const guidanceCard = popupModel.guidanceCard;
  const quickThemeToggle = buildQuickThemeToggle(
    appState.settings.themeMode,
    typeof window !== "undefined" ? window : undefined,
  );
  const quickThemeToggleCopy = getQuickThemeToggleCopy(
    quickThemeToggle.nextMode,
    runtimeI18n,
  );
  const popupProgressStyle = appState.settings.popupProgressStyle;
  const popupCustomSources = getVisibleCustomSources(appState, "popup");
  const customSourceSettingsFocus: SettingsRouteFocus = {
    kind: "section",
    sectionId: SETTINGS_SECTION_IDS.providerDisplay,
  };
  const hasFeaturedProviderCards =
    popupModel.featuredProviderCards.length > 0 ||
    popupCustomSources.length > 0;
  const settingsFocusForGuidance =
    getSettingsRouteFocusForPopupAction(
      guidanceCard?.action,
      popupModel.visibleProviders,
    );
  const settingsFocusForSetupCoverage = getSettingsRouteFocusForPopupAction(
    popupModel.setupCoverage.action,
    popupModel.visibleProviders,
  );

  async function handlePopupAction(
    action: PopupGuidanceAction,
    options: {
      settingsFocus?: SettingsRouteFocus | null;
    } = {},
  ) {
    if (action.kind === "grant-access" && action.providerId) {
      const target = findHostAccessRefreshCandidate(
        appState,
        action.providerId,
      );

      if (target && hasDirectHostAccessRequest()) {
        try {
          const granted = await requestHostAccessForProvider(target);

          if (!granted) {
            return;
          }

          const response = await sendAppMessage({
            type: "app:request-refresh",
            providerId: target.id,
          });

          if (!response.ok) {
            setLoadState({ status: "error", message: response.error });
            return;
          }

          setLoadState({ status: "ready", appState: response.state });

          return;
        } catch (error) {
          setLoadState({
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "The browser rejected the host access request.",
          });
          return;
        }
      }
    }

    if (action.kind === "hide-provider" && action.providerId) {
      const providerId = action.providerId;
      const providerLabel =
        popupModel.featuredProviderCards.find(
          (card) => card.provider.providerId === providerId,
        )?.provider.providerLabel ?? providerId;
      const response = await sendAppMessage({
        type: "app:set-provider-enabled",
        providerId,
        enabled: false,
      });

      if (!response.ok) {
        setLoadState({ status: "error", message: response.error });
        return;
      }

      setLoadState({ status: "ready", appState: response.state });
      setHideProviderFeedback({
        kind: "undo",
        providerId,
        providerLabel,
        secondsRemaining: HIDE_PROVIDER_UNDO_SECONDS,
      });
      return;
    }

    await runPopupGuidanceAction(action, options);
  }

  async function handleUndoHideProvider(providerId: ProviderId) {
    const response = await sendAppMessage({
      type: "app:set-provider-enabled",
      providerId,
      enabled: true,
    });

    if (!response.ok) {
      setLoadState({ status: "error", message: response.error });
      return;
    }

    setLoadState({ status: "ready", appState: response.state });
    setHideProviderFeedback(null);
  }

  async function handleUsageHistoryVisibilityChange(
    providerId: ProviderId,
    moduleId: ProviderUsageHistoryModuleId,
    visible: boolean,
  ) {
    if (loadState.status !== "ready") {
      return;
    }

    const response = await sendAppMessage({
      type: "app:update-settings",
      settings: {
        usageHistoryModulesBySurface:
          setProviderUsageHistoryModuleVisibility(
            loadState.appState.settings.usageHistoryModulesBySurface,
            "popup",
            providerId,
            moduleId,
            visible,
          ),
      },
    });

    setLoadState(
      response.ok
        ? { status: "ready", appState: response.state }
        : { status: "error", message: response.error },
    );
  }

  return (
    <main
      className={`app-shell popup-shell${
        hasFeaturedProviderCards ? " popup-shell--quota-first" : ""
      }`}
    >
      <PopupHeaderSection
        isRefreshing={isRefreshing}
        isThemeTogglePending={isThemeTogglePending}
        areActionsCollapsed={areHeaderActionsCollapsed}
        quickThemeToggleCopy={quickThemeToggleCopy}
        quickThemeToggleTargetMode={quickThemeToggle.nextMode}
        refreshCountdownSeconds={refreshCountdownSeconds}
        runtimeI18n={runtimeI18n}
        hideProviderFeedback={
          hideProviderFeedback ? (
            <PopupHideProviderFeedback
              copy={hideProviderFeedbackCopy}
              feedback={hideProviderFeedback}
              undoSeconds={HIDE_PROVIDER_UNDO_SECONDS}
              onOpenSettings={openSettings}
              onUndo={handleUndoHideProvider}
            />
          ) : null
        }
        onOpenDashboardSidebar={openDashboardSidebar}
        onOpenDashboardTab={openFullDashboardTab}
        onOpenSettings={openSettings}
        onRefresh={handleRefresh}
        onToggleActionsCollapsed={() => {
          setAreHeaderActionsCollapsed((current) => {
            const next = !current;
            writePopupCollapsePreference("headerActions", next);
            return next;
          });
        }}
        onToggleThemeMode={handleToggleThemeMode}
      />

      <PopupFeaturedProviderList
        ariaLabel={popupCopy.aria.featuredProviders}
        cards={popupModel.featuredProviderCards}
        i18n={runtimeI18n}
        sourcePageActionLabel={popupCopy.featuredCard.openSourcePageAction}
        progressColorAppearance={
          appState.settings.progressColorAppearance
        }
        progressColorBands={appState.settings.progressColorBands}
        popupCircularProgressItemsPerRow={
          appState.settings.popupCircularProgressItemsPerRow
        }
        progressDisplayStyle={popupProgressStyle}
        progressItemsBySurface={appState.settings.progressItemsBySurface}
        progressThicknessPx={appState.settings.progressThicknessPx}
        usageHistoryModulesBySurface={
          appState.settings.usageHistoryModulesBySurface
        }
        getSettingsFocusForProvider={getSettingsRouteFocusForPopupProvider}
        onAction={handlePopupAction}
        onUsageHistoryVisibilityChange={
          handleUsageHistoryVisibilityChange
        }
      />

      <PopupCustomSourceList
        ariaLabel={
          runtimeI18n.resolvedLocale === "zh-CN"
            ? "自定义来源"
            : "Custom sources"
        }
        sources={popupCustomSources}
        i18n={runtimeI18n}
        progressColorAppearance={
          appState.settings.progressColorAppearance
        }
        progressColorBands={appState.settings.progressColorBands}
        popupCircularProgressItemsPerRow={
          appState.settings.popupCircularProgressItemsPerRow
        }
        progressDisplayStyle={popupProgressStyle}
        progressItemsBySurface={appState.settings.progressItemsBySurface}
        progressThicknessPx={appState.settings.progressThicknessPx}
        settingsFocus={customSourceSettingsFocus}
        onOpenSettings={(settingsFocus) =>
          runPopupGuidanceAction(
            {
              kind: "settings",
              label: runtimeI18n.t("common.actions.settings"),
            },
            { settingsFocus },
          )
        }
      />

      {!hasFeaturedProviderCards ? (
        <SummaryStrip
          ariaLabel={runtimeI18n.t("popup.summary.aria")}
          items={popupModel.summaryItems}
        />
      ) : null}

      {!hasFeaturedProviderCards ? (
        <PopupGuidanceCardSection
          card={guidanceCard}
          runtimeI18n={runtimeI18n}
          settingsFocus={settingsFocusForGuidance}
          onAction={handlePopupAction}
        />
      ) : null}

      {!hasFeaturedProviderCards ? (
        <PopupSetupCoverageSection
          ariaLabel={popupCopy.aria.setupCoverage}
          setupCoverage={popupModel.setupCoverage}
          settingsFocus={settingsFocusForSetupCoverage}
          onAction={handlePopupAction}
        />
      ) : null}

      {!hasFeaturedProviderCards && popupModel.showSnapshotStatus ? (
        <PopupSnapshotStatusSection
          runtimeI18n={runtimeI18n}
          snapshotStatus={popupModel.snapshotStatus}
        />
      ) : null}

      {!hasFeaturedProviderCards ? (
        <PopupActionSection
          actionSection={popupModel.actionSection}
          onAction={handlePopupAction}
        />
      ) : null}

      {!hasFeaturedProviderCards ? (
        <PopupSurfaceRolesSection
          surfaceRolesCard={popupModel.surfaceRolesCard}
        />
      ) : null}

      {!hasFeaturedProviderCards ? (
        <PopupFeaturedSection
          featuredSection={popupModel.featuredSection}
          runtimeI18n={runtimeI18n}
        />
      ) : null}

      <PopupFooterSection
        headerDetail={popupModel.headerDetail}
        hasFeaturedProviderCards={hasFeaturedProviderCards}
        isCollapsed={isFooterCollapsed}
        runtimeI18n={runtimeI18n}
        onToggleCollapsed={() => {
          setIsFooterCollapsed((current) => {
            const next = !current;
            writePopupCollapsePreference("footerInfo", next);
            return next;
          });
        }}
      />
    </main>
  );
}
