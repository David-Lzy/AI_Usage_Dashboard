import { useRef } from "react";
import { useSurfaceMotion } from "../../shared/use-motion-effects";
import type {
  ApiGatewayMeteringDisplayPreferences,
  AppLocalePreference,
  DisplaySurface,
  ProgressColorAppearance,
  ProgressColorBand,
  ProgressDisplayStyle,
  ProgressItemsBySurface,
  ResetTimeDisplayMode,
  AppState,
  ProviderAccountId,
  ProviderAccountsByProvider,
  ProviderId,
  ProviderServiceStatus as ProviderServiceStatusModel,
  ProviderServiceStatusVisibilityBySurface,
  UsageHistoryModulesBySurface,
} from "../../providers/types";
import { buildRuntimeCommonCopy, createRuntimeI18n } from "../../shared/i18n";
import type { MaterialActionIconName } from "../../shared/components/MaterialActionIcon";
import { getProviderDiagnosticPresentation } from "../../shared/provider-diagnostic-presentation";
import {
  buildProviderDetailLocalizedCopy,
  getProviderDetailStatusBadgeLabel,
} from "../../shared/provider-detail-localized-copy";
import { hasVisibleProviderProgressItems } from "../../shared/provider-progress-item-selection";
import { ProviderProgressItemList } from "../components/ProviderProgressItemList";
import { StatusBadge } from "../components/StatusBadge";
import { TopBar } from "../components/TopBar";
import { UsageFactsList } from "../components/UsageFactsList";
import type { ProviderViewModel } from "../view-models";
import { UsageHistoryDetail } from "../../shared/components/UsageHistoryCharts";
import { buildUsageHistoryLocalizedCopy } from "../../shared/usage-history-localized-copy";
import {
  createDefaultUsageHistoryModulesBySurface,
  resolveProviderUsageHistoryModules,
} from "../../shared/usage-history-visibility";
import { CursorUsageSummary } from "../../shared/components/CursorUsageSummary";
import { buildCursorUsageLocalizedCopy } from "../../shared/cursor-usage-localized-copy";
import { DEFAULT_RESET_TIME_DISPLAY_MODE } from "../../shared/reset-time-display";
import { buildAvailableQuotaPaceForecasts } from "../../shared/quota-pace";
import {
  buildQuotaPaceLocalizedCopy,
  formatQuotaPaceDateTime,
} from "../../shared/quota-pace-localized-copy";
import { ProviderServiceStatus } from "../../shared/components/ProviderServiceStatus";
import {
  createDefaultProviderServiceStatusVisibilityBySurface,
  getProviderServiceStatusForProvider,
  isProviderServiceStatusVisible,
} from "../../shared/provider-service-status";
import { ProviderAccountSelector } from "../components/ProviderAccountSelector";
import { ApiGatewayMeteringSummary } from "../../shared/components/ApiGatewayMeteringSummary";
import { buildApiGatewayMeteringLocalizedCopy } from "../../shared/api-gateway-metering-localized-copy";
import { getActiveProviderAccountMetadata } from "../../shared/provider-accounts";
import { TechnicalText } from "../../shared/components/TechnicalText";
import { DeploymentComparison } from "../components/DeploymentComparison";
import { UsageExport } from "../components/UsageExport";
import { ProviderDetailSourceInfo } from "../components/ProviderDetailSourceInfo";
import { getProviderDetailGroupsCopy } from "../../shared/provider-detail-groups-copy";

