import type {
  AppLocalePreference,
  DisplaySurface,
  ProgressColorAppearance,
  ProgressColorBand,
  ProgressDisplayStyle,
  ProgressItemsBySurface,
  ProviderId,
  SummaryItem,
} from "../../providers/types";
import { createRuntimeI18n } from "../../shared/i18n";
import { ProviderCard } from "../components/ProviderCard";
import { SummaryStrip } from "../components/SummaryStrip";
import { TopBar } from "../components/TopBar";
import type { ProviderViewModel } from "../view-models";

type DashboardPageProps = {
  localePreference: AppLocalePreference;
  progressColorAppearance?: ProgressColorAppearance;
  progressColorBands: readonly ProgressColorBand[];
  progressDisplayStyle: ProgressDisplayStyle;
  progressItemsBySurface: ProgressItemsBySurface;
  progressThicknessPx: number;
  progressSurface: DisplaySurface;
  summaryItems: SummaryItem[];
  providers: ProviderViewModel[];
  onOpenProvider: (providerId: ProviderId) => void;
  onOpenSourcePage?: (
    providerId: ProviderId,
    sourceStateKind: ProviderViewModel["currentSourceStateKind"],
  ) => void;
  themeActionLabel?: string;
  themeActionTitle?: string;
  onToggleThemeMode?: () => void;
  onOpenFullPage?: () => void;
  surfaceActionLabel?: string;
  surfaceActionTitle?: string;
  onOpenSettings: () => void;
  onOpenQuickSetup: () => void;
  onRefreshProvider: (providerId: ProviderId) => void;
  onRefreshAll: () => void;
};

export function DashboardPage({
  localePreference,
  progressColorAppearance,
  progressColorBands,
  progressDisplayStyle,
  progressItemsBySurface,
  progressThicknessPx,
  progressSurface,
  summaryItems,
  providers,
  onOpenProvider,
  onOpenSourcePage,
  themeActionLabel,
  themeActionTitle,
  onToggleThemeMode,
  onOpenFullPage,
  surfaceActionLabel,
  surfaceActionTitle,
  onOpenSettings,
  onOpenQuickSetup,
  onRefreshProvider,
  onRefreshAll,
}: DashboardPageProps) {
  const i18n = createRuntimeI18n(
    localePreference,
    typeof window !== "undefined" ? window : undefined,
  );

  return (
    <main className="app-shell">
      <TopBar
        title={i18n.t("dashboard.topbar.title")}
        subtitle={i18n.t("dashboard.topbar.subtitle")}
        themeActionLabel={themeActionLabel}
        themeActionTitle={themeActionTitle}
        expandActionLabel={surfaceActionLabel ?? i18n.t("common.actions.tab")}
        expandActionTitle={
          surfaceActionTitle ?? i18n.t("common.actions.open_dashboard_tab")
        }
        secondaryActionLabel={i18n.t("common.actions.refresh_all")}
        primaryActionLabel={i18n.t("common.actions.settings")}
        onThemeAction={onToggleThemeMode}
        onExpandAction={onOpenFullPage}
        onSecondaryAction={onRefreshAll}
        onPrimaryAction={onOpenSettings}
      />

      <section className="hero-card dashboard-hero-card">
        <div className="dashboard-hero-card__body">
          <div className="dashboard-hero-card__main">
            <p className="section-label">{i18n.t("dashboard.hero.eyebrow")}</p>
            <h2 className="display-headline">{i18n.t("dashboard.hero.title")}</h2>
          </div>

          {summaryItems.length > 0 ? (
            <SummaryStrip
              ariaLabel={i18n.t("dashboard.summary.aria")}
              className="dashboard-hero-card__summary"
              items={summaryItems}
              variant="compact"
            />
          ) : null}
        </div>

        <p className="body-copy dashboard-hero-card__detail">
          {i18n.t("dashboard.hero.detail")}
        </p>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section__header">
          <div>
            <p className="section-label">{i18n.t("dashboard.providers.eyebrow")}</p>
            <h2 className="section-title">{i18n.t("dashboard.providers.title")}</h2>
          </div>
          <p className="supporting-copy">{i18n.t("dashboard.providers.detail")}</p>
        </div>

        {providers.length > 0 ? (
          <div className="provider-shell-list" aria-label={i18n.t("dashboard.providers.aria")}>
            {providers.map((provider) => (
              <ProviderCard
                key={provider.providerId}
                localePreference={localePreference}
                progressColorAppearance={progressColorAppearance}
                progressColorBands={progressColorBands}
                progressDisplayStyle={progressDisplayStyle}
                progressItemsBySurface={progressItemsBySurface}
                progressThicknessPx={progressThicknessPx}
                progressSurface={progressSurface}
                provider={provider}
                onOpen={onOpenProvider}
                onOpenSourcePage={onOpenSourcePage}
                onRefresh={onRefreshProvider}
              />
            ))}
          </div>
        ) : (
          <section className="status-card dashboard-empty-state" aria-live="polite">
            <p className="section-label">{i18n.t("dashboard.empty.eyebrow")}</p>
            <p className="body-copy">{i18n.t("dashboard.empty.detail")}</p>
            <div className="credential-actions dashboard-empty-state__actions">
              <button
                className="text-button"
                type="button"
                onClick={onOpenQuickSetup}
              >
                {i18n.t("dashboard.empty.action")}
              </button>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
