import { useEffect, useState } from "react";

import type {
  AppLocalePreference,
  AppState,
} from "../providers/types";
import { sendAppMessage } from "../shared/app-client";
import {
  buildPopupSummaryLabels,
  createRuntimeI18n,
  DEFAULT_APP_LOCALE_PREFERENCE,
  getQuickThemeToggleCopy,
  syncRuntimeLocaleAttributes,
} from "../shared/i18n";
import {
  buildPopupLocalizedCopy,
  buildProviderSourceDisplayLocalizedCopy,
} from "../shared/localized-copy";
import {
  buildQuickThemeToggle,
  DEFAULT_THEME_SETTINGS,
  startThemeSettingsSync,
} from "../shared/theme";
import { SummaryStrip } from "../sidepanel/components/SummaryStrip";
import { StatusBadge } from "../sidepanel/components/StatusBadge";
import type { SettingsRouteFocus } from "../sidepanel/route-state";
import { syncPopupAppearanceAttributes } from "../shared/popup-appearance";
import {
  buildPopupViewModel,
  localizePopupViewModel,
  type PopupGuidanceAction,
} from "./view-models";
import {
  getSettingsRouteFocusForPopupAction,
  getSettingsRouteFocusForPopupProvider,
} from "./settings-route-targets";
import {
  openFullDashboard,
  openFullDashboardTab,
  openSettings,
} from "./popup-route-actions";
import { runPopupRefreshAction } from "./popup-refresh-action";
import { runPopupThemeToggleAction } from "./popup-theme-toggle-action";
import { runPopupHideProviderAction } from "./popup-hide-provider-action";
import { runPopupGuidanceAction } from "./popup-guidance-action";
import { PopupFeaturedProviderList } from "./PopupFeaturedProviderList";
import { PopupGuidanceCardSection } from "./PopupGuidanceCardSection";
import { PopupHeaderSection } from "./PopupHeaderSection";

type PopupLoadState =
  | { status: "loading" }
  | { status: "ready"; appState: AppState }
  | { status: "error"; message: string };

