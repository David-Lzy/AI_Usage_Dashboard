import type { buildOperatorWorkspaceLocalizedCopy } from "../../shared/localized-copy";

export type InteractionAuditWorkspaceFeedback = {
  tone: "neutral" | "warning";
  message: string;
};

export type InteractionAuditWorkspaceControlsCopy = ReturnType<
  typeof buildOperatorWorkspaceLocalizedCopy
>["interactionAudit"]["workspaceControls"];

type InteractionAuditWorkspaceControlsSectionProps = {
  copy: InteractionAuditWorkspaceControlsCopy;
  importDraft: string;
  signoffDraft: string;
  workspaceFeedback: InteractionAuditWorkspaceFeedback;
  onApplyImport: () => void;
  onClearImport: () => void;
  onCopySignoffDraft: () => void | Promise<void>;
  onCopySignoffJson: () => void | Promise<void>;
  onDownloadSignoffDraft: () => void;
  onDownloadSignoffJson: () => void;
  onImportDraftChange: (value: string) => void;
  onResetSignoffWorkspace: () => void;
};

export function InteractionAuditWorkspaceControlsSection({
  copy,
  importDraft,
  signoffDraft,
  workspaceFeedback,
  onApplyImport,
  onClearImport,
  onCopySignoffDraft,
  onCopySignoffJson,
  onDownloadSignoffDraft,
  onDownloadSignoffJson,
  onImportDraftChange,
  onResetSignoffWorkspace,
}: InteractionAuditWorkspaceControlsSectionProps) {
  const feedbackClassName =
    workspaceFeedback.tone === "warning"
      ? "detail-note detail-note--warning"
      : "detail-note detail-note--neutral";

  return (
    <>
      <div className="interaction-audit__actions interaction-audit__workspace-actions">
        <button
          className="text-button"
          data-audit-copy-signoff-draft
          type="button"
          onClick={() => {
            void onCopySignoffDraft();
          }}
        >
          {copy.copySignoffDraft}
        </button>
        <button
          className="text-button"
          data-audit-download-signoff-draft
          type="button"
          onClick={onDownloadSignoffDraft}
        >
          {copy.downloadSignoffDraft}
        </button>
        <button
          className="text-button"
          data-audit-copy-signoff-json
          type="button"
          onClick={() => {
            void onCopySignoffJson();
          }}
        >
          {copy.copySignoffJson}
        </button>
        <button
          className="text-button"
          data-audit-download-signoff-json
          type="button"
          onClick={onDownloadSignoffJson}
        >
          {copy.downloadSignoffJson}
        </button>
        <button
          className="text-button"
          data-audit-reset-signoff
          type="button"
          onClick={onResetSignoffWorkspace}
        >
          {copy.resetSignoff}
        </button>
      </div>

      <details
        className="source-card__details"
        data-audit-signoff-import-details
      >
        <summary className="source-card__details-toggle">
          {copy.importSignoffJson}
        </summary>
        <div className="source-card__details-body interaction-audit__signoff-fields">
          <label className="form-field">
            <span className="form-field__label">{copy.pastedSignoffJson}</span>
            <textarea
              className="form-field__control interaction-audit__notes-control"
              data-audit-import-textarea
              placeholder={copy.importPlaceholder}
              rows={8}
              value={importDraft}
              onChange={(event) => {
                onImportDraftChange(event.target.value);
              }}
            />
          </label>

          <div className="interaction-audit__actions">
            <button
              className="text-button"
              data-audit-apply-import
              type="button"
              onClick={onApplyImport}
            >
              {copy.applyImportedSignoff}
            </button>
            <button
              className="text-button"
              data-audit-clear-import
              type="button"
              onClick={onClearImport}
            >
              {copy.clearPastedJson}
            </button>
          </div>
        </div>
      </details>

      <div className={feedbackClassName} data-audit-signoff-feedback>
        <p className="detail-note__label">{copy.workspaceState}</p>
        <p className="supporting-copy">{workspaceFeedback.message}</p>
      </div>

      <details
        className="source-card__details"
        data-audit-signoff-preview-details
      >
        <summary className="source-card__details-toggle">
          {copy.currentSignoffDraft}
        </summary>
        <div className="source-card__details-body">
          <pre className="capture-pre" data-audit-signoff-preview>
            {signoffDraft}
          </pre>
        </div>
      </details>
    </>
  );
}
