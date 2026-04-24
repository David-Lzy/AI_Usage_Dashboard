import type { AppLocalePreference, ProviderId } from "../../providers/types";
import { createRuntimeI18n } from "../../shared/i18n";
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
        ? `${i18n.formatPercentValue(provider.used)} used · ${i18n.formatPercentValue(provider.remaining)} remaining`
        : provider.used !== null
          ? `${i18n.formatPercentValue(provider.used)} used`
          : provider.remaining !== null
            ? `${i18n.formatPercentValue(provider.remaining)} remaining`
            : "Unknown usage-window percentage"
      : provider.used !== null && provider.total !== null
        ? `${i18n.formatNumber(provider.used)} / ${i18n.formatNumber(provider.total)} ${provider.quotaUnit}`
        : provider.used !== null
          ? `${i18n.formatNumber(provider.used)} ${provider.quotaUnit} tracked`
          : provider.total !== null
            ? `Unknown / ${i18n.formatNumber(provider.total)} ${provider.quotaUnit}`
            : `Unknown ${provider.quotaUnit}`;

  const remainingValue =
    provider.quotaUnit === "percent" && provider.remaining !== null
      ? `${i18n.formatPercentValue(provider.remaining)} remaining`
      : provider.remaining !== null
      ? `${i18n.formatNumber(provider.remaining)} ${provider.quotaUnit}`
      : provider.used !== null && provider.total === null
        ? "Not available from this source"
      : "Unknown";
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

  return (
    <main className="app-shell">
      <TopBar
        title={provider.providerLabel}
        subtitle="Current provider source snapshot"
        themeActionLabel={themeActionLabel}
        themeActionTitle={themeActionTitle}
        expandActionLabel="Tab"
        expandActionTitle={`Open ${provider.providerLabel} detail tab`}
        secondaryActionLabel="Back"
        primaryActionLabel="Refresh"
        onThemeAction={onToggleThemeMode}
        onExpandAction={onOpenFullPage}
        onSecondaryAction={onBack}
        onPrimaryAction={() => onRefresh(provider.providerId)}
      />

      <section
        className="status-card"
        data-theme-stability-surface="provider-detail-sync-status-card"
      >
        <p className="section-label">Sync Status</p>
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
      </section>

      <section className="hero-card">
        <p className="section-label">Provider Detail</p>
        <h2 className="display-headline">{provider.planName}</h2>
        <p className="body-copy">
          This detail view reflects the normalized provider snapshot currently
          used by the dashboard and refresh flow, including the source fidelity
          and product-contract semantics shown in the side panel.
        </p>
      </section>

      <section
        className="status-card"
        data-theme-stability-surface="provider-detail-usage-card"
      >
        <p className="section-label">Usage</p>
        <div className="detail-grid">
          <div className="detail-field">
            <p className="detail-field__label">Plan</p>
            <p className="detail-field__value">{provider.planName}</p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">Status</p>
            <p className="detail-field__value">{provider.displaySyncStatus}</p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">Quota model</p>
            <p className="detail-field__value">
              {provider.quotaWindow} {provider.quotaUnit}
            </p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">Used</p>
            <p className="detail-field__value">{usageValue}</p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">Remaining</p>
            <p className="detail-field__value">{remainingValue}</p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">Reset time</p>
            <p className="detail-field__value">{formattedResetAt}</p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">Source preference</p>
            <p className="detail-field__value">{provider.sourcePreferenceLabel}</p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">Sync source</p>
            <p className="detail-field__value">{provider.currentSourceLabel}</p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">Product contract</p>
            <p className="detail-field__value">
              {provider.currentSourceContractLabel}
            </p>
          </div>
          {showSessionPageContract ? (
            <div className="detail-field">
              <p className="detail-field__label">Session-page contract</p>
              <p className="detail-field__value">
                {provider.sessionPageContractLabel}
              </p>
            </div>
          ) : null}
          {provider.currentSourceGraduationGateLabel ? (
            <div className="detail-field">
              <p className="detail-field__label">Graduation gate</p>
              <p className="detail-field__value">
                {provider.currentSourceGraduationGateLabel}
              </p>
            </div>
          ) : null}
          {showSessionPageGraduationGate ? (
            <div className="detail-field">
              <p className="detail-field__label">Session-page gate</p>
              <p className="detail-field__value">
                {provider.sessionPageGraduationGateLabel}
              </p>
            </div>
          ) : null}
          <div className="detail-field">
            <p className="detail-field__label">Source fidelity</p>
            <p className="detail-field__value">
              {provider.currentSourceFidelityLabel}
            </p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">Source state</p>
            <p className="detail-field__value">{provider.currentSourceStateLabel}</p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">Used value fidelity</p>
            <p className="detail-field__value">
              {provider.currentSourceUsedAvailabilityLabel}
            </p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">Remaining value fidelity</p>
            <p className="detail-field__value">
              {provider.currentSourceRemainingAvailabilityLabel}
            </p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">Reset value fidelity</p>
            <p className="detail-field__value">
              {provider.currentSourceResetAvailabilityLabel}
            </p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">Availability summary</p>
            <p className="detail-field__value">
              {provider.currentSourceAvailabilitySummary}
            </p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">Access model</p>
            <p className="detail-field__value">{provider.currentAccessModelLabel}</p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">Credential persistence</p>
            <p className="detail-field__value">
              {provider.credentialPersistenceLabel}
            </p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">Cookie storage</p>
            <p className="detail-field__value">{provider.cookiePolicyLabel}</p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">Manual cookie import</p>
            <p className="detail-field__value">
              {provider.manualCookieImportLabel}
            </p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">Host access requirement</p>
            <p className="detail-field__value">
              {provider.hostAccessRequirementLabel}
            </p>
          </div>
          {provider.pageBindingLabel ? (
            <>
              <div className="detail-field">
                <p className="detail-field__label">Page binding</p>
                <p className="detail-field__value">{provider.pageBindingLabel}</p>
              </div>
              <div className="detail-field">
                <p className="detail-field__label">Binding mode</p>
                <p className="detail-field__value">
                  {provider.pageBindingModeLabel}
                </p>
              </div>
            </>
          ) : null}
          <div className="detail-field">
            <p className="detail-field__label">Selection reason</p>
            <p className="detail-field__value">{provider.sourceSelectionReason}</p>
          </div>
          {provider.sourceFallbackReason ? (
            <div className="detail-field">
              <p className="detail-field__label">Fallback reason</p>
              <p className="detail-field__value">{provider.sourceFallbackReason}</p>
            </div>
          ) : null}
          <div className="detail-field">
            <p className="detail-field__label">Source note</p>
            <p className="detail-field__value">{provider.currentSourceNote}</p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">Last sync</p>
            <p className="detail-field__value">{formattedSyncedAt}</p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">Host access</p>
            <p className="detail-field__value">{provider.permissionStatus}</p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">Hosts</p>
            <p className="detail-field__value">{provider.hostsLabel}</p>
          </div>
          {provider.fallbackSourceLabels.length > 0 ? (
            <div className="detail-field">
              <p className="detail-field__label">Fallback path</p>
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
          label={`${provider.providerLabel} usage ratio`}
        />

        {provider.permissionStatus === "missing" ? (
          <div className="detail-note detail-note--warning">
            <p className="detail-note__label">Access status</p>
            <p className="supporting-copy">
              Host access is missing for this provider. Future live syncs may
              fail until the required host permissions are granted.
            </p>
          </div>
        ) : null}

        {provider.currentSourceStateKind !== "ready" ? (
          <div
            className={`detail-note ${provider.currentSourceStateTone === "error" ? "detail-note--error" : "detail-note--warning"}`}
          >
            <p className="detail-note__label">Source state</p>
            <p className="supporting-copy">{provider.currentSourceStateDetail}</p>
          </div>
        ) : null}

        <div
          className={`detail-note ${fidelityNoteToneClassName}`}
          data-theme-stability-surface="provider-detail-fidelity-note"
        >
          <p className="detail-note__label">Source fidelity</p>
          <p className="supporting-copy">{provider.currentSourceFidelityDetail}</p>
        </div>

        <div
          className="detail-note detail-note--neutral"
          data-theme-stability-surface="provider-detail-contract-note"
        >
          <p className="detail-note__label">Product contract</p>
          <p className="supporting-copy">
            {provider.currentSourceContractDetail}
          </p>
          {provider.currentSourceGraduationGateDetail ? (
            <p className="supporting-copy">
              Graduation gate: {provider.currentSourceGraduationGateDetail}
            </p>
          ) : null}
          {showSessionPageContract ? (
            <p className="supporting-copy">
              Session-page track: {provider.sessionPageContractLabel}.{" "}
              {provider.sessionPageContractDetail}
            </p>
          ) : null}
          {showSessionPageGraduationGate &&
          provider.sessionPageGraduationGateDetail ? (
            <p className="supporting-copy">
              Session-page gate: {provider.sessionPageGraduationGateDetail}
            </p>
          ) : null}
        </div>

        <div
          className="detail-note detail-note--neutral"
          data-theme-stability-surface="provider-detail-trust-note"
        >
          <p className="detail-note__label">Trust boundary</p>
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
            <p className="detail-note__label">Page binding</p>
            <p className="supporting-copy">{provider.pageBindingDetail}</p>
          </div>
        ) : null}

        {provider.warningReason ? (
          <div className="detail-note detail-note--warning">
            <p className="detail-note__label">Warning reason</p>
            <p className="supporting-copy">{provider.warningReason}</p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
