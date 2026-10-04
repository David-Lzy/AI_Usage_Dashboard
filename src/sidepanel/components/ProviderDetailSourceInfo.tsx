import type { RuntimeI18n } from "../../shared/i18n";
import {
  buildProviderDetailLocalizedCopy,
  getPermissionStatusLabel,
} from "../../shared/provider-detail-localized-copy";
import { getProviderDiagnosticPresentation } from "../../shared/provider-diagnostic-presentation";
import { getProviderDetailGroupsCopy } from "../../shared/provider-detail-groups-copy";
import { TechnicalText } from "../../shared/components/TechnicalText";
import type { ProviderViewModel } from "../view-models";
import { MotionDetails } from "../../shared/components/MotionDetails";

export function ProviderDetailSourceInfo({
  provider,
  i18n,
}: {
  provider: ProviderViewModel;
  i18n: RuntimeI18n;
}) {
  const copy = buildProviderDetailLocalizedCopy(i18n);
  const groups = getProviderDetailGroupsCopy(i18n.resolvedLocale);
  const showSessionPageContract =
    provider.sessionPageContractLabel !== null &&
    (provider.sessionPageContractLabel !==
      provider.currentSourceContractLabel ||
      provider.sessionPageContractDetail !==
        provider.currentSourceContractDetail);
  const showSessionPageGraduationGate =
    provider.sessionPageGraduationGateLabel !== null &&
    (showSessionPageContract ||
      provider.sessionPageGraduationGateLabel !==
        provider.currentSourceGraduationGateLabel ||
      provider.sessionPageGraduationGateDetail !==
        provider.currentSourceGraduationGateDetail);

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

  const permissionStatusLabel = getPermissionStatusLabel(
    provider.permissionStatus,
    copy,
  );

  const sourceSelectionDiagnosticPresentation =
    getProviderDiagnosticPresentation(provider.sourceSelectionDiagnostic, i18n);
  const sourceFallbackDiagnosticPresentation =
    getProviderDiagnosticPresentation(provider.sourceFallbackDiagnostic, i18n);

  return (
    <MotionDetails
      className="detail-section detail-source-info"
      data-provider-source-info=""
      summary={groups.source}
      summaryProps={{ className: "section-title" }}
    >
      <div className="detail-source-info__body">
        <div className="detail-grid">
          <div className="detail-field">
            <p className="detail-field__label">
              {copy.fieldLabels.sourcePreference}
            </p>
            <p className="detail-field__value">
              {provider.sourcePreferenceLabel}
            </p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">{copy.fieldLabels.syncSource}</p>
            <p className="detail-field__value">
              <TechnicalText direction="auto">
                {provider.currentSourceLabel}
              </TechnicalText>
            </p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">
              {copy.fieldLabels.productContract}
            </p>
            <p className="detail-field__value">
              <TechnicalText direction="auto">
                {provider.currentSourceContractLabel}
              </TechnicalText>
            </p>
          </div>
          {showSessionPageContract ? (
            <div className="detail-field">
              <p className="detail-field__label">
                {copy.fieldLabels.sessionPageContract}
              </p>
              <p className="detail-field__value">
                <TechnicalText direction="auto">
                  {provider.sessionPageContractLabel}
                </TechnicalText>
              </p>
            </div>
          ) : null}
          {provider.currentSourceGraduationGateLabel ? (
            <div className="detail-field">
              <p className="detail-field__label">
                {copy.fieldLabels.graduationGate}
              </p>
              <p className="detail-field__value">
                {provider.currentSourceGraduationGateLabel}
              </p>
            </div>
          ) : null}
          {showSessionPageGraduationGate ? (
            <div className="detail-field">
              <p className="detail-field__label">
                {copy.fieldLabels.sessionPageGate}
              </p>
              <p className="detail-field__value">
                {provider.sessionPageGraduationGateLabel}
              </p>
            </div>
          ) : null}
          <div className="detail-field">
            <p className="detail-field__label">
              {copy.fieldLabels.sourceFidelity}
            </p>
            <p className="detail-field__value">
              {provider.currentSourceFidelityLabel}
            </p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">
              {copy.fieldLabels.sourceState}
            </p>
            <p className="detail-field__value">
              {provider.currentSourceStateLabel}
            </p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">
              {copy.fieldLabels.usedValueFidelity}
            </p>
            <p className="detail-field__value">
              {provider.currentSourceUsedAvailabilityLabel}
            </p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">
              {copy.fieldLabels.remainingValueFidelity}
            </p>
            <p className="detail-field__value">
              {provider.currentSourceRemainingAvailabilityLabel}
            </p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">
              {copy.fieldLabels.resetValueFidelity}
            </p>
            <p className="detail-field__value">
              {provider.currentSourceResetAvailabilityLabel}
            </p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">
              {copy.fieldLabels.availabilitySummary}
            </p>
            <p className="detail-field__value">
              {provider.currentSourceAvailabilitySummary}
            </p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">
              {copy.fieldLabels.accessModel}
            </p>
            <p className="detail-field__value">
              {provider.currentAccessModelLabel}
            </p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">
              {copy.fieldLabels.credentialPersistence}
            </p>
            <p className="detail-field__value">
              {provider.credentialPersistenceLabel}
            </p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">
              {copy.fieldLabels.cookieStorage}
            </p>
            <p className="detail-field__value">{provider.cookiePolicyLabel}</p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">
              {copy.fieldLabels.manualCookieImport}
            </p>
            <p className="detail-field__value">
              {provider.manualCookieImportLabel}
            </p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">
              {copy.fieldLabels.hostAccessRequirement}
            </p>
            <p className="detail-field__value">
              {provider.hostAccessRequirementLabel}
            </p>
          </div>
          {provider.pageBindingLabel ? (
            <>
              <div className="detail-field">
                <p className="detail-field__label">
                  {copy.fieldLabels.pageBinding}
                </p>
                <p className="detail-field__value">
                  {provider.pageBindingLabel}
                </p>
              </div>
              <div className="detail-field">
                <p className="detail-field__label">
                  {copy.fieldLabels.bindingMode}
                </p>
                <p className="detail-field__value">
                  {provider.pageBindingModeLabel}
                </p>
              </div>
            </>
          ) : null}
          <div className="detail-field">
            <p className="detail-field__label">
              {copy.fieldLabels.selectionReason}
            </p>
            <p className="detail-field__value">
              {provider.sourceSelectionReason}
            </p>
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
              <p className="detail-field__label">
                {copy.fieldLabels.fallbackReason}
              </p>
              <p className="detail-field__value">
                {provider.sourceFallbackReason}
              </p>
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
            <p className="detail-field__label">{copy.fieldLabels.hostAccess}</p>
            <p className="detail-field__value">{permissionStatusLabel}</p>
          </div>
          <div className="detail-field">
            <p className="detail-field__label">{copy.fieldLabels.hosts}</p>
            <p className="detail-field__value">
              <TechnicalText>{provider.hostsLabel}</TechnicalText>
            </p>
          </div>
          {provider.fallbackSourceLabels.length > 0 ? (
            <div className="detail-field">
              <p className="detail-field__label">
                {copy.fieldLabels.fallbackPath}
              </p>
              <p className="detail-field__value">
                <TechnicalText direction="auto">
                  {provider.fallbackSourceLabels.join(" · ")}
                </TechnicalText>
              </p>
            </div>
          ) : null}
        </div>
        <div
          className={`detail-note ${fidelityNoteToneClassName}`}
          data-theme-stability-surface="provider-detail-fidelity-note"
        >
          <p className="detail-note__label">{copy.notes.sourceFidelity}</p>
          <p className="supporting-copy">
            {provider.currentSourceFidelityDetail}
          </p>
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
              <TechnicalText direction="auto">
                {provider.sessionPageContractLabel}
              </TechnicalText>
              . {provider.sessionPageContractDetail}
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
          <p className="supporting-copy">
            {provider.credentialPersistenceDetail}
          </p>
          <p className="supporting-copy">{provider.cookiePolicyDetail}</p>
          <p className="supporting-copy">{provider.manualCookieImportDetail}</p>
          <p className="supporting-copy">
            {provider.hostAccessRequirementDetail}
          </p>
        </div>

        {provider.pageBindingDetail ? (
          <div className={`detail-note ${pageBindingNoteToneClassName}`}>
            <p className="detail-note__label">{copy.notes.pageBinding}</p>
            <p className="supporting-copy">{provider.pageBindingDetail}</p>
          </div>
        ) : null}
      </div>
    </MotionDetails>
  );
}