export function PopupApp() {
  const [loadState, setLoadState] = useState<PopupLoadState>({
    status: "loading",
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isThemeTogglePending, setIsThemeTogglePending] = useState(false);

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
    return (
      <main className="app-shell popup-shell">
        <section className="status-card">
          <p className="section-label">{runtimeI18n.t("popup.loading.eyebrow")}</p>
          <h1 className="section-title">{runtimeI18n.t("popup.loading.title")}</h1>
          <p className="supporting-copy">{runtimeI18n.t("popup.loading.detail")}</p>
        </section>
      </main>
    );
  }

  if (loadState.status === "error") {
    return (
      <main className="app-shell popup-shell">
        <section className="status-card">
          <p className="section-label">{runtimeI18n.t("popup.error.eyebrow")}</p>
          <h1 className="section-title">{runtimeI18n.t("popup.error.title")}</h1>
          <p className="supporting-copy">{loadState.message}</p>
          <div className="popup-actions">
            <button className="text-button" type="button" onClick={handleRefresh}>
              {runtimeI18n.t("common.actions.retry")}
            </button>
            <button
              className="text-button"
              type="button"
              onClick={() => {
                void openFullDashboard();
              }}
            >
              {runtimeI18n.t("common.actions.open_dashboard")}
            </button>
            <button
              className="text-button"
              type="button"
              onClick={() => {
                void openSettings();
              }}
            >
              {runtimeI18n.t("common.actions.open_settings")}
            </button>
          </div>
        </section>
      </main>
    );
  }

  const popupCopy = buildPopupLocalizedCopy(runtimeI18n);
  const popupModel = localizePopupViewModel(
    buildPopupViewModel(
      loadState.appState,
      buildPopupSummaryLabels(runtimeI18n),
      runtimeI18n.formatNumber,
      buildProviderSourceDisplayLocalizedCopy(runtimeI18n),
    ),
    runtimeI18n,
  );
  const guidanceCard = popupModel.guidanceCard;
  const quickThemeToggle = buildQuickThemeToggle(
    loadState.appState.settings.themeMode,
    typeof window !== "undefined" ? window : undefined,
  );
  const quickThemeToggleCopy = getQuickThemeToggleCopy(
    quickThemeToggle.nextMode,
    runtimeI18n,
  );
  const popupProgressStyle = loadState.appState.settings.popupProgressStyle;
  const hasFeaturedProviderCards = popupModel.featuredProviderCards.length > 0;
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
    if (action.kind === "hide-provider" && action.providerId) {
      const result = await runPopupHideProviderAction(action.providerId);
      setLoadState(
        result.status === "ready"
          ? { status: "ready", appState: result.state }
          : { status: "error", message: result.message },
      );
      return;
    }

    await runPopupGuidanceAction(action, options);
  }

  return (
    <main
      className={`app-shell popup-shell${
        hasFeaturedProviderCards ? " popup-shell--quota-first" : ""
      }`}
    >
      <PopupHeaderSection
        headerDetail={popupModel.headerDetail}
        hasFeaturedProviderCards={hasFeaturedProviderCards}
        isRefreshing={isRefreshing}
        isThemeTogglePending={isThemeTogglePending}
        quickThemeToggleCopy={quickThemeToggleCopy}
        runtimeI18n={runtimeI18n}
        onOpenDashboardTab={openFullDashboardTab}
        onRefresh={handleRefresh}
        onToggleThemeMode={handleToggleThemeMode}
      />

      <PopupFeaturedProviderList
        ariaLabel={popupCopy.aria.featuredProviders}
        cards={popupModel.featuredProviderCards}
        i18n={runtimeI18n}
        progressDisplayStyle={popupProgressStyle}
        getSettingsFocusForProvider={getSettingsRouteFocusForPopupProvider}
        onAction={handlePopupAction}
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
        <section
          className="status-card popup-setup-coverage"
          data-theme-local-surface="popup-setup-coverage-card"
        >
          <div className="status-card__header">
            <div>
              <p
                className="section-label"
                data-theme-local-surface="popup-setup-coverage-label"
              >
                {popupModel.setupCoverage.label}
              </p>
              <h2 className="section-title">{popupModel.setupCoverage.headline}</h2>
            </div>
            <div data-popup-setup-coverage-stage>
              {popupModel.setupCoverage.action ? (
                <button
                  className={`status-chip status-chip-button status-chip--${popupModel.setupCoverage.tone}`}
                  data-popup-setup-coverage-action="true"
                  type="button"
                  aria-label={popupModel.setupCoverage.action.label}
                  title={popupModel.setupCoverage.action.label}
                  onClick={() => {
                    void handlePopupAction(popupModel.setupCoverage.action!, {
                      settingsFocus: settingsFocusForSetupCoverage,
                    });
                  }}
                >
                  {popupModel.setupCoverage.statusLabel}
                </button>
              ) : (
                <StatusBadge
                  label={popupModel.setupCoverage.statusLabel}
                  tone={popupModel.setupCoverage.tone}
                />
              )}
            </div>
          </div>
          <p className="supporting-copy" data-popup-setup-coverage-detail>
            {popupModel.setupCoverage.detail}
          </p>
          <div data-popup-setup-coverage-grid>
            <SummaryStrip
              ariaLabel={popupCopy.aria.setupCoverage}
              items={popupModel.setupCoverage.items}
            />
          </div>
        </section>
      ) : null}

      {!hasFeaturedProviderCards && popupModel.showSnapshotStatus ? (
        <section
          className={`status-card${
            popupModel.snapshotStatus.tone === "neutral"
              ? ""
              : ` status-card--${popupModel.snapshotStatus.tone}`
          }`}
          data-theme-local-surface="popup-snapshot-status-card"
        >
          <div className="status-card__header">
            <div>
              <p className="section-label">{runtimeI18n.t("popup.snapshot_status.eyebrow")}</p>
              <h2 className="section-title">{popupModel.snapshotStatus.headline}</h2>
            </div>
            <StatusBadge
              label={popupModel.snapshotStatus.label}
              tone={popupModel.snapshotStatus.tone}
            />
          </div>
          <p className="supporting-copy">{popupModel.snapshotStatus.detail}</p>
        </section>
      ) : null}

      {!hasFeaturedProviderCards ? (
        <section
          className="status-card"
          data-theme-local-surface="popup-actions-card"
        >
          <p className="section-label" data-theme-local-surface="popup-actions-label">
            {popupModel.actionSection.label}
          </p>
          <p className="supporting-copy">{popupModel.actionSection.detail}</p>
          <div className="popup-actions">
            {popupModel.actionSection.actions.map((action) => (
              <button
                key={`${action.kind}-${action.providerId ?? "root"}`}
                className="text-button"
                data-theme-local-surface={
                  action.kind === "dashboard" ? "popup-open-dashboard" : undefined
                }
                type="button"
                onClick={() => {
                  void handlePopupAction(action);
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {!hasFeaturedProviderCards ? (
        <section
          className="status-card"
          data-theme-local-surface="popup-contract-card"
        >
          <p className="section-label">{popupModel.surfaceRolesCard.label}</p>
          <h2
            className="section-title"
            data-popup-surface-roles-headline="true"
          >
            {popupModel.surfaceRolesCard.headline}
          </h2>
          <p className="supporting-copy" data-popup-surface-roles-detail="true">
            {popupModel.surfaceRolesCard.detail}
          </p>
        </section>
      ) : null}

      {!hasFeaturedProviderCards ? (
        <section className="dashboard-section">
          <div className="dashboard-section__header">
            <div>
              <p
                className="section-label"
                data-theme-local-surface="popup-featured-section-label"
              >
                {popupModel.featuredSection.label}
              </p>
              <h2 className="section-title">{popupModel.featuredSection.headline}</h2>
            </div>
            <p className="supporting-copy">{popupModel.featuredSection.detail}</p>
          </div>

          <section className="status-card" data-theme-local-surface="popup-empty-state-card">
            <p className="section-label">{runtimeI18n.t("popup.triage.eyebrow")}</p>
            <h3 className="section-title">
              {popupModel.featuredSection.emptyStateHeadline}
            </h3>
            <p className="supporting-copy">
              {popupModel.featuredSection.emptyStateDetail}
            </p>
          </section>
        </section>
      ) : null}
    </main>
  );
}
