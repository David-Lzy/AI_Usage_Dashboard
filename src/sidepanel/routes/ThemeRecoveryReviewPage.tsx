import { useEffect, useMemo, useState } from "react";

import type { AppState } from "../../providers/types";
import { sendAppMessage } from "../../shared/app-client";
import { APP_STATE_STORAGE_KEY } from "../../shared/constants";
import { TopBar } from "../components/TopBar";
import { StatusBadge } from "../components/StatusBadge";
import { buildThemeRecoveryExportFilename } from "../theme-recovery-export-files";
import {
  buildThemeRecoveryReviewExport,
  buildThemeRecoveryReviewSnapshot,
  buildThemeRecoveryReviewSummary,
  serializeThemeRecoveryReviewExport,
  type ThemeRecoveryReviewRequestContext,
  type ThemeRecoveryLiveBadgeSnapshot,
} from "../theme-recovery-review";

type ReviewWorkspaceFeedback = {
  tone: "neutral" | "warning" | "error";
  message: string;
};

const SIDE_PANEL_ROUTE_LINKS = [
  {
    id: "settings",
    label: "Open settings",
    href: "./index.html#settings",
  },
  {
    id: "dashboard",
    label: "Open dashboard",
    href: "./index.html#dashboard",
  },
  {
    id: "cursor-detail",
    label: "Open Cursor detail",
    href: "./index.html#provider-detail/cursor",
  },
  {
    id: "codex-detail",
    label: "Open Codex detail",
    href: "./index.html#provider-detail/codex",
  },
  {
    id: "popup",
    label: "Open popup",
    href: "../popup/index.html",
  },
] as const;

const VENDOR_ROUTE_LINKS = [
  {
    id: "cursor-session-page",
    label: "Open Cursor usage page",
    href: "https://cursor.com/dashboard/usage",
  },
  {
    id: "codex-session-page",
    label: "Open Codex analytics page",
    href: "https://chatgpt.com/codex/cloud/settings/analytics#usage",
  },
] as const;

const THEME_RECOVERY_REQUEST_ID_QUERY_PARAM = "themeRecoveryRequestId";
const THEME_RECOVERY_REQUEST_CREATED_AT_QUERY_PARAM =
  "themeRecoveryRequestCreatedAt";

