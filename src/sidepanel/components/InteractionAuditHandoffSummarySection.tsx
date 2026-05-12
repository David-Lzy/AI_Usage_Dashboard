import type { InteractionAuditSignoffHandoffSummary } from "../interaction-audit-signoff";

type InteractionAuditHandoffSummarySectionProps = {
  handoffDraft: string;
  handoffSummary: InteractionAuditSignoffHandoffSummary;
  onCopyHandoffSummary: () => void | Promise<void>;
  onDownloadHandoffSummary: () => void;
};

export function InteractionAuditHandoffSummarySection({
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
          <p className="detail-note__label">Handoff Summary</p>
          <p className="supporting-copy">
            Use this summary to see what still blocks final operator signoff
            before exporting the current workspace conclusions.
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
          Copy handoff summary
        </button>
        <button
          className="text-button"
          data-audit-download-handoff-summary
          type="button"
          onClick={() => {
            onDownloadHandoffSummary();
          }}
        >
          Download handoff summary
        </button>
      </div>

      <div className="interaction-audit__signoff-summary">
        <div className="source-card__field" data-audit-handoff-summary-id="ready">
          <p className="source-card__label">Ready for signoff</p>
          <p className="source-card__value" data-audit-handoff-summary-value>
            {handoffSummary.readyForSignoff ? "Ready" : "Not ready"}
          </p>
        </div>
        <div
          className="source-card__field"
          data-audit-handoff-summary-id="follow-up"
        >
          <p className="source-card__label">Follow-up surfaces</p>
          <p className="source-card__value" data-audit-handoff-summary-value>
            {handoffSummary.followUpSurfaceCount}
          </p>
        </div>
        <div
          className="source-card__field"
          data-audit-handoff-summary-id="not-reviewed"
        >
          <p className="source-card__label">Not reviewed</p>
          <p className="source-card__value" data-audit-handoff-summary-value>
            {handoffSummary.notReviewedSurfaceCount}
          </p>
        </div>
        <div
          className="source-card__field"
          data-audit-handoff-summary-id="pending-checks"
        >
          <p className="source-card__label">Pending checks</p>
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
            ? "Ready for final signoff"
            : "Outstanding review work"}
        </p>
        <p className="supporting-copy">
          {handoffSummary.readyForSignoff
            ? "All audit surfaces are reviewed, no follow-up state remains, and every manual check is complete."
            : `${handoffSummary.followUpSurfaceCount + handoffSummary.notReviewedSurfaceCount} surfaces still need review attention, and ${handoffSummary.pendingManualCheckCount} manual checks remain incomplete.`}
        </p>
      </div>

      <div className="interaction-audit__handoff-groups">
        <div className="interaction-audit__handoff-group">
          <p className="detail-note__label">Follow-up Required</p>
          <ul
            className="interaction-audit__handoff-list"
            data-audit-handoff-follow-up-list
          >
            {handoffSummary.followUpSurfaces.length === 0 ? (
              <li className="interaction-audit__handoff-item">
                <p className="interaction-audit__handoff-item-title">None</p>
              </li>
            ) : (
              handoffSummary.followUpSurfaces.map((surface) => (
                <li
                  key={`follow-up-${surface.id}`}
                  className="interaction-audit__handoff-item"
                  data-audit-handoff-follow-up-item={surface.id}
                >
                  <p className="interaction-audit__handoff-item-title">
                    {surface.title}
                  </p>
                  <p className="interaction-audit__handoff-item-meta">
                    Pending checks: {surface.pendingManualChecks.length} /{" "}
                    {surface.totalManualCheckCount}
                  </p>
                  <p className="supporting-copy">
                    {surface.operatorNotes.length > 0
                      ? surface.operatorNotes
                      : "No operator notes recorded yet."}
                  </p>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="interaction-audit__handoff-group">
          <p className="detail-note__label">Not Reviewed</p>
          <ul
            className="interaction-audit__handoff-list"
            data-audit-handoff-not-reviewed-list
          >
            {handoffSummary.notReviewedSurfaces.length === 0 ? (
              <li className="interaction-audit__handoff-item">
                <p className="interaction-audit__handoff-item-title">None</p>
              </li>
            ) : (
              handoffSummary.notReviewedSurfaces.map((surface) => (
                <li
                  key={`not-reviewed-${surface.id}`}
                  className="interaction-audit__handoff-item"
                  data-audit-handoff-not-reviewed-item={surface.id}
                >
                  <p className="interaction-audit__handoff-item-title">
                    {surface.title}
                  </p>
                  <p className="interaction-audit__handoff-item-meta">
                    Pending checks: {surface.pendingManualChecks.length} /{" "}
                    {surface.totalManualCheckCount}
                  </p>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="interaction-audit__handoff-group">
          <p className="detail-note__label">Pending Manual Checks</p>
          <ul
            className="interaction-audit__handoff-list"
            data-audit-handoff-pending-list
          >
            {handoffSummary.surfacesWithPendingChecks.length === 0 ? (
              <li className="interaction-audit__handoff-item">
                <p className="interaction-audit__handoff-item-title">None</p>
              </li>
            ) : (
              handoffSummary.surfacesWithPendingChecks.map((surface) => (
                <li
                  key={`pending-${surface.id}`}
                  className="interaction-audit__handoff-item"
                  data-audit-handoff-pending-item={surface.id}
                >
                  <p className="interaction-audit__handoff-item-title">
                    {surface.title}
                  </p>
                  <p className="interaction-audit__handoff-item-meta">
                    {surface.pendingManualChecks.length} pending of{" "}
                    {surface.totalManualCheckCount}
                  </p>
                  <ul className="interaction-audit__handoff-check-list">
                    {surface.pendingManualChecks.map((check) => (
                      <li key={`${surface.id}-${check}`}>{check}</li>
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
          Current handoff summary
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
          Operator handoff workflow
        </summary>
        <div
          className="source-card__details-body interaction-audit__operator-workflow"
          data-audit-operator-workflow
        >
          <ul className="feature-list interaction-audit__checklist">
            <li>
              Finish the current review state in the audit hub or import an
              existing signoff JSON snapshot.
            </li>
            <li>
              Fill the review-session metadata so the export records reviewer,
              session label, and review time.
            </li>
            <li>
              Use `Download signoff JSON` for a direct local file, or `Copy
              signoff JSON` if the current environment cannot download files.
            </li>
            <li>
              Keep the downloaded or pasted file under a local path such as
              `tmp/operator-signoff-export.json`.
            </li>
            <li>
              Run the bundle command below to package the current export with
              the latest preset evidence references and preserved review-session
              metadata.
            </li>
          </ul>
          <pre className="capture-pre" data-audit-operator-bundle-command>
            npm run interaction-audit:bundle -- --input tmp/operator-signoff-export.json --output-dir tmp/operator-handoff-bundle
          </pre>
        </div>
      </details>
    </section>
  );
}
