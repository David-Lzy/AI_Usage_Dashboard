import type {
  ProviderId,
  ProviderSetting,
  ProviderSnapshot,
  ProviderSourcePreference,
} from "../../providers/types";
import { buildProviderSourceDisplay } from "../../shared/provider-sources";
import type { RuntimeI18n } from "../../shared/i18n";
import { getProviderDiagnosticPresentation } from "../../shared/provider-diagnostic-presentation";
import { buildProviderSourceDisplayLocalizedCopy } from "../../shared/provider-source-display-localized-copy";
import {
  buildSettingsLocalizedCopy,
  getSettingsSourcePreferenceLabel,
} from "../../shared/settings-localized-copy";
import type { SettingsUserLevelVisibility } from "../settings-user-level-visibility";
import {
  buildSettingsSourceCardModel,
  buildSettingsSourceCompactFields,
} from "../settings-view-models";
import { MaterialSelect } from "./MaterialSelect";

type SettingsSourceCardProps = {
  activeSessionPageAttachAvailable: boolean;
  i18n: RuntimeI18n;
  provider: ProviderSetting;
  sessionPageNavigationAvailable: boolean;
  settingsCopy: ReturnType<typeof buildSettingsLocalizedCopy>;
  snapshot: ProviderSnapshot;
  userLevelVisibility: SettingsUserLevelVisibility;
  onAttachActiveSessionPage: (providerId: ProviderId) => void;
  onClearPageBinding: (providerId: ProviderId) => void;
  onOpenSessionPage: (providerId: ProviderId) => void;
  onSetSourcePreference: (
    providerId: ProviderId,
    sourcePreference: ProviderSourcePreference,
  ) => void;
};

