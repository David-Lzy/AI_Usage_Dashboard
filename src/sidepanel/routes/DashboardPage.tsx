import type { ProviderId, SummaryItem } from "../../providers/types";
import { ProviderCard } from "../components/ProviderCard";
import { SummaryStrip } from "../components/SummaryStrip";
import { TopBar } from "../components/TopBar";
import type { ProviderViewModel } from "../view-models";

type DashboardPageProps = {
  summaryItems: SummaryItem[];
  providers: ProviderViewModel[];
  onOpenProvider: (providerId: ProviderId) => void;
  onOpenSettings: () => void;
  onRefreshProvider: (providerId: ProviderId) => void;
  onRefreshAll: () => void;
};

export function DashboardPage({
  summaryItems,
  providers,
  onOpenProvider,
  onOpenSettings,
  onRefreshProvider,
  onRefreshAll,
}: DashboardPageProps) {
  return (
    <main className="app-shell">
      <TopBar
        title="AI Usage Dashboard"
        subtitle="Usage, credits, and sync health"
        secondaryActionLabel="Refresh All"
        primaryActionLabel="Settings"
        onSecondaryAction={onRefreshAll}
        onPrimaryAction={onOpenSettings}
      />

      <section className="hero-card">
        <p className="section-label">Overview</p>
        <h2 className="display-headline">One panel for AI coding quotas</h2>
        <p className="body-copy">
          Official APIs, documented quota policies, and guarded page-parse
          sources are collected into one release-ready dashboard for refreshes,
          settings, and provider drill-downs.
        </p>
        <span className="token-chip">Material 3 · Release Candidate</span>
      </section>

      <SummaryStrip items={summaryItems} />

      <section className="dashboard-section">
        <div className="dashboard-section__header">
          <div>
            <p className="section-label">Providers</p>
            <h2 className="section-title">Provider cards</h2>
          </div>
          <p className="supporting-copy">
            Cards are ordered by severity first, then current access gaps, so
            the highest-risk providers stay at the top of the dashboard while
            still exposing the current product contract at a glance.
          </p>
        </div>

        {providers.length > 0 ? (
          <div className="provider-shell-list" aria-label="Provider cards">
            {providers.map((provider) => (
              <ProviderCard
                key={provider.providerId}
                provider={provider}
                onOpen={onOpenProvider}
                onRefresh={onRefreshProvider}
              />
            ))}
          </div>
        ) : (
          <section className="status-card" aria-live="polite">
            <p className="section-label">No Visible Providers</p>
            <p className="body-copy">
              Enable at least one provider in Settings to restore the dashboard
              feed.
            </p>
          </section>
        )}
      </section>
    </main>
  );
}