type ProviderDetailPageProps = {
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
  aggregateState?: Pick<
    AppState,
    "providers" | "providerSettings" | "providerAccounts"
  >;
  quotaPaceForecastEnabled?: boolean;
  quotaPaceNow?: Date;
  resetTimeDisplayMode?: ResetTimeDisplayMode;
  onBack: () => void;
  themeActionLabel?: string;
  themeActionTitle?: string;
  themeActionIconName?: MaterialActionIconName;
  onToggleThemeMode?: () => void;
  onOpenFullPage?: () => void;
  surfaceActionLabel?: string;
  surfaceActionTitle?: string;
  onOpenSourcePage?: (
    providerId: ProviderId,
    sourceStateKind: ProviderViewModel["currentSourceStateKind"],
  ) => void;
  onRefresh: (providerId: ProviderId) => void;
  onRefreshAccount?: (accountId: string) => Promise<void>;
  onSelectProviderAccount?: (
    providerId: ProviderId,
    accountId: ProviderAccountId,
  ) => void;
};

export function ProviderDetailPage({
  localePreference,
  progressColorAppearance,
  progressColorBands,
  progressDisplayStyle,
  progressItemsBySurface,
  progressThicknessPx,
  progressSurface,
  usageHistoryModulesBySurface = createDefaultUsageHistoryModulesBySurface(),
  providerServiceStatuses = [],
  providerServiceStatusVisibilityBySurface = createDefaultProviderServiceStatusVisibilityBySurface(),
  provider,
  providerAccounts,
  aggregateState,
  quotaPaceForecastEnabled = false,
  quotaPaceNow = new Date(),
  resetTimeDisplayMode = DEFAULT_RESET_TIME_DISPLAY_MODE,
  onBack,
  themeActionLabel,
  themeActionTitle,
  themeActionIconName,
  onToggleThemeMode,
  onOpenFullPage,
  surfaceActionLabel,
  surfaceActionTitle,
  onOpenSourcePage,
  onRefresh,
  onRefreshAccount,
  onSelectProviderAccount = () => undefined,
}: ProviderDetailPageProps) {
  const pageRef = useRef<HTMLElement>(null);
  const accountId = providerAccounts?.[provider.providerId]?.activeAccountId ?? null;
  useSurfaceMotion(pageRef, `${provider.providerId}:${accountId}`);
  const i18n = createRuntimeI18n(
    localePreference,
    typeof window !== "undefined" ? window : undefined,
  );
  const copy = buildProviderDetailLocalizedCopy(i18n);
  const groups = getProviderDetailGroupsCopy(i18n.resolvedLocale);
  const usageHistoryCopy = buildUsageHistoryLocalizedCopy(i18n.resolvedLocale);
  const cursorUsageCopy = buildCursorUsageLocalizedCopy(i18n.resolvedLocale);
  const apiGatewayMeteringCopy = buildApiGatewayMeteringLocalizedCopy(
    i18n.resolvedLocale,
  );
  const apiGatewayMeteringDisplayPreferences:
    ApiGatewayMeteringDisplayPreferences | undefined =
    getActiveProviderAccountMetadata(
      { providerAccounts },
      provider.providerId,
    )?.apiGatewayMeteringDisplayPreferences;
  const quotaPaceCopy = buildQuotaPaceLocalizedCopy(i18n.resolvedLocale);
  const quotaPaceForecasts = quotaPaceForecastEnabled
    ? buildAvailableQuotaPaceForecasts(
        provider.usageWindows,
        provider.lastSuccessAt,
        quotaPaceNow,
      )
    : [];
  const visibleUsageHistoryModuleOrder = resolveProviderUsageHistoryModules(
    usageHistoryModulesBySurface,
    progressSurface,
    provider.providerId,
  )
    .filter((preference) => preference.visible)
    .map((preference) => preference.id);
  const visibleUsageContextLabel =
    buildRuntimeCommonCopy(i18n).visibleUsageContext;
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
  const hasStructuredUsageContext =
    (provider.usageWindows?.length ?? 0) > 0 ||
    (provider.usageBalances?.length ?? 0) > 0 ||
    (provider.usageFacts?.length ?? 0) > 0;
  const hasUsageFacts = (provider.usageFacts?.length ?? 0) > 0;
  const hasApiGatewayMetering = provider.apiGatewayMetering !== undefined;
  const hasProviderProgressItems = hasVisibleProviderProgressItems(
    provider,
    progressSurface,
    progressItemsBySurface,
  );
  const showUsageSummary =
    Boolean(provider.usageSummary) &&
    (!hasStructuredUsageContext || !hasProviderProgressItems);
  const hasUsageContext = hasUsageFacts || showUsageSummary;
  const showSourcePageAction =
    provider.openableSessionPageUrl !== null && onOpenSourcePage !== undefined;
  const usageValue =
    provider.quotaUnit === "percent"
      ? provider.used !== null && provider.remaining !== null
        ? copy.values.usedAndRemaining(
            i18n.formatPercentValue(provider.used),
            i18n.formatPercentValue(provider.remaining),
          )
        : provider.used !== null
          ? copy.values.usedOnly(i18n.formatPercentValue(provider.used))
          : provider.remaining !== null
            ? copy.values.remainingOnly(
                i18n.formatPercentValue(provider.remaining),
              )
            : copy.values.unknownUsageWindowPercentage
      : provider.used !== null && provider.total !== null
        ? `${i18n.formatNumber(provider.used)} / ${i18n.formatNumber(provider.total)} ${provider.quotaUnit}`
        : provider.used !== null
          ? copy.values.tracked(
              i18n.formatNumber(provider.used),
              provider.quotaUnit,
            )
          : provider.total !== null
            ? copy.values.unknownOfTotal(
                i18n.formatNumber(provider.total),
                provider.quotaUnit,
              )
            : copy.values.unknownQuotaUnit(provider.quotaUnit);
  const normalizedUsageValue =
    usageValue === copy.values.unknownQuotaUnit(provider.quotaUnit) &&
    hasUsageFacts
      ? visibleUsageContextLabel
      : usageValue;

  const remainingValue =
    provider.quotaUnit === "percent" && provider.remaining !== null
      ? copy.values.remainingOnly(i18n.formatPercentValue(provider.remaining))
      : provider.remaining !== null
        ? `${i18n.formatNumber(provider.remaining)} ${provider.quotaUnit}`
        : provider.used !== null && provider.total === null
          ? copy.values.notAvailableFromSource
          : copy.values.unknown;
  const formattedResetAt =
    i18n.formatTemporalValue(provider.resetAt) ??
    (provider.resetAt || copy.values.unknown);
  const formattedSyncedAt = provider.lastSuccessAt
    ? (i18n.formatTemporalValue(provider.lastSuccessAt) ??
      provider.lastSuccessAt)
    : copy.values.unknown;
  const syncStatusBadgeLabel = getProviderDetailStatusBadgeLabel(
    provider.permissionStatus,
    provider.displaySyncStatus,
    copy,
  );
  const warningDiagnosticPresentation = getProviderDiagnosticPresentation(
    provider.warningDiagnostic,
    i18n,
  );
  const diagnosticNoteToneClassName =
    provider.warningDiagnostic?.severity === "error"
      ? "detail-note--error"
      : provider.warningDiagnostic?.severity === "warning"
        ? "detail-note--warning"
        : "detail-note--neutral";

  return (
    <main ref={pageRef} data-motion-owned="" className="app-shell fusion-surface provider-detail-fusion">
      <TopBar
        title={provider.providerLabel}
        compact
        themeActionLabel={themeActionLabel}
        themeActionTitle={themeActionTitle}
        themeActionIconName={themeActionIconName}
        expandActionLabel={surfaceActionLabel ?? i18n.t("common.actions.tab")}
        expandActionTitle={
          surfaceActionTitle ?? copy.openDetailTabTitle(provider.providerLabel)
        }
        expandActionIconName={
          progressSurface === "fullPage" ? "dock-left" : "tab"
        }
        secondaryActionLabel={i18n.t("common.actions.back")}
        secondaryActionIconName="keyboard-backspace"
        primaryActionLabel={i18n.t("common.actions.refresh")}
        primaryActionIconName="refresh"
        onThemeAction={onToggleThemeMode}
        onExpandAction={onOpenFullPage}
        onSecondaryAction={onBack}
        onPrimaryAction={() => onRefresh(provider.providerId)}
      />

      <ProviderAccountSelector
        accountLabel={i18n.t("provider.account.selector_label")}
        providerId={provider.providerId}
        providerAccounts={providerAccounts}
        onChange={onSelectProviderAccount}
      />

      <section
        className="detail-context"
        data-motion-group=""
        data-theme-stability-surface="provider-detail-sync-status-card"
      >
        <div className="detail-context__identity">
          <h2 className="section-title">
            <TechnicalText direction="auto">{provider.planName}</TechnicalText>
          </h2>
          <StatusBadge
            label={syncStatusBadgeLabel}
            tone={provider.displayTone}
          />
        </div>
        <div className="detail-context__source">
          <span className="meta-chip">
            <TechnicalText direction="auto">
              {provider.currentSourceLabel}
            </TechnicalText>
          </span>
          <span
            className={
              provider.currentSourceFidelityTone === "error"
                ? "meta-chip meta-chip--error"
                : provider.currentSourceFidelityTone === "warning"
                  ? "meta-chip meta-chip--warning"
                  : "meta-chip"
            }
          >
            {provider.currentSourceFidelityLabel}
          </span>
          <span className="supporting-copy" data-provider-success-time="">
            {groups.captured}:{" "}
            <TechnicalText direction="auto">{formattedSyncedAt}</TechnicalText>
          </span>
        </div>
        <p className="supporting-copy">
          {provider.currentSourceAvailabilitySummary}
        </p>
      </section>
      {showProviderServiceStatus ? (
        <section className="status-card" data-provider-service-status-detail="">
          <ProviderServiceStatus
            density="detail"
            locale={i18n.resolvedLocale}
            status={providerServiceStatus}
          />
        </section>
      ) : null}

      <section
        className="detail-recovery"
        data-motion-group=""
        aria-label={copy.sections.syncStatus}
      >
        {provider.permissionStatus === "missing" ? (
          <div className="detail-note detail-note--warning">
            <p className="detail-note__label">{copy.notes.accessStatus}</p>
            <p className="supporting-copy">{copy.notes.accessStatusDetail}</p>
          </div>
        ) : null}

        {provider.currentSourceStateKind !== "ready" ? (
          <div
            className={`detail-note ${provider.currentSourceStateTone === "error" ? "detail-note--error" : "detail-note--warning"}`}
          >
            <p className="detail-note__label">{copy.notes.sourceState}</p>
            <p className="supporting-copy">
              {provider.currentSourceStateDetail}
            </p>
          </div>
        ) : null}

        {showSourcePageAction ? (
          <div
            className="detail-note detail-note--neutral"
            data-provider-detail-open-source-page="true"
          >
            <p className="detail-note__label">
              {copy.notes.sourcePageRecovery}
            </p>
            <p className="supporting-copy">
              {copy.notes.sourcePageRecoveryDetail}
            </p>
            <button
              className="text-button text-button--inline"
              type="button"
              onClick={() =>
                onOpenSourcePage(
                  provider.providerId,
                  provider.currentSourceStateKind,
                )
              }
            >
              {copy.notes.openSourcePageAction}
            </button>
          </div>
        ) : null}

        {warningDiagnosticPresentation ? (
          <div className={`detail-note ${diagnosticNoteToneClassName}`}>
            <p className="detail-note__label">{copy.notes.diagnosticSummary}</p>
            <p className="supporting-copy">
              {warningDiagnosticPresentation.label}
            </p>
            <p className="supporting-copy">
              {warningDiagnosticPresentation.summary}
            </p>
          </div>
        ) : null}

        {provider.warningReason &&
        (provider.currentSourceStateKind === "ready" ||
          provider.warningReason !== provider.currentSourceStateDetail) ? (
          <div className="detail-note detail-note--warning">
            <p className="detail-note__label">{copy.notes.warningReason}</p>
            <p className="supporting-copy">
              <TechnicalText direction="auto">
                {provider.warningReason}
              </TechnicalText>
            </p>
          </div>
        ) : null}
        {provider.pageBinding.status === "stale" &&
        provider.pageBindingDetail ? (
          <div className="detail-note detail-note--warning">
            <p className="detail-note__label">{copy.notes.pageBinding}</p>
            <p className="supporting-copy">{provider.pageBindingDetail}</p>
          </div>
        ) : null}
      </section>
      <section
        className="detail-section"
        aria-labelledby="provider-quota-heading"
        data-theme-stability-surface="provider-detail-usage-card"
      >
        <h2 id="provider-quota-heading" className="section-title">
          {groups.quota}
        </h2>
        <div className="detail-grid detail-quota-grid">
          {!hasApiGatewayMetering ? (
            <>
              <div className="detail-field">
                <p className="detail-field__label">
                  {copy.fieldLabels.quotaModel}
                </p>
                <p className="detail-field__value">
                  {provider.quotaWindow} {provider.quotaUnit}
                </p>
              </div>
              <div className="detail-field">
                <p className="detail-field__label">{copy.fieldLabels.used}</p>
                <p className="detail-field__value">{normalizedUsageValue}</p>
              </div>
              <div className="detail-field">
                <p className="detail-field__label">
                  {copy.fieldLabels.remaining}
                </p>
                <p className="detail-field__value">{remainingValue}</p>
              </div>
              <div className="detail-field">
                <p className="detail-field__label">
                  {copy.fieldLabels.resetTime}
                </p>
                <p className="detail-field__value">{formattedResetAt}</p>
              </div>
            </>
          ) : null}
        </div>
        {hasProviderProgressItems ? (
          <ProviderProgressItemList
            accountId={accountId}
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
        ) : null}

        {quotaPaceForecasts.length > 0 ? (
          <div
            className="detail-note detail-note--neutral quota-pace"
            data-provider-quota-pace=""
          >
            <div className="quota-pace__header">
              <p className="detail-note__label">{quotaPaceCopy.sectionLabel}</p>
              <span className="meta-chip">{quotaPaceCopy.estimateLabel}</span>
            </div>
            <ul className="quota-pace__list">
              {quotaPaceForecasts.map((forecast, index) => {
                const resetTime = formatQuotaPaceDateTime(
                  forecast.resetAt,
                  i18n.resolvedLocale,
                );
                const timingDetail = forecast.projectedExhaustionAt
                  ? quotaPaceCopy.projectedExhaustion(
                      formatQuotaPaceDateTime(
                        forecast.projectedExhaustionAt,
                        i18n.resolvedLocale,
                      ),
                    )
                  : quotaPaceCopy.lastsThroughReset(resetTime);

                return (
                  <li
                    className="quota-pace__item"
                    data-quota-pace-status={forecast.status}
                    key={`${forecast.window.kind}:${forecast.window.normalizedLabel}:${forecast.window.modelLabel ?? "window"}:${index}`}
                  >
                    <div className="quota-pace__item-header">
                      <strong className="quota-pace__window-name">
                        {forecast.window.modelLabel ?? forecast.window.label}
                      </strong>
                      <span className="quota-pace__status">
                        {quotaPaceCopy.status[forecast.status]}
                      </span>
                    </div>
                    <p className="supporting-copy">
                      {quotaPaceCopy.comparison(
                        i18n.formatPercentValue(forecast.usedPercent),
                        i18n.formatPercentValue(forecast.expectedUsedPercent),
                      )}
                    </p>
                    <p className="supporting-copy">{timingDetail}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {hasUsageContext ? (
          <div className="detail-note detail-note--neutral">
            <p className="detail-note__label">{copy.notes.usageWindows}</p>
            {showUsageSummary ? (
              <p className="supporting-copy">{provider.usageSummary}</p>
            ) : null}
            {hasUsageFacts && provider.usageFacts ? (
              <UsageFactsList facts={provider.usageFacts} />
            ) : null}
          </div>
        ) : null}
      </section>
      {provider.apiGatewayMetering ||
      provider.providerId === "codex-personal-page" ||
      (provider.providerId === "cursor-personal-page" &&
        provider.cursorUsage) ? (
        <section
          className="detail-section"
          aria-labelledby="provider-trends-heading"
        >
          <h2 id="provider-trends-heading" className="section-title">
            {groups.trends}
          </h2>
          {provider.apiGatewayMetering ? (
            <section
              className="status-card api-gateway-metering-detail"
              data-api-gateway-metering-detail=""
            >
              <ApiGatewayMeteringSummary
                copy={apiGatewayMeteringCopy}
                density="detail"
                locale={i18n.resolvedLocale}
                metering={provider.apiGatewayMetering}
                preferences={apiGatewayMeteringDisplayPreferences}
                providerId={provider.providerId}
                surface="fullPage"
              />
              <a
                className="text-button text-button--inline api-gateway-metering-detail__source-action"
                href={provider.apiGatewayMetering.origin}
                rel="noreferrer"
                target="_blank"
              >
                {apiGatewayMeteringCopy.openSourceDashboard}
              </a>
            </section>
          ) : null}

          {provider.providerId === "codex-personal-page" ? (
            <section
              className="status-card"
              data-provider-usage-history-detail=""
            >
              {provider.usageHistory ? (
                <UsageHistoryDetail
                  copy={usageHistoryCopy}
                  history={provider.usageHistory}
                  formatCapturedAt={(value) =>
                    i18n.formatTemporalValue(value) ?? value
                  }
                  moduleOrder={visibleUsageHistoryModuleOrder}
                />
              ) : (
                <p className="supporting-copy">{usageHistoryCopy.noData}</p>
              )}
            </section>
          ) : null}

          {provider.providerId === "cursor-personal-page" &&
          provider.cursorUsage ? (
            <section
              className="status-card cursor-usage-detail"
              data-cursor-usage-detail=""
            >
              <CursorUsageSummary
                copy={cursorUsageCopy}
                density="detail"
                locale={i18n.resolvedLocale}
                providerId={provider.providerId}
                surface="fullPage"
                usage={provider.cursorUsage}
              />
              <nav
                aria-label={cursorUsageCopy.sourceLinksLabel}
                className="cursor-usage-source-actions"
              >
                <a
                  className="text-button text-button--inline"
                  href="https://cursor.com/dashboard/usage"
                  rel="noreferrer"
                  target="_blank"
                >
                  {cursorUsageCopy.usagePage}
                </a>
                <a
                  className="text-button text-button--inline"
                  href="https://cursor.com/dashboard/spending"
                  rel="noreferrer"
                  target="_blank"
                >
                  {cursorUsageCopy.spendingPage}
                </a>
                {provider.usageSummary?.includes("CSV export available") ? (
                  <span className="supporting-copy">
                    {cursorUsageCopy.csvAvailable}
                  </span>
                ) : null}
              </nav>
            </section>
          ) : null}
        </section>
      ) : null}
      {progressSurface === "fullPage" && aggregateState ? (
        <section
          className="detail-section"
          aria-labelledby="provider-exports-heading"
        >
          <h2 id="provider-exports-heading" className="section-title">
            {groups.exports}
          </h2>
          {progressSurface === "fullPage" &&
          provider.providerId === "sub2api-api-key" &&
          aggregateState &&
          onRefreshAccount ? (
            <DeploymentComparison
              i18n={i18n}
              state={aggregateState}
              onRefreshAccount={onRefreshAccount}
            />
          ) : null}

          {progressSurface === "fullPage" && aggregateState ? (
            <UsageExport
              i18n={i18n}
              providerId={provider.providerId}
              state={aggregateState}
            />
          ) : null}
        </section>
      ) : null}
      <ProviderDetailSourceInfo provider={provider} i18n={i18n} />
    </main>
  );
}
