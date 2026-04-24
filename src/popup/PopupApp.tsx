import { useEffect, useState } from "react";

import type { AppState, ProviderId } from "../providers/types";
import { sendAppMessage } from "../shared/app-client";
import {
  buildSidePanelExtensionPath,
  buildSidePanelPreviewUrl,
} from "../shared/extension-surface-paths";
import { DEFAULT_THEME_SETTINGS, startThemeSettingsSync } from "../shared/theme";
import { SummaryStrip } from "../sidepanel/components/SummaryStrip";
import { StatusBadge } from "../sidepanel/components/StatusBadge";
import { type SidePanelRouteState } from "../sidepanel/route-state";
import { buildPopupViewModel, type PopupGuidanceAction } from "./view-models";

type PopupLoadState =
  | { status: "loading" }
  | { status: "ready"; appState: AppState }
  | { status: "error"; message: string };

async function openSidePanelRoute(route: SidePanelRouteState) {
  const path = buildSidePanelExtensionPath(route);

  if (
    typeof chrome !== "undefined" &&
    Boolean(chrome.runtime?.id) &&
    typeof chrome.sidePanel?.open === "function" &&
    typeof chrome.sidePanel?.setOptions === "function" &&
    typeof chrome.windows?.getCurrent === "function"
  ) {
    const [activeTab] =
      typeof chrome.tabs?.query === "function"
        ? await chrome.tabs.query({ active: true, currentWindow: true })
        : [];

    if (typeof activeTab?.id === "number") {
      await chrome.sidePanel.setOptions({
        tabId: activeTab.id,
        enabled: true,
        path,
      });
      await chrome.sidePanel.open({ tabId: activeTab.id });
    } else {
      const currentWindow = await chrome.windows.getCurrent();

      if (typeof currentWindow.id === "number") {
        await chrome.sidePanel.setOptions({
          enabled: true,
          path,
        });
        await chrome.sidePanel.open({ windowId: currentWindow.id });
      }
    }

    window.close();
    return;
  }

  window.open(
    buildSidePanelPreviewUrl(route, window.location.href),
    "_blank",
    "noopener,noreferrer",
  );
}

async function openFullDashboard() {
  await openSidePanelRoute({ name: "dashboard" });
}

async function openSettings() {
  await openSidePanelRoute({ name: "settings" });
}

async function openProviderDetail(providerId: ProviderId) {
  await openSidePanelRoute({ name: "provider-detail", providerId });
}

async function handleGuidanceAction(action: PopupGuidanceAction) {
  if (action.kind === "settings") {
    await openSettings();
    return;
  }

  if (action.kind === "dashboard") {
    await openFullDashboard();
    return;
  }

  if (action.kind === "provider-detail" && action.providerId) {
    await openProviderDetail(action.providerId);
  }
}

