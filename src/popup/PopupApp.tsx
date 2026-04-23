import { useEffect, useState } from "react";

import type { AppState, ProviderId } from "../providers/types";
import { sendAppMessage } from "../shared/app-client";
import { SummaryStrip } from "../sidepanel/components/SummaryStrip";
import { StatusBadge } from "../sidepanel/components/StatusBadge";
import {
  buildSidePanelHash,
  type SidePanelRouteState,
} from "../sidepanel/route-state";
import { buildPopupViewModel } from "./view-models";

type PopupLoadState =
  | { status: "loading" }
  | { status: "ready"; appState: AppState }
  | { status: "error"; message: string };

function getSidePanelPreviewUrl(route: SidePanelRouteState): string {
  return new URL(
    `../sidepanel/index.html${buildSidePanelHash(route)}`,
    window.location.href,
  ).toString();
}

async function openSidePanelRoute(route: SidePanelRouteState) {
  const path = `src/sidepanel/index.html${buildSidePanelHash(route)}`;

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
    getSidePanelPreviewUrl(route),
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

  return (
    <main className="app-shell popup-shell">
      <section className="status-card popup-header">
        <div>
          <p className="section-label">Toolbar Popup</p>
          <h1 className="section-title">Quick glance</h1>
          <p className="supporting-copy">
            Use the popup for fast triage, then jump into the right detailed
            surface without re-navigating the whole extension.
          </p>
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

      <SummaryStrip items={popupModel.summaryItems} />

      <section
        className={`status-card${
          popupModel.snapshotStatus.tone === "neutral"
            ? ""
            : ` status-card--${popupModel.snapshotStatus.tone}`
        }`}
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

      <section className="status-card">
        <p className="section-label">Quick Actions</p>
        <p className="supporting-copy">
          Open the dashboard for the full multi-provider overview, or jump
          straight into settings when you need provider toggles, permissions, or
          source controls.
        </p>
        <div className="popup-actions">
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

      <section className="status-card">
        <p className="section-label">Popup Contract</p>
        <p className="supporting-copy">
          This popup shows the shared cached dashboard state for a quick glance.
          Use dashboard for broad status, settings for provider controls, and
          provider detail for one provider's current source contract and health.
        </p>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section__header">
          <div>
            <p className="section-label">Needs Attention</p>
            <h2 className="section-title">Featured providers</h2>
          </div>
          <p className="supporting-copy">
            The popup shows up to three providers, preferring the ones that are
            currently blocked, warning, or otherwise not fully ready.
          </p>
        </div>

        <div className="popup-provider-list" aria-label="Popup featured providers">
          {popupModel.featuredProviders.map((provider) => (
            <article
              key={provider.providerId}
              className={`popup-provider-card popup-provider-card--${provider.displayTone}`}
            >
              <div className="popup-provider-card__header">
                <div>
                  <p className="popup-provider-card__provider">
                    {provider.providerLabel}
                  </p>
                  <p className="popup-provider-card__plan">{provider.planName}</p>
                </div>
                <StatusBadge
                  label={
                    provider.permissionStatus === "missing"
                      ? "Needs access"
                      : provider.displaySyncStatus === "ok"
                        ? "Healthy"
                        : provider.displaySyncStatus === "warning"
                          ? "Warning"
                          : "Sync issue"
                  }
                  tone={provider.displayTone}
                />
              </div>

              <div className="popup-provider-card__chips">
                <span className="meta-chip">{provider.currentSourceContractLabel}</span>
                <span className="meta-chip">{provider.currentSourceFidelityLabel}</span>
                <span className="meta-chip">{provider.lastSyncLabel}</span>
              </div>

              <p className="supporting-copy">{provider.currentSourceContractDetail}</p>
              <p className="supporting-copy">
                {provider.warningReason ??
                  provider.currentSourceStateDetail ??
                  provider.currentSourceAvailabilitySummary}
              </p>
              <div className="popup-actions">
                <button
                  className="text-button"
                  type="button"
                  onClick={() => {
                    void openProviderDetail(provider.providerId);
                  }}
                >
                  Open detail
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