export function SettingsSourceCard({
  activeSessionPageAttachAvailable,
  i18n,
  provider,
  sessionPageNavigationAvailable,
  settingsCopy,
  snapshot,
  userLevelVisibility,
  onAttachActiveSessionPage,
  onClearPageBinding,
  onOpenSessionPage,
  onSetSourcePreference,
}: SettingsSourceCardProps) {
  const sourceDisplay = buildProviderSourceDisplay(
    snapshot,
    provider,
    buildProviderSourceDisplayLocalizedCopy(i18n),
  );
  const sourceCardModel = buildSettingsSourceCardModel(
    sourceDisplay,
    {
      ...settingsCopy.sources.cardLabels,
      sourceKindLabels: settingsCopy.sources.sourceKindLabels,
      routeFallback: settingsCopy.sources.routeFallback,
    },
    getProviderDiagnosticPresentation(snapshot.warningDiagnostic, i18n),
    getProviderDiagnosticPresentation(
      snapshot.sourceSelectionDiagnostic,
      i18n,
    ),
    getProviderDiagnosticPresentation(snapshot.sourceFallbackDiagnostic, i18n),
  );
  const sessionPagePlan = sourceDisplay.sessionPagePlan;
  const canUseSessionPageAction = sessionPagePlan?.rolloutStage === "shipped";
  const compactFields = buildSettingsSourceCompactFields(
    sourceDisplay,
    settingsCopy,
  );
  const developerFields = userLevelVisibility.showDeveloperSourceContext
    ? sourceCardModel.primaryFields
    : [];
  const summaryNoteLines = Array.from(
    new Set(
      sourceCardModel.summaryNoteLines.filter((line) => Boolean(line.trim())),
    ),
  );

  return (
    <article
      key={provider.id}
      className="source-card"
      data-provider-id={provider.id}
    >
      <div className="source-card__header">
        <div>
          <p className="source-card__provider">{provider.label}</p>
          <p className="supporting-copy">
            {userLevelVisibility.showDeveloperSourceContext
              ? sourceDisplay.currentContractDetail
              : sourceDisplay.stateDetail}
          </p>
        </div>
        <div className="source-card__chips">
          <span className="meta-chip">{sourceDisplay.currentLabel}</span>
          {userLevelVisibility.showDeveloperSourceContext ? (
            <>
              <span className="meta-chip">
                {sourceDisplay.currentContractLabel}
              </span>
              <span className={getMetaChipClassName(sourceDisplay.fidelityTone)}>
                {sourceDisplay.fidelityLabel}
              </span>
            </>
          ) : null}
          <span className={getMetaChipClassName(sourceDisplay.stateTone)}>
            {sourceDisplay.stateLabel}
          </span>
        </div>
      </div>

      <div className="source-card__body">
        <div className="source-card__summary-grid">
          {userLevelVisibility.showSourcePreference ? (
            <div className="source-card__field">
              <p className="source-card__label">
                {settingsCopy.sources.preferenceLabel}
              </p>
              {sourceDisplay.sourcePreferenceOptions.length > 1 ? (
                <MaterialSelect
                  label={settingsCopy.sources.preferenceLabel}
                  labelHidden
                  value={sourceDisplay.sourcePreference}
                  fieldIdPrefix={`source-preference-${provider.id}`}
                  options={sourceDisplay.sourcePreferenceOptions.map(
                    (preference) => ({
                      value: preference,
                      label: getSettingsSourcePreferenceLabel(
                        preference,
                        settingsCopy,
                      ),
                    }),
                  )}
                  onChange={(preference) =>
                    onSetSourcePreference(provider.id, preference)
                  }
                />
              ) : (
                <p className="source-card__value">
                  {getSettingsSourcePreferenceLabel(
                    sourceDisplay.sourcePreference,
                    settingsCopy,
                  )}
                </p>
              )}
            </div>
          ) : null}
          {compactFields.map((field) => (
            <div key={field.label} className="source-card__field">
              <p className="source-card__label">{field.label}</p>
              <p className="source-card__value">{field.value}</p>
            </div>
          ))}
          {developerFields.map((field) => (
            <div
              key={`developer-${field.label}`}
              className="source-card__field source-card__field--developer"
            >
              <p className="source-card__label">{field.label}</p>
              <p className="source-card__value">{field.value}</p>
            </div>
          ))}
        </div>

        {summaryNoteLines.length > 0 ? (
          <div
            className={getDetailNoteClassName(sourceCardModel.summaryNoteTone)}
            data-theme-stability-surface={
              provider.id === "cursor"
                ? "settings-cursor-operational-note"
                : undefined
            }
          >
            <p className="detail-note__label">
              {settingsCopy.sources.operationalNoteLabel}
            </p>
            {summaryNoteLines.map((line) => (
              <p key={line} className="supporting-copy">
                {line}
              </p>
            ))}
          </div>
        ) : null}

        {sessionPagePlan && userLevelVisibility.showDeveloperSourceContext ? (
          <div className="source-card__session">
            <div className="source-card__session-header">
              <div>
                <p className="source-card__label">
                  {settingsCopy.sources.sessionPageTrackLabel}
                </p>
                <p className="source-card__value">
                  {sourceCardModel.sessionTrack?.title ?? sessionPagePlan.label}
                </p>
              </div>
              <div className="source-card__session-chips">
                {sourceCardModel.sessionTrack?.chips.map((chip) => (
                  <span
                    key={chip.label}
                    className={getMetaChipClassName(chip.tone)}
                  >
                    {chip.label}
                  </span>
                ))}
              </div>
            </div>

            {sourceCardModel.sessionTrack?.fields.length ? (
              <div className="source-card__session-grid">
                {sourceCardModel.sessionTrack.fields.map((field) => (
                  <div key={field.label} className="source-card__field">
                    <p className="source-card__label">{field.label}</p>
                    <p className="source-card__value">{field.value}</p>
                  </div>
                ))}
              </div>
            ) : null}

            {sourceCardModel.sessionTrack?.noteLines.length ? (
              <div
                className={getDetailNoteClassName(
                  sourceCardModel.sessionTrack.noteTone,
                )}
                data-theme-stability-surface={
                  provider.id === "cursor"
                    ? "settings-cursor-session-note"
                    : undefined
                }
              >
                <p className="detail-note__label">
                  {settingsCopy.sources.sessionPageNoteLabel}
                </p>
                {sourceCardModel.sessionTrack.noteLines.map((line) => (
                  <p key={line} className="supporting-copy">
                    {line}
                  </p>
                ))}
              </div>
            ) : null}

            {canUseSessionPageAction ? (
              <div className="credential-actions source-card__session-actions">
                <button
                  className="text-button"
                  type="button"
                  disabled={!sessionPageNavigationAvailable}
                  onClick={() => onOpenSessionPage(provider.id)}
                >
                  {sessionPageNavigationAvailable
                    ? settingsCopy.sources.findOrOpenPage
                    : settingsCopy.sources.extensionModeOnly}
                </button>
                <button
                  className="text-button"
                  type="button"
                  disabled={!activeSessionPageAttachAvailable}
                  onClick={() => onAttachActiveSessionPage(provider.id)}
                >
                  {settingsCopy.sources.useActivePage}
                </button>
                <button
                  className="text-button"
                  type="button"
                  disabled={
                    sourceDisplay.pageBindingLabel === null ||
                    provider.pageBinding.status === "unbound"
                  }
                  onClick={() => onClearPageBinding(provider.id)}
                >
                  {settingsCopy.sources.disconnectBinding}
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        {canUseSessionPageAction &&
        !userLevelVisibility.showDeveloperSourceContext ? (
          <div className="credential-actions source-card__session-actions">
            <button
              className="text-button"
              type="button"
              disabled={!sessionPageNavigationAvailable}
              onClick={() => onOpenSessionPage(provider.id)}
            >
              {sessionPageNavigationAvailable
                ? settingsCopy.sources.findOrOpenPage
                : settingsCopy.sources.extensionModeOnly}
            </button>
            <button
              className="text-button"
              type="button"
              disabled={!activeSessionPageAttachAvailable}
              onClick={() => onAttachActiveSessionPage(provider.id)}
            >
              {settingsCopy.sources.useActivePage}
            </button>
            <button
              className="text-button"
              type="button"
              disabled={provider.pageBinding.status === "unbound"}
              onClick={() => onClearPageBinding(provider.id)}
            >
              {settingsCopy.sources.disconnectBinding}
            </button>
          </div>
        ) : null}

        {userLevelVisibility.showDebugDiagnostics ? (
          <details className="source-card__details">
            <summary className="source-card__details-toggle">
              <span>{settingsCopy.sources.detailedDiagnostics}</span>
              <span className="meta-chip">
                {settingsCopy.sources.itemCount(sourceCardModel.diagnosticsCount)}
              </span>
            </summary>

            <div className="source-card__details-body">
              {sourceCardModel.diagnosticGroups.map((group) => (
                <section
                  key={group.title}
                  className="source-card__diagnostic-group"
                >
                  <div className="source-card__diagnostic-group-header">
                    <p className="source-card__diagnostic-group-title">
                      {group.title}
                    </p>
                    <span className="meta-chip">
                      {settingsCopy.sources.itemCount(
                        group.fields.length + group.noteLines.length,
                      )}
                    </span>
                  </div>

                  {group.fields.length > 0 ? (
                    <div className="source-card__diagnostic-list">
                      {group.fields.map((field) => (
                        <div
                          key={`${group.title}-${field.label}`}
                          className="source-card__diagnostic-row"
                        >
                          <p className="source-card__diagnostic-label">
                            {field.label}
                          </p>
                          <p className="source-card__diagnostic-value">
                            {field.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {group.noteLines.length > 0 ? (
                    <div className="detail-note detail-note--neutral">
                      <p className="detail-note__label">{group.title}</p>
                      {group.noteLines.map((line) => (
                        <p key={line} className="supporting-copy">
                          {line}
                        </p>
                      ))}
                    </div>
                  ) : null}
                </section>
              ))}
            </div>
          </details>
        ) : null}
      </div>
    </article>
  );
}

function getMetaChipClassName(
  tone: "error" | "warning" | "neutral" | null,
) {
  return `meta-chip ${
    tone === "error"
      ? "meta-chip--error"
      : tone === "warning"
        ? "meta-chip--warning"
        : ""
  }`.trim();
}

function getDetailNoteClassName(tone: "error" | "warning" | "neutral" | null) {
  return `detail-note ${
    tone === "error"
      ? "detail-note--error"
      : tone === "warning"
        ? "detail-note--warning"
        : "detail-note--neutral"
  }`.trim();
}