export function PopupApp() {
  const [loadState, setLoadState] = useState<PopupLoadState>({
    status: "loading",
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let disposed = false;

    async function loadState() {
      const response = await sendAppMessage({ type: "app:read-state" });

      if (disposed) {
        return;
      }

      if (!response.ok) {
        setLoadState({ status: "error", message: response.error });
        return;
      }

      setLoadState({ status: "ready", appState: response.state });
    }

    void loadState();

    return () => {
      disposed = true;
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined" || typeof window === "undefined") {
      return undefined;
    }

    const themeSettings =
      loadState.status === "ready"
        ? loadState.appState.settings
        : DEFAULT_THEME_SETTINGS;

    return startThemeSettingsSync(themeSettings, document.documentElement, window);
  }, [loadState]);

  async function handleRefresh() {
    setIsRefreshing(true);
    const response = await sendAppMessage({ type: "app:request-refresh" });

    if (!response.ok) {
      setLoadState({ status: "error", message: response.error });
      setIsRefreshing(false);
      return;
    }

    setLoadState({ status: "ready", appState: response.state });
    setIsRefreshing(false);
  }

  if (loadState.status === "loading") {
    return (
      <main className="app-shell popup-shell">
        <section className="status-card">
          <p className="section-label">Toolbar Popup</p>
          <h1 className="section-title">Loading cached dashboard state</h1>
          <p className="supporting-copy">
            Preparing the shared quota snapshot for this browser profile.
          </p>
        </section>
      </main>
    );
  }

  if (loadState.status === "error") {
    return (
      <main className="app-shell popup-shell">
        <section className="status-card">
          <p className="section-label">Toolbar Popup</p>
          <h1 className="section-title">Popup load failed</h1>
          <p className="supporting-copy">{loadState.message}</p>
          <div className="popup-actions">
            <button className="text-button" type="button" onClick={handleRefresh}>
              Retry
            </button>
            <button
              className="text-button"
              type="button"
              onClick={() => {
                void openFullDashboard();
              }}
            >
              Open dashboard
            </button>
            <button
              className="text-button"
              type="button"
              onClick={() => {
                void openSettings();
              }}
            >
              Open settings
            </button>
          </div>
        </section>
      </main>
    );
  }

  const popupModel = buildPopupViewModel(loadState.appState);
  const guidanceCard = popupModel.guidanceCard;

  return (
    <main className="app-shell popup-shell">
      <section className="status-card popup-header">
        <div>
          <p className="section-label" data-theme-local-surface="popup-header-label">
            Toolbar Popup
          </p>
          <h1 className="section-title">Quick glance</h1>
          <p className="supporting-copy">{popupModel.headerDetail}</p>
        </div>
        <div className="popup-actions">
          <button
            className="text-button"
            type="button"
            disabled={isRefreshing}
            onClick={handleRefresh}
          >
            {isRefreshing ? "Refreshing" : "Refresh"}
          </button>
        </div>
      </section>

      <SummaryStrip ariaLabel="Popup top summary" items={popupModel.summaryItems} />

      {guidanceCard ? (
        <section
          className={`status-card${
            guidanceCard.tone === "neutral"
              ? ""
              : ` status-card--${guidanceCard.tone}`
          }`}
          data-theme-local-surface="popup-guidance-card"
        >
          <div className="status-card__header">
            <div>
              <p className="section-label">Popup Guidance</p>
              <h2 className="section-title">{guidanceCard.headline}</h2>
            </div>
            <StatusBadge
              label={guidanceCard.label}
              tone={guidanceCard.tone}
            />
          </div>
          <p className="supporting-copy">{guidanceCard.detail}</p>
          <div className="popup-actions">
            <button
              className="text-button"
              data-theme-local-surface="popup-guidance-action"
              type="button"
              onClick={() => {
                void handleGuidanceAction(guidanceCard.action);
              }}
            >
              {guidanceCard.action.label}
            </button>
          </div>
        </section>
      ) : null}

      <section
        className="status-card popup-setup-coverage"
        data-theme-local-surface="popup-setup-coverage-card"
      >
        <div className="status-card__header">
          <div>
            <p
              className="section-label"
              data-theme-local-surface="popup-setup-coverage-label"
            >
              {popupModel.setupCoverage.label}
            </p>
            <h2 className="section-title">{popupModel.setupCoverage.headline}</h2>
          </div>
          <div data-popup-setup-coverage-stage>
            <StatusBadge
              label={popupModel.setupCoverage.statusLabel}
              tone={popupModel.setupCoverage.tone}
            />
          </div>
        </div>
        <p className="supporting-copy" data-popup-setup-coverage-detail>
          {popupModel.setupCoverage.detail}
        </p>
        <div data-popup-setup-coverage-grid>
          <SummaryStrip
            ariaLabel="Popup setup coverage"
            items={popupModel.setupCoverage.items}
          />
        </div>
      </section>

      {popupModel.showSnapshotStatus ? (
        <section
          className={`status-card${
            popupModel.snapshotStatus.tone === "neutral"
              ? ""
              : ` status-card--${popupModel.snapshotStatus.tone}`
          }`}
          data-theme-local-surface="popup-snapshot-status-card"
        >
          <div className="status-card__header">
            <div>
              <p className="section-label">Snapshot Status</p>
              <h2 className="section-title">{popupModel.snapshotStatus.headline}</h2>
            </div>
            <StatusBadge
              label={popupModel.snapshotStatus.label}
              tone={popupModel.snapshotStatus.tone}
            />
          </div>
          <p className="supporting-copy">{popupModel.snapshotStatus.detail}</p>
        </section>
      ) : null}

      <section
        className="status-card"
        data-theme-local-surface="popup-actions-card"
      >
        <p className="section-label" data-theme-local-surface="popup-actions-label">
          {popupModel.actionSection.label}
        </p>
        <p className="supporting-copy">{popupModel.actionSection.detail}</p>
        <div className="popup-actions">
          {popupModel.actionSection.actions.map((action) => (
            <button
              key={`${action.kind}-${action.providerId ?? "root"}`}
              className="text-button"
              data-theme-local-surface={
                action.kind === "dashboard" ? "popup-open-dashboard" : undefined
              }
              type="button"
              onClick={() => {
                void handleGuidanceAction(action);
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      </section>

      <section
        className="status-card"
        data-theme-local-surface="popup-contract-card"
      >
        <p className="section-label">{popupModel.surfaceRolesCard.label}</p>
        <h2
          className="section-title"
          data-popup-surface-roles-headline="true"
        >
          {popupModel.surfaceRolesCard.headline}
        </h2>
        <p className="supporting-copy" data-popup-surface-roles-detail="true">
          {popupModel.surfaceRolesCard.detail}
        </p>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section__header">
          <div>
            <p
              className="section-label"
              data-theme-local-surface="popup-featured-section-label"
            >
              {popupModel.featuredSection.label}
            </p>
            <h2 className="section-title">{popupModel.featuredSection.headline}</h2>
          </div>
          <p className="supporting-copy">{popupModel.featuredSection.detail}</p>
        </div>

        {popupModel.featuredProviderCards.length > 0 ? (
          <div className="popup-provider-list" aria-label="Popup featured providers">
            {popupModel.featuredProviderCards.map((card, index) => {
              const { provider } = card;

              return (
              <article
                key={provider.providerId}
                className={`popup-provider-card popup-provider-card--${provider.displayTone}`}
                data-theme-local-surface={
                  index === 0 ? "popup-first-provider-card" : undefined
                }
              >
                <div className="popup-provider-card__header">
                  <div>
                    <p className="popup-provider-card__provider">
                      {provider.providerLabel}
                    </p>
                    <p className="popup-provider-card__plan">{provider.planName}</p>
                  </div>
                  <div data-popup-featured-status={index === 0 ? "true" : undefined}>
                    <StatusBadge
                      label={card.statusLabel}
                      tone={provider.displayTone}
                    />
                  </div>
                </div>

                <div
                  className="popup-provider-card__chips"
                  data-popup-featured-chips={index === 0 ? "true" : undefined}
                >
                  {card.metaChips.map((chipLabel) => (
                    <span key={chipLabel} className="meta-chip">
                      {chipLabel}
                    </span>
                  ))}
                </div>

                <p
                  className="supporting-copy"
                  data-popup-featured-primary={index === 0 ? "true" : undefined}
                >
                  {card.primaryDetail}
                </p>
                <p
                  className="supporting-copy"
                  data-popup-featured-secondary={index === 0 ? "true" : undefined}
                >
                  {card.secondaryDetail}
                </p>
                <div className="popup-actions">
                  <button
                    className="text-button"
                    data-theme-local-surface={
                      index === 0 ? "popup-first-open-detail" : undefined
                    }
                    data-popup-featured-action={index === 0 ? "true" : undefined}
                    type="button"
                    onClick={() => {
                      void handleGuidanceAction(card.action);
                    }}
                  >
                    {card.action.label}
                  </button>
                </div>
              </article>
              );
            })}
          </div>
        ) : (
          <section className="status-card" data-theme-local-surface="popup-empty-state-card">
            <p className="section-label">Popup Triage</p>
            <h3 className="section-title">
              {popupModel.featuredSection.emptyStateHeadline}
            </h3>
            <p className="supporting-copy">
              {popupModel.featuredSection.emptyStateDetail}
            </p>
          </section>
        )}
      </section>
    </main>
  );
}
