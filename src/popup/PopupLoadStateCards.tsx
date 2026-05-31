import type { RuntimeI18n } from "../shared/i18n";

type PopupLoadingCardProps = {
  runtimeI18n: RuntimeI18n;
};

type PopupErrorCardProps = {
  message: string;
  runtimeI18n: RuntimeI18n;
  onOpenDashboard: () => void | Promise<void>;
  onOpenSettings: () => void | Promise<void>;
  onRetry: () => void | Promise<void>;
};

export function PopupLoadingCard({ runtimeI18n }: PopupLoadingCardProps) {
  return (
    <main className="app-shell popup-shell">
      <section
        className="status-card popup-load-state-card popup-load-state-card--loading"
        aria-live="polite"
      >
        <p className="section-label">{runtimeI18n.t("popup.loading.eyebrow")}</p>
        <h1 className="section-title">{runtimeI18n.t("popup.loading.title")}</h1>
        <p className="supporting-copy">{runtimeI18n.t("popup.loading.detail")}</p>
        <span className="popup-load-state-card__indicator" aria-hidden="true" />
      </section>
    </main>
  );
}

export function PopupErrorCard({
  message,
  runtimeI18n,
  onOpenDashboard,
  onOpenSettings,
  onRetry,
}: PopupErrorCardProps) {
  return (
    <main className="app-shell popup-shell">
      <section
        className="status-card status-card--error popup-load-state-card popup-load-state-card--error"
        role="alert"
      >
        <p className="section-label">{runtimeI18n.t("popup.error.eyebrow")}</p>
        <h1 className="section-title">{runtimeI18n.t("popup.error.title")}</h1>
        <p className="supporting-copy">{message}</p>
        <div className="popup-actions popup-load-state-card__actions">
          <button
            className="text-button text-button--outlined popup-load-state-card__primary-action"
            type="button"
            onClick={() => {
              void onRetry();
            }}
          >
            {runtimeI18n.t("common.actions.retry")}
          </button>
          <button
            className="text-button"
            type="button"
            onClick={() => {
              void onOpenDashboard();
            }}
          >
            {runtimeI18n.t("common.actions.open_dashboard")}
          </button>
          <button
            className="text-button"
            type="button"
            onClick={() => {
              void onOpenSettings();
            }}
          >
            {runtimeI18n.t("common.actions.open_settings")}
          </button>
        </div>
      </section>
    </main>
  );
}
