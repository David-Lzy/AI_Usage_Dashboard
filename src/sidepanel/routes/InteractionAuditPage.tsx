import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

import { TopBar } from "../components/TopBar";
import { buildInteractionAuditExportFilename } from "../interaction-audit-export-files";
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

function isHtmlElementLike(value: unknown): value is HTMLElement {
  return Boolean(
    value &&
      typeof value === "object" &&
      "nodeType" in value &&
      value.nodeType === 1 &&
      "scrollIntoView" in value &&
      typeof value.scrollIntoView === "function" &&
      "focus" in value &&
      typeof value.focus === "function",
  );
}

function isHtmlDetailsElementLike(value: unknown): value is HTMLDetailsElement {
  return (
    isHtmlElementLike(value) &&
    "tagName" in value &&
    String(value.tagName).toUpperCase() === "DETAILS" &&
    "open" in value
  );
}

function getFrameContext(frame: HTMLIFrameElement | null): {
  document: Document;
  window: Window;
} | null {
  const frameWindow = frame?.contentWindow;
  const frameDocument = frameWindow?.document;

  if (!frameWindow || !frameDocument || frameDocument.readyState !== "complete") {
    return null;
  }

  return {
    document: frameDocument,
    window: frameWindow,
  };
}

function focusFrameElement(
  frame: HTMLIFrameElement | null,
  selector: string,
): HTMLElement | null {
  const frameContext = getFrameContext(frame);

  if (!frameContext) {
    return null;
  }

  const element = frameContext.document.querySelector(selector);

  if (!isHtmlElementLike(element)) {
    return null;
  }

  frameContext.document
    .querySelectorAll("[data-audit-preset-target='true']")
    .forEach((current) => {
      current.removeAttribute("data-audit-preset-target");
    });
  element.setAttribute("data-audit-preset-target", "true");

  window.setTimeout(() => {
    frame?.focus();
    frameContext.window.focus();
    element.scrollIntoView({
      block: "center",
      inline: "nearest",
    });
    element.focus();
  }, 0);

  return element;
}

function getAuditSurfaceReadiness(
  surfaceId: string,
  frame: HTMLIFrameElement | null,
): {
  ready: boolean;
  message: string;
} {
  const frameContext = getFrameContext(frame);

  if (!frameContext) {
    return {
      ready: false,
      message: "Frame not ready yet.",
    };
  }

  const { document } = frameContext;

  switch (surfaceId) {
    case "dashboard-360":
      return document.querySelector(".provider-card .text-button")
        ? {
            ready: true,
            message: "Frame loaded and ready for audit presets.",
          }
        : {
            ready: false,
            message: "Frame loaded. Waiting for dashboard provider actions.",
          };
    case "settings-420":
      return document.querySelector(".source-card__details-toggle") &&
        document.querySelector(
          "#settings-sources .source-card select.form-field__control",
        )
        ? {
            ready: true,
            message: "Frame loaded and ready for audit presets.",
          }
        : {
            ready: false,
            message: "Frame loaded. Waiting for Settings source controls.",
          };
    case "cursor-detail-360":
    case "codex-detail-420":
      return document.querySelector(".detail-note")
        ? {
            ready: true,
            message: "Frame loaded and ready for audit presets.",
          }
        : {
            ready: false,
            message: "Frame loaded. Waiting for provider detail notes.",
          };
    case "popup-360":
      return document.querySelector(".popup-actions .text-button") &&
        document.querySelector(".popup-provider-card .text-button")
        ? {
            ready: true,
            message: "Frame loaded and ready for audit presets.",
          }
        : {
            ready: false,
            message: "Frame loaded. Waiting for popup actions.",
          };
    default:
      return {
        ready: true,
        message: "Frame loaded and ready for audit presets.",
      };
  }
}

