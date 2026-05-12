import type { buildOperatorWorkspaceLocalizedCopy } from "../../shared/localized-copy";
import type { ThemeRecoveryReviewRequestContext } from "../theme-recovery-review";

type ThemeRecoveryRequestScopeCopy = ReturnType<
  typeof buildOperatorWorkspaceLocalizedCopy
>["themeRecovery"]["requestScope"];

type ThemeRecoveryRequestScopeSectionProps = {
  copy: ThemeRecoveryRequestScopeCopy;
  requestContext: ThemeRecoveryReviewRequestContext | null;
};

export function ThemeRecoveryRequestScopeSection({
  copy,
  requestContext,
}: ThemeRecoveryRequestScopeSectionProps) {
  if (!requestContext) {
    return (
      <section
        className="detail-note detail-note--warning"
        data-theme-recovery-request-scope="ad-hoc"
      >
        <p className="detail-note__label">{copy.adHocTitle}</p>
        <p className="supporting-copy">{copy.adHocDetail}</p>
      </section>
    );
  }

  return (
    <section className="status-card" data-theme-recovery-request-scope="bound">
      <div className="dashboard-section__header">
        <div>
          <p className="section-label">{copy.eyebrow}</p>
          <h2 className="section-title">{copy.title}</h2>
        </div>
        <p className="supporting-copy">{copy.detail}</p>
      </div>

      <div className="detail-grid">
        <div className="detail-field">
          <p className="detail-field__label">{copy.requestId}</p>
          <p className="detail-field__value" data-theme-recovery-request-id>
            {requestContext.requestId}
          </p>
        </div>
        <div className="detail-field">
          <p className="detail-field__label">{copy.createdAt}</p>
          <p
            className="detail-field__value"
            data-theme-recovery-request-created-at
          >
            {requestContext.requestCreatedAt}
          </p>
        </div>
      </div>

      <div className="detail-note detail-note--neutral">
        <p className="detail-note__label">{copy.boundWorkspaceRoute}</p>
        <p className="supporting-copy" data-theme-recovery-request-route>
          {requestContext.requestBoundWorkspaceRoute}
        </p>
      </div>
    </section>
  );
}
