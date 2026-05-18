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
  refreshCountdownMinutes: number | null;
  runtimeI18n: RuntimeI18n;
  hideProviderFeedback?: ReactNode;
  onOpenDashboardTab: () => void | Promise<void>;
  onOpenSettings: () => void | Promise<void>;
  onRefresh: () => void | Promise<void>;
  onToggleThemeMode: () => void | Promise<void>;
};

function buildRefreshTitle({
  isRefreshing,
  refreshCountdownMinutes,
  runtimeI18n,
}: {
  isRefreshing: boolean;
  refreshCountdownMinutes: number | null;
  runtimeI18n: RuntimeI18n;
}) {
  if (isRefreshing) {
    return runtimeI18n.t("popup.actions.refreshing");
  }

  const minutesLabel =
    refreshCountdownMinutes === null
      ? null
      : [
          runtimeI18n.formatNumber(Math.max(1, refreshCountdownMinutes)),
          runtimeI18n.t("settings.preferences.minutes"),
        ].join(" ");

  return [
    runtimeI18n.t("popup.actions.refresh_title"),
    minutesLabel ? `~${minutesLabel}` : null,
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
  refreshCountdownMinutes,
  runtimeI18n,
  hideProviderFeedback = null,
  onOpenDashboardTab,
  onOpenSettings,
  onRefresh,
  onToggleThemeMode,
}: PopupHeaderSectionProps) {
  const refreshTitle = buildRefreshTitle({
    isRefreshing,
    refreshCountdownMinutes,
    runtimeI18n,
  });
  const refreshCountdownLabel = formatPopupRefreshCountdownLabel(
    refreshCountdownMinutes,
    runtimeI18n.formatNumber,
  );
  const themeIcon =
    quickThemeToggleTargetMode === "dark" ? "dark-mode" : "clear-day";

  return (
    <section className="status-card popup-header">
      {hideProviderFeedback ? (
        <div className="popup-header__feedback-slot">
          {hideProviderFeedback}
        </div>
      ) : null}
      <div className="popup-header__actions">
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
