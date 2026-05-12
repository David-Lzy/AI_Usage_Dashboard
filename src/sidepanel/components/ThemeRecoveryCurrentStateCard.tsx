import type { buildOperatorWorkspaceLocalizedCopy } from "../../shared/localized-copy";
import type {
  ThemeRecoveryLiveBadgeSnapshot,
  ThemeRecoveryReviewSnapshot,
} from "../theme-recovery-review";

type ThemeRecoveryCurrentTruthCopy = ReturnType<
  typeof buildOperatorWorkspaceLocalizedCopy
>["themeRecovery"]["currentTruth"];

type ThemeRecoveryCurrentStateCardProps = {
  badgeSummary: ThemeRecoveryLiveBadgeSnapshot;
  copy: ThemeRecoveryCurrentTruthCopy;
  snapshot: ThemeRecoveryReviewSnapshot;
};

function formatBadgeText(text: string): string {
  return text.trim().length > 0 ? text.trim() : "cleared";
}

export function ThemeRecoveryCurrentStateCard({
  badgeSummary,
  copy,
  snapshot,
}: ThemeRecoveryCurrentStateCardProps) {
  return (
    <section
      className={`status-card theme-recovery-status-card${
        snapshot.overallTone === "warning"
          ? " status-card--warning"
          : snapshot.overallTone === "error"
            ? " status-card--error"
            : ""
      }`}
      data-theme-recovery-current-state
    >
      <div className="dashboard-section__header">
        <div>
          <p className="section-label">{copy.eyebrow}</p>
          <h2 className="section-title">{copy.title}</h2>
        </div>
        <p className="supporting-copy">{snapshot.overallDetail}</p>
      </div>

      <div className="summary-strip theme-recovery-summary-strip">
        <div
          className={`summary-pill${
            snapshot.overallTone === "warning"
              ? " summary-pill--warning"
              : snapshot.overallTone === "error"
                ? " summary-pill--error"
                : ""
          }`}
        >
          <p className="summary-pill__label">{copy.reviewStage}</p>
          <p className="summary-pill__value" data-theme-recovery-overall-label>
            {snapshot.overallLabel}
          </p>
        </div>
        <div
          className={`summary-pill${
            snapshot.popupSnapshotTone === "warning"
              ? " summary-pill--warning"
              : snapshot.popupSnapshotTone === "error"
                ? " summary-pill--error"
                : ""
          }`}
        >
          <p className="summary-pill__label">{copy.popupSnapshot}</p>
          <p className="summary-pill__value" data-theme-recovery-popup-label>
            {snapshot.popupSnapshotLabel}
          </p>
        </div>
        <div
          className={`summary-pill${
            badgeSummary.text.trim().length > 0 ? " summary-pill--warning" : ""
          }`}
        >
          <p className="summary-pill__label">{copy.actionBadge}</p>
          <p className="summary-pill__value" data-theme-recovery-badge-text>
            {formatBadgeText(badgeSummary.text)}
          </p>
        </div>
      </div>
    </section>
  );
}
