import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

import {
  createRuntimeI18n,
  DEFAULT_APP_LOCALE_PREFERENCE,
  type RuntimeI18n,
} from "../../shared/i18n";
import { buildOperatorWorkspaceLocalizedCopy } from "../../shared/localized-copy";
import { TopBar } from "../components/TopBar";
import { downloadTextFile } from "../download-text-file";
import { buildInteractionAuditExportFilename } from "../interaction-audit-export-files";
import {
  getAuditSurfaceReadiness,
  runAuditPreset,
} from "../interaction-audit-frame-actions";
import { buildInteractionAuditReviewQueue } from "../interaction-audit-review-queue";
import {
  buildInitialInteractionAuditSignoffMetadata,
  buildInitialInteractionAuditSignoffRequestContext,
  buildInitialInteractionAuditSignoffState,
  buildInteractionAuditSignoffDraft,
  buildInteractionAuditSignoffExport,
  buildInteractionAuditSignoffHandoffDraft,
  buildInteractionAuditSignoffHandoffSummary,
  buildInteractionAuditSignoffSummary,
  clearInteractionAuditSignoffMetadata,
  clearInteractionAuditSignoffRequestContext,
  clearInteractionAuditSignoffState,
  formatInteractionAuditSignoffRequestBinding,
  formatInteractionAuditSignoffRequestRevision,
  parseInteractionAuditSignoffImport,
  readInteractionAuditSignoffMetadata,
  readInteractionAuditSignoffRequestContext,
  readInteractionAuditSignoffState,
  writeInteractionAuditSignoffMetadata,
  writeInteractionAuditSignoffRequestContext,
  writeInteractionAuditSignoffState,
} from "../interaction-audit-signoff";
import {
  INTERACTION_AUDIT_SIGNOFF_SURFACES,
  INTERACTION_AUDIT_SURFACES,
} from "../interaction-audit-surfaces";

function buildAuditUrl(path: string): string {
  if (typeof window === "undefined") {
    return path;
  }

  return new URL(path, window.location.href).toString();
}

function openAuditSurface(path: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.open(buildAuditUrl(path), "_blank", "noopener,noreferrer");
}

type InteractionAuditPageProps = {
  i18n?: RuntimeI18n;
};

function createDefaultOperatorRuntimeI18n(): RuntimeI18n {
  return createRuntimeI18n(
    DEFAULT_APP_LOCALE_PREFERENCE,
    typeof window !== "undefined" ? window : undefined,
  );
}

