import type {
  PopupActionSection as PopupActionSectionModel,
  PopupGuidanceAction,
} from "./view-models";

type PopupActionSectionProps = {
  actionSection: PopupActionSectionModel;
  onAction: (action: PopupGuidanceAction) => void | Promise<void>;
};

export function PopupActionSection({
  actionSection,
  onAction,
}: PopupActionSectionProps) {
  return (
    <section
      className="status-card"
      data-theme-local-surface="popup-actions-card"
    >
      <p className="section-label" data-theme-local-surface="popup-actions-label">
        {actionSection.label}
      </p>
      <p className="supporting-copy">{actionSection.detail}</p>
      <div className="popup-actions">
        {actionSection.actions.map((action) => (
          <button
            key={`${action.kind}-${action.providerId ?? "root"}`}
            className="text-button"
            data-theme-local-surface={
              action.kind === "dashboard" ? "popup-open-dashboard" : undefined
            }
            type="button"
            onClick={() => {
              void onAction(action);
            }}
          >
            {action.label}
          </button>
        ))}
      </div>
    </section>
  );
}
