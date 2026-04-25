import type { AppLocalePreference, ProviderId } from "../../providers/types";
import { createRuntimeI18n } from "../../shared/i18n";
import {
  buildProviderDetailLocalizedCopy,
  getProviderDiagnosticPresentation,
  getPermissionStatusLabel,
  getProviderDetailStatusBadgeLabel,
} from "../../shared/localized-copy";
import { StatusBadge } from "../components/StatusBadge";
import { TopBar } from "../components/TopBar";
import { UsageProgress } from "../components/UsageProgress";
import type { ProviderViewModel } from "../view-models";

type ProviderDetailPageProps = {
  localePreference: AppLocalePreference;
  provider: ProviderViewModel;
  onBack: () => void;
  themeActionLabel?: string;
  themeActionTitle?: string;
  onToggleThemeMode?: () => void;
  onOpenFullPage?: () => void;
  onRefresh: (providerId: ProviderId) => void;
};

export function ProviderDetailPage({
  localePreference,
  provider,
  onBack,
  themeActionLabel,
  themeActionTitle,
  onToggleThemeMode,
  onOpenFullPage,
  onRefresh,
}: ProviderDetailPageProps) {
  const i18n = createRuntimeI18n(
    localePreference,
    typeof window !== "undefined" ? window : undefined,
  );
  const copy = buildProviderDetailLocalizedCopy(i18n);
  const showSessionPageContract =
    provider.sessionPageContractLabel !== null &&
    (provider.sessionPageContractLabel !== provider.currentSourceContractLabel ||
      provider.sessionPageContractDetail !== provider.currentSourceContractDetail);
  const showSessionPageGraduationGate =
    provider.sessionPageGraduationGateLabel !== null &&
    (showSessionPageContract ||
      provider.sessionPageGraduationGateLabel !==
        provider.currentSourceGraduationGateLabel ||
      provider.sessionPageGraduationGateDetail !==
        provider.currentSourceGraduationGateDetail);
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
            ? copy.values.remainingOnly(i18n.formatPercentValue(provider.remaining))
            : copy.values.unknownUsageWindowPercentage
      : provider.used !== null && provider.total !== null
        ? `${i18n.formatNumber(provider.used)} / ${i18n.formatNumber(provider.total)} ${provider.quotaUnit}`
        : provider.used !== null
          ? copy.values.tracked(i18n.formatNumber(provider.used), provider.quotaUnit)
          : provider.total !== null
            ? copy.values.unknownOfTotal(
                i18n.formatNumber(provider.total),
                provider.quotaUnit,
              )
            : copy.values.unknownQuotaUnit(provider.quotaUnit);

  const remainingValue =
    provider.quotaUnit === "percent" && provider.remaining !== null
      ? copy.values.remainingOnly(i18n.formatPercentValue(provider.remaining))
      : provider.remaining !== null
        ? `${i18n.formatNumber(provider.remaining)} ${provider.quotaUnit}`
        : provider.used !== null && provider.total === null
          ? copy.values.notAvailableFromSource
          : copy.values.unknown;
  const formattedResetAt = i18n.formatTemporalValue(provider.resetAt) ?? provider.resetAt;
  const formattedSyncedAt = i18n.formatTemporalValue(provider.syncedAt) ?? provider.syncedAt;
  const fidelityNoteToneClassName =
    provider.currentSourceFidelityTone === "error"
      ? "detail-note--error"
      : provider.currentSourceFidelityTone === "warning"
        ? "detail-note--warning"
        : "detail-note--neutral";
  const pageBindingNoteToneClassName =
    provider.pageBinding.status === "stale"
      ? "detail-note--warning"
      : "detail-note--neutral";
  const syncStatusBadgeLabel = getProviderDetailStatusBadgeLabel(
    provider.permissionStatus,
    provider.displaySyncStatus,
    copy,
  );
  const permissionStatusLabel = getPermissionStatusLabel(
    provider.permissionStatus,
    copy,
  );
  const warningDiagnosticPresentation = getProviderDiagnosticPresentation(
    provider.warningDiagnostic,
    i18n,
  );
  const sourceSelectionDiagnosticPresentation = getProviderDiagnosticPresentation(
    provider.sourceSelectionDiagnostic,
    i18n,
  );
  const sourceFallbackDiagnosticPresentation = getProviderDiagnosticPresentation(
    provider.sourceFallbackDiagnostic,
    i18n,
  );
  const diagnosticNoteToneClassName =
    provider.warningDiagnostic?.severity === "error"
      ? "detail-note--error"
      : provider.warningDiagnostic?.severity === "warning"
        ? "detail-note--warning"
        : "detail-note--neutral";

  return (
    <main className="app-shell">
      <TopBar
        title={provider.providerLabel}
        subtitle={copy.topbarSubtitle}
        themeActionLabel={themeActionLabel}
        themeActionTitle={themeActionTitle}
        expandActionLabel={i18n.t("common.actions.tab")}
        expandActionTitle={copy.openDetailTabTitle(provider.providerLabel)}
        secondaryActionLabel={i18n.t("common.actions.back")}
        primaryActionLabel={i18n.t("common.actions.refresh")}
        onThemeAction={onToggleThemeMode}
        onExpandAction={onOpenFullPage}
        onSecondaryAction={onBack}
        onPrimaryAction={() => onRefresh(provider.providerId)}
      />

      <section
        className="status-card"
        data-theme-stability-surface="provider-detail-sync-status-card"
      >
        <p className="section-label">{copy.sections.syncStatus}</p>
        <StatusBadge label={syncStatusBadgeLabel} tone={provider.displayTone} />
      </section>

      <section className="hero-card">
        <p className="section-label">{copy.sections.providerDetail}</p>
        <h2 className="display-headline">{provider.planName}</h2>
        <p className="body-copy">{copy.heroDetail}</p>
      </section>

      <section
        className="status-card"
        data-theme-stability-surface="provider-detail-usage-card"
      >
        <p className="section-label">{copy.sections.usage}</p>
        <div className="detail-grid">
          <div className="detail-field">
            <p className="detail-field__label">{copy.fieldLabels.plan}</p>
            <p className="detail-field__value">{provider.planName}</p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">{copy.fieldLabels.status}</p>
            <p className="detail-field__value">{syncStatusBadgeLabel}</p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">{copy.fieldLabels.quotaModel}</p>
            <p className="detail-field__value">
              {provider.quotaWindow} {provider.quotaUnit}
            </p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">{copy.fieldLabels.used}</p>
            <p className="detail-field__value">{usageValue}</p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">{copy.fieldLabels.remaining}</p>
            <p className="detail-field__value">{remainingValue}</p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">{copy.fieldLabels.resetTime}</p>
            <p className="detail-field__value">{formattedResetAt}</p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">{copy.fieldLabels.sourcePreference}</p>
            <p className="detail-field__value">{provider.sourcePreferenceLabel}</p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">{copy.fieldLabels.syncSource}</p>
            <p className="detail-field__value">{provider.currentSourceLabel}</p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">{copy.fieldLabels.productContract}</p>
            <p className="detail-field__value">
              {provider.currentSourceContractLabel}
            </p>
          </div>
          {showSessionPageContract ? (
            <div className="detail-field">
              <p className="detail-field__label">{copy.fieldLabels.sessionPageContract}</p>
              <p className="detail-field__value">
                {provider.sessionPageContractLabel}
              </p>
            </div>
          ) : null}
          {provider.currentSourceGraduationGateLabel ? (
            <div className="detail-field">
              <p className="detail-field__label">{copy.fieldLabels.graduationGate}</p>
              <p className="detail-field__value">
                {provider.currentSourceGraduationGateLabel}
              </p>
            </div>
          ) : null}
          {showSessionPageGraduationGate ? (
            <div className="detail-field">
              <p className="detail-field__label">{copy.fieldLabels.sessionPageGate}</p>
              <p className="detail-field__value">
                {provider.sessionPageGraduationGateLabel}
              </p>
            </div>
          ) : null}
          <div className="detail-field">
            <p className="detail-field__label">{copy.fieldLabels.sourceFidelity}</p>
            <p className="detail-field__value">
              {provider.currentSourceFidelityLabel}
            </p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">{copy.fieldLabels.sourceState}</p>
            <p className="detail-field__value">{provider.currentSourceStateLabel}</p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">{copy.fieldLabels.usedValueFidelity}</p>
            <p className="detail-field__value">
              {provider.currentSourceUsedAvailabilityLabel}
            </p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">{copy.fieldLabels.remainingValueFidelity}</p>
            <p className="detail-field__value">
              {provider.currentSourceRemainingAvailabilityLabel}
            </p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">{copy.fieldLabels.resetValueFidelity}</p>
            <p className="detail-field__value">
              {provider.currentSourceResetAvailabilityLabel}
            </p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">{copy.fieldLabels.availabilitySummary}</p>
            <p className="detail-field__value">
              {provider.currentSourceAvailabilitySummary}
            </p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">{copy.fieldLabels.accessModel}</p>
            <p className="detail-field__value">{provider.currentAccessModelLabel}</p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">{copy.fieldLabels.credentialPersistence}</p>
            <p className="detail-field__value">
              {provider.credentialPersistenceLabel}
            </p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">{copy.fieldLabels.cookieStorage}</p>
            <p className="detail-field__value">{provider.cookiePolicyLabel}</p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">{copy.fieldLabels.manualCookieImport}</p>
            <p className="detail-field__value">
              {provider.manualCookieImportLabel}
            </p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">{copy.fieldLabels.hostAccessRequirement}</p>
            <p className="detail-field__value">
              {provider.hostAccessRequirementLabel}
            </p>
          </div>
          {provider.pageBindingLabel ? (
            <>
              <div className="detail-field">
                <p className="detail-field__label">{copy.fieldLabels.pageBinding}</p>
                <p className="detail-field__value">{provider.pageBindingLabel}</p>
              </div>
              <div className="detail-field">
                <p className="detail-field__label">{copy.fieldLabels.bindingMode}</p>
                <p className="detail-field__value">
                  {provider.pageBindingModeLabel}
                </p>
              </div>
            </>
          ) : null}
          <div className="detail-field">
            <p className="detail-field__label">{copy.fieldLabels.selectionReason}</p>
            <p className="detail-field__value">{provider.sourceSelectionReason}</p>
          </div>
          {sourceSelectionDiagnosticPresentation ? (
            <>
              <div className="detail-field">
                <p className="detail-field__label">
                  {copy.fieldLabels.selectionDiagnostic}
                </p>
                <p className="detail-field__value">
                  {sourceSelectionDiagnosticPresentation.label}
                </p>
              </div>
              <div className="detail-field">
                <p className="detail-field__label">
                  {copy.fieldLabels.selectionDiagnosticSummary}
                </p>
                <p className="detail-field__value">
                  {sourceSelectionDiagnosticPresentation.summary}
                </p>
              </div>
            </>
          ) : null}
          {provider.sourceFallbackReason ? (
            <div className="detail-field">
              <p className="detail-field__label">{copy.fieldLabels.fallbackReason}</p>
              <p className="detail-field__value">{provider.sourceFallbackReason}</p>
            </div>
          ) : null}
          {sourceFallbackDiagnosticPresentation ? (
            <>
              <div className="detail-field">
                <p className="detail-field__label">
                  {copy.fieldLabels.fallbackDiagnostic}
                </p>
                <p className="detail-field__value">
                  {sourceFallbackDiagnosticPresentation.label}
                </p>
              </div>
              <div className="detail-field">
                <p className="detail-field__label">
                  {copy.fieldLabels.fallbackDiagnosticSummary}
                </p>
                <p className="detail-field__value">
                  {sourceFallbackDiagnosticPresentation.summary}
                </p>
              </div>
            </>
          ) : null}
          <div className="detail-field">
            <p className="detail-field__label">{copy.fieldLabels.sourceNote}</p>
            <p className="detail-field__value">{provider.currentSourceNote}</p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">{copy.fieldLabels.lastSync}</p>
            <p className="detail-field__value">{formattedSyncedAt}</p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">{copy.fieldLabels.hostAccess}</p>
            <p className="detail-field__value">{permissionStatusLabel}</p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">{copy.fieldLabels.hosts}</p>
            <p className="detail-field__value">{provider.hostsLabel}</p>
          </div>
          {provider.fallbackSourceLabels.length > 0 ? (
            <div className="detail-field">
              <p className="detail-field__label">{copy.fieldLabels.fallbackPath}</p>
              <p className="detail-field__value">
                {provider.fallbackSourceLabels.join(" · ")}
              </p>
            </div>
          ) : null}
        </div>

        <UsageProgress
          used={provider.used}
          total={provider.total}
          tone={provider.displayTone}
          label={copy.progressLabel(provider.providerLabel)}
        />

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
            <p className="supporting-copy">{provider.currentSourceStateDetail}</p>
          </div>
        ) : null}

        <div
          className={`detail-note ${fidelityNoteToneClassName}`}
          data-theme-stability-surface="provider-detail-fidelity-note"
        >
          <p className="detail-note__label">{copy.notes.sourceFidelity}</p>
          <p className="supporting-copy">{provider.currentSourceFidelityDetail}</p>
        </div>

        <div
          className="detail-note detail-note--neutral"
          data-theme-stability-surface="provider-detail-contract-note"
        >
          <p className="detail-note__label">{copy.notes.productContract}</p>
          <p className="supporting-copy">
            {provider.currentSourceContractDetail}
          </p>
          {provider.currentSourceGraduationGateDetail ? (
            <p className="supporting-copy">
              {copy.notes.graduationGatePrefix}
              {provider.currentSourceGraduationGateDetail}
            </p>
          ) : null}
          {showSessionPageContract ? (
            <p className="supporting-copy">
              {copy.notes.sessionPageTrackPrefix}
              {provider.sessionPageContractLabel}. {provider.sessionPageContractDetail}
            </p>
          ) : null}
          {showSessionPageGraduationGate &&
          provider.sessionPageGraduationGateDetail ? (
            <p className="supporting-copy">
              {copy.notes.sessionPageGatePrefix}
              {provider.sessionPageGraduationGateDetail}
            </p>
          ) : null}
        </div>

        <div
          className="detail-note detail-note--neutral"
          data-theme-stability-surface="provider-detail-trust-note"
        >
          <p className="detail-note__label">{copy.notes.trustBoundary}</p>
          <p className="supporting-copy">{provider.currentAccessModelDetail}</p>
          <p className="supporting-copy">{provider.credentialPersistenceDetail}</p>
          <p className="supporting-copy">{provider.cookiePolicyDetail}</p>
          <p className="supporting-copy">
            {provider.manualCookieImportDetail}
          </p>
          <p className="supporting-copy">{provider.hostAccessRequirementDetail}</p>
        </div>

        {provider.pageBindingDetail ? (
          <div
            className={`detail-note ${pageBindingNoteToneClassName}`}
          >
            <p className="detail-note__label">{copy.notes.pageBinding}</p>
            <p className="supporting-copy">{provider.pageBindingDetail}</p>
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

        {provider.warningReason ? (
          <div className="detail-note detail-note--warning">
            <p className="detail-note__label">{copy.notes.warningReason}</p>
            <p className="supporting-copy">{provider.warningReason}</p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
