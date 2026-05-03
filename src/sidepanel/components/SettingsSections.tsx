import type { FormEvent } from "react";

import type {
  ApiKeyProviderId,
  ProviderId,
  ProviderSetting,
  SummaryItem,
} from "../../providers/types";
import type { buildSettingsLocalizedCopy } from "../../shared/localized-copy";
import type { SettingsSectionId } from "../settings-section-ids";
import {
  PermissionPrompt,
  type PermissionPromptLabels,
} from "./PermissionPrompt";
import { SummaryStrip } from "./SummaryStrip";

type SettingsOverviewSectionProps = {
  ariaLabel: string;
  detail: string;
  eyebrow: string;
  items: SummaryItem[];
  title: string;
};

type SettingsVisibilitySectionProps = {
  disabledDetail: string;
  enabledDetail: string;
  eyebrow: string;
  providers: ProviderSetting[];
  sectionId: SettingsSectionId;
  onToggleProvider: (providerId: ProviderId) => void;
};

export type CredentialProviderSection = {
  provider: ProviderSetting & { id: ApiKeyProviderId };
  title: string;
  inputLabel: string;
  helpText: string;
  footerText: string;
  placeholderMissing: string;
  placeholderConfigured: string;
};

type SettingsCredentialsSectionProps = {
  codexAnalyticsApiKeyInput: string;
  codexProvider: (ProviderSetting & { id: "codex" }) | null;
  codexWorkspaceIdInput: string;
  credentialInputs: Record<ApiKeyProviderId, string>;
  credentialProviders: CredentialProviderSection[];
  detail: string;
  eyebrow: string;
  labels: ReturnType<typeof buildSettingsLocalizedCopy>["credentials"];
  sectionId: SettingsSectionId;
  title: string;
  onClearCodexConfig: () => void;
  onClearProviderApiKey: (providerId: ApiKeyProviderId) => void;
  onCodexAnalyticsApiKeyInputChange: (value: string) => void;
  onCodexWorkspaceIdInputChange: (value: string) => void;
  onProviderApiKeyInputChange: (
    providerId: ApiKeyProviderId,
    value: string,
  ) => void;
  onSaveCodexConfig: (event: FormEvent<HTMLFormElement>) => void;
  onSaveProviderApiKey: (
    providerId: ApiKeyProviderId,
    event: FormEvent<HTMLFormElement>,
  ) => void;
};

type SettingsPermissionsSectionProps = {
  detail: string;
  eyebrow: string;
  labels: PermissionPromptLabels;
  providers: ProviderSetting[];
  sectionId: SettingsSectionId;
  title: string;
  onTogglePermission: (providerId: ProviderId) => void;
};

export function SettingsOverviewSection({
  ariaLabel,
  detail,
  eyebrow,
  items,
  title,
}: SettingsOverviewSectionProps) {
  return (
    <section className="status-card settings-overview">
      <div className="dashboard-section__header">
        <div>
          <p className="section-label">{eyebrow}</p>
          <h2 className="section-title">{title}</h2>
        </div>
        <p className="supporting-copy">{detail}</p>
      </div>

      <SummaryStrip ariaLabel={ariaLabel} items={items} />
    </section>
  );
}

export function SettingsVisibilitySection({
  disabledDetail,
  enabledDetail,
  eyebrow,
  providers,
  sectionId,
  onToggleProvider,
}: SettingsVisibilitySectionProps) {
  return (
    <section className="status-card settings-section-anchor" id={sectionId}>
      <p className="section-label">{eyebrow}</p>
      <div className="settings-list">
        {providers.map((provider) => (
          <label
            key={provider.id}
            className="switch-row"
            data-visibility-provider-id={provider.id}
            data-visibility-enabled={provider.enabled ? "true" : "false"}
          >
            <div>
              <p className="switch-row__title">{provider.label}</p>
              <p className="supporting-copy">
                {provider.enabled ? enabledDetail : disabledDetail}
              </p>
            </div>
            <input
              className="switch-row__control"
              type="checkbox"
              checked={provider.enabled}
              data-visibility-toggle={provider.id}
              onChange={() => onToggleProvider(provider.id)}
            />
          </label>
        ))}
      </div>
    </section>
  );
}

