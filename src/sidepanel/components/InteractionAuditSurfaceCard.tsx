import type { CSSProperties } from "react";

import type { buildOperatorWorkspaceLocalizedCopy } from "../../shared/localized-copy";
import type { InteractionAuditSurface } from "../interaction-audit-surfaces";
import type {
  InteractionAuditSignoffStatus,
  InteractionAuditSurfaceSignoffState,
} from "../interaction-audit-signoff";

export type InteractionAuditSurfaceStatus = {
  tone: "neutral" | "warning";
  message: string;
};

export type InteractionAuditSurfaceCardCopy = ReturnType<
  typeof buildOperatorWorkspaceLocalizedCopy
>["interactionAudit"]["surfaceCard"];

type InteractionAuditSurfaceCardProps = {
  copy: InteractionAuditSurfaceCardCopy;
  surface: InteractionAuditSurface;
  loaded: boolean;
  status: InteractionAuditSurfaceStatus | undefined;
  signoffState: InteractionAuditSurfaceSignoffState;
  buildAuditUrl: (path: string) => string;
  onAction: (surfaceId: string, actionId: string) => void;
  onCardRef: (surfaceId: string, element: HTMLElement | null) => void;
  onFrameLoad: (surfaceId: string) => void;
  onFrameRef: (surfaceId: string, node: HTMLIFrameElement | null) => void;
  onManualCheckToggle: (
    surfaceId: string,
    checkIndex: number,
    checked: boolean,
  ) => void;
  onNotes: (surfaceId: string, notes: string) => void;
  onSignoffStatus: (
    surfaceId: string,
    status: InteractionAuditSignoffStatus,
  ) => void;
};

export function InteractionAuditSurfaceCard({
  copy,
  surface,
  loaded,
  status,
  signoffState,
  buildAuditUrl,
  onAction,
  onCardRef,
  onFrameLoad,
  onFrameRef,
  onManualCheckToggle,
  onNotes,
  onSignoffStatus,
}: InteractionAuditSurfaceCardProps) {
  return (
    <article
      className="status-card interaction-audit-card"
      data-audit-surface-id={surface.id}
      data-audit-surface-title={surface.title}
      ref={(element) => {
        onCardRef(surface.id, element);
      }}
    >
      <div className="status-card__header">
        <div>
          <p className="section-label">{copy.sectionLabel}</p>
          <h2 className="section-title">{surface.title}</h2>
        </div>
        <span className="meta-chip">
          {surface.width} x {surface.height}
        </span>
      </div>

      <p className="supporting-copy">{surface.description}</p>

      <div className="interaction-audit__actions">
        <a
          className="text-button interaction-audit__open-link"
          href={buildAuditUrl(surface.path)}
          rel="noreferrer"
          target="_blank"
        >
          {copy.openStandalone}
        </a>
        {surface.actions.map((action) => (
          <div
            key={action.id}
            className="interaction-audit__preset"
            data-audit-preset-id={`${surface.id}:${action.id}`}
          >
            <button
              className="text-button"
              data-audit-action-expectation={action.expectation}
              data-audit-action-id={action.id}
              data-audit-action-label={action.label}
              type="button"
              disabled={!loaded}
              onClick={() => {
                onAction(surface.id, action.id);
              }}
            >
              {action.label}
            </button>
            <p className="supporting-copy interaction-audit__preset-copy">
              {action.expectation}
            </p>
          </div>
        ))}
      </div>

      <div
        className={`detail-note ${status?.tone === "warning" ? "detail-note--warning" : "detail-note--neutral"}`}
        data-audit-status-id={surface.id}
      >
        <p className="detail-note__label">
          {loaded ? copy.auditState : copy.frameState}
        </p>
        <p className="supporting-copy">
          {status?.message ?? copy.loadingFrame}
        </p>
      </div>

      <div
        className="detail-note detail-note--neutral interaction-audit__manual-review"
        data-audit-manual-checks-id={surface.id}
      >
        <p className="detail-note__label">{copy.manualChecks}</p>
        <ul className="interaction-audit__manual-checks">
          {surface.manualChecks.map((check, index) => (
            <li
              key={`${surface.id}-manual-check-${index + 1}`}
              className="interaction-audit__manual-check-item"
              data-audit-manual-check-id={`${surface.id}:${index + 1}`}
            >
              <label className="switch-row interaction-audit__manual-check-row">
                <div>
                  <p className="switch-row__title">{check}</p>
                </div>
                <input
                  className="switch-row__control"
                  checked={Boolean(signoffState.manualCheckStates[index])}
                  data-audit-manual-toggle-id={`${surface.id}:${index + 1}`}
                  type="checkbox"
                  onChange={(event) => {
                    onManualCheckToggle(surface.id, index, event.target.checked);
                  }}
                />
              </label>
            </li>
          ))}
        </ul>

        <div className="interaction-audit__signoff-fields">
          <label className="form-field">
            <span className="form-field__label">{copy.surfaceSignoff}</span>
            <select
              className="form-field__control"
              data-audit-signoff-status-id={surface.id}
              value={signoffState.signoffStatus}
              onChange={(event) => {
                onSignoffStatus(
                  surface.id,
                  event.target.value as InteractionAuditSignoffStatus,
                );
              }}
            >
              <option value="not_reviewed">
                {copy.signoffStatus.notReviewed}
              </option>
              <option value="pass">{copy.signoffStatus.pass}</option>
              <option value="follow_up">{copy.signoffStatus.followUp}</option>
            </select>
          </label>

          <label className="form-field">
            <span className="form-field__label">{copy.operatorNotes}</span>
            <textarea
              className="form-field__control interaction-audit__notes-control"
              data-audit-signoff-notes-id={surface.id}
              placeholder={copy.notesPlaceholder}
              rows={4}
              value={signoffState.operatorNotes}
              onChange={(event) => {
                onNotes(surface.id, event.target.value);
              }}
            />
          </label>
        </div>
      </div>

      <div
        className="interaction-audit-frame-shell"
        data-audit-frame-height={surface.height}
        data-audit-frame-width={surface.width}
        style={
          {
            "--interaction-audit-frame-height": `${surface.height}px`,
            "--interaction-audit-frame-width": `${surface.width}px`,
          } as CSSProperties
        }
      >
        <div className="interaction-audit-frame-viewport">
          <iframe
            className="interaction-audit-frame"
            src={buildAuditUrl(surface.path)}
            title={`${surface.title} audit frame`}
            ref={(node) => {
              onFrameRef(surface.id, node);
            }}
            onLoad={() => {
              onFrameLoad(surface.id);
            }}
          />
        </div>
      </div>
    </article>
  );
}
