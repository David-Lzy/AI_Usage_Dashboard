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
  onOpenDashboardTab: () => void | Promise<void>;
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
  onOpenDashboardTab,
  onRefresh,
  onToggleThemeMode,
}: PopupHeaderSectionProps) {
  return (
    <section className="status-card popup-header">
      <div>
        <p className="section-label" data-theme-local-surface="popup-header-label">
          {runtimeI18n.t("popup.header.eyebrow")}
        </p>
        <h1 className="section-title">{runtimeI18n.t("popup.header.title")}</h1>
        {!hasFeaturedProviderCards ? (
          <p className="supporting-copy">{headerDetail}</p>
        ) : null}
      </div>
      <div className="popup-actions">
        <button
          className="text-button"
          type="button"
          disabled={isRefreshing}
          onClick={() => {
            void onRefresh();
          }}
        >
          {isRefreshing
            ? runtimeI18n.t("popup.actions.refreshing")
            : runtimeI18n.t("popup.actions.refresh")}
        </button>
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
      </div>
    </section>
  );
}
