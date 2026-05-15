import type { buildOperatorWorkspaceLocalizedCopy } from "../../shared/operator-workspace-localized-copy";
import type { InteractionAuditSignoffHandoffSummary } from "../interaction-audit-signoff";
import { INTERACTION_AUDIT_SIGNOFF_SURFACES } from "../interaction-audit-surfaces";

type InteractionAuditHandoffSummaryCopy = ReturnType<
  typeof buildOperatorWorkspaceLocalizedCopy
>["interactionAudit"]["handoffSummary"];

type InteractionAuditSurfaceDefinitionsCopy = ReturnType<
  typeof buildOperatorWorkspaceLocalizedCopy
>["interactionAudit"]["surfaceDefinitions"];

type InteractionAuditHandoffSummarySectionProps = {
  copy: InteractionAuditHandoffSummaryCopy;
  surfaceDefinitionsCopy: InteractionAuditSurfaceDefinitionsCopy;
  handoffDraft: string;
  handoffSummary: InteractionAuditSignoffHandoffSummary;
  onCopyHandoffSummary: () => void | Promise<void>;
  onDownloadHandoffSummary: () => void;
};

const SOURCE_SURFACES_BY_ID = new Map(
  INTERACTION_AUDIT_SIGNOFF_SURFACES.map((surface) => [surface.id, surface]),
);

function getSurfaceDisplayTitle(
  surfaceDefinitionsCopy: InteractionAuditSurfaceDefinitionsCopy,
  surfaceId: string,
  fallbackTitle: string,
) {
  return surfaceDefinitionsCopy[surfaceId]?.title ?? fallbackTitle;
}

function getManualCheckDisplayText(
  surfaceDefinitionsCopy: InteractionAuditSurfaceDefinitionsCopy,
  surfaceId: string,
  sourceCheck: string,
) {
  const sourceSurface = SOURCE_SURFACES_BY_ID.get(surfaceId);
  const sourceCheckIndex = sourceSurface?.manualChecks.indexOf(sourceCheck) ?? -1;

  if (sourceCheckIndex < 0) {
    return sourceCheck;
  }

  return (
    surfaceDefinitionsCopy[surfaceId]?.manualChecks[sourceCheckIndex] ??
    sourceCheck
  );
}