function runAuditPreset(
  surfaceId: string,
  actionId: string,
  frame: HTMLIFrameElement | null,
): {
  ok: boolean;
  message: string;
} {
  const frameContext = getFrameContext(frame);

  if (!frameContext) {
    return {
      ok: false,
      message: "Frame not ready yet.",
    };
  }

  const { document, window } = frameContext;

  switch (`${surfaceId}:${actionId}`) {
    case "dashboard-360:focus-first-provider-open": {
      const openButton = focusFrameElement(frame, ".provider-card .text-button");

      if (!openButton) {
        return {
          ok: false,
          message: "Could not find the first provider action.",
        };
      }

      return {
        ok: true,
        message: "Focused the first provider action button.",
      };
    }
    case "settings-420:open-first-diagnostics": {
      document.getElementById("settings-sources")?.scrollIntoView({
        block: "start",
      });

      const details = document.querySelector(".source-card__details");

      if (!isHtmlDetailsElementLike(details)) {
        return {
          ok: false,
          message: "Could not find a source diagnostics disclosure.",
        };
      }

      details.open = true;

      const toggle = details.querySelector(".source-card__details-toggle");

      if (isHtmlElementLike(toggle)) {
        document
          .querySelectorAll("[data-audit-preset-target='true']")
          .forEach((current) => {
            current.removeAttribute("data-audit-preset-target");
          });
        toggle.setAttribute("data-audit-preset-target", "true");
        window.setTimeout(() => {
          frame?.focus();
          frameContext.window.focus();
          toggle.focus();
        }, 0);
      }

      return {
        ok: true,
        message: "Opened the first source diagnostics disclosure.",
      };
    }
    case "settings-420:focus-first-source-preference": {
      document.getElementById("settings-sources")?.scrollIntoView({
        block: "start",
      });

      const select = focusFrameElement(
        frame,
        "#settings-sources .source-card select.form-field__control",
      );

      if (!select) {
        return {
          ok: false,
          message: "Could not find a source-preference select.",
        };
      }

      return {
        ok: true,
        message: "Focused the first source-preference select.",
      };
    }
    case "cursor-detail-360:jump-first-note":
    case "codex-detail-420:jump-first-note": {
      const firstNote = document.querySelector(".detail-note");

      if (!isHtmlElementLike(firstNote)) {
        return {
          ok: false,
          message: "Could not find a detail note block.",
        };
      }

      firstNote.scrollIntoView({
        block: "center",
        inline: "nearest",
      });
      window.scrollBy({
        top: -24,
      });

      return {
        ok: true,
        message: "Scrolled the detail frame to the first note block.",
      };
    }
    case "popup-360:focus-open-dashboard": {
      const quickActions = Array.from(
        document.querySelectorAll(".popup-actions .text-button"),
      );
      const dashboardButton = quickActions.find((button) =>
        button.textContent?.includes("Open dashboard"),
      );

      if (!isHtmlElementLike(dashboardButton)) {
        return {
          ok: false,
          message: "Could not find the popup dashboard action.",
        };
      }

      dashboardButton.scrollIntoView({
        block: "center",
        inline: "nearest",
      });
      dashboardButton.focus();

      return {
        ok: true,
        message: "Focused the popup dashboard action.",
      };
    }
    case "popup-360:focus-first-detail": {
      const detailButton = focusFrameElement(
        frame,
        ".popup-provider-card .text-button",
      );

      if (!detailButton) {
        return {
          ok: false,
          message: "Could not find the featured-provider detail action.",
        };
      }

      return {
        ok: true,
        message: "Focused the first featured-provider detail action.",
      };
    }
    default:
      return {
        ok: false,
        message: "Unsupported audit preset.",
      };
  }
}

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

function downloadTextFile(
  filename: string,
  content: string,
  mimeType: string,
): boolean {
  if (
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    typeof URL?.createObjectURL !== "function"
  ) {
    return false;
  }

  try {
    const blob = new Blob([content], { type: mimeType });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.rel = "noopener";
    anchor.style.display = "none";

    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
    }, 0);

    return true;
  } catch {
    return false;
  }
}

