import type { buildOperatorWorkspaceLocalizedCopy } from "../../shared/localized-copy";

type ThemeRecoveryCopy = ReturnType<
  typeof buildOperatorWorkspaceLocalizedCopy
>["themeRecovery"];

export type ThemeRecoveryWorkspaceFeedback = {
  tone: "neutral" | "warning" | "error";
  message: string;
};

type ThemeRecoveryOutputsSectionProps = {
  copy: ThemeRecoveryCopy["outputs"];
  jsonDraft: string;
  summaryDraft: string;
  workspaceFeedback: ThemeRecoveryWorkspaceFeedback | null;
  onCopyJson: () => void | Promise<void>;
  onCopySummary: () => void | Promise<void>;
  onDownloadJson: () => void;
  onDownloadSummary: () => void;
  onOpenSettingsTab: () => void;
};

function feedbackToneToNoteClass(
  tone: ThemeRecoveryWorkspaceFeedback["tone"],
): "detail-note--neutral" | "detail-note--warning" | "detail-note--error" {
  switch (tone) {
    case "warning":
      return "detail-note--warning";
    case "error":
      return "detail-note--error";
    default:
      return "detail-note--neutral";
  }
}

export function ThemeRecoveryOutputsSection({
  copy,
  jsonDraft,
  summaryDraft,
  workspaceFeedback,
  onCopyJson,
  onCopySummary,
  onDownloadJson,
  onDownloadSummary,
  onOpenSettingsTab,
}: ThemeRecoveryOutputsSectionProps) {
  return (
    <>
      <section className="status-card">
        <div className="status-card__header">
          <div>
            <p className="section-label">{copy.eyebrow}</p>
            <h2 className="section-title">{copy.title}</h2>
          </div>
          <p className="supporting-copy">{copy.detail}</p>
        </div>

        <div className="interaction-audit__actions theme-recovery-copy-actions">
          <button
            className="text-button"
            data-theme-recovery-copy="summary"
            type="button"
            onClick={() => {
              void onCopySummary();
            }}
          >
            {copy.copySummary}
          </button>
          <button
            className="text-button"
            data-theme-recovery-download="summary"
            type="button"
            onClick={onDownloadSummary}
          >
            {copy.downloadSummary}
          </button>
          <button
            className="text-button"
            data-theme-recovery-copy="json"
            type="button"
            onClick={() => {
              void onCopyJson();
            }}
          >
            {copy.copyJson}
          </button>
          <button
            className="text-button"
            data-theme-recovery-download="json"
            type="button"
            onClick={onDownloadJson}
          >
            {copy.downloadJson}
          </button>
          <button
            className="text-button"
            type="button"
            onClick={onOpenSettingsTab}
          >
            {copy.openSettingsTab}
          </button>
        </div>

        <div className="theme-recovery-export-grid">
          <div className="theme-recovery-export-panel">
            <p className="detail-note__label">{copy.summaryDraft}</p>
            <pre className="capture-pre" data-theme-recovery-summary-draft>
              {summaryDraft}
            </pre>
          </div>

          <div className="theme-recovery-export-panel">
            <p className="detail-note__label">{copy.jsonExport}</p>
            <pre className="capture-pre" data-theme-recovery-json-draft>
              {jsonDraft}
            </pre>
          </div>
        </div>
      </section>

      {workspaceFeedback ? (
        <section
          className={`detail-note ${feedbackToneToNoteClass(
            workspaceFeedback.tone,
          )}`}
        >
          <p className="detail-note__label">{copy.workspaceNote}</p>
          <p className="supporting-copy">{workspaceFeedback.message}</p>
        </section>
      ) : null}
    </>
  );
}
