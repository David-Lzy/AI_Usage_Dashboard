import { useEffect, useMemo, useState } from "react";

import type { AppState } from "../../providers/types";
import { sendAppMessage } from "../../shared/app-client";
import { APP_STATE_STORAGE_KEY } from "../../shared/constants";
import type { RuntimeI18n } from "../../shared/i18n";
import { buildOperatorWorkspaceLocalizedCopy } from "../../shared/operator-workspace-localized-copy";
import { TopBar } from "../components/TopBar";
import { ThemeRecoveryCurrentStateCard } from "../components/ThemeRecoveryCurrentStateCard";
import {
  ThemeRecoveryOutputsSection,
  type ThemeRecoveryWorkspaceFeedback,
} from "../components/ThemeRecoveryOutputsSection";
import { ThemeRecoveryProviderList } from "../components/ThemeRecoveryProviderList";
import { ThemeRecoveryRequestScopeSection } from "../components/ThemeRecoveryRequestScopeSection";
import { ThemeRecoveryThemeStateCard } from "../components/ThemeRecoveryThemeStateCard";
import { ThemeRecoveryWorkflowLinksCard } from "../components/ThemeRecoveryWorkflowLinksCard";
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

const THEME_RECOVERY_REQUEST_ID_QUERY_PARAM = "themeRecoveryRequestId";
const THEME_RECOVERY_REQUEST_CREATED_AT_QUERY_PARAM =
  "themeRecoveryRequestCreatedAt";

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
    useState<ThemeRecoveryWorkspaceFeedback | null>(null);
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

  async function handleCopySummary() {
    const copied = (await writeClipboardText(summaryDraft)) === "success";
    setWorkspaceFeedback({
      tone: copied ? "neutral" : "warning",
      message: copied
        ? copy.outputs.copiedSummary
        : copy.outputs.clipboardUnavailable,
    });
  }

  function handleDownloadSummary() {
    if (!exportValue) {
      return;
    }

    const downloaded = downloadTextFile(
      buildThemeRecoveryExportFilename("summary-draft", exportValue),
      summaryDraft,
      "text/markdown;charset=utf-8",
    );
    setWorkspaceFeedback({
      tone: downloaded ? "neutral" : "warning",
      message: downloaded
        ? copy.outputs.downloadedSummary
        : copy.outputs.downloadUnavailable,
    });
  }

  async function handleCopyJson() {
    const copied = (await writeClipboardText(jsonDraft)) === "success";
    setWorkspaceFeedback({
      tone: copied ? "neutral" : "warning",
      message: copied
        ? copy.outputs.copiedJson
        : copy.outputs.clipboardUnavailable,
    });
  }

  function handleDownloadJson() {
    if (!exportValue) {
      return;
    }

    const downloaded = downloadTextFile(
      buildThemeRecoveryExportFilename("export-json", exportValue),
      jsonDraft,
      "application/json;charset=utf-8",
    );
    setWorkspaceFeedback({
      tone: downloaded ? "neutral" : "warning",
      message: downloaded
        ? copy.outputs.downloadedJson
        : copy.outputs.downloadUnavailable,
    });
  }

  function handleOpenSettingsTab() {
    openRouteInNewTab("./index.html#settings");
  }

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

          <ThemeRecoveryThemeStateCard
            badgeSummary={badgeSummary}
            copy={copy.themeState}
            snapshot={snapshot}
          />

          <ThemeRecoveryRequestScopeSection
            copy={copy.requestScope}
            requestContext={requestContext}
          />

          <ThemeRecoveryProviderList providers={snapshot.targetProviders} />

          <ThemeRecoveryWorkflowLinksCard
            linksCopy={copy.links}
            workflowCopy={copy.workflow}
          />

          <ThemeRecoveryOutputsSection
            copy={copy.outputs}
            jsonDraft={jsonDraft}
            summaryDraft={summaryDraft}
            workspaceFeedback={workspaceFeedback}
            onCopyJson={handleCopyJson}
            onCopySummary={handleCopySummary}
            onDownloadJson={handleDownloadJson}
            onDownloadSummary={handleDownloadSummary}
            onOpenSettingsTab={handleOpenSettingsTab}
          />
        </>
      ) : null}
    </main>
  );
}