export function InteractionAuditPage() {
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
    ? "Repo-backed request"
    : "Ad-hoc audit workspace";
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

    if (isHtmlElementLike(signoffControl)) {
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
        title="Interaction Audit"
        subtitle="Real-browser QA hub"
        secondaryActionLabel="Open dashboard"
        primaryActionLabel="Open settings"
        onSecondaryAction={() => {
          openAuditSurface("./index.html#dashboard");
        }}
        onPrimaryAction={() => {
          openAuditSurface("./index.html#settings");
        }}
      />

      <section className="hero-card">
        <p className="section-label">Audit Hub</p>
        <h2 className="display-headline">Manual interaction review without repeated resizing</h2>
        <p className="body-copy">
          This page embeds the real shipped dashboard, settings, provider-detail,
          and popup surfaces inside fixed-width frames so real-browser review can
          focus on hover, focus, pressed, and compact-width behavior instead of
          repeatedly reopening routes.
        </p>
        <span className="token-chip">Manual QA · Fixed-width frames</span>
      </section>

      <section className="status-card">
        <div className="dashboard-section__header">
          <div>
            <p className="section-label">How To Use</p>
            <h2 className="section-title">Review guidance</h2>
          </div>
          <p className="supporting-copy">
            Open this route in a normal browser tab or extension page when you
            want a human pass after the automated review scripts. The embedded
            frames preserve representative widths even when the outer browser
            window is larger.
          </p>
        </div>

        <ul className="feature-list interaction-audit__checklist">
          <li>Hover interactive controls and confirm the state layer still feels coherent across pages.</li>
          <li>Use keyboard tab focus across the embedded surfaces and confirm focus visibility stays explicit.</li>
          <li>Use the preset actions below to open disclosures, focus controls, or reveal lower detail notes before signing off a UI slice.</li>
        </ul>

        <div className="interaction-audit__actions">
          <a
            className="text-button interaction-audit__open-link"
            href={buildAuditUrl("./index.html#dashboard")}
            rel="noreferrer"
            target="_blank"
          >
            Open dashboard
          </a>
          <a
            className="text-button interaction-audit__open-link"
            href={buildAuditUrl("./index.html#settings")}
            rel="noreferrer"
            target="_blank"
          >
            Open settings
          </a>
          <a
            className="text-button interaction-audit__open-link"
            href={buildAuditUrl("../popup/index.html")}
            rel="noreferrer"
            target="_blank"
          >
            Open popup
          </a>
        </div>
      </section>

      <section
        className="status-card interaction-audit__signoff-workspace"
        data-audit-signoff-workspace
      >
        <div className="status-card__header">
          <div>
            <p className="section-label">Signoff Workspace</p>
            <h2 className="section-title">Current operator draft</h2>
          </div>
          <p className="supporting-copy">
            Use the controls inside each audit surface to record check progress,
            reviewer notes, and pass-versus-follow-up state. The draft below
            updates live from the current workspace state.
          </p>
        </div>

        <div className="interaction-audit__signoff-summary">
          <div
            className="source-card__field"
            data-audit-signoff-summary-id="reviewed-surfaces"
          >
            <p className="source-card__label">Reviewed surfaces</p>
            <p className="source-card__value" data-audit-signoff-summary-value>
              {signoffSummary.reviewedSurfaceCount} /{" "}
              {INTERACTION_AUDIT_SIGNOFF_SURFACES.length}
            </p>
          </div>
          <div className="source-card__field" data-audit-signoff-summary-id="pass">
            <p className="source-card__label">Pass</p>
            <p className="source-card__value" data-audit-signoff-summary-value>
              {signoffSummary.passSurfaceCount}
            </p>
          </div>
          <div
            className="source-card__field"
            data-audit-signoff-summary-id="follow-up"
          >
            <p className="source-card__label">Follow-up</p>
            <p className="source-card__value" data-audit-signoff-summary-value>
              {signoffSummary.followUpSurfaceCount}
            </p>
          </div>
          <div
            className="source-card__field"
            data-audit-signoff-summary-id="completed-checks"
          >
            <p className="source-card__label">Completed checks</p>
            <p className="source-card__value" data-audit-signoff-summary-value>
              {signoffSummary.completedManualCheckCount} /{" "}
              {signoffSummary.totalManualCheckCount}
            </p>
          </div>
        </div>

        <div className="interaction-audit__signoff-fields">
          <label className="form-field">
            <span className="form-field__label">Reviewer name</span>
            <input
              className="form-field__control"
              data-audit-session-reviewer
              placeholder="Record the reviewer or operator name."
              type="text"
              value={signoffMetadata.reviewerName}
              onChange={(event) => {
                handleSignoffMetadata("reviewerName", event.target.value);
              }}
            />
          </label>

          <label className="form-field">
            <span className="form-field__label">Session label</span>
            <input
              className="form-field__control"
              data-audit-session-label
              placeholder="Label this pass, for example Compact QA Pass."
              type="text"
              value={signoffMetadata.sessionLabel}
              onChange={(event) => {
                handleSignoffMetadata("sessionLabel", event.target.value);
              }}
            />
          </label>

          <label className="form-field">
            <span className="form-field__label">Reviewed at</span>
            <input
              className="form-field__control"
              data-audit-session-reviewed-at
              placeholder="Use ISO-8601 time or stamp the current review moment."
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
            Stamp current time
          </button>
        </div>

        <div
          className="detail-note detail-note--neutral"
          data-audit-session-summary
        >
          <p className="detail-note__label">Review session</p>
          <p className="supporting-copy">
            Reviewer:{" "}
            {signoffMetadata.reviewerName.trim().length > 0
              ? signoffMetadata.reviewerName.trim()
              : "not set"}
            {" · "}Session:{" "}
            {signoffMetadata.sessionLabel.trim().length > 0
              ? signoffMetadata.sessionLabel.trim()
              : "not set"}
            {" · "}Reviewed at:{" "}
            {signoffMetadata.reviewedAt.trim().length > 0
              ? signoffMetadata.reviewedAt.trim()
              : "not set"}
          </p>
          <p
            className="supporting-copy"
            data-audit-request-binding-summary
          >
            Request binding:{" "}
            {formatInteractionAuditSignoffRequestBinding(signoffRequestContext)}
            {" · "}Request revision:{" "}
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
              <p className="detail-note__label">Request Scope</p>
              <p
                className="supporting-copy"
                data-audit-request-scope-copy
              >
                {hasBoundRequest
                  ? "This workspace is bound to one repo-backed pending request. Use preflight and completion against that request instead of the ad-hoc archive path."
                  : "This workspace is not bound to a repo-backed request. Use the archive path unless a pending request template is imported first."}
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
              <p className="source-card__label">Binding</p>
              <p className="source-card__value">
                {formatInteractionAuditSignoffRequestBinding(signoffRequestContext)}
              </p>
            </div>
            <div
              className="source-card__field"
              data-audit-request-scope-summary="revision"
            >
              <p className="source-card__label">Request revision</p>
              <p className="source-card__value">
                {formatInteractionAuditSignoffRequestRevision(signoffRequestContext)}
              </p>
            </div>
            <div
              className="source-card__field"
              data-audit-request-scope-summary="downloads"
            >
              <p className="source-card__label">Download identity</p>
              <p className="source-card__value">
                {hasBoundRequest
                  ? "Downloads include the bound request id and request revision."
                  : "Downloads stay session-scoped only."}
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
