import type { buildOperatorWorkspaceLocalizedCopy } from "../../shared/operator-workspace-localized-copy";
import {
  formatInteractionAuditSignoffRequestBinding,
  formatInteractionAuditSignoffRequestRevision,
  type InteractionAuditSignoffMetadata,
  type InteractionAuditSignoffRequestContext,
} from "../interaction-audit-signoff";

type InteractionAuditSignoffCopy = ReturnType<
  typeof buildOperatorWorkspaceLocalizedCopy
>["interactionAudit"]["signoff"];

type InteractionAuditSignoffSummary = {
  reviewedSurfaceCount: number;
  passSurfaceCount: number;
  followUpSurfaceCount: number;
  completedManualCheckCount: number;
  totalManualCheckCount: number;
};

type InteractionAuditSignoffMetadataField = keyof InteractionAuditSignoffMetadata;

type InteractionAuditSignoffSessionSectionProps = {
  copy: InteractionAuditSignoffCopy;
  signoffMetadata: InteractionAuditSignoffMetadata;
  signoffRequestContext: InteractionAuditSignoffRequestContext;
  signoffSummary: InteractionAuditSignoffSummary;
  signoffSurfaceCount: number;
  onMetadataChange: (
    field: InteractionAuditSignoffMetadataField,
    value: string,
  ) => void;
  onStampReviewedAt: () => void;
};

export function InteractionAuditSignoffSessionSection({
  copy,
  signoffMetadata,
  signoffRequestContext,
  signoffSummary,
  signoffSurfaceCount,
  onMetadataChange,
  onStampReviewedAt,
}: InteractionAuditSignoffSessionSectionProps) {
  return (
    <>
      <div className="status-card__header">
        <div>
          <p className="section-label">{copy.eyebrow}</p>
          <h2 className="section-title">{copy.title}</h2>
        </div>
        <p className="supporting-copy">{copy.detail}</p>
      </div>

      <div className="interaction-audit__signoff-summary">
        <div
          className="source-card__field"
          data-audit-signoff-summary-id="reviewed-surfaces"
        >
          <p className="source-card__label">{copy.reviewedSurfaces}</p>
          <p className="source-card__value" data-audit-signoff-summary-value>
            {signoffSummary.reviewedSurfaceCount} / {signoffSurfaceCount}
          </p>
        </div>
        <div className="source-card__field" data-audit-signoff-summary-id="pass">
          <p className="source-card__label">{copy.pass}</p>
          <p className="source-card__value" data-audit-signoff-summary-value>
            {signoffSummary.passSurfaceCount}
          </p>
        </div>
        <div
          className="source-card__field"
          data-audit-signoff-summary-id="follow-up"
        >
          <p className="source-card__label">{copy.followUp}</p>
          <p className="source-card__value" data-audit-signoff-summary-value>
            {signoffSummary.followUpSurfaceCount}
          </p>
        </div>
        <div
          className="source-card__field"
          data-audit-signoff-summary-id="completed-checks"
        >
          <p className="source-card__label">{copy.completedChecks}</p>
          <p className="source-card__value" data-audit-signoff-summary-value>
            {signoffSummary.completedManualCheckCount} /{" "}
            {signoffSummary.totalManualCheckCount}
          </p>
        </div>
      </div>

      <div className="interaction-audit__signoff-fields">
        <label className="form-field">
          <span className="form-field__label">{copy.reviewerName}</span>
          <input
            className="form-field__control"
            data-audit-session-reviewer
            placeholder={copy.reviewerPlaceholder}
            type="text"
            value={signoffMetadata.reviewerName}
            onChange={(event) => {
              onMetadataChange("reviewerName", event.target.value);
            }}
          />
        </label>

        <label className="form-field">
          <span className="form-field__label">{copy.sessionLabel}</span>
          <input
            className="form-field__control"
            data-audit-session-label
            placeholder={copy.sessionPlaceholder}
            type="text"
            value={signoffMetadata.sessionLabel}
            onChange={(event) => {
              onMetadataChange("sessionLabel", event.target.value);
            }}
          />
        </label>

        <label className="form-field">
          <span className="form-field__label">{copy.reviewedAt}</span>
          <input
            className="form-field__control"
            data-audit-session-reviewed-at
            placeholder={copy.reviewedAtPlaceholder}
            type="text"
            value={signoffMetadata.reviewedAt}
            onChange={(event) => {
              onMetadataChange("reviewedAt", event.target.value);
            }}
          />
        </label>
      </div>

      <div className="interaction-audit__actions interaction-audit__workspace-actions">
        <button
          className="text-button"
          data-audit-session-stamp-time
          type="button"
          onClick={() => {
            onStampReviewedAt();
          }}
        >
          {copy.stampCurrentTime}
        </button>
      </div>

      <div className="detail-note detail-note--neutral" data-audit-session-summary>
        <p className="detail-note__label">{copy.reviewSession}</p>
        <p className="supporting-copy">
          {copy.reviewerPrefix}:{" "}
          {signoffMetadata.reviewerName.trim().length > 0
            ? signoffMetadata.reviewerName.trim()
            : copy.notSet}
          {" · "}
          {copy.sessionPrefix}:{" "}
          {signoffMetadata.sessionLabel.trim().length > 0
            ? signoffMetadata.sessionLabel.trim()
            : copy.notSet}
          {" · "}
          {copy.reviewedAtPrefix}:{" "}
          {signoffMetadata.reviewedAt.trim().length > 0
            ? signoffMetadata.reviewedAt.trim()
            : copy.notSet}
        </p>
        <p className="supporting-copy" data-audit-request-binding-summary>
          {copy.requestBindingPrefix}:{" "}
          {formatInteractionAuditSignoffRequestBinding(signoffRequestContext)}
          {" · "}
          {copy.requestRevisionPrefix}:{" "}
          {formatInteractionAuditSignoffRequestRevision(signoffRequestContext)}
        </p>
      </div>
    </>
  );
}