function feedbackToneToNoteClass(
  tone: ReviewWorkspaceFeedback["tone"],
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

function hasLiveActionBadgeReadApi(): boolean {
  return (
    typeof chrome !== "undefined" &&
    Boolean(chrome.runtime?.id) &&
    typeof chrome.action?.getBadgeText === "function" &&
    typeof chrome.action?.getTitle === "function"
  );
}

async function readLiveActionBadge(): Promise<ThemeRecoveryLiveBadgeSnapshot | null> {
  if (!hasLiveActionBadgeReadApi()) {
    return null;
  }

  try {
    const [text, title] = await Promise.all([
      chrome.action.getBadgeText({}),
      chrome.action.getTitle({}),
    ]);

    return {
      available: true,
      text,
      title,
      sourceLabel: "Live extension action badge",
    };
  } catch {
    return {
      available: false,
      text: "",
      title: "",
      sourceLabel: "Live extension action badge unavailable",
    };
  }
}

function formatBadgeText(text: string): string {
  return text.trim().length > 0 ? text.trim() : "cleared";
}

function openRouteInNewTab(href: string) {
  if (typeof window === "undefined") {
    return;
  }

  const targetUrl = new URL(href, window.location.href).toString();
  window.open(targetUrl, "_blank", "noopener,noreferrer");
}

function readThemeRecoveryRequestContext(): ThemeRecoveryReviewRequestContext | null {
  if (typeof window === "undefined") {
    return null;
  }

  const params = new URLSearchParams(window.location.search);
  const requestId =
    params.get(THEME_RECOVERY_REQUEST_ID_QUERY_PARAM)?.trim() ?? "";
  const requestCreatedAt =
    params.get(THEME_RECOVERY_REQUEST_CREATED_AT_QUERY_PARAM)?.trim() ?? "";

  if (requestId.length === 0 || requestCreatedAt.length === 0) {
    return null;
  }

  const boundUrl = new URL(window.location.href);

  boundUrl.searchParams.set(THEME_RECOVERY_REQUEST_ID_QUERY_PARAM, requestId);
  boundUrl.searchParams.set(
    THEME_RECOVERY_REQUEST_CREATED_AT_QUERY_PARAM,
    requestCreatedAt,
  );

  return {
    requestId,
    requestCreatedAt,
    requestBoundWorkspaceRoute: boundUrl.toString(),
  };
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

async function writeClipboardText(value: string): Promise<boolean> {
  if (!navigator.clipboard?.writeText) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

export function ThemeRecoveryReviewPage() {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [liveActionBadge, setLiveActionBadge] =
    useState<ThemeRecoveryLiveBadgeSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [workspaceFeedback, setWorkspaceFeedback] =
    useState<ReviewWorkspaceFeedback | null>(null);
  const requestContext = useMemo(() => readThemeRecoveryRequestContext(), []);

  async function refreshWorkspace() {
    setIsLoading(true);
    setLoadError(null);

    const response = await sendAppMessage({ type: "app:read-state" });

    if (!response.ok) {
      setLoadError(response.error);
      setIsLoading(false);
      return;
    }

    setAppState(response.state);
    setLiveActionBadge(await readLiveActionBadge());
    setIsLoading(false);
  }

  useEffect(() => {
    let disposed = false;

    async function safeRefresh() {
      const response = await sendAppMessage({ type: "app:read-state" });

      if (disposed) {
        return;
      }

      if (!response.ok) {
        setLoadError(response.error);
        setIsLoading(false);
        return;
      }

      setAppState(response.state);
      setLiveActionBadge(await readLiveActionBadge());
      setIsLoading(false);
    }

    void safeRefresh();

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== APP_STATE_STORAGE_KEY) {
        return;
      }

      void safeRefresh();
    };

    const handleFocus = () => {
      void safeRefresh();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    let removeChromeStorageListener = () => {};

    if (
      typeof chrome !== "undefined" &&
      typeof chrome.storage?.onChanged?.addListener === "function"
    ) {
      const handleChromeStorageChange = (
        changes: Record<string, chrome.storage.StorageChange>,
        areaName: string,
      ) => {
        if (areaName !== "local" || !(APP_STATE_STORAGE_KEY in changes)) {
          return;
        }

        void safeRefresh();
      };

      chrome.storage.onChanged.addListener(handleChromeStorageChange);
      removeChromeStorageListener = () => {
        chrome.storage.onChanged.removeListener(handleChromeStorageChange);
      };
    }

    return () => {
      disposed = true;
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
      removeChromeStorageListener();
    };
  }, []);

  const snapshot = useMemo(
    () =>
      appState
        ? buildThemeRecoveryReviewSnapshot(
            appState,
            undefined,
            undefined,
            requestContext,
          )
        : null,
    [appState, requestContext],
  );

  const exportValue = useMemo(
    () =>
      snapshot ? buildThemeRecoveryReviewExport(snapshot, liveActionBadge) : null,
    [liveActionBadge, snapshot],
  );

  const summaryDraft = useMemo(
    () =>
      snapshot ? buildThemeRecoveryReviewSummary(snapshot, liveActionBadge) : "",
    [liveActionBadge, snapshot],
  );

  const jsonDraft = useMemo(
    () => (exportValue ? serializeThemeRecoveryReviewExport(exportValue) : ""),
    [exportValue],
  );

  const badgeSummary = liveActionBadge?.available
    ? liveActionBadge
    : {
        available: false,
        text: snapshot?.computedActionBadge.text ?? "",
        title: snapshot?.computedActionBadge.title ?? "",
        sourceLabel: "Computed from current app state",
      };

  return (
    <main className="app-shell theme-recovery-shell">
      <TopBar
        title="Theme Recovery Review"
        subtitle="Operator workspace"
        secondaryActionLabel="Refresh"
        primaryActionLabel="Open settings"
        onSecondaryAction={() => {
          void refreshWorkspace();
        }}
        onPrimaryAction={() => {
          openRouteInNewTab("./index.html#settings");
        }}
      />

      <section
        className="hero-card"
        data-theme-recovery-page="true"
        data-theme-local-surface="theme-recovery-hero-card"
      >
        <p
          className="section-label"
          data-theme-local-surface="theme-recovery-hero-label"
        >
          Real-session follow-up
        </p>
        <h2 className="display-headline">
          One place to stage native-prompt and real-session recovery checks
        </h2>
        <p className="body-copy">
          This route does not claim that the native host prompt or a real vendor
          session already passed. It collects the current theme state, recovery
          state, quick links, and copyable evidence so the next operator pass can
          stay truthful and repeatable.
        </p>
        <span
          className="token-chip"
          data-theme-local-surface="theme-recovery-hero-chip"
        >
          Theme QA · Recovery follow-up
        </span>
      </section>

      {isLoading ? (
        <section className="status-card">
          <p className="section-title">Loading current review state…</p>
          <p className="supporting-copy">
            Reading the current app state and action badge so this workspace can
            reflect the same theme and provider state as the shipped surfaces.
          </p>
        </section>
      ) : loadError ? (
        <section className="detail-note detail-note--error">
          <p className="detail-note__label">Could not load review state</p>
          <p className="supporting-copy">{loadError}</p>
        </section>
      ) : snapshot ? (
        <>
          <section
            className={`status-card theme-recovery-status-card${
              snapshot.overallTone === "warning"
                ? " status-card--warning"
                : snapshot.overallTone === "error"
                  ? " status-card--error"
                  : ""
            }`}
            data-theme-recovery-current-state
          >
            <div className="dashboard-section__header">
              <div>
                <p className="section-label">Current truth</p>
                <h2 className="section-title">Recovery status right now</h2>
              </div>
              <p className="supporting-copy">{snapshot.overallDetail}</p>
            </div>

            <div className="summary-strip theme-recovery-summary-strip">
              <div
                className={`summary-pill${
                  snapshot.overallTone === "warning"
                    ? " summary-pill--warning"
                    : snapshot.overallTone === "error"
                      ? " summary-pill--error"
                      : ""
                }`}
              >
                <p className="summary-pill__label">Review stage</p>
                <p
                  className="summary-pill__value"
                  data-theme-recovery-overall-label
                >
                  {snapshot.overallLabel}
                </p>
              </div>
              <div
                className={`summary-pill${
                  snapshot.popupSnapshotTone === "warning"
                    ? " summary-pill--warning"
                    : snapshot.popupSnapshotTone === "error"
                      ? " summary-pill--error"
                      : ""
                }`}
              >
                <p className="summary-pill__label">Popup snapshot</p>
                <p
                  className="summary-pill__value"
                  data-theme-recovery-popup-label
                >
                  {snapshot.popupSnapshotLabel}
                </p>
              </div>
              <div
                className={`summary-pill${
                  badgeSummary.text.trim().length > 0
                    ? " summary-pill--warning"
                    : ""
                }`}
              >
                <p className="summary-pill__label">Action badge</p>
                <p
                  className="summary-pill__value"
                  data-theme-recovery-badge-text
                >
                  {formatBadgeText(badgeSummary.text)}
                </p>
              </div>
            </div>
          </section>

          <section className="status-card">
            <div className="dashboard-section__header">
              <div>
                <p className="section-label">Theme state</p>
                <h2 className="section-title">Shared runtime state</h2>
              </div>
              <p className="supporting-copy">
                This workspace reads the same saved theme settings used by the
                side panel, popup, and audit hub. The operator pass should keep
                the current custom-seed state fixed while recovering provider
                access.
              </p>
            </div>

            <div className="detail-grid">
              <div className="detail-field">
                <p className="detail-field__label">Theme mode</p>
                <p className="detail-field__value" data-theme-recovery-theme-mode>
                  {snapshot.themeMode}
                </p>
              </div>
              <div className="detail-field">
                <p className="detail-field__label">Resolved mode</p>
                <p
                  className="detail-field__value"
                  data-theme-recovery-theme-resolved
                >
                  {snapshot.themeResolved}
                </p>
              </div>
              <div className="detail-field">
                <p className="detail-field__label">Accent preset</p>
                <p
                  className="detail-field__value"
                  data-theme-recovery-theme-preset
                >
                  {snapshot.themePreset}
                </p>
              </div>
              <div className="detail-field">
                <p className="detail-field__label">Custom seed</p>
                <p className="detail-field__value" data-theme-recovery-seed>
                  {snapshot.themeCustomSeedHex ?? "Not set"}
                </p>
              </div>
              <div className="detail-field">
                <p className="detail-field__label">Scope isolation</p>
                <p className="detail-field__value" data-theme-recovery-scope-label>
                  {snapshot.scopeIsolationLabel}
                </p>
              </div>
              <div className="detail-field">
                <p className="detail-field__label">Live badge source</p>
                <p className="detail-field__value">
                  {badgeSummary.sourceLabel}
                </p>
              </div>
            </div>

            <div className="detail-note detail-note--neutral">
              <p className="detail-note__label">Scope note</p>
              <p className="supporting-copy" data-theme-recovery-scope-detail>
                {snapshot.scopeIsolationDetail}
              </p>
              <p className="supporting-copy">
                Popup snapshot: {snapshot.popupSnapshotDetail}
              </p>
              <p className="supporting-copy">
                Action badge title: {badgeSummary.title}
              </p>
            </div>
          </section>

          {requestContext ? (
            <section
              className="status-card"
              data-theme-recovery-request-scope="bound"
            >
              <div className="dashboard-section__header">
                <div>
                  <p className="section-label">Request scope</p>
                  <h2 className="section-title">Repo-backed request binding</h2>
                </div>
                <p className="supporting-copy">
                  This workspace is bound to one pending theme-recovery request.
                  Summary and JSON exports should preserve this request identity
                  so completion cannot accidentally fulfill a different request.
                </p>
              </div>

              <div className="detail-grid">
                <div className="detail-field">
                  <p className="detail-field__label">Request id</p>
                  <p
                    className="detail-field__value"
                    data-theme-recovery-request-id
                  >
                    {requestContext.requestId}
                  </p>
                </div>
                <div className="detail-field">
                  <p className="detail-field__label">Created at</p>
                  <p
                    className="detail-field__value"
                    data-theme-recovery-request-created-at
                  >
                    {requestContext.requestCreatedAt}
                  </p>
                </div>
              </div>

              <div className="detail-note detail-note--neutral">
                <p className="detail-note__label">Bound workspace route</p>
                <p
                  className="supporting-copy"
                  data-theme-recovery-request-route
                >
                  {requestContext.requestBoundWorkspaceRoute}
                </p>
              </div>
            </section>
          ) : (
            <section
              className="detail-note detail-note--warning"
              data-theme-recovery-request-scope="ad-hoc"
            >
              <p className="detail-note__label">Ad-hoc workspace</p>
              <p className="supporting-copy">
                This review route is not currently bound to a repo-backed
                request. Its exports are still useful for local inspection, but
                they should not be used to fulfill a pending request.
              </p>
            </section>
          )}

          <section className="provider-shell-list theme-recovery-provider-list">
            {snapshot.targetProviders.map((provider) => (
              <article
                key={provider.providerId}
                className={`provider-card${
                  provider.recoveryTone === "warning"
                    ? " provider-card--warning"
                    : provider.recoveryTone === "error"
                      ? " provider-card--error"
                      : ""
                }`}
                data-theme-recovery-provider={provider.providerId}
                data-theme-recovery-provider-visible={provider.visible ? "true" : "false"}
              >
                <header className="provider-card__header">
                  <div>
                    <p className="provider-card__provider">{provider.providerLabel}</p>
                    <p className="provider-card__plan">{provider.currentSourceLabel}</p>
                  </div>
                  <StatusBadge
                    label={provider.recoveryLabel}
                    tone={provider.recoveryTone}
                  />
                </header>

                <div className="provider-card__body">
                  <div className="provider-card__meta">
                    <span className="meta-chip">{provider.hostAccessLabel}</span>
                    <span
                      className={`meta-chip${
                        provider.currentSourceStateTone === "warning"
                          ? " meta-chip--warning"
                          : provider.currentSourceStateTone === "error"
                            ? " meta-chip--error"
                            : ""
                      }`}
                    >
                      {provider.currentSourceStateLabel}
                    </span>
                    <span className="meta-chip">{provider.lastSyncLabel}</span>
                  </div>
                  <p className="body-copy" data-theme-recovery-provider-status>
                    {provider.recoveryDetail}
                  </p>
                  <p className="supporting-copy">
                    Source detail: {provider.currentSourceStateDetail}
                  </p>
                </div>
              </article>
            ))}
          </section>

          <section className="status-card">
            <div className="dashboard-section__header">
              <div>
                <p className="section-label">Operator workflow</p>
                <h2 className="section-title">Real-session follow-up steps</h2>
              </div>
              <p className="supporting-copy">
                Keep this page open while switching between Settings, popup, and
                the target vendor pages. Use the links below to open the exact
                shipped surfaces in separate tabs without losing this workspace.
              </p>
            </div>

            <ol className="feature-list theme-recovery-checklist">
              <li>Keep the current custom seed fixed and confirm the workspace still reports the expected theme mode, resolved mode, preset, and seed.</li>
              <li>Use Settings to keep only Cursor and Codex visible before trusting popup alignment and the action badge.</li>
              <li>Capture the degraded state first: missing host access or a blocked real session should keep this page in a warning state.</li>
              <li>Grant host access through the native prompt or restore the real vendor session, then refresh this page and confirm the review stage returns to recovered.</li>
              <li>Copy the summary or JSON export after the real pass so the result can be attached to a later repo-backed archive or operator note.</li>
            </ol>

            <div className="theme-recovery-link-groups">
              <div className="theme-recovery-link-group">
                <p className="detail-note__label">Extension surfaces</p>
                <div className="interaction-audit__actions">
                  {SIDE_PANEL_ROUTE_LINKS.map((link) => (
                    <a
                      key={link.id}
                      className="text-button interaction-audit__open-link"
                      data-theme-recovery-link={link.id}
                      href={link.href}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>

              <div className="theme-recovery-link-group">
                <p className="detail-note__label">Vendor session pages</p>
                <div className="interaction-audit__actions">
                  {VENDOR_ROUTE_LINKS.map((link) => (
                    <a
                      key={link.id}
                      className="text-button interaction-audit__open-link"
                      data-theme-recovery-vendor-link={link.id}
                      href={link.href}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="status-card">
            <div className="status-card__header">
              <div>
                <p className="section-label">Copyable outputs</p>
                <h2 className="section-title">Summary and JSON evidence</h2>
              </div>
              <p className="supporting-copy">
                These outputs stay read-only. They reflect the current workspace
                state exactly as shown above and can be copied after a manual
                extension-mode or real-session pass.
              </p>
            </div>

            <div className="interaction-audit__actions theme-recovery-copy-actions">
              <button
                className="text-button"
                data-theme-recovery-copy="summary"
                type="button"
                onClick={async () => {
                  const copied = await writeClipboardText(summaryDraft);
                  setWorkspaceFeedback({
                    tone: copied ? "neutral" : "warning",
                    message: copied
                      ? "Copied the current theme recovery summary."
                      : "Clipboard access is not available in this context.",
                  });
                }}
              >
                Copy summary
              </button>
              <button
                className="text-button"
                data-theme-recovery-download="summary"
                type="button"
                onClick={() => {
                  if (!exportValue) {
                    return;
                  }

                  const downloaded = downloadTextFile(
                    buildThemeRecoveryExportFilename(
                      "summary-draft",
                      exportValue,
                    ),
                    summaryDraft,
                    "text/markdown;charset=utf-8",
                  );
                  setWorkspaceFeedback({
                    tone: downloaded ? "neutral" : "warning",
                    message: downloaded
                      ? "Downloaded the current theme recovery summary."
                      : "Direct download is not available in this context.",
                  });
                }}
              >
                Download summary
              </button>
              <button
                className="text-button"
                data-theme-recovery-copy="json"
                type="button"
                onClick={async () => {
                  const copied = await writeClipboardText(jsonDraft);
                  setWorkspaceFeedback({
                    tone: copied ? "neutral" : "warning",
                    message: copied
                      ? "Copied the current theme recovery JSON export."
                      : "Clipboard access is not available in this context.",
                  });
                }}
              >
                Copy JSON
              </button>
              <button
                className="text-button"
                data-theme-recovery-download="json"
                type="button"
                onClick={() => {
                  if (!exportValue) {
                    return;
                  }

                  const downloaded = downloadTextFile(
                    buildThemeRecoveryExportFilename(
                      "export-json",
                      exportValue,
                    ),
                    jsonDraft,
                    "application/json;charset=utf-8",
                  );
                  setWorkspaceFeedback({
                    tone: downloaded ? "neutral" : "warning",
                    message: downloaded
                      ? "Downloaded the current theme recovery JSON export."
                      : "Direct download is not available in this context.",
                  });
                }}
              >
                Download JSON
              </button>
              <button
                className="text-button"
                type="button"
                onClick={() => {
                  openRouteInNewTab("./index.html#settings");
                }}
              >
                Open settings in new tab
              </button>
            </div>

            <div className="theme-recovery-export-grid">
              <div className="theme-recovery-export-panel">
                <p className="detail-note__label">Summary draft</p>
                <pre
                  className="capture-pre"
                  data-theme-recovery-summary-draft
                >
                  {summaryDraft}
                </pre>
              </div>

              <div className="theme-recovery-export-panel">
                <p className="detail-note__label">JSON export</p>
                <pre
                  className="capture-pre"
                  data-theme-recovery-json-draft
                >
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
              <p className="detail-note__label">Workspace note</p>
              <p className="supporting-copy">{workspaceFeedback.message}</p>
            </section>
          ) : null}
        </>
      ) : null}
    </main>
  );
}
