import type {
  ApiGatewayMeteringDisplayPreferences,
  AppLocalePreference,
  DisplaySurface,
  ProgressColorAppearance,
  ProgressColorBand,
  ProgressDisplayStyle,
  ProgressItemsBySurface,
  ResetTimeDisplayMode,
  ProviderId,
  ProviderAccountId,
  ProviderAccountsByProvider,
  ProviderServiceStatus as ProviderServiceStatusModel,
  ProviderServiceStatusVisibilityBySurface,
  UsageHistoryModulesBySurface,
} from "../../providers/types";
import { buildRuntimeCommonCopy, createRuntimeI18n } from "../../shared/i18n";
import { hasVisibleProviderProgressItems } from "../../shared/provider-progress-item-selection";
import type { ProviderViewModel } from "../view-models";
import { ProviderProgressItemList } from "./ProviderProgressItemList";
import { StatusBadge } from "./StatusBadge";
import { UsageFactsList } from "./UsageFactsList";
import { UsageHistoryCompact } from "../../shared/components/UsageHistoryCharts";
import { buildUsageHistoryLocalizedCopy } from "../../shared/usage-history-localized-copy";
import {
  createDefaultUsageHistoryModulesBySurface,
  resolveProviderUsageHistoryModules,
} from "../../shared/usage-history-visibility";
import { CursorUsageSummary } from "../../shared/components/CursorUsageSummary";
import { buildCursorUsageLocalizedCopy } from "../../shared/cursor-usage-localized-copy";
import { ApiGatewayMeteringSummary } from "../../shared/components/ApiGatewayMeteringSummary";
import { buildApiGatewayMeteringLocalizedCopy } from "../../shared/api-gateway-metering-localized-copy";
import { DEFAULT_RESET_TIME_DISPLAY_MODE } from "../../shared/reset-time-display";
import {
  buildProviderDetailLocalizedCopy,
  getProviderDetailStatusBadgeLabel,
} from "../../shared/provider-detail-localized-copy";
import { buildProviderSourceDisplayLocalizedCopy } from "../../shared/provider-source-display-localized-copy";
import { ProviderServiceStatus } from "../../shared/components/ProviderServiceStatus";
import {
  createDefaultProviderServiceStatusVisibilityBySurface,
  getProviderServiceStatusForProvider,
  isProviderServiceStatusVisible,
} from "../../shared/provider-service-status";

const CLAUDE_PERSONAL_PROVIDER_ID = "claude-code-team-page";

type ProviderCardProps = {
  apiGatewayMeteringDisplayPreferences?: ApiGatewayMeteringDisplayPreferences;
  localePreference: AppLocalePreference;
  progressColorAppearance?: ProgressColorAppearance;
  progressColorBands: readonly ProgressColorBand[];
  progressDisplayStyle: ProgressDisplayStyle;
  progressItemsBySurface: ProgressItemsBySurface;
  progressThicknessPx: number;
  progressSurface: DisplaySurface;
  usageHistoryModulesBySurface?: UsageHistoryModulesBySurface;
  providerServiceStatuses?: readonly ProviderServiceStatusModel[];
  providerServiceStatusVisibilityBySurface?: ProviderServiceStatusVisibilityBySurface;
  provider: ProviderViewModel;
  providerAccounts?: ProviderAccountsByProvider;
  resetTimeDisplayMode?: ResetTimeDisplayMode;
  onOpen: (providerId: ProviderId) => void;
  onOpenSourcePage?: (
    providerId: ProviderId,
    sourceStateKind: ProviderViewModel["currentSourceStateKind"],
  ) => void;
  onRefresh: (providerId: ProviderId) => void;
  onSelectProviderAccount?: (
    providerId: ProviderId,
    accountId: ProviderAccountId,
  ) => void;
};

