import type { buildOperatorWorkspaceLocalizedCopy } from "../../shared/operator-workspace-localized-copy";
import type {
  ThemeRecoveryLiveBadgeSnapshot,
  ThemeRecoveryReviewSnapshot,
} from "../theme-recovery-review";

type ThemeRecoveryThemeStateCopy = ReturnType<
  typeof buildOperatorWorkspaceLocalizedCopy
>["themeRecovery"]["themeState"];

type ThemeRecoveryThemeStateCardProps = {
  badgeSummary: ThemeRecoveryLiveBadgeSnapshot;
  copy: ThemeRecoveryThemeStateCopy;
  snapshot: ThemeRecoveryReviewSnapshot;
};

export function ThemeRecoveryThemeStateCard({
  badgeSummary,
  copy,
  snapshot,
}: ThemeRecoveryThemeStateCardProps) {
  return (
    <section className="status-card">
      <div className="dashboard-section__header">
        <div>
          <p className="section-label">{copy.eyebrow}</p>
          <h2 className="section-title">{copy.title}</h2>
        </div>
        <p className="supporting-copy">{copy.detail}</p>
      </div>

      <div className="detail-grid">
        <div className="detail-field">
          <p className="detail-field__label">{copy.themeMode}</p>
          <p className="detail-field__value" data-theme-recovery-theme-mode>
            {snapshot.themeMode}
          </p>
        </div>
        <div className="detail-field">
          <p className="detail-field__label">{copy.resolvedMode}</p>
          <p className="detail-field__value" data-theme-recovery-theme-resolved>
            {snapshot.themeResolved}
          </p>
        </div>
        <div className="detail-field">
          <p className="detail-field__label">{copy.accentPreset}</p>
          <p className="detail-field__value" data-theme-recovery-theme-preset>
            {snapshot.themePreset}
          </p>
        </div>
        <div className="detail-field">
          <p className="detail-field__label">{copy.customSeed}</p>
          <p className="detail-field__value" data-theme-recovery-seed>
            {snapshot.themeCustomSeedHex ?? copy.notSet}
          </p>
        </div>
        <div className="detail-field">
          <p className="detail-field__label">{copy.scopeIsolation}</p>
          <p className="detail-field__value" data-theme-recovery-scope-label>
            {snapshot.scopeIsolationLabel}
          </p>
        </div>
        <div className="detail-field">
          <p className="detail-field__label">{copy.liveBadgeSource}</p>
          <p className="detail-field__value">{badgeSummary.sourceLabel}</p>
        </div>
      </div>

      <div className="detail-note detail-note--neutral">
        <p className="detail-note__label">{copy.scopeNote}</p>
        <p className="supporting-copy" data-theme-recovery-scope-detail>
          {snapshot.scopeIsolationDetail}
        </p>
        <p className="supporting-copy">
          {copy.popupSnapshotPrefix}: {snapshot.popupSnapshotDetail}
        </p>
        <p className="supporting-copy">
          {copy.actionBadgeTitlePrefix}: {badgeSummary.title}
        </p>
      </div>
    </section>
  );
}
