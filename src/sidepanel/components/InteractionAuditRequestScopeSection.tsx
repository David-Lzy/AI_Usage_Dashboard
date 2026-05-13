import type { buildOperatorWorkspaceLocalizedCopy } from "../../shared/localized-copy";
import {
  formatInteractionAuditSignoffRequestBinding,
  formatInteractionAuditSignoffRequestRevision,
  type InteractionAuditSignoffRequestContext,
} from "../interaction-audit-signoff";

type InteractionAuditSignoffCopy = ReturnType<
  typeof buildOperatorWorkspaceLocalizedCopy
>["interactionAudit"]["signoff"];

type InteractionAuditRequestScopeCommandsCopy = ReturnType<
  typeof buildOperatorWorkspaceLocalizedCopy
>["interactionAudit"]["requestScopeCommands"];

type InteractionAuditRequestScopeSectionProps = {
  copy: InteractionAuditSignoffCopy;
  commandCopy: InteractionAuditRequestScopeCommandsCopy;
  signoffRequestContext: InteractionAuditSignoffRequestContext;
};

export function InteractionAuditRequestScopeSection({
  commandCopy,
  copy,
  signoffRequestContext,
}: InteractionAuditRequestScopeSectionProps) {
  const boundRequestId = signoffRequestContext.requestId.trim();
  const hasBoundRequest = boundRequestId.length > 0;
  const requestScopeLabel = hasBoundRequest
    ? copy.repoBackedRequest
    : copy.adHocWorkspace;
  const requestPreflightCommand = hasBoundRequest
    ? `npm run interaction-audit:preflight-review-request -- --request-id ${boundRequestId} --input tmp/operator-signoff-export.json`
    : "";
  const requestCompleteCommand = hasBoundRequest
    ? `npm run interaction-audit:complete-review-request -- --request-id ${boundRequestId} --input tmp/operator-signoff-export.json`
    : "";
  const requestArchiveCommand =
    "npm run interaction-audit:archive -- --input tmp/operator-signoff-export.json";

  return (
    <section
      className="detail-note detail-note--neutral interaction-audit__request-scope"
      data-audit-request-scope
      data-audit-request-scope-mode={hasBoundRequest ? "bound" : "adhoc"}
    >
      <div className="interaction-audit__request-scope-header">
        <div>
          <p className="detail-note__label">{copy.requestScope}</p>
          <p className="supporting-copy" data-audit-request-scope-copy>
            {hasBoundRequest ? copy.boundRequestDetail : copy.adHocDetail}
          </p>
        </div>
        <span className="meta-chip" data-audit-request-scope-label>
          {requestScopeLabel}
        </span>
      </div>

      <div className="interaction-audit__signoff-summary">
        <div
          className="source-card__field"
          data-audit-request-scope-summary="binding"
        >
          <p className="source-card__label">{copy.binding}</p>
          <p className="source-card__value">
            {formatInteractionAuditSignoffRequestBinding(signoffRequestContext)}
          </p>
        </div>
        <div
          className="source-card__field"
          data-audit-request-scope-summary="revision"
        >
          <p className="source-card__label">{copy.requestRevision}</p>
          <p className="source-card__value">
            {formatInteractionAuditSignoffRequestRevision(signoffRequestContext)}
          </p>
        </div>
        <div
          className="source-card__field"
          data-audit-request-scope-summary="downloads"
        >
          <p className="source-card__label">{copy.downloadIdentity}</p>
          <p className="source-card__value">
            {hasBoundRequest ? copy.downloadsBound : copy.downloadsAdHoc}
          </p>
        </div>
      </div>

      <div className="interaction-audit__request-scope-commands">
        {hasBoundRequest ? (
          <>
            <div className="interaction-audit__request-scope-command">
              <p className="detail-note__label">
                {commandCopy.preflightNext}
              </p>
              <pre
                className="capture-pre"
                data-audit-request-scope-preflight
              >
                {requestPreflightCommand}
              </pre>
            </div>
            <div className="interaction-audit__request-scope-command">
              <p className="detail-note__label">{commandCopy.completeNext}</p>
              <pre className="capture-pre" data-audit-request-scope-complete>
                {requestCompleteCommand}
              </pre>
            </div>
          </>
        ) : (
          <div className="interaction-audit__request-scope-command">
            <p className="detail-note__label">{commandCopy.archiveNext}</p>
            <pre className="capture-pre" data-audit-request-scope-archive>
              {requestArchiveCommand}
            </pre>
          </div>
        )}
      </div>
    </section>
  );
}