export function ProviderCard({
  apiGatewayMeteringDisplayPreferences,
  localePreference,
  progressColorAppearance,
  progressColorBands,
  progressDisplayStyle,
  progressItemsBySurface,
  progressThicknessPx,
  progressSurface,
  usageHistoryModulesBySurface = createDefaultUsageHistoryModulesBySurface(),
  providerServiceStatuses = [],
  providerServiceStatusVisibilityBySurface =
    createDefaultProviderServiceStatusVisibilityBySurface(),
  provider,
  providerAccounts = {},
  resetTimeDisplayMode = DEFAULT_RESET_TIME_DISPLAY_MODE,
  onOpen,
  onOpenSourcePage,
  onRefresh,
  onSelectProviderAccount,
}: ProviderCardProps) {
  const i18n = createRuntimeI18n(
    localePreference,
    typeof window !== "undefined" ? window : undefined,
  );
  const usageHistoryCopy = buildUsageHistoryLocalizedCopy(i18n.resolvedLocale);
  const cursorUsageCopy = buildCursorUsageLocalizedCopy(i18n.resolvedLocale);
  const apiGatewayMeteringCopy = buildApiGatewayMeteringLocalizedCopy(
    i18n.resolvedLocale,
  );
  const providerDetailCopy = buildProviderDetailLocalizedCopy(i18n);
  const providerSourceDisplayCopy = buildProviderSourceDisplayLocalizedCopy(i18n);
  const isClaudePersonal =
    provider.providerId === CLAUDE_PERSONAL_PROVIDER_ID;
  const showSessionPageContract =
    provider.sessionPageContractLabel !== null &&
    provider.sessionPageContractLabel !== provider.currentSourceContractLabel;
  const showSourcePageAction =
    provider.openableSessionPageUrl !== null && onOpenSourcePage !== undefined;
  const hasStructuredUsageContext =
    (provider.usageWindows?.length ?? 0) > 0 ||
    (provider.usageBalances?.length ?? 0) > 0 ||
    (provider.usageFacts?.length ?? 0) > 0;
  const hasUsageFacts = (provider.usageFacts?.length ?? 0) > 0;
  const hasProviderProgressItems = hasVisibleProviderProgressItems(
    provider,
    progressSurface,
    progressItemsBySurface,
  );
  const showUsageSummary =
    !hasStructuredUsageContext && Boolean(provider.usageSummary);
  const localizedResetLabel = i18n.localizeResetRuntimeLabel(provider.resetLabel);
  const localizedLastSyncLabel = i18n.localizeRelativeRuntimeLabel(
    provider.lastSyncLabel,
  );
  const visibleUsageContextLabel =
    buildRuntimeCommonCopy(i18n).visibleUsageContext;
  const hasCursorUsage = provider.cursorUsage !== undefined;
  const hasApiGatewayMetering = provider.apiGatewayMetering !== undefined;
  const providerAccountCollection = providerAccounts[provider.providerId];
  const showProviderServiceStatus = isProviderServiceStatusVisible(
    providerServiceStatusVisibilityBySurface,
    progressSurface,
    provider.providerId,
  );
  const providerServiceStatus = showProviderServiceStatus
    ? getProviderServiceStatusForProvider(
        providerServiceStatuses,
        provider.providerId,
      )
    : null;
  const hasCachedProviderContent =
    hasProviderProgressItems ||
    hasUsageFacts ||
    provider.usageHistory !== undefined ||
    hasCursorUsage ||
    hasApiGatewayMetering ||
    showProviderServiceStatus;
  const cardSurfaceTone =
    hasCachedProviderContent && provider.displayTone === "error"
      ? "neutral"
      : provider.displayTone;
  const cardStatusTone =
    hasCachedProviderContent && provider.displayTone === "error"
      ? "warning"
      : provider.displayTone;
  const showClaudeRecoveryState =
    isClaudePersonal &&
    (provider.permissionStatus === "missing" ||
      provider.currentSourceStateKind !== "ready");
  const fidelityChipClassName =
    provider.currentSourceFidelityTone === "error"
      ? "meta-chip meta-chip--error"
      : provider.currentSourceFidelityTone === "warning"
        ? "meta-chip meta-chip--warning"
        : "meta-chip";
  const usageLabel =
    provider.quotaUnit === "percent"
      ? provider.used !== null && provider.remaining !== null
        ? `${i18n.formatPercentValue(provider.used)} used · ${i18n.formatPercentValue(provider.remaining)} remaining`
        : provider.used !== null
          ? `${i18n.formatPercentValue(provider.used)} used`
          : provider.remaining !== null
            ? `${i18n.formatPercentValue(provider.remaining)} remaining`
            : "Usage window percent unavailable"
      : provider.used !== null && provider.total !== null
        ? `${i18n.formatNumber(provider.used)} / ${i18n.formatNumber(provider.total)} ${provider.quotaUnit}`
        : provider.used !== null
          ? `${i18n.formatNumber(provider.used)} ${provider.quotaUnit} tracked`
          : provider.total !== null
            ? `Unknown / ${i18n.formatNumber(provider.total)} ${provider.quotaUnit}`
            : hasUsageFacts
              ? visibleUsageContextLabel
              : `Usage unknown · ${provider.quotaUnit}`;

  return (
    <article
      className={`provider-card provider-card--${cardSurfaceTone}`}
      data-provider-id={provider.providerId}
    >
      <header className="provider-card__header">
        <div className="provider-card__identity">
          <p className="provider-card__provider">{provider.providerLabel}</p>
          {!hasApiGatewayMetering ? (
            <p className="provider-card__plan">{provider.planName}</p>
          ) : null}
        </div>
        <div className="provider-card__status">
          <StatusBadge
            label={getProviderDetailStatusBadgeLabel(
              provider.permissionStatus,
              provider.displaySyncStatus,
              providerDetailCopy,
            )}
            tone={cardStatusTone}
          />
        </div>
      </header>

      <div className="provider-card__body">
        {!hasCursorUsage && !isClaudePersonal && !hasApiGatewayMetering ? (
          <section
            className="provider-card__summary"
            aria-label={`${provider.providerLabel} usage summary`}
          >
            <p className="provider-card__usage-label">{usageLabel}</p>
            <div className="provider-card__summary-details">
              <p className="supporting-copy">{localizedResetLabel}</p>
              <p className="supporting-copy">
                {provider.currentSourceContractDetail}
              </p>
            </div>
          </section>
        ) : null}

        {hasProviderProgressItems ? (
          <section className="provider-card__progress-surface">
            <ProviderProgressItemList
              density="compact"
              displayStyle={progressDisplayStyle}
              i18n={i18n}
              progressColorAppearance={progressColorAppearance}
              progressColorBands={progressColorBands}
              progressItemsBySurface={progressItemsBySurface}
              progressThicknessPx={progressThicknessPx}
              provider={provider}
              resetTimeDisplayMode={resetTimeDisplayMode}
              surface={progressSurface}
            />
          </section>
        ) : null}

        {!hasCursorUsage && hasUsageFacts && provider.usageFacts ? (
          <section className="provider-card__progress-surface">
            <UsageFactsList facts={provider.usageFacts} density="compact" />
          </section>
        ) : null}

        {isClaudePersonal ? (
          <section
            className="provider-card__product-context"
            aria-label={`${provider.providerLabel} sync context`}
          >
            <div className="provider-card__product-context-meta">
              <span className="meta-chip">{localizedLastSyncLabel}</span>
              {showClaudeRecoveryState ? (
                <span
                  className={`meta-chip ${provider.currentSourceStateTone === "error" ? "meta-chip--error" : "meta-chip--warning"}`}
                >
                  {provider.currentSourceStateLabel}
                </span>
              ) : null}
            </div>
            {showClaudeRecoveryState && !hasCachedProviderContent ? (
              <p className="supporting-copy provider-card__availability">
                {provider.currentSourceStateDetail}
              </p>
            ) : null}
          </section>
        ) : null}

        {provider.usageHistory
          ? resolveProviderUsageHistoryModules(
              usageHistoryModulesBySurface,
              progressSurface,
              provider.providerId,
            ).map((preference) =>
              preference.visible ? (
                <UsageHistoryCompact
                  key={preference.id}
                  copy={usageHistoryCopy}
                  history={provider.usageHistory}
                  moduleId={preference.id}
                />
              ) : null,
            )
          : null}

        {provider.cursorUsage ? (
          <CursorUsageSummary
            copy={cursorUsageCopy}
            locale={i18n.resolvedLocale}
            providerId={provider.providerId}
            surface={progressSurface}
            usage={provider.cursorUsage}
          />
        ) : null}

        {provider.apiGatewayMetering ? (
          <ApiGatewayMeteringSummary
            copy={apiGatewayMeteringCopy}
            locale={i18n.resolvedLocale}
            metering={provider.apiGatewayMetering}
            preferences={apiGatewayMeteringDisplayPreferences}
            providerId={provider.providerId}
            surface={progressSurface}
            activeDeploymentId={
              providerAccountCollection?.activeAccountId ?? null
            }
            deploymentOptions={providerAccountCollection?.accounts}
            onSelectDeployment={
              onSelectProviderAccount
                ? (accountId) =>
                    onSelectProviderAccount(provider.providerId, accountId)
                : undefined
            }
          />
        ) : null}

        {showProviderServiceStatus ? (
          <ProviderServiceStatus
            locale={i18n.resolvedLocale}
            status={providerServiceStatus}
          />
        ) : null}

        {!hasCursorUsage && !isClaudePersonal && !hasApiGatewayMetering ? (
          <>
            <div
              className="provider-card__meta"
              aria-label={providerDetailCopy.fieldLabels.syncSource}
            >
              <span className="meta-chip">{provider.currentSourceLabel}</span>
              <span className="meta-chip">
                {provider.currentSourceContractLabel}
              </span>
              <span className={fidelityChipClassName}>
                {provider.currentSourceFidelityLabel}
              </span>
              <span className="meta-chip">{localizedLastSyncLabel}</span>
              {provider.currentSourceStateKind === "credential_missing" ||
              provider.currentSourceStateKind === "open_page_required" ||
              provider.currentSourceStateKind === "logged_out" ||
              provider.currentSourceStateKind === "capture_unavailable" ? (
                <span
                  className={`meta-chip ${provider.currentSourceStateTone === "error" ? "meta-chip--error" : "meta-chip--warning"}`}
                >
                  {provider.currentSourceStateLabel}
                </span>
              ) : null}
              {provider.permissionStatus === "missing" ? (
                <span className="meta-chip meta-chip--warning">
                  {providerSourceDisplayCopy.sourceState.hostAccessMissingLabel}
                </span>
              ) : null}
              {provider.warningReason ? (
                <span className="meta-chip meta-chip--warning">
                  {provider.warningReason}
                </span>
              ) : null}
            </div>
            <p className="supporting-copy provider-card__availability">
              {provider.currentSourceAvailabilitySummary}
            </p>
            {showUsageSummary ? (
              <p className="supporting-copy provider-card__availability">
                {provider.usageSummary}
              </p>
            ) : null}
            {showSessionPageContract ? (
              <p className="supporting-copy provider-card__availability">
                {providerDetailCopy.notes.sessionPageTrackPrefix}
                {provider.sessionPageContractLabel}
              </p>
            ) : null}
          </>
        ) : null}
      </div>

      <footer className="provider-card__footer">
        <button
          className="text-button provider-card__action"
          type="button"
          title={providerDetailCopy.openDetailTabTitle(provider.providerLabel)}
          onClick={() => onOpen(provider.providerId)}
        >
          {providerDetailCopy.sections.providerDetail}
        </button>
        {showSourcePageAction ? (
          <button
            className={`text-button provider-card__action${
              showClaudeRecoveryState
                ? " provider-card__action--primary"
                : ""
            }`}
            data-provider-card-open-source-page="true"
            type="button"
            title={providerDetailCopy.notes.openSourcePageAction}
            onClick={() =>
              onOpenSourcePage(
                provider.providerId,
                provider.currentSourceStateKind,
              )
            }
          >
            {providerDetailCopy.notes.openSourcePageAction}
          </button>
        ) : null}
        {!isClaudePersonal || !showSourcePageAction || !showClaudeRecoveryState ? (
          <button
            className="text-button provider-card__action provider-card__action--primary"
            type="button"
            onClick={() => onRefresh(provider.providerId)}
          >
            {i18n.t("common.actions.refresh")}
          </button>
        ) : null}
      </footer>
    </article>
  );
}
