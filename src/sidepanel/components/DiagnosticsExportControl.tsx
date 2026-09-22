import { useRef, useState } from "react";

import { BUILD_INFO } from "../../shared/build-info";
import { MaterialActionIcon } from "../../shared/components/MaterialActionIcon";
import { buildDiagnosticsExportLocalizedCopy } from "../../shared/diagnostics-export-localized-copy";
import type { RuntimeI18n } from "../../shared/i18n";
import {
  createSanitizedDiagnostics,
  type DiagnosticsSourceState,
} from "../../shared/sanitized-diagnostics";
import { downloadTextFile } from "../download-text-file";
import "./DiagnosticsExportControl.css";

type DiagnosticsExportControlProps = {
  state: DiagnosticsSourceState;
  i18n: RuntimeI18n;
};

export function DiagnosticsExportControl({
  state,
  i18n,
}: DiagnosticsExportControlProps) {
  const previewTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [snapshotJson, setSnapshotJson] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const copy = buildDiagnosticsExportLocalizedCopy(i18n.resolvedLocale);

  function handlePreview() {
    try {
      const report = createSanitizedDiagnostics(state, {
        appVersion: BUILD_INFO.version,
      });

      setSnapshotJson(JSON.stringify(report, null, 2));
      setError(null);
    } catch {
      setError(copy.previewFailed);
    }
  }

  function handleDownload() {
    if (!snapshotJson) {
      return;
    }

    if (
      !downloadTextFile(
        "ai-usage-dashboard-diagnostics.json",
        snapshotJson,
        "application/json",
      )
    ) {
      setError(copy.downloadFailed);
    } else {
      setError(null);
    }
  }

  function handleClose() {
    setSnapshotJson(null);
    setError(null);
    previewTriggerRef.current?.focus();
  }

  return (
    <section
      className="diagnostics-export-control"
      data-diagnostics-export=""
      data-diagnostics-export-control=""
      aria-labelledby="diagnostics-export-title"
    >
      <div className="diagnostics-export-control__header">
        <div>
          <h3
            id="diagnostics-export-title"
            className="diagnostics-export-control__title"
          >
            {copy.title}
          </h3>
        </div>
      </div>

      <div className="diagnostics-export-control__actions">
        <button
          ref={previewTriggerRef}
          className="text-button diagnostics-export-control__button"
          type="button"
          title={copy.preview}
          data-diagnostics-action="preview"
          aria-expanded={snapshotJson !== null}
          aria-controls="diagnostics-export-preview"
          onClick={handlePreview}
        >
          <MaterialActionIcon
            className="diagnostics-export-control__button-icon"
            name="keyboard-arrow-down"
          />
          {copy.preview}
        </button>
      </div>

      {error ? (
        <p className="diagnostics-export-control__error" role="alert">
          {error}
        </p>
      ) : null}

      {snapshotJson ? (
        <section
          id="diagnostics-export-preview"
          className="diagnostics-export-control__dialog"
          role="region"
          aria-labelledby="diagnostics-export-preview-title"
        >
          <div className="diagnostics-export-control__dialog-header">
            <div>
              <h4
                id="diagnostics-export-preview-title"
                className="diagnostics-export-control__dialog-title"
              >
                {copy.previewTitle}
              </h4>
            </div>
            <button
              className="text-button diagnostics-export-control__button"
              type="button"
              title={copy.closeTitle}
              data-diagnostics-action="close"
              onClick={handleClose}
            >
              <MaterialActionIcon
                className="diagnostics-export-control__button-icon"
                name="keyboard-arrow-up"
              />
              {copy.close}
            </button>
          </div>

          <pre
            className="diagnostics-export-control__json"
            data-diagnostics-preview=""
            dir="ltr"
            tabIndex={0}
            aria-label={copy.previewTitle}
          >
            {snapshotJson}
          </pre>

          <div className="diagnostics-export-control__actions">
            <button
              className="text-button text-button--outlined diagnostics-export-control__button"
              type="button"
              title={copy.downloadTitle}
              data-diagnostics-action="download"
              onClick={handleDownload}
            >
              <MaterialActionIcon
                className="diagnostics-export-control__button-icon"
                name="save"
              />
              {copy.download}
            </button>
          </div>
        </section>
      ) : null}
    </section>
  );
}