export function InteractionAuditHandoffSummarySection({
  copy,
  surfaceDefinitionsCopy,
  handoffDraft,
  handoffSummary,
  onCopyHandoffSummary,
  onDownloadHandoffSummary,
}: InteractionAuditHandoffSummarySectionProps) {
  return (
    <section
      className="detail-note detail-note--neutral interaction-audit__handoff-summary"
      data-audit-handoff-summary
    >
      <div className="interaction-audit__handoff-header">
        <div>
          <p className="detail-note__label">{copy.label}</p>
          <p className="supporting-copy">
            {copy.detail}
          </p>
        </div>
        <button
          className="text-button"
          data-audit-copy-handoff-summary
          type="button"
          onClick={() => {
            void onCopyHandoffSummary();
          }}
        >
          {copy.copyAction}
        </button>
        <button
          className="text-button"
          data-audit-download-handoff-summary
          type="button"
          onClick={() => {
            onDownloadHandoffSummary();
          }}
        >
          {copy.downloadAction}
        </button>
      </div>

      <div className="interaction-audit__signoff-summary">
        <div className="source-card__field" data-audit-handoff-summary-id="ready">
          <p className="source-card__label">{copy.readyForSignoff}</p>
          <p className="source-card__value" data-audit-handoff-summary-value>
            {handoffSummary.readyForSignoff ? copy.ready : copy.notReady}
          </p>
        </div>
        <div
          className="source-card__field"
          data-audit-handoff-summary-id="follow-up"
        >
          <p className="source-card__label">{copy.followUpSurfaces}</p>
          <p className="source-card__value" data-audit-handoff-summary-value>
            {handoffSummary.followUpSurfaceCount}
          </p>
        </div>
        <div
          className="source-card__field"
          data-audit-handoff-summary-id="not-reviewed"
        >
          <p className="source-card__label">{copy.notReviewed}</p>
          <p className="source-card__value" data-audit-handoff-summary-value>
            {handoffSummary.notReviewedSurfaceCount}
          </p>
        </div>
        <div
          className="source-card__field"
          data-audit-handoff-summary-id="pending-checks"
        >
          <p className="source-card__label">{copy.pendingChecks}</p>
          <p className="source-card__value" data-audit-handoff-summary-value>
            {handoffSummary.pendingManualCheckCount} /{" "}
            {handoffSummary.totalManualCheckCount}
          </p>
        </div>
      </div>

      <div
        className={`detail-note ${handoffSummary.readyForSignoff ? "detail-note--neutral" : "detail-note--warning"}`}
        data-audit-handoff-status
      >
        <p className="detail-note__label">
          {handoffSummary.readyForSignoff
            ? copy.readyStatusLabel
            : copy.outstandingStatusLabel}
        </p>
        <p className="supporting-copy">
          {handoffSummary.readyForSignoff
            ? copy.readyStatusDetail
            : copy.outstandingStatusDetail({
                reviewSurfaceCount:
                  handoffSummary.followUpSurfaceCount +
                  handoffSummary.notReviewedSurfaceCount,
                pendingManualCheckCount:
                  handoffSummary.pendingManualCheckCount,
              })}
        </p>
      </div>

      <div className="interaction-audit__handoff-groups">
        <div className="interaction-audit__handoff-group">
          <p className="detail-note__label">{copy.followUpRequired}</p>
          <ul
            className="interaction-audit__handoff-list"
            data-audit-handoff-follow-up-list
          >
            {handoffSummary.followUpSurfaces.length === 0 ? (
              <li className="interaction-audit__handoff-item">
                <p className="interaction-audit__handoff-item-title">
                  {copy.none}
                </p>
              </li>
            ) : (
              handoffSummary.followUpSurfaces.map((surface) => (
                <li
                  key={`follow-up-${surface.id}`}
                  className="interaction-audit__handoff-item"
                  data-audit-handoff-follow-up-item={surface.id}
                >
                  <p className="interaction-audit__handoff-item-title">
                    {getSurfaceDisplayTitle(
                      surfaceDefinitionsCopy,
                      surface.id,
                      surface.title,
                    )}
                  </p>
                  <p className="interaction-audit__handoff-item-meta">
                    {copy.pendingChecksMeta({
                      pendingManualCheckCount:
                        surface.pendingManualChecks.length,
                      totalManualCheckCount: surface.totalManualCheckCount,
                    })}
                  </p>
                  <p className="supporting-copy">
                    {surface.operatorNotes.length > 0
                      ? surface.operatorNotes
                      : copy.noOperatorNotes}
                  </p>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="interaction-audit__handoff-group">
          <p className="detail-note__label">{copy.notReviewedGroup}</p>
          <ul
            className="interaction-audit__handoff-list"
            data-audit-handoff-not-reviewed-list
          >
            {handoffSummary.notReviewedSurfaces.length === 0 ? (
              <li className="interaction-audit__handoff-item">
                <p className="interaction-audit__handoff-item-title">
                  {copy.none}
                </p>
              </li>
            ) : (
              handoffSummary.notReviewedSurfaces.map((surface) => (
                <li
                  key={`not-reviewed-${surface.id}`}
                  className="interaction-audit__handoff-item"
                  data-audit-handoff-not-reviewed-item={surface.id}
                >
                  <p className="interaction-audit__handoff-item-title">
                    {getSurfaceDisplayTitle(
                      surfaceDefinitionsCopy,
                      surface.id,
                      surface.title,
                    )}
                  </p>
                  <p className="interaction-audit__handoff-item-meta">
                    {copy.pendingChecksMeta({
                      pendingManualCheckCount:
                        surface.pendingManualChecks.length,
                      totalManualCheckCount: surface.totalManualCheckCount,
                    })}
                  </p>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="interaction-audit__handoff-group">
          <p className="detail-note__label">{copy.pendingManualChecks}</p>
          <ul
            className="interaction-audit__handoff-list"
            data-audit-handoff-pending-list
          >
            {handoffSummary.surfacesWithPendingChecks.length === 0 ? (
              <li className="interaction-audit__handoff-item">
                <p className="interaction-audit__handoff-item-title">
                  {copy.none}
                </p>
              </li>
            ) : (
              handoffSummary.surfacesWithPendingChecks.map((surface) => (
                <li
                  key={`pending-${surface.id}`}
                  className="interaction-audit__handoff-item"
                  data-audit-handoff-pending-item={surface.id}
                >
                  <p className="interaction-audit__handoff-item-title">
                    {getSurfaceDisplayTitle(
                      surfaceDefinitionsCopy,
                      surface.id,
                      surface.title,
                    )}
                  </p>
                  <p className="interaction-audit__handoff-item-meta">
                    {copy.pendingOfTotal({
                      pendingManualCheckCount:
                        surface.pendingManualChecks.length,
                      totalManualCheckCount: surface.totalManualCheckCount,
                    })}
                  </p>
                  <ul className="interaction-audit__handoff-check-list">
                    {surface.pendingManualChecks.map((check) => (
                      <li key={`${surface.id}-${check}`}>
                        {getManualCheckDisplayText(
                          surfaceDefinitionsCopy,
                          surface.id,
                          check,
                        )}
                      </li>
                    ))}
                  </ul>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <details
        className="source-card__details"
        data-audit-handoff-preview-details
      >
        <summary className="source-card__details-toggle">
          {copy.currentHandoffSummary}
        </summary>
        <div className="source-card__details-body">
          <pre className="capture-pre" data-audit-handoff-preview>
            {handoffDraft}
          </pre>
        </div>
      </details>

      <details
        className="source-card__details"
        data-audit-operator-workflow-details
      >
        <summary className="source-card__details-toggle">
          {copy.operatorHandoffWorkflow}
        </summary>
        <div
          className="source-card__details-body interaction-audit__operator-workflow"
          data-audit-operator-workflow
        >
          <ul className="feature-list interaction-audit__checklist">
            {copy.workflowSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
          <pre className="capture-pre" data-audit-operator-bundle-command>
            npm run interaction-audit:bundle -- --input tmp/operator-signoff-export.json --output-dir tmp/operator-handoff-bundle
          </pre>
        </div>
      </details>
    </section>
  );
}
