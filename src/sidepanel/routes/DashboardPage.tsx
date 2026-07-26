import type {
  ProviderAccountsByProvider,
  AppLocalePreference,
  DisplaySurface,
  ProgressColorAppearance,
  ProgressColorBand,
  ProgressDisplayStyle,
  ProgressItemsBySurface,
  ResetTimeDisplayMode,
  ProviderId,
  ProviderAccountId,
  ProviderServiceStatus,
  ProviderServiceStatusVisibilityBySurface,
  SummaryItem,
  UsageHistoryModulesBySurface,
} from "../../providers/types";
import { createRuntimeI18n } from "../../shared/i18n";
import type {
  MaterialActionIconName,
} from "../../shared/components/MaterialActionIcon";
import type { DashboardSourceId } from "../../shared/custom-sources";
import type { CustomSourceViewModel } from "../../shared/custom-source-view-models";
import { CustomSourceCard } from "../components/CustomSourceCard";
import { ProviderCard } from "../components/ProviderCard";
import { SummaryStrip } from "../components/SummaryStrip";
import { TopBar } from "../components/TopBar";
import type { ProviderViewModel } from "../view-models";
import { createDefaultUsageHistoryModulesBySurface } from "../../shared/usage-history-visibility";
import { DEFAULT_RESET_TIME_DISPLAY_MODE } from "../../shared/reset-time-display";
import { getActiveProviderAccountMetadata } from "../../shared/provider-accounts";

type DashboardPageProps = {
  providerAccounts?: ProviderAccountsByProvider;
  localePreference: AppLocalePreference;
  progressColorAppearance?: ProgressColorAppearance;
  progressColorBands: readonly ProgressColorBand[];
  progressDisplayStyle: ProgressDisplayStyle;
  progressItemsBySurface: ProgressItemsBySurface;
  progressThicknessPx: number;
  progressSurface: DisplaySurface;
  resetTimeDisplayMode?: ResetTimeDisplayMode;
  usageHistoryModulesBySurface?: UsageHistoryModulesBySurface;
  providerServiceStatuses?: readonly ProviderServiceStatus[];
  providerServiceStatusVisibilityBySurface?: ProviderServiceStatusVisibilityBySurface;
  summaryItems: SummaryItem[];
  providers: ProviderViewModel[];
  customSources?: CustomSourceViewModel[];
  sourceOrder?: readonly DashboardSourceId[];
  onOpenProvider: (providerId: ProviderId) => void;
  onOpenCustomSourcesSettings?: () => void;
  onOpenSourcePage?: (
    providerId: ProviderId,
    sourceStateKind: ProviderViewModel["currentSourceStateKind"],
  ) => void;
  themeActionLabel?: string;
  themeActionTitle?: string;
  themeActionIconName?: MaterialActionIconName;
  onToggleThemeMode?: () => void;
  onOpenFullPage?: () => void;
  surfaceActionLabel?: string;
  surfaceActionTitle?: string;
  onOpenSettings: () => void;
  onOpenQuickSetup: () => void;
  onRefreshProvider: (providerId: ProviderId) => void;
  onRefreshAll: () => void;
  onSelectProviderAccount?: (
    providerId: ProviderId,
    accountId: ProviderAccountId,
  ) => void;
};

export function DashboardPage({
  providerAccounts = {},
  localePreference,
  progressColorAppearance,
  progressColorBands,
  progressDisplayStyle,
  progressItemsBySurface,
  progressThicknessPx,
  progressSurface,
  resetTimeDisplayMode = DEFAULT_RESET_TIME_DISPLAY_MODE,
  usageHistoryModulesBySurface = createDefaultUsageHistoryModulesBySurface(),
  providerServiceStatuses = [],
  providerServiceStatusVisibilityBySurface,
  summaryItems,
  providers,
  customSources = [],
  sourceOrder = [],
  onOpenProvider,
  onOpenCustomSourcesSettings,
  onOpenSourcePage,
  themeActionLabel,
  themeActionTitle,
  themeActionIconName,
  onToggleThemeMode,
  onOpenFullPage,
  surfaceActionLabel,
  surfaceActionTitle,
  onOpenSettings,
  onOpenQuickSetup,
  onRefreshProvider,
  onRefreshAll,
  onSelectProviderAccount,
}: DashboardPageProps) {
  const i18n = createRuntimeI18n(
    localePreference,
    typeof window !== "undefined" ? window : undefined,
  );
  const sourceOrderIndex = new Map(
    sourceOrder.map((sourceId, index) => [sourceId, index]),
  );
  const sourceCards = [
    ...providers.map((provider) => ({
      kind: "provider" as const,
      sourceId: provider.providerId as DashboardSourceId,
      provider,
    })),
    ...customSources.map((source) => ({
      kind: "custom" as const,
      sourceId: source.sourceId as DashboardSourceId,
      source,
    })),
  ].sort((left, right) => {
    const leftIndex = sourceOrderIndex.get(left.sourceId);
    const rightIndex = sourceOrderIndex.get(right.sourceId);

    if (leftIndex !== undefined && rightIndex !== undefined) {
      return leftIndex - rightIndex;
    }

    if (leftIndex !== undefined) {
      return -1;
    }

    if (rightIndex !== undefined) {
      return 1;
    }

    return 0;
  });

  return (
    <main className="app-shell">
      <TopBar
        title={i18n.t("dashboard.topbar.title")}
        subtitle={i18n.t("dashboard.topbar.subtitle")}
        themeActionLabel={themeActionLabel}
        themeActionTitle={themeActionTitle}
        themeActionIconName={themeActionIconName}
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

        {sourceCards.length > 0 ? (
          <div className="provider-shell-list" aria-label={i18n.t("dashboard.providers.aria")}>
            {sourceCards.map((sourceCard) =>
              sourceCard.kind === "provider" ? (
                <ProviderCard
                  key={sourceCard.provider.providerId}
                  apiGatewayMeteringDisplayPreferences={
                    getActiveProviderAccountMetadata(
                      { providerAccounts },
                      sourceCard.provider.providerId,
                    )?.apiGatewayMeteringDisplayPreferences
                  }
                  localePreference={localePreference}
                  progressColorAppearance={progressColorAppearance}
                  progressColorBands={progressColorBands}
                  progressDisplayStyle={progressDisplayStyle}
                  progressItemsBySurface={progressItemsBySurface}
                  progressThicknessPx={progressThicknessPx}
                  progressSurface={progressSurface}
                  usageHistoryModulesBySurface={usageHistoryModulesBySurface}
                  providerServiceStatuses={providerServiceStatuses}
                  providerServiceStatusVisibilityBySurface={
                    providerServiceStatusVisibilityBySurface
                  }
                  provider={sourceCard.provider}
                  providerAccounts={providerAccounts}
                  resetTimeDisplayMode={resetTimeDisplayMode}
                  onOpen={onOpenProvider}
                  onOpenSourcePage={onOpenSourcePage}
                  onRefresh={onRefreshProvider}
                  onSelectProviderAccount={onSelectProviderAccount}
                />
              ) : (
                <CustomSourceCard
                  key={sourceCard.source.sourceId}
                  localePreference={localePreference}
                  progressColorAppearance={progressColorAppearance}
                  progressColorBands={progressColorBands}
                  progressDisplayStyle={progressDisplayStyle}
                  progressItemsBySurface={progressItemsBySurface}
                  progressThicknessPx={progressThicknessPx}
                  progressSurface={progressSurface}
                  source={sourceCard.source}
                  onOpenSettings={onOpenCustomSourcesSettings ?? onOpenSettings}
                  onRefresh={onRefreshAll}
                />
              ),
            )}
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
