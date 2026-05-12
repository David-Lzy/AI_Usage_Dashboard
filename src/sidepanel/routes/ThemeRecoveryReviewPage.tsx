import { useEffect, useMemo, useState } from "react";

import type { AppState } from "../../providers/types";
import { sendAppMessage } from "../../shared/app-client";
import { APP_STATE_STORAGE_KEY } from "../../shared/constants";
import type { RuntimeI18n } from "../../shared/i18n";
import { buildOperatorWorkspaceLocalizedCopy } from "../../shared/localized-copy";
import { TopBar } from "../components/TopBar";
import { StatusBadge } from "../components/StatusBadge";
import { ThemeRecoveryCurrentStateCard } from "../components/ThemeRecoveryCurrentStateCard";
import { downloadTextFile } from "../download-text-file";
import { createDefaultOperatorRuntimeI18n } from "../operator-runtime-i18n";
import { buildThemeRecoveryExportFilename } from "../theme-recovery-export-files";
import {
  buildThemeRecoveryReviewExport,
  buildThemeRecoveryReviewSnapshot,
  buildThemeRecoveryReviewSummary,
  serializeThemeRecoveryReviewExport,
  type ThemeRecoveryReviewRequestContext,
  type ThemeRecoveryLiveBadgeSnapshot,
} from "../theme-recovery-review";
import { writeClipboardText } from "../write-clipboard-text";

type ReviewWorkspaceFeedback = {
  tone: "neutral" | "warning" | "error";
  message: string;
};

const SIDE_PANEL_ROUTE_LINKS = [
  {
    id: "settings",
    href: "./index.html#settings",
  },
  {
    id: "dashboard",
    href: "./index.html#dashboard",
  },
  {
    id: "cursor-detail",
    href: "./index.html#provider-detail/cursor",
  },
  {
    id: "codex-detail",
    href: "./index.html#provider-detail/codex",
  },
  {
    id: "popup",
    href: "../popup/index.html",
  },
] as const;

