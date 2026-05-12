import type { RuntimeI18n } from "../shared/i18n";
import { StatusBadge } from "../sidepanel/components/StatusBadge";
import type { PopupSnapshotStatus } from "./view-models";

type PopupSnapshotStatusSectionProps = {
  runtimeI18n: RuntimeI18n;
  snapshotStatus: PopupSnapshotStatus;
};

export function PopupSnapshotStatusSection({
  runtimeI18n,
  snapshotStatus,
}: PopupSnapshotStatusSectionProps) {
  return (
    <section
      className={`status-card${
        snapshotStatus.tone === "neutral"
          ? ""
          : ` status-card--${snapshotStatus.tone}`
      }`}
      data-theme-local-surface="popup-snapshot-status-card"
    >
      <div className="status-card__header">
        <div>
          <p className="section-label">
            {runtimeI18n.t("popup.snapshot_status.eyebrow")}
          </p>
          <h2 className="section-title">{snapshotStatus.headline}</h2>
        </div>
        <StatusBadge
          label={snapshotStatus.label}
          tone={snapshotStatus.tone}
        />
      </div>
      <p className="supporting-copy">{snapshotStatus.detail}</p>
    </section>
  );
}
