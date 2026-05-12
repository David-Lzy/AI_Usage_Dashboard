import type {
  InteractionAuditReviewQueue,
  InteractionAuditReviewQueueItem,
} from "../interaction-audit-review-queue";

type InteractionAuditReviewQueueSectionProps = {
  nextReviewTarget: InteractionAuditReviewQueueItem | null;
  reviewQueue: InteractionAuditReviewQueue;
  onJumpToSurface: (surfaceId: string) => void;
};

export function InteractionAuditReviewQueueSection({
  nextReviewTarget,
  reviewQueue,
  onJumpToSurface,
}: InteractionAuditReviewQueueSectionProps) {
  return (
    <section
      className="detail-note detail-note--neutral interaction-audit__review-queue"
      data-audit-review-queue
    >
      <div className="interaction-audit__queue-header">
        <div>
          <p className="detail-note__label">Review Queue</p>
          <p className="supporting-copy">
            The queue keeps follow-up surfaces first, then not-reviewed
            surfaces, then pass states with pending checks, so a reviewer can
            move through the unresolved work without scanning the whole page.
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
            ? `Jump to ${nextReviewTarget.title}`
            : "All surfaces ready"}
        </button>
      </div>

      <div className="interaction-audit__signoff-summary">
        <div className="source-card__field" data-audit-review-queue-summary-id="next">
          <p className="source-card__label">Next target</p>
          <p
            className="source-card__value"
            data-audit-review-queue-summary-value
          >
            {nextReviewTarget ? nextReviewTarget.title : "All ready"}
          </p>
        </div>
        <div
          className="source-card__field"
          data-audit-review-queue-summary-id="follow-up"
        >
          <p className="source-card__label">Follow-up</p>
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
          <p className="source-card__label">Not reviewed</p>
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
          <p className="source-card__label">Pending-check surfaces</p>
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
          <p className="source-card__label">Ready</p>
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
                  {item.title}
                </p>
                <p className="interaction-audit__queue-item-meta">
                  Signoff: {item.signoffLabel} · Checks:{" "}
                  {item.completedManualCheckCount} / {item.totalManualCheckCount}
                </p>
              </div>
              <span className="meta-chip interaction-audit__queue-chip">
                {item.queueLabel}
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
                Jump to surface
              </button>
              <span
                className="supporting-copy interaction-audit__queue-item-meta"
                data-audit-review-queue-checks={item.id}
              >
                Pending checks: {item.pendingManualCheckCount}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