export function SettingsCredentialsSection({
  codexAnalyticsApiKeyInput,
  codexProvider,
  codexWorkspaceIdInput,
  credentialInputs,
  credentialProviders,
  detail,
  eyebrow,
  labels,
  sectionId,
  title,
  onClearCodexConfig,
  onClearProviderApiKey,
  onCodexAnalyticsApiKeyInputChange,
  onCodexWorkspaceIdInputChange,
  onProviderApiKeyInputChange,
  onSaveCodexConfig,
  onSaveProviderApiKey,
}: SettingsCredentialsSectionProps) {
  if (credentialProviders.length === 0 && !codexProvider) {
    return null;
  }

  return (
    <section className="dashboard-section settings-section-anchor" id={sectionId}>
      <div className="dashboard-section__header">
        <div>
          <p className="section-label">{eyebrow}</p>
          <h2 className="section-title">{title}</h2>
        </div>
        <p className="supporting-copy">{detail}</p>
      </div>

      <div className="provider-shell-list">
        {credentialProviders.map((item) => {
          const isConfigured = item.provider.credentialStatus === "configured";
          const currentInput = credentialInputs[item.provider.id];
          const trimmedInput = currentInput.trim();

          return (
            <article
              key={item.provider.id}
              className="status-card"
              data-credential-provider-id={item.provider.id}
            >
              <div className="dashboard-section__header">
                <div>
                  <p className="section-label">{labels.sectionLabel}</p>
                  <h2 className="section-title">{item.title}</h2>
                </div>
                <p
                  className={`credential-state ${
                    isConfigured
                      ? "credential-state--configured"
                      : "credential-state--missing"
                  }`}
                >
                  {isConfigured ? labels.configured : labels.missing}
                </p>
              </div>

              <div className="credential-card">
                <p className="supporting-copy">{item.helpText}</p>

                <form
                  className="credential-form"
                  onSubmit={(event) =>
                    onSaveProviderApiKey(item.provider.id, event)
                  }
                >
                  <label className="form-field">
                    <span className="form-field__label">{item.inputLabel}</span>
                    <input
                      className="form-field__control"
                      type="password"
                      autoComplete="off"
                      spellCheck={false}
                      value={currentInput}
                      placeholder={
                        isConfigured
                          ? item.placeholderConfigured
                          : item.placeholderMissing
                      }
                      onChange={(event) =>
                        onProviderApiKeyInputChange(
                          item.provider.id,
                          event.target.value,
                        )
                      }
                    />
                  </label>

                  <div className="credential-actions">
                    <button
                      className="text-button"
                      type="submit"
                      disabled={!trimmedInput}
                    >
                      {labels.saveKey}
                    </button>
                    <button
                      className="text-button"
                      type="button"
                      disabled={!isConfigured}
                      onClick={() => onClearProviderApiKey(item.provider.id)}
                    >
                      {labels.clearStoredKey}
                    </button>
                  </div>
                </form>

                <p className="supporting-copy">{item.footerText}</p>
              </div>
            </article>
          );
        })}

        {codexProvider ? (
          <article
            className="status-card"
            data-credential-provider-id={codexProvider.id}
          >
            <div className="dashboard-section__header">
              <div>
                <p className="section-label">{labels.sectionLabel}</p>
                <h2 className="section-title">{labels.codexTitle}</h2>
              </div>
              <p
                className={`credential-state ${
                  codexProvider.credentialStatus === "configured"
                    ? "credential-state--configured"
                    : "credential-state--missing"
                }`}
              >
                {codexProvider.credentialStatus === "configured"
                  ? labels.configured
                  : labels.missing}
              </p>
            </div>

            <div className="credential-card">
              <p className="supporting-copy">{labels.codexHelpText}</p>

              <form className="credential-form" onSubmit={onSaveCodexConfig}>
                <label className="form-field">
                  <span className="form-field__label">
                    {labels.analyticsApiKeyLabel}
                  </span>
                  <input
                    className="form-field__control"
                    type="password"
                    autoComplete="off"
                    spellCheck={false}
                    value={codexAnalyticsApiKeyInput}
                    placeholder={
                      codexProvider.credentialStatus === "configured"
                        ? labels.codexAnalyticsPlaceholderConfigured
                        : labels.codexAnalyticsPlaceholderMissing
                    }
                    onChange={(event) =>
                      onCodexAnalyticsApiKeyInputChange(event.target.value)
                    }
                  />
                </label>

                <label className="form-field">
                  <span className="form-field__label">
                    {labels.workspaceIdLabel}
                  </span>
                  <input
                    className="form-field__control"
                    type="text"
                    autoComplete="off"
                    spellCheck={false}
                    value={codexWorkspaceIdInput}
                    placeholder={
                      codexProvider.credentialStatus === "configured"
                        ? labels.codexWorkspacePlaceholderConfigured
                        : labels.codexWorkspacePlaceholderMissing
                    }
                    onChange={(event) =>
                      onCodexWorkspaceIdInputChange(event.target.value)
                    }
                  />
                </label>

                <div className="credential-actions">
                  <button
                    className="text-button"
                    type="submit"
                    disabled={
                      !codexAnalyticsApiKeyInput.trim() ||
                      !codexWorkspaceIdInput.trim()
                    }
                  >
                    {labels.saveConfig}
                  </button>
                  <button
                    className="text-button"
                    type="button"
                    disabled={codexProvider.credentialStatus !== "configured"}
                    onClick={onClearCodexConfig}
                  >
                    {labels.clearStoredConfig}
                  </button>
                </div>
              </form>

              <p className="supporting-copy">{labels.codexFooterText}</p>
            </div>
          </article>
        ) : null}
      </div>
    </section>
  );
}

export function SettingsPermissionsSection({
  detail,
  eyebrow,
  labels,
  providers,
  sectionId,
  title,
  onTogglePermission,
}: SettingsPermissionsSectionProps) {
  return (
    <section className="dashboard-section settings-section-anchor" id={sectionId}>
      <div className="dashboard-section__header">
        <div>
          <p className="section-label">{eyebrow}</p>
          <h2 className="section-title">{title}</h2>
        </div>
        <p className="supporting-copy">{detail}</p>
      </div>

      <div className="provider-shell-list">
        {providers.map((provider) => (
          <PermissionPrompt
            key={provider.id}
            providerId={provider.id}
            providerLabel={provider.label}
            description={provider.description}
            hostsLabel={provider.hostsLabel}
            requiresHostAccess={(provider.hostOrigins?.length ?? 0) > 0}
            status={provider.status}
            labels={labels}
            onToggle={() => onTogglePermission(provider.id)}
          />
        ))}
      </div>
    </section>
  );
}
