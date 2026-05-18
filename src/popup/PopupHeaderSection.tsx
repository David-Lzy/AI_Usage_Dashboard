import type { ReactNode } from "react";

import type {
  getQuickThemeToggleCopy,
  RuntimeI18n,
} from "../shared/i18n";
import type { ResolvedThemeMode } from "../shared/theme";
import { PopupMaterialIcon } from "./PopupMaterialIcon";
import { formatPopupRefreshCountdownLabel } from "./popup-refresh-schedule";

type PopupHeaderSectionProps = {
  isRefreshing: boolean;
  isThemeTogglePending: boolean;
  quickThemeToggleCopy: ReturnType<typeof getQuickThemeToggleCopy>;
  quickThemeToggleTargetMode: ResolvedThemeMode;
  areActionsCollapsed: boolean;
  refreshCountdownSeconds: number | null;
  runtimeI18n: RuntimeI18n;
  hideProviderFeedback?: ReactNode;
  onOpenDashboardSidebar: () => void | Promise<void>;
  onOpenDashboardTab: () => void | Promise<void>;
  onOpenSettings: () => void | Promise<void>;
  onRefresh: () => void | Promise<void>;
  onToggleActionsCollapsed: () => void;
  onToggleThemeMode: () => void | Promise<void>;
};

function buildRefreshTitle({
  isRefreshing,
  refreshCountdownSeconds,
  runtimeI18n,
}: {
  isRefreshing: boolean;
  refreshCountdownSeconds: number | null;
  runtimeI18n: RuntimeI18n;
}) {
  if (isRefreshing) {
    return runtimeI18n.t("popup.actions.refreshing");
  }

  const countdownLabel =
    refreshCountdownSeconds === null
      ? null
      : formatPopupRefreshCountdownLabel(
          refreshCountdownSeconds,
          runtimeI18n.formatNumber,
        );

  return [
    runtimeI18n.t("popup.actions.refresh_title"),
    countdownLabel,
    runtimeI18n.t("popup.actions.refresh_drift_note"),
  ]
    .filter(Boolean)
    .join(" · ");
}

export function PopupHeaderSection({
  isRefreshing,
  isThemeTogglePending,
  quickThemeToggleCopy,
  quickThemeToggleTargetMode,
  areActionsCollapsed,
  refreshCountdownSeconds,
  runtimeI18n,
  hideProviderFeedback = null,
  onOpenDashboardSidebar,
  onOpenDashboardTab,
  onOpenSettings,
  onRefresh,
  onToggleActionsCollapsed,
  onToggleThemeMode,
}: PopupHeaderSectionProps) {
  const refreshTitle = buildRefreshTitle({
    isRefreshing,
    refreshCountdownSeconds,
    runtimeI18n,
  });
  const refreshCountdownLabel = formatPopupRefreshCountdownLabel(
    refreshCountdownSeconds,
    runtimeI18n.formatNumber,
  );
  const themeIcon =
    quickThemeToggleTargetMode === "dark" ? "dark-mode" : "clear-day";
  const toggleActionsTitle = runtimeI18n.t(
    areActionsCollapsed
      ? "popup.actions.show_header_actions"
      : "popup.actions.hide_header_actions",
  );
  const isSurfaceCollapsed = areActionsCollapsed && !hideProviderFeedback;

  return (
    <section
      className={`status-card popup-header${
        areActionsCollapsed ? " popup-header--actions-collapsed" : ""
      }${isSurfaceCollapsed ? " popup-header--surface-collapsed" : ""}`}
    >
      <button
        className="icon-button popup-header__collapse-toggle"
        type="button"
        aria-controls="popup-header-actions"
        aria-expanded={!areActionsCollapsed}
        aria-label={toggleActionsTitle}
        title={toggleActionsTitle}
        onClick={onToggleActionsCollapsed}
      >
        <PopupMaterialIcon
          name={
            areActionsCollapsed
              ? "keyboard-arrow-down"
              : "keyboard-arrow-up"
          }
        />
      </button>
      {hideProviderFeedback ? (
        <div className="popup-header__feedback-slot">
          {hideProviderFeedback}
        </div>
      ) : null}
      <div
        id="popup-header-actions"
        className="popup-header__actions"
        hidden={areActionsCollapsed}
      >
        <button
          className="icon-button popup-header__icon-action popup-header__icon-action--refresh"
          type="button"
          disabled={isRefreshing}
          data-popup-refresh="true"
          aria-label={refreshTitle}
          title={refreshTitle}
          onClick={() => {
            void onRefresh();
          }}
        >
          <PopupMaterialIcon name="refresh" />
          <span className="popup-header__refresh-countdown" aria-hidden="true">
            {isRefreshing
              ? runtimeI18n.t("popup.actions.refreshing")
              : refreshCountdownLabel}
          </span>
        </button>
        <button
          className="icon-button popup-header__icon-action"
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
          <PopupMaterialIcon name={themeIcon} />
        </button>
        <button
          className="icon-button popup-header__icon-action"
          data-popup-open-dashboard-tab="true"
          data-theme-local-surface="popup-open-dashboard-tab"
          type="button"
          aria-label={runtimeI18n.t("common.actions.open_dashboard_tab")}
          title={runtimeI18n.t("common.actions.open_dashboard_tab")}
          onClick={() => {
            void onOpenDashboardTab();
          }}
        >
          <PopupMaterialIcon name="tab" />
        </button>
        <button
          className="icon-button popup-header__icon-action"
          data-popup-open-dashboard-sidebar="true"
          data-theme-local-surface="popup-open-dashboard-sidebar"
          type="button"
          aria-label={runtimeI18n.t("common.actions.open_sidebar")}
          title={runtimeI18n.t("common.actions.open_sidebar")}
          onClick={() => {
            void onOpenDashboardSidebar();
          }}
        >
          <PopupMaterialIcon name="dock-left" />
        </button>
        <button
          className="icon-button popup-header__icon-action"
          data-popup-open-settings="true"
          data-theme-local-surface="popup-open-settings"
          type="button"
          aria-label={runtimeI18n.t("common.actions.open_settings")}
          title={runtimeI18n.t("common.actions.open_settings")}
          onClick={() => {
            void onOpenSettings();
          }}
        >
          <PopupMaterialIcon name="settings" />
        </button>
      </div>
    </section>
  );
}