const VENDOR_ROUTE_LINKS = [
  {
    id: "cursor-session-page",
    href: "https://cursor.com/dashboard/usage",
  },
  {
    id: "codex-session-page",
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

type ThemeRecoveryReviewPageProps = {
  i18n?: RuntimeI18n;
};

export function ThemeRecoveryReviewPage({
  i18n = createDefaultOperatorRuntimeI18n(),
}: ThemeRecoveryReviewPageProps = {}) {
  const copy = buildOperatorWorkspaceLocalizedCopy(i18n).themeRecovery;
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
        sourceLabel: copy.themeState.computedBadgeSource,
      };

  return (
    <main className="app-shell theme-recovery-shell">
      <TopBar
        title={copy.topbar.title}
        subtitle={copy.topbar.subtitle}
        secondaryActionLabel={copy.topbar.refresh}
        primaryActionLabel={copy.topbar.openSettings}
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
          {copy.hero.eyebrow}
        </p>
        <h2 className="display-headline">{copy.hero.title}</h2>
        <p className="body-copy">{copy.hero.detail}</p>
        <span
          className="token-chip"
          data-theme-local-surface="theme-recovery-hero-chip"
        >
          {copy.hero.chip}
        </span>
      </section>

      {isLoading ? (
        <section className="status-card">
          <p className="section-title">{copy.loading.title}</p>
          <p className="supporting-copy">{copy.loading.detail}</p>
        </section>
      ) : loadError ? (
        <section className="detail-note detail-note--error">
          <p className="detail-note__label">{copy.error.title}</p>
          <p className="supporting-copy">{loadError}</p>
        </section>
      ) : snapshot ? (
        <>
          <ThemeRecoveryCurrentStateCard
            badgeSummary={badgeSummary}
            copy={copy.currentTruth}
            snapshot={snapshot}
          />

          <section className="status-card">
            <div className="dashboard-section__header">
              <div>
                <p className="section-label">{copy.themeState.eyebrow}</p>
                <h2 className="section-title">{copy.themeState.title}</h2>
              </div>
              <p className="supporting-copy">{copy.themeState.detail}</p>
            </div>

            <div className="detail-grid">
              <div className="detail-field">
                <p className="detail-field__label">{copy.themeState.themeMode}</p>
                <p className="detail-field__value" data-theme-recovery-theme-mode>
                  {snapshot.themeMode}
                </p>
              </div>
              <div className="detail-field">
                <p className="detail-field__label">
                  {copy.themeState.resolvedMode}
                </p>
                <p
                  className="detail-field__value"
                  data-theme-recovery-theme-resolved
                >
                  {snapshot.themeResolved}
                </p>
              </div>
              <div className="detail-field">
                <p className="detail-field__label">
                  {copy.themeState.accentPreset}
                </p>
                <p
                  className="detail-field__value"
                  data-theme-recovery-theme-preset
                >
                  {snapshot.themePreset}
                </p>
              </div>
              <div className="detail-field">
                <p className="detail-field__label">{copy.themeState.customSeed}</p>
                <p className="detail-field__value" data-theme-recovery-seed>
                  {snapshot.themeCustomSeedHex ?? copy.themeState.notSet}
                </p>
              </div>
              <div className="detail-field">
                <p className="detail-field__label">
                  {copy.themeState.scopeIsolation}
                </p>
                <p className="detail-field__value" data-theme-recovery-scope-label>
                  {snapshot.scopeIsolationLabel}
                </p>
              </div>
              <div className="detail-field">
                <p className="detail-field__label">
                  {copy.themeState.liveBadgeSource}
                </p>
                <p className="detail-field__value">
                  {badgeSummary.sourceLabel}
                </p>
              </div>
            </div>

            <div className="detail-note detail-note--neutral">
              <p className="detail-note__label">{copy.themeState.scopeNote}</p>
              <p className="supporting-copy" data-theme-recovery-scope-detail>
                {snapshot.scopeIsolationDetail}
              </p>
              <p className="supporting-copy">
                {copy.themeState.popupSnapshotPrefix}:{" "}
                {snapshot.popupSnapshotDetail}
              </p>
              <p className="supporting-copy">
                {copy.themeState.actionBadgeTitlePrefix}: {badgeSummary.title}
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
                  <p className="section-label">{copy.requestScope.eyebrow}</p>
                  <h2 className="section-title">{copy.requestScope.title}</h2>
                </div>
                <p className="supporting-copy">{copy.requestScope.detail}</p>
              </div>

              <div className="detail-grid">
                <div className="detail-field">
                  <p className="detail-field__label">
                    {copy.requestScope.requestId}
                  </p>
                  <p
                    className="detail-field__value"
                    data-theme-recovery-request-id
                  >
                    {requestContext.requestId}
                  </p>
                </div>
                <div className="detail-field">
                  <p className="detail-field__label">
                    {copy.requestScope.createdAt}
                  </p>
                  <p
                    className="detail-field__value"
                    data-theme-recovery-request-created-at
                  >
                    {requestContext.requestCreatedAt}
                  </p>
                </div>
              </div>

              <div className="detail-note detail-note--neutral">
                <p className="detail-note__label">
                  {copy.requestScope.boundWorkspaceRoute}
                </p>
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
              <p className="detail-note__label">{copy.requestScope.adHocTitle}</p>
              <p className="supporting-copy">{copy.requestScope.adHocDetail}</p>
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
                <p className="section-label">{copy.workflow.eyebrow}</p>
                <h2 className="section-title">{copy.workflow.title}</h2>
              </div>
              <p className="supporting-copy">{copy.workflow.detail}</p>
            </div>

            <ol className="feature-list theme-recovery-checklist">
              {copy.workflow.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>

            <div className="theme-recovery-link-groups">
              <div className="theme-recovery-link-group">
                <p className="detail-note__label">
                  {copy.workflow.extensionSurfaces}
                </p>
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
                      {copy.links.sidePanel[link.id]}
                    </a>
                  ))}
                </div>
              </div>

              <div className="theme-recovery-link-group">
                <p className="detail-note__label">
                  {copy.workflow.vendorSessionPages}
                </p>
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
                      {copy.links.vendor[link.id]}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="status-card">
            <div className="status-card__header">
              <div>
                <p className="section-label">{copy.outputs.eyebrow}</p>
                <h2 className="section-title">{copy.outputs.title}</h2>
              </div>
              <p className="supporting-copy">{copy.outputs.detail}</p>
            </div>

            <div className="interaction-audit__actions theme-recovery-copy-actions">
              <button
                className="text-button"
                data-theme-recovery-copy="summary"
                type="button"
                onClick={async () => {
                  const copied =
                    (await writeClipboardText(summaryDraft)) === "success";
                  setWorkspaceFeedback({
                    tone: copied ? "neutral" : "warning",
                    message: copied
                      ? copy.outputs.copiedSummary
                      : copy.outputs.clipboardUnavailable,
                  });
                }}
              >
                {copy.outputs.copySummary}
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
                      ? copy.outputs.downloadedSummary
                      : copy.outputs.downloadUnavailable,
                  });
                }}
              >
                {copy.outputs.downloadSummary}
              </button>
              <button
                className="text-button"
                data-theme-recovery-copy="json"
                type="button"
                onClick={async () => {
                  const copied =
                    (await writeClipboardText(jsonDraft)) === "success";
                  setWorkspaceFeedback({
                    tone: copied ? "neutral" : "warning",
                    message: copied
                      ? copy.outputs.copiedJson
                      : copy.outputs.clipboardUnavailable,
                  });
                }}
              >
                {copy.outputs.copyJson}
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
                      ? copy.outputs.downloadedJson
                      : copy.outputs.downloadUnavailable,
                  });
                }}
              >
                {copy.outputs.downloadJson}
              </button>
              <button
                className="text-button"
                type="button"
                onClick={() => {
                  openRouteInNewTab("./index.html#settings");
                }}
              >
                {copy.outputs.openSettingsTab}
              </button>
            </div>

            <div className="theme-recovery-export-grid">
              <div className="theme-recovery-export-panel">
                <p className="detail-note__label">{copy.outputs.summaryDraft}</p>
                <pre
                  className="capture-pre"
                  data-theme-recovery-summary-draft
                >
                  {summaryDraft}
                </pre>
              </div>

              <div className="theme-recovery-export-panel">
                <p className="detail-note__label">{copy.outputs.jsonExport}</p>
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
              <p className="detail-note__label">{copy.outputs.workspaceNote}</p>
              <p className="supporting-copy">{workspaceFeedback.message}</p>
            </section>
          ) : null}
        </>
      ) : null}
    </main>
  );
}
