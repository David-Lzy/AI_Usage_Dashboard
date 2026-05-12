export type InteractionAuditWorkspaceFeedback = {
  tone: "neutral" | "warning";
  message: string;
};

type InteractionAuditWorkspaceControlsSectionProps = {
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
          Copy signoff draft
        </button>
        <button
          className="text-button"
          data-audit-download-signoff-draft
          type="button"
          onClick={onDownloadSignoffDraft}
        >
          Download signoff draft
        </button>
        <button
          className="text-button"
          data-audit-copy-signoff-json
          type="button"
          onClick={() => {
            void onCopySignoffJson();
          }}
        >
          Copy signoff JSON
        </button>
        <button
          className="text-button"
          data-audit-download-signoff-json
          type="button"
          onClick={onDownloadSignoffJson}
        >
          Download signoff JSON
        </button>
        <button
          className="text-button"
          data-audit-reset-signoff
          type="button"
          onClick={onResetSignoffWorkspace}
        >
          Reset signoff
        </button>
      </div>

      <details
        className="source-card__details"
        data-audit-signoff-import-details
      >
        <summary className="source-card__details-toggle">
          Import signoff JSON
        </summary>
        <div className="source-card__details-body interaction-audit__signoff-fields">
          <label className="form-field">
            <span className="form-field__label">Pasted signoff JSON</span>
            <textarea
              className="form-field__control interaction-audit__notes-control"
              data-audit-import-textarea
              placeholder="Paste exported signoff JSON to restore a workspace."
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
              Apply imported signoff
            </button>
            <button
              className="text-button"
              data-audit-clear-import
              type="button"
              onClick={onClearImport}
            >
              Clear pasted JSON
            </button>
          </div>
        </div>
      </details>

      <div className={feedbackClassName} data-audit-signoff-feedback>
        <p className="detail-note__label">Workspace state</p>
        <p className="supporting-copy">{workspaceFeedback.message}</p>
      </div>

      <details
        className="source-card__details"
        data-audit-signoff-preview-details
      >
        <summary className="source-card__details-toggle">
          Current signoff draft
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