export function InteractionAuditPage({
  i18n = createDefaultOperatorRuntimeI18n(),
}: InteractionAuditPageProps = {}) {
  const copy = buildOperatorWorkspaceLocalizedCopy(i18n).interactionAudit;
  const auditFrameRefs = useRef<Record<string, HTMLIFrameElement | null>>({});
  const auditCardRefs = useRef<Record<string, HTMLElement | null>>({});
  const [loadedSurfaces, setLoadedSurfaces] = useState<Record<string, boolean>>(
    {},
  );
  const [surfaceStatus, setSurfaceStatus] = useState<
    Record<
      string,
      {
        tone: "neutral" | "warning";
        message: string;
      }
    >
  >({});
  const [signoffState, setSignoffState] = useState(() =>
    readInteractionAuditSignoffState(INTERACTION_AUDIT_SIGNOFF_SURFACES),
  );
  const [signoffMetadata, setSignoffMetadata] = useState(() =>
    readInteractionAuditSignoffMetadata(),
  );
  const [signoffRequestContext, setSignoffRequestContext] = useState(() =>
    readInteractionAuditSignoffRequestContext(),
  );
  const [workspaceFeedback, setWorkspaceFeedback] = useState<{
    tone: "neutral" | "warning";
    message: string;
  }>({
    tone: "neutral",
    message: "No operator signoff decisions are recorded yet.",
  });
  const [importDraft, setImportDraft] = useState("");

  useEffect(() => {
    writeInteractionAuditSignoffState(
      signoffState,
      INTERACTION_AUDIT_SIGNOFF_SURFACES,
    );
  }, [signoffState]);

  useEffect(() => {
    writeInteractionAuditSignoffMetadata(signoffMetadata);
  }, [signoffMetadata]);

  useEffect(() => {
    writeInteractionAuditSignoffRequestContext(signoffRequestContext);
  }, [signoffRequestContext]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const auditWindow = window as typeof window & {
      __interactionAuditRunPreset?: (
        surfaceId: string,
        actionId: string,
      ) => boolean;
    };

    auditWindow.__interactionAuditRunPreset = (surfaceId, actionId) => {
      handleAuditAction(surfaceId, actionId);
      return true;
    };

    return () => {
      delete auditWindow.__interactionAuditRunPreset;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const intervalId = window.setInterval(() => {
      const readinessEntries = INTERACTION_AUDIT_SURFACES.map((surface) => [
        surface.id,
        getAuditSurfaceReadiness(
          surface.id,
          auditFrameRefs.current[surface.id] ?? null,
        ),
      ] as const);

      setLoadedSurfaces((current) => {
        const next = { ...current };
        let changed = false;

        for (const [surfaceId, readiness] of readinessEntries) {
          if (next[surfaceId] !== readiness.ready) {
            next[surfaceId] = readiness.ready;
            changed = true;
          }
        }

        return changed ? next : current;
      });

      setSurfaceStatus((current) => {
        const next = { ...current };
        let changed = false;

        for (const [surfaceId, readiness] of readinessEntries) {
          if (
            next[surfaceId]?.tone !== "neutral" ||
            next[surfaceId]?.message !== readiness.message
          ) {
            next[surfaceId] = {
              tone: "neutral",
              message: readiness.message,
            };
            changed = true;
          }
        }

        return changed ? next : current;
      });

      if (readinessEntries.every(([, readiness]) => readiness.ready)) {
        window.clearInterval(intervalId);
      }
    }, 250);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const signoffSummary = buildInteractionAuditSignoffSummary(
    INTERACTION_AUDIT_SIGNOFF_SURFACES,
    signoffState,
  );
  const reviewQueue = buildInteractionAuditReviewQueue(
    INTERACTION_AUDIT_SIGNOFF_SURFACES,
    signoffState,
  );
  const nextReviewTarget =
    reviewQueue.nextTargetId === null
      ? null
      : reviewQueue.items.find((item) => item.id === reviewQueue.nextTargetId) ?? null;
  const signoffDraft = buildInteractionAuditSignoffDraft(
    INTERACTION_AUDIT_SIGNOFF_SURFACES,
    signoffState,
    signoffMetadata,
    signoffRequestContext,
  );
  const handoffSummary = buildInteractionAuditSignoffHandoffSummary(
    INTERACTION_AUDIT_SIGNOFF_SURFACES,
    signoffState,
  );
  const handoffDraft = buildInteractionAuditSignoffHandoffDraft(
    INTERACTION_AUDIT_SIGNOFF_SURFACES,
    signoffState,
    signoffMetadata,
    signoffRequestContext,
  );
  const signoffExport = buildInteractionAuditSignoffExport(
    INTERACTION_AUDIT_SIGNOFF_SURFACES,
    signoffState,
    signoffMetadata,
    signoffRequestContext,
  );
  const boundRequestId = signoffRequestContext.requestId.trim();
  const hasBoundRequest = boundRequestId.length > 0;
  const requestScopeLabel = hasBoundRequest
    ? copy.signoff.repoBackedRequest
    : copy.signoff.adHocWorkspace;
  const requestPreflightCommand = hasBoundRequest
    ? `npm run interaction-audit:preflight-review-request -- --request-id ${boundRequestId} --input tmp/operator-signoff-export.json`
    : "";
  const requestCompleteCommand = hasBoundRequest
    ? `npm run interaction-audit:complete-review-request -- --request-id ${boundRequestId} --input tmp/operator-signoff-export.json`
    : "";
  const requestArchiveCommand =
    "npm run interaction-audit:archive -- --input tmp/operator-signoff-export.json";

  function handleFrameLoad(surfaceId: string) {
    const readiness = getAuditSurfaceReadiness(
      surfaceId,
      auditFrameRefs.current[surfaceId] ?? null,
    );

    setLoadedSurfaces((current) => ({
      ...current,
      [surfaceId]: readiness.ready,
    }));
    setSurfaceStatus((current) => ({
      ...current,
      [surfaceId]: {
        tone: "neutral",
        message: readiness.message,
      },
    }));
  }

  function handleAuditAction(surfaceId: string, actionId: string) {
    const result = runAuditPreset(
      surfaceId,
      actionId,
      auditFrameRefs.current[surfaceId] ?? null,
    );

    setSurfaceStatus((current) => ({
      ...current,
      [surfaceId]: {
        tone: result.ok ? "neutral" : "warning",
        message: result.message,
      },
    }));
  }

  function updateSurfaceSignoff(
    surfaceId: string,
    updater: (current: (typeof signoffState)[string]) => (typeof signoffState)[string],
  ) {
    setSignoffState((current) => ({
      ...current,
      [surfaceId]: updater(
        current[surfaceId] ??
          buildInitialInteractionAuditSignoffState(
            INTERACTION_AUDIT_SIGNOFF_SURFACES,
          )[surfaceId],
      ),
    }));
  }

  function handleManualCheckToggle(
    surfaceId: string,
    checkIndex: number,
    checked: boolean,
  ) {
    updateSurfaceSignoff(surfaceId, (current) => ({
      ...current,
      manualCheckStates: current.manualCheckStates.map((value, index) =>
        index === checkIndex ? checked : value,
      ),
    }));
    setWorkspaceFeedback({
      tone: "neutral",
      message: "Updated the operator signoff workspace.",
    });
  }

  function handleSurfaceSignoffStatus(
    surfaceId: string,
    status: "not_reviewed" | "pass" | "follow_up",
  ) {
    updateSurfaceSignoff(surfaceId, (current) => ({
      ...current,
      signoffStatus: status,
    }));
    setWorkspaceFeedback({
      tone: "neutral",
      message: "Updated the operator signoff workspace.",
    });
  }

  function handleSurfaceNotes(surfaceId: string, notes: string) {
    updateSurfaceSignoff(surfaceId, (current) => ({
      ...current,
      operatorNotes: notes,
    }));
    setWorkspaceFeedback({
      tone: "neutral",
      message: "Updated the operator signoff workspace.",
    });
  }

  function handleSignoffMetadata(
    field: "reviewerName" | "sessionLabel" | "reviewedAt",
    value: string,
  ) {
    setSignoffMetadata((current) => ({
      ...current,
      [field]: value,
    }));
    setWorkspaceFeedback({
      tone: "neutral",
      message: "Updated the review-session metadata.",
    });
  }

  function handleStampReviewedAt() {
    const reviewedAt = new Date().toISOString();

    setSignoffMetadata((current) => ({
      ...current,
      reviewedAt,
    }));
    setWorkspaceFeedback({
      tone: "neutral",
      message: "Stamped the current review time into the workspace metadata.",
    });
  }

  async function handleCopySignoffDraft() {
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      setWorkspaceFeedback({
        tone: "warning",
        message: "Clipboard access is unavailable in this audit environment.",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(signoffDraft);
      setWorkspaceFeedback({
        tone: "neutral",
        message: "Copied the current signoff draft to the clipboard.",
      });
    } catch {
      setWorkspaceFeedback({
        tone: "warning",
        message: "Failed to copy the current signoff draft to the clipboard.",
      });
    }
  }

  async function handleCopySignoffJson() {
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      setWorkspaceFeedback({
        tone: "warning",
        message: "Clipboard access is unavailable in this audit environment.",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(JSON.stringify(signoffExport, null, 2));
      setWorkspaceFeedback({
        tone: "neutral",
        message: "Copied the current signoff JSON to the clipboard.",
      });
    } catch {
      setWorkspaceFeedback({
        tone: "warning",
        message: "Failed to copy the current signoff JSON to the clipboard.",
      });
    }
  }

  async function handleCopyHandoffSummary() {
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      setWorkspaceFeedback({
        tone: "warning",
        message: "Clipboard access is unavailable in this audit environment.",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(handoffDraft);
      setWorkspaceFeedback({
        tone: "neutral",
        message: "Copied the current handoff summary to the clipboard.",
      });
    } catch {
      setWorkspaceFeedback({
        tone: "warning",
        message: "Failed to copy the current handoff summary to the clipboard.",
      });
    }
  }

  function handleDownloadSignoffDraft() {
    const filename = buildInteractionAuditExportFilename(
      "signoff-draft",
      signoffMetadata,
      signoffRequestContext,
    );
    const didDownload = downloadTextFile(filename, signoffDraft, "text/markdown");

    setWorkspaceFeedback({
      tone: didDownload ? "neutral" : "warning",
      message: didDownload
        ? `Downloaded the current signoff draft as ${filename}.`
        : "Failed to download the current signoff draft from this audit environment.",
    });
  }

  function handleDownloadSignoffJson() {
    const filename = buildInteractionAuditExportFilename(
      "signoff-json",
      signoffMetadata,
      signoffRequestContext,
    );
    const didDownload = downloadTextFile(
      filename,
      JSON.stringify(signoffExport, null, 2),
      "application/json",
    );

    setWorkspaceFeedback({
      tone: didDownload ? "neutral" : "warning",
      message: didDownload
        ? `Downloaded the current signoff JSON as ${filename}.`
        : "Failed to download the current signoff JSON from this audit environment.",
    });
  }

  function handleDownloadHandoffSummary() {
    const filename = buildInteractionAuditExportFilename(
      "handoff-summary",
      signoffMetadata,
      signoffRequestContext,
    );
    const didDownload = downloadTextFile(filename, handoffDraft, "text/markdown");

    setWorkspaceFeedback({
      tone: didDownload ? "neutral" : "warning",
      message: didDownload
        ? `Downloaded the current handoff summary as ${filename}.`
        : "Failed to download the current handoff summary from this audit environment.",
    });
  }

  function handleResetSignoffWorkspace() {
    clearInteractionAuditSignoffMetadata();
    clearInteractionAuditSignoffRequestContext();
    clearInteractionAuditSignoffState();
    setSignoffMetadata(buildInitialInteractionAuditSignoffMetadata());
    setSignoffRequestContext(buildInitialInteractionAuditSignoffRequestContext());
    setSignoffState(
      buildInitialInteractionAuditSignoffState(
        INTERACTION_AUDIT_SIGNOFF_SURFACES,
      ),
    );
    setImportDraft("");
    setWorkspaceFeedback({
      tone: "neutral",
      message: "Reset the operator signoff workspace.",
    });
  }

  function handleImportSignoffWorkspace() {
    const result = parseInteractionAuditSignoffImport(
      importDraft,
      INTERACTION_AUDIT_SIGNOFF_SURFACES,
    );

    if (!result.ok) {
      setWorkspaceFeedback({
        tone: "warning",
        message: result.error,
      });
      return;
    }

    setSignoffState(result.state);
    setSignoffMetadata(result.metadata);
    setSignoffRequestContext(result.requestContext);
    setWorkspaceFeedback({
      tone: "neutral",
      message: "Imported signoff JSON into the workspace.",
    });
  }

  function handleJumpToSurface(surfaceId: string) {
    const surfaceCard = auditCardRefs.current[surfaceId];

    if (!surfaceCard) {
      setWorkspaceFeedback({
        tone: "warning",
        message: "Could not find the requested audit surface on this page.",
      });
      return;
    }

    surfaceCard.scrollIntoView({
      block: "start",
      inline: "nearest",
      behavior: "smooth",
    });

    const signoffControl = surfaceCard.querySelector(
      `[data-audit-signoff-status-id="${surfaceId}"]`,
    );

    if (
      signoffControl &&
      "focus" in signoffControl &&
      typeof signoffControl.focus === "function"
    ) {
      signoffControl.focus();
    }

    setWorkspaceFeedback({
      tone: "neutral",
      message: `Jumped to ${surfaceCard.dataset.auditSurfaceTitle ?? "the requested audit surface"}.`,
    });
  }

  return (
    <main className="app-shell interaction-audit-shell">
      <TopBar
        title={copy.topbar.title}
        subtitle={copy.topbar.subtitle}
        secondaryActionLabel={copy.topbar.openDashboard}
        primaryActionLabel={copy.topbar.openSettings}
        onSecondaryAction={() => {
          openAuditSurface("./index.html#dashboard");
        }}
        onPrimaryAction={() => {
          openAuditSurface("./index.html#settings");
        }}
      />

      <section className="hero-card" data-theme-local-surface="audit-hero-card">
        <p className="section-label" data-theme-local-surface="audit-hero-label">
          {copy.hero.eyebrow}
        </p>
        <h2 className="display-headline">{copy.hero.title}</h2>
        <p className="body-copy">{copy.hero.detail}</p>
        <span className="token-chip" data-theme-local-surface="audit-hero-chip">
          {copy.hero.chip}
        </span>
      </section>

      <section className="status-card">
        <div className="dashboard-section__header">
          <div>
            <p className="section-label">{copy.guidance.eyebrow}</p>
            <h2 className="section-title">{copy.guidance.title}</h2>
          </div>
          <p className="supporting-copy">{copy.guidance.detail}</p>
        </div>

        <ul className="feature-list interaction-audit__checklist">
          {copy.guidance.checks.map((check) => (
            <li key={check}>{check}</li>
          ))}
        </ul>

        <div className="interaction-audit__actions">
          <a
            className="text-button interaction-audit__open-link"
            href={buildAuditUrl("./index.html#dashboard")}
            rel="noreferrer"
            target="_blank"
          >
            {copy.guidance.openDashboard}
          </a>
          <a
            className="text-button interaction-audit__open-link"
            href={buildAuditUrl("./index.html#settings")}
            rel="noreferrer"
            target="_blank"
            data-theme-local-surface="audit-open-settings-link"
          >
            {copy.guidance.openSettings}
          </a>
          <a
            className="text-button interaction-audit__open-link"
            href={buildAuditUrl("../popup/index.html")}
            rel="noreferrer"
            target="_blank"
          >
            {copy.guidance.openPopup}
          </a>
        </div>
      </section>

      <section
        className="status-card interaction-audit__signoff-workspace"
        data-audit-signoff-workspace
      >
        <div className="status-card__header">
          <div>
            <p className="section-label">{copy.signoff.eyebrow}</p>
            <h2 className="section-title">{copy.signoff.title}</h2>
          </div>
          <p className="supporting-copy">{copy.signoff.detail}</p>
        </div>

        <div className="interaction-audit__signoff-summary">
          <div
            className="source-card__field"
            data-audit-signoff-summary-id="reviewed-surfaces"
          >
            <p className="source-card__label">{copy.signoff.reviewedSurfaces}</p>
            <p className="source-card__value" data-audit-signoff-summary-value>
              {signoffSummary.reviewedSurfaceCount} /{" "}
              {INTERACTION_AUDIT_SIGNOFF_SURFACES.length}
            </p>
          </div>
          <div className="source-card__field" data-audit-signoff-summary-id="pass">
            <p className="source-card__label">{copy.signoff.pass}</p>
            <p className="source-card__value" data-audit-signoff-summary-value>
              {signoffSummary.passSurfaceCount}
            </p>
          </div>
          <div
            className="source-card__field"
            data-audit-signoff-summary-id="follow-up"
          >
            <p className="source-card__label">{copy.signoff.followUp}</p>
            <p className="source-card__value" data-audit-signoff-summary-value>
              {signoffSummary.followUpSurfaceCount}
            </p>
          </div>
          <div
            className="source-card__field"
            data-audit-signoff-summary-id="completed-checks"
          >
            <p className="source-card__label">{copy.signoff.completedChecks}</p>
            <p className="source-card__value" data-audit-signoff-summary-value>
              {signoffSummary.completedManualCheckCount} /{" "}
              {signoffSummary.totalManualCheckCount}
            </p>
          </div>
        </div>

        <div className="interaction-audit__signoff-fields">
          <label className="form-field">
            <span className="form-field__label">{copy.signoff.reviewerName}</span>
            <input
              className="form-field__control"
              data-audit-session-reviewer
              placeholder={copy.signoff.reviewerPlaceholder}
              type="text"
              value={signoffMetadata.reviewerName}
              onChange={(event) => {
                handleSignoffMetadata("reviewerName", event.target.value);
              }}
            />
          </label>

          <label className="form-field">
            <span className="form-field__label">{copy.signoff.sessionLabel}</span>
            <input
              className="form-field__control"
              data-audit-session-label
              placeholder={copy.signoff.sessionPlaceholder}
              type="text"
              value={signoffMetadata.sessionLabel}
              onChange={(event) => {
                handleSignoffMetadata("sessionLabel", event.target.value);
              }}
            />
          </label>

          <label className="form-field">
            <span className="form-field__label">{copy.signoff.reviewedAt}</span>
            <input
              className="form-field__control"
              data-audit-session-reviewed-at
              placeholder={copy.signoff.reviewedAtPlaceholder}
              type="text"
              value={signoffMetadata.reviewedAt}
              onChange={(event) => {
                handleSignoffMetadata("reviewedAt", event.target.value);
              }}
            />
          </label>
        </div>

        <div className="interaction-audit__actions interaction-audit__workspace-actions">
          <button
            className="text-button"
            data-audit-session-stamp-time
            type="button"
            onClick={() => {
              handleStampReviewedAt();
            }}
          >
            {copy.signoff.stampCurrentTime}
          </button>
        </div>

        <div
          className="detail-note detail-note--neutral"
          data-audit-session-summary
        >
          <p className="detail-note__label">{copy.signoff.reviewSession}</p>
          <p className="supporting-copy">
            {copy.signoff.reviewerPrefix}:{" "}
            {signoffMetadata.reviewerName.trim().length > 0
              ? signoffMetadata.reviewerName.trim()
              : copy.signoff.notSet}
            {" · "}{copy.signoff.sessionPrefix}:{" "}
            {signoffMetadata.sessionLabel.trim().length > 0
              ? signoffMetadata.sessionLabel.trim()
              : copy.signoff.notSet}
            {" · "}{copy.signoff.reviewedAtPrefix}:{" "}
            {signoffMetadata.reviewedAt.trim().length > 0
              ? signoffMetadata.reviewedAt.trim()
              : copy.signoff.notSet}
          </p>
          <p
            className="supporting-copy"
            data-audit-request-binding-summary
          >
            {copy.signoff.requestBindingPrefix}:{" "}
            {formatInteractionAuditSignoffRequestBinding(signoffRequestContext)}
            {" · "}{copy.signoff.requestRevisionPrefix}:{" "}
            {formatInteractionAuditSignoffRequestRevision(signoffRequestContext)}
          </p>
        </div>

        <section
          className="detail-note detail-note--neutral interaction-audit__request-scope"
          data-audit-request-scope
          data-audit-request-scope-mode={hasBoundRequest ? "bound" : "adhoc"}
        >
          <div className="interaction-audit__request-scope-header">
            <div>
              <p className="detail-note__label">{copy.signoff.requestScope}</p>
              <p
                className="supporting-copy"
                data-audit-request-scope-copy
              >
                {hasBoundRequest
                  ? copy.signoff.boundRequestDetail
                  : copy.signoff.adHocDetail}
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
              <p className="source-card__label">{copy.signoff.binding}</p>
              <p className="source-card__value">
                {formatInteractionAuditSignoffRequestBinding(signoffRequestContext)}
              </p>
            </div>
            <div
              className="source-card__field"
              data-audit-request-scope-summary="revision"
            >
              <p className="source-card__label">{copy.signoff.requestRevision}</p>
              <p className="source-card__value">
                {formatInteractionAuditSignoffRequestRevision(signoffRequestContext)}
              </p>
            </div>
            <div
              className="source-card__field"
              data-audit-request-scope-summary="downloads"
            >
              <p className="source-card__label">{copy.signoff.downloadIdentity}</p>
              <p className="source-card__value">
                {hasBoundRequest
                  ? copy.signoff.downloadsBound
                  : copy.signoff.downloadsAdHoc}
              </p>
            </div>
          </div>

          <div className="interaction-audit__request-scope-commands">
            {hasBoundRequest ? (
              <>
                <div className="interaction-audit__request-scope-command">
                  <p className="detail-note__label">Preflight next</p>
                  <pre
                    className="capture-pre"
                    data-audit-request-scope-preflight
                  >
                    {requestPreflightCommand}
                  </pre>
                </div>
                <div className="interaction-audit__request-scope-command">
                  <p className="detail-note__label">Complete next</p>
                  <pre
                    className="capture-pre"
                    data-audit-request-scope-complete
                  >
                    {requestCompleteCommand}
                  </pre>
                </div>
              </>
            ) : (
              <div className="interaction-audit__request-scope-command">
                <p className="detail-note__label">Archive next</p>
                <pre
                  className="capture-pre"
                  data-audit-request-scope-archive
                >
                  {requestArchiveCommand}
                </pre>
              </div>
            )}
          </div>
        </section>

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
                  handleJumpToSurface(nextReviewTarget.id);
                }
              }}
            >
              {nextReviewTarget ? `Jump to ${nextReviewTarget.title}` : "All surfaces ready"}
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
                    <p className="interaction-audit__queue-item-title">{item.title}</p>
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
                      handleJumpToSurface(item.id);
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

        <div className="interaction-audit__actions interaction-audit__workspace-actions">
          <button
            className="text-button"
            data-audit-copy-signoff-draft
            type="button"
            onClick={() => {
              void handleCopySignoffDraft();
            }}
          >
            Copy signoff draft
          </button>
          <button
            className="text-button"
            data-audit-download-signoff-draft
            type="button"
            onClick={() => {
              handleDownloadSignoffDraft();
            }}
          >
            Download signoff draft
          </button>
          <button
            className="text-button"
            data-audit-copy-signoff-json
            type="button"
            onClick={() => {
              void handleCopySignoffJson();
            }}
          >
            Copy signoff JSON
          </button>
          <button
            className="text-button"
            data-audit-download-signoff-json
            type="button"
            onClick={() => {
              handleDownloadSignoffJson();
            }}
          >
            Download signoff JSON
          </button>
          <button
            className="text-button"
            data-audit-reset-signoff
            type="button"
            onClick={() => {
              handleResetSignoffWorkspace();
            }}
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
                  setImportDraft(event.target.value);
                }}
              />
            </label>

            <div className="interaction-audit__actions">
              <button
                className="text-button"
                data-audit-apply-import
                type="button"
                onClick={() => {
                  handleImportSignoffWorkspace();
                }}
              >
                Apply imported signoff
              </button>
              <button
                className="text-button"
                data-audit-clear-import
                type="button"
                onClick={() => {
                  setImportDraft("");
                  setWorkspaceFeedback({
                    tone: "neutral",
                    message: "Cleared the pasted signoff JSON.",
                  });
                }}
              >
                Clear pasted JSON
              </button>
            </div>
          </div>
        </details>

        <div
          className={`detail-note ${workspaceFeedback.tone === "warning" ? "detail-note--warning" : "detail-note--neutral"}`}
          data-audit-signoff-feedback
        >
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
                void handleCopyHandoffSummary();
              }}
            >
              Copy handoff summary
            </button>
            <button
              className="text-button"
              data-audit-download-handoff-summary
              type="button"
              onClick={() => {
                handleDownloadHandoffSummary();
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
                <li>Finish the current review state in the audit hub or import an existing signoff JSON snapshot.</li>
                <li>Fill the review-session metadata so the export records reviewer, session label, and review time.</li>
                <li>Use `Download signoff JSON` for a direct local file, or `Copy signoff JSON` if the current environment cannot download files.</li>
                <li>Keep the downloaded or pasted file under a local path such as `tmp/operator-signoff-export.json`.</li>
                <li>Run the bundle command below to package the current export with the latest preset evidence references and preserved review-session metadata.</li>
              </ul>
              <pre
                className="capture-pre"
                data-audit-operator-bundle-command
              >
                npm run interaction-audit:bundle -- --input tmp/operator-signoff-export.json --output-dir tmp/operator-handoff-bundle
              </pre>
            </div>
          </details>
        </section>
      </section>

      <section className="interaction-audit-grid" aria-label="Interaction audit surfaces">
        {INTERACTION_AUDIT_SURFACES.map((surface) => {
          const surfaceSignoffState =
            signoffState[surface.id] ??
            buildInitialInteractionAuditSignoffState(
              INTERACTION_AUDIT_SIGNOFF_SURFACES,
            )[surface.id];

          return (
            <article
              key={surface.id}
              className="status-card interaction-audit-card"
              data-audit-surface-id={surface.id}
              data-audit-surface-title={surface.title}
              ref={(element) => {
                auditCardRefs.current[surface.id] = element;
              }}
            >
              <div className="status-card__header">
                <div>
                  <p className="section-label">Audit Surface</p>
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
                  Open standalone
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
                      disabled={!loadedSurfaces[surface.id]}
                      onClick={() => {
                        handleAuditAction(surface.id, action.id);
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
                className={`detail-note ${surfaceStatus[surface.id]?.tone === "warning" ? "detail-note--warning" : "detail-note--neutral"}`}
                data-audit-status-id={surface.id}
              >
                <p className="detail-note__label">
                  {loadedSurfaces[surface.id] ? "Audit state" : "Frame state"}
                </p>
                <p className="supporting-copy">
                  {surfaceStatus[surface.id]?.message ??
                    "Loading embedded frame for audit presets."}
                </p>
              </div>

              <div
                className="detail-note detail-note--neutral interaction-audit__manual-review"
                data-audit-manual-checks-id={surface.id}
              >
                <p className="detail-note__label">Manual checks</p>
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
                          checked={Boolean(surfaceSignoffState.manualCheckStates[index])}
                          data-audit-manual-toggle-id={`${surface.id}:${index + 1}`}
                          type="checkbox"
                          onChange={(event) => {
                            handleManualCheckToggle(
                              surface.id,
                              index,
                              event.target.checked,
                            );
                          }}
                        />
                      </label>
                    </li>
                  ))}
                </ul>

                <div className="interaction-audit__signoff-fields">
                  <label className="form-field">
                    <span className="form-field__label">Surface signoff</span>
                    <select
                      className="form-field__control"
                      data-audit-signoff-status-id={surface.id}
                      value={surfaceSignoffState.signoffStatus}
                      onChange={(event) => {
                        handleSurfaceSignoffStatus(
                          surface.id,
                          event.target.value as "not_reviewed" | "pass" | "follow_up",
                        );
                      }}
                    >
                      <option value="not_reviewed">Not reviewed</option>
                      <option value="pass">Pass</option>
                      <option value="follow_up">Follow-up required</option>
                    </select>
                  </label>

                  <label className="form-field">
                    <span className="form-field__label">Operator notes</span>
                    <textarea
                      className="form-field__control interaction-audit__notes-control"
                      data-audit-signoff-notes-id={surface.id}
                      placeholder="Record reviewer notes for this surface."
                      rows={4}
                      value={surfaceSignoffState.operatorNotes}
                      onChange={(event) => {
                        handleSurfaceNotes(surface.id, event.target.value);
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
                      auditFrameRefs.current[surface.id] = node;
                    }}
                    onLoad={() => {
                      handleFrameLoad(surface.id);
                    }}
                  />
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
