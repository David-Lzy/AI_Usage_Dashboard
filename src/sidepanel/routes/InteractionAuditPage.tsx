import { useEffect, useRef, useState } from "react";

import type { RuntimeI18n } from "../../shared/i18n";
import { buildOperatorWorkspaceLocalizedCopy } from "../../shared/localized-copy";
import { InteractionAuditGuidanceCard } from "../components/InteractionAuditGuidanceCard";
import { InteractionAuditHandoffSummarySection } from "../components/InteractionAuditHandoffSummarySection";
import { InteractionAuditRequestScopeSection } from "../components/InteractionAuditRequestScopeSection";
import { InteractionAuditReviewQueueSection } from "../components/InteractionAuditReviewQueueSection";
import { InteractionAuditSignoffSessionSection } from "../components/InteractionAuditSignoffSessionSection";
import {
  InteractionAuditSurfaceGridSection,
  type InteractionAuditSurfaceStatus,
} from "../components/InteractionAuditSurfaceGridSection";
import {
  InteractionAuditWorkspaceControlsSection,
  type InteractionAuditWorkspaceFeedback,
} from "../components/InteractionAuditWorkspaceControlsSection";
import { TopBar } from "../components/TopBar";
import { downloadTextFile } from "../download-text-file";
import { buildInteractionAuditExportFilename } from "../interaction-audit-export-files";
import {
  getAuditSurfaceReadiness,
  runAuditPreset,
} from "../interaction-audit-frame-actions";
import {
  presentAuditFrameReadiness,
  presentAuditPresetResult,
} from "../interaction-audit-frame-result-presentation";
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
import { createDefaultOperatorRuntimeI18n } from "../operator-runtime-i18n";
import { writeClipboardText } from "../write-clipboard-text";

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
    Record<string, InteractionAuditSurfaceStatus>
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
  const [workspaceFeedback, setWorkspaceFeedback] =
    useState<InteractionAuditWorkspaceFeedback>({
      tone: "neutral",
      message: copy.workspaceControls.feedback.noDecisions,
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
  }, [copy.frameResults]);

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
          const status = presentAuditFrameReadiness(
            readiness,
            copy.frameResults,
          );

          if (
            next[surfaceId]?.tone !== status.tone ||
            next[surfaceId]?.message !== status.message ||
            next[surfaceId]?.rawDetailLabel !== status.rawDetailLabel ||
            next[surfaceId]?.rawMessage !== status.rawMessage
          ) {
            next[surfaceId] = status;
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
  }, [copy.frameResults]);

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
      [surfaceId]: presentAuditFrameReadiness(readiness, copy.frameResults),
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
      [surfaceId]: presentAuditPresetResult(result, copy.frameResults),
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
      message: copy.workspaceControls.feedback.updatedWorkspace,
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
      message: copy.workspaceControls.feedback.updatedWorkspace,
    });
  }

  function handleSurfaceNotes(surfaceId: string, notes: string) {
    updateSurfaceSignoff(surfaceId, (current) => ({
      ...current,
      operatorNotes: notes,
    }));
    setWorkspaceFeedback({
      tone: "neutral",
      message: copy.workspaceControls.feedback.updatedWorkspace,
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
      message: copy.workspaceControls.feedback.updatedMetadata,
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
      message: copy.workspaceControls.feedback.stampedReviewTime,
    });
  }

  async function handleCopySignoffDraft() {
    const result = await writeClipboardText(signoffDraft);

    if (result === "success") {
      setWorkspaceFeedback({
        tone: "neutral",
        message: copy.workspaceControls.feedback.copiedSignoffDraft,
      });
      return;
    }

    setWorkspaceFeedback({
      tone: "warning",
      message:
        result === "unavailable"
          ? copy.workspaceControls.feedback.clipboardUnavailable
          : copy.workspaceControls.feedback.failedCopySignoffDraft,
    });
  }

  async function handleCopySignoffJson() {
    const result = await writeClipboardText(
      JSON.stringify(signoffExport, null, 2),
    );

    if (result === "success") {
      setWorkspaceFeedback({
        tone: "neutral",
        message: copy.workspaceControls.feedback.copiedSignoffJson,
      });
      return;
    }

    setWorkspaceFeedback({
      tone: "warning",
      message:
        result === "unavailable"
          ? copy.workspaceControls.feedback.clipboardUnavailable
          : copy.workspaceControls.feedback.failedCopySignoffJson,
    });
  }

  async function handleCopyHandoffSummary() {
    const result = await writeClipboardText(handoffDraft);

    if (result === "success") {
      setWorkspaceFeedback({
        tone: "neutral",
        message: copy.handoffSummary.feedback.copiedHandoffSummary,
      });
      return;
    }

    setWorkspaceFeedback({
      tone: "warning",
      message:
        result === "unavailable"
          ? copy.handoffSummary.feedback.clipboardUnavailable
          : copy.handoffSummary.feedback.failedCopyHandoffSummary,
    });
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
        ? copy.workspaceControls.feedback.downloadedSignoffDraft(filename)
        : copy.workspaceControls.feedback.failedDownloadSignoffDraft,
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
        ? copy.workspaceControls.feedback.downloadedSignoffJson(filename)
        : copy.workspaceControls.feedback.failedDownloadSignoffJson,
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
        ? copy.handoffSummary.feedback.downloadedHandoffSummary(filename)
        : copy.handoffSummary.feedback.failedDownloadHandoffSummary,
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
      message: copy.workspaceControls.feedback.resetWorkspace,
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
      message: copy.workspaceControls.feedback.importedSignoffJson,
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

      <InteractionAuditGuidanceCard
        buildAuditUrl={buildAuditUrl}
        copy={copy.guidance}
      />

      <section
        className="status-card interaction-audit__signoff-workspace"
        data-audit-signoff-workspace
      >
        <InteractionAuditSignoffSessionSection
          copy={copy.signoff}
          signoffMetadata={signoffMetadata}
          signoffRequestContext={signoffRequestContext}
          signoffSummary={signoffSummary}
          signoffSurfaceCount={INTERACTION_AUDIT_SIGNOFF_SURFACES.length}
          onMetadataChange={handleSignoffMetadata}
          onStampReviewedAt={handleStampReviewedAt}
        />

        <InteractionAuditRequestScopeSection
          commandCopy={copy.requestScopeCommands}
          copy={copy.signoff}
          signoffRequestContext={signoffRequestContext}
        />

        <InteractionAuditReviewQueueSection
          copy={copy.reviewQueue}
          nextReviewTarget={nextReviewTarget}
          reviewQueue={reviewQueue}
          onJumpToSurface={handleJumpToSurface}
        />

        <InteractionAuditWorkspaceControlsSection
          copy={copy.workspaceControls}
          importDraft={importDraft}
          signoffDraft={signoffDraft}
          workspaceFeedback={workspaceFeedback}
          onApplyImport={handleImportSignoffWorkspace}
          onClearImport={() => {
            setImportDraft("");
            setWorkspaceFeedback({
              tone: "neutral",
              message: copy.workspaceControls.feedback.clearedPastedJson,
            });
          }}
          onCopySignoffDraft={handleCopySignoffDraft}
          onCopySignoffJson={handleCopySignoffJson}
          onDownloadSignoffDraft={handleDownloadSignoffDraft}
          onDownloadSignoffJson={handleDownloadSignoffJson}
          onImportDraftChange={setImportDraft}
          onResetSignoffWorkspace={handleResetSignoffWorkspace}
        />

        <InteractionAuditHandoffSummarySection
          copy={copy.handoffSummary}
          handoffDraft={handoffDraft}
          handoffSummary={handoffSummary}
          onCopyHandoffSummary={handleCopyHandoffSummary}
          onDownloadHandoffSummary={handleDownloadHandoffSummary}
        />
      </section>

      <InteractionAuditSurfaceGridSection
        copy={copy.surfaceCard}
        buildAuditUrl={buildAuditUrl}
        loadedSurfaces={loadedSurfaces}
        signoffState={signoffState}
        surfaceStatus={surfaceStatus}
        onAction={handleAuditAction}
        onCardRef={(surfaceId, element) => {
          auditCardRefs.current[surfaceId] = element;
        }}
        onFrameLoad={handleFrameLoad}
        onFrameRef={(surfaceId, node) => {
          auditFrameRefs.current[surfaceId] = node;
        }}
        onManualCheckToggle={handleManualCheckToggle}
        onNotes={handleSurfaceNotes}
        onSignoffStatus={handleSurfaceSignoffStatus}
      />
    </main>
  );
}
