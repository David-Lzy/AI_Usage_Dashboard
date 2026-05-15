import type { buildOperatorWorkspaceLocalizedCopy } from "../../shared/operator-workspace-localized-copy";
import type {
  InteractionAuditReviewQueue,
  InteractionAuditReviewQueueItem,
  InteractionAuditReviewQueueStatus,
} from "../interaction-audit-review-queue";
import type { InteractionAuditSignoffStatus } from "../interaction-audit-signoff";

type InteractionAuditReviewQueueCopy = ReturnType<
  typeof buildOperatorWorkspaceLocalizedCopy
>["interactionAudit"]["reviewQueue"];

type InteractionAuditSurfaceDefinitionsCopy = ReturnType<
  typeof buildOperatorWorkspaceLocalizedCopy
>["interactionAudit"]["surfaceDefinitions"];

type InteractionAuditReviewQueueSectionProps = {
  copy: InteractionAuditReviewQueueCopy;
  surfaceDefinitionsCopy: InteractionAuditSurfaceDefinitionsCopy;
  nextReviewTarget: InteractionAuditReviewQueueItem | null;
  reviewQueue: InteractionAuditReviewQueue;
  onJumpToSurface: (surfaceId: string) => void;
};

function getQueueStatusLabel(
  copy: InteractionAuditReviewQueueCopy,
  status: InteractionAuditReviewQueueStatus,
) {
  switch (status) {
    case "follow_up":
      return copy.queueStatus.followUp;
    case "not_reviewed":
      return copy.queueStatus.notReviewed;
    case "pending_checks":
      return copy.queueStatus.pendingChecks;
    case "ready":
      return copy.queueStatus.ready;
    default:
      return copy.queueStatus.notReviewed;
  }
}

function getSignoffStatusLabel(
  copy: InteractionAuditReviewQueueCopy,
  status: InteractionAuditSignoffStatus,
) {
  switch (status) {
    case "pass":
      return copy.signoffStatus.pass;
    case "follow_up":
      return copy.signoffStatus.followUp;
    case "not_reviewed":
    default:
      return copy.signoffStatus.notReviewed;
  }
}

function getSurfaceDisplayTitle(
  surfaceDefinitionsCopy: InteractionAuditSurfaceDefinitionsCopy,
  surfaceId: string,
  fallbackTitle: string,
) {
  return surfaceDefinitionsCopy[surfaceId]?.title ?? fallbackTitle;
}

export function InteractionAuditReviewQueueSection({
  copy,
  surfaceDefinitionsCopy,
  nextReviewTarget,
  reviewQueue,
  onJumpToSurface,
}: InteractionAuditReviewQueueSectionProps) {
  const nextReviewTargetTitle = nextReviewTarget
    ? getSurfaceDisplayTitle(
        surfaceDefinitionsCopy,
        nextReviewTarget.id,
        nextReviewTarget.title,
      )
    : null;

  return (
    <section
      className="detail-note detail-note--neutral interaction-audit__review-queue"
      data-audit-review-queue
    >
      <div className="interaction-audit__queue-header">
        <div>
          <p className="detail-note__label">{copy.label}</p>
          <p className="supporting-copy">
            {copy.detail}
          </p>
        </div>
        <button
          className="text-button"
          data-audit-review-queue-next-target
          disabled={nextReviewTarget === null}
          type="button"
          onClick={() => {
            if (nextReviewTarget) {
              onJumpToSurface(nextReviewTarget.id);
            }
          }}
        >
          {nextReviewTarget
            ? copy.jumpToSurface(nextReviewTargetTitle ?? nextReviewTarget.title)
            : copy.allSurfacesReady}
        </button>
      </div>

      <div className="interaction-audit__signoff-summary">
        <div className="source-card__field" data-audit-review-queue-summary-id="next">
          <p className="source-card__label">{copy.nextTarget}</p>
          <p
            className="source-card__value"
            data-audit-review-queue-summary-value
          >
            {nextReviewTargetTitle ?? copy.allReady}
          </p>
        </div>
        <div
          className="source-card__field"
          data-audit-review-queue-summary-id="follow-up"
        >
          <p className="source-card__label">{copy.followUp}</p>
          <p
            className="source-card__value"
            data-audit-review-queue-summary-value
          >
            {reviewQueue.followUpCount}
          </p>
        </div>
        <div
          className="source-card__field"
          data-audit-review-queue-summary-id="not-reviewed"
        >
          <p className="source-card__label">{copy.notReviewed}</p>
          <p
            className="source-card__value"
            data-audit-review-queue-summary-value
          >
            {reviewQueue.notReviewedCount}
          </p>
        </div>
        <div
          className="source-card__field"
          data-audit-review-queue-summary-id="pending-checks"
        >
          <p className="source-card__label">{copy.pendingCheckSurfaces}</p>
          <p
            className="source-card__value"
            data-audit-review-queue-summary-value
          >
            {reviewQueue.pendingCheckSurfaceCount}
          </p>
        </div>
        <div
          className="source-card__field"
          data-audit-review-queue-summary-id="ready"
        >
          <p className="source-card__label">{copy.ready}</p>
          <p
            className="source-card__value"
            data-audit-review-queue-summary-value
          >
            {reviewQueue.readyCount}
          </p>
        </div>
      </div>

      <ul className="interaction-audit__queue-list">
        {reviewQueue.items.map((item) => (
          <li
            key={item.id}
            className="interaction-audit__queue-item"
            data-audit-review-queue-item={item.id}
            data-audit-review-queue-status={item.queueStatus}
          >
            <div className="interaction-audit__queue-item-header">
              <div>
                <p className="interaction-audit__queue-item-title">
                  {getSurfaceDisplayTitle(
                    surfaceDefinitionsCopy,
                    item.id,
                    item.title,
                  )}
                </p>
                <p className="interaction-audit__queue-item-meta">
                  {copy.itemMeta({
                    signoffLabel: getSignoffStatusLabel(
                      copy,
                      item.signoffStatus,
                    ),
                    completedManualCheckCount: item.completedManualCheckCount,
                    totalManualCheckCount: item.totalManualCheckCount,
                  })}
                </p>
              </div>
              <span className="meta-chip interaction-audit__queue-chip">
                {getQueueStatusLabel(copy, item.queueStatus)}
              </span>
            </div>

            <div className="interaction-audit__actions">
              <button
                className="text-button"
                data-audit-review-queue-jump={item.id}
                type="button"
                onClick={() => {
                  onJumpToSurface(item.id);
                }}
              >
                {copy.jumpToSurfaceAction}
              </button>
              <span
                className="supporting-copy interaction-audit__queue-item-meta"
                data-audit-review-queue-checks={item.id}
              >
                {copy.pendingChecks(item.pendingManualCheckCount)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
