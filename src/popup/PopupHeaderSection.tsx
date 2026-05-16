import type { ReactNode } from "react";

import type {
  getQuickThemeToggleCopy,
  RuntimeI18n,
} from "../shared/i18n";

type PopupHeaderSectionProps = {
  headerDetail: string;
  hasFeaturedProviderCards: boolean;
  isRefreshing: boolean;
  isThemeTogglePending: boolean;
  quickThemeToggleCopy: ReturnType<typeof getQuickThemeToggleCopy>;
  runtimeI18n: RuntimeI18n;
  hideProviderFeedback?: ReactNode;
  onOpenDashboardTab: () => void | Promise<void>;
  onOpenSettings: () => void | Promise<void>;
  onRefresh: () => void | Promise<void>;
  onToggleThemeMode: () => void | Promise<void>;
};

export function PopupHeaderSection({
  headerDetail,
  hasFeaturedProviderCards,
  isRefreshing,
  isThemeTogglePending,
  quickThemeToggleCopy,
  runtimeI18n,
  hideProviderFeedback = null,
  onOpenDashboardTab,
  onOpenSettings,
  onRefresh,
  onToggleThemeMode,
}: PopupHeaderSectionProps) {
  return (
    <section className="status-card popup-header">
      <div className="popup-header__top-row">
        <div className="popup-header__title-copy">
          <p
            className="section-label"
            data-theme-local-surface="popup-header-label"
          >
            {runtimeI18n.t("popup.header.eyebrow")}
          </p>
          <h1 className="section-title">
            {runtimeI18n.t("popup.header.title")}
          </h1>
          {!hasFeaturedProviderCards ? (
            <p className="supporting-copy">{headerDetail}</p>
          ) : null}
        </div>
        {hideProviderFeedback ? (
          <div className="popup-header__feedback-slot">
            {hideProviderFeedback}
          </div>
        ) : null}
        <button
          className="text-button popup-header__refresh"
          type="button"
          disabled={isRefreshing}
          data-popup-refresh="true"
          onClick={() => {
            void onRefresh();
          }}
        >
          {isRefreshing
            ? runtimeI18n.t("popup.actions.refreshing")
            : runtimeI18n.t("popup.actions.refresh")}
        </button>
      </div>
      <div className="popup-header__actions">
        <button
          className="icon-button"
          data-popup-toggle-theme-mode="true"
          data-theme-local-surface="popup-toggle-theme-mode"
          type="button"
          aria-label={quickThemeToggleCopy.title}
          title={quickThemeToggleCopy.title}
          disabled={isThemeTogglePending}
          onClick={() => {
            void onToggleThemeMode();
          }}
        >
          {quickThemeToggleCopy.label}
        </button>
        <button
          className="icon-button"
          data-popup-open-dashboard-tab="true"
          data-theme-local-surface="popup-open-dashboard-tab"
          type="button"
          aria-label={runtimeI18n.t("common.actions.open_dashboard_tab")}
          title={runtimeI18n.t("common.actions.open_dashboard_tab")}
          onClick={() => {
            void onOpenDashboardTab();
          }}
        >
          {runtimeI18n.t("common.actions.tab")}
        </button>
        <button
          className="icon-button"
          data-popup-open-settings="true"
          data-theme-local-surface="popup-open-settings"
          type="button"
          aria-label={runtimeI18n.t("common.actions.open_settings")}
          title={runtimeI18n.t("common.actions.open_settings")}
          onClick={() => {
            void onOpenSettings();
          }}
        >
          {runtimeI18n.t("common.actions.settings")}
        </button>
      </div>
    </section>
  );
}
