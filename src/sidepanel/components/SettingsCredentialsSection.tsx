import type { FormEvent } from "react";

import type {
  ApiKeyProviderId,
  ProviderId,
  ProviderSetting,
} from "../../providers/types";
import type { ResolvedTextDirection } from "../../shared/i18n";
import type { buildSettingsLocalizedCopy } from "../../shared/settings-localized-copy";
import {
  ProviderCarousel,
  type ProviderCarouselItem,
} from "./ProviderCarousel";
import { MaterialInfoTooltip } from "./MaterialInfoTooltip";

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
  codexProvider: (ProviderSetting & { id: "codex-enterprise-api" }) | null;
  codexWorkspaceIdInput: string;
  credentialInputs: Record<ApiKeyProviderId, string>;
  credentialProviders: CredentialProviderSection[];
  detail: string;
  eyebrow: string;
  focusedProviderId?: ProviderId | null;
  labels: ReturnType<typeof buildSettingsLocalizedCopy>["credentials"];
  sectionId?: string;
  textDirection?: ResolvedTextDirection;
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

export function SettingsCredentialsSection({
  codexAnalyticsApiKeyInput,
  codexProvider,
  codexWorkspaceIdInput,
  credentialInputs,
  credentialProviders,
  detail,
  eyebrow,
  focusedProviderId = null,
  labels,
  sectionId,
  textDirection = "ltr",
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

  const credentialItems: ProviderCarouselItem[] = [
    ...credentialProviders.map((item) => {
      const isConfigured = item.provider.credentialStatus === "configured";
      const currentInput = credentialInputs[item.provider.id];
      const trimmedInput = currentInput.trim();

      return {
        id: item.provider.id,
        label: item.provider.label,
        content: (
          <article
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
        ),
      };
    }),
    ...(codexProvider
      ? [
          {
            id: codexProvider.id,
            label: codexProvider.label,
            content: (
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
            ),
          },
        ]
      : []),
  ];
  const focusedCredentialIndex = credentialItems.findIndex(
    (item) => item.id === focusedProviderId,
  );

  return (
    <section className="dashboard-section settings-section-anchor" id={sectionId}>
      <div className="dashboard-section__header">
        <div>
          <p className="section-label">{eyebrow}</p>
          <div className="section-title-with-info">
            <h2 className="section-title">{title}</h2>
            <MaterialInfoTooltip>{detail}</MaterialInfoTooltip>
          </div>
        </div>
      </div>

      <ProviderCarousel
        ariaLabel={title}
        initialIndex={focusedCredentialIndex > -1 ? focusedCredentialIndex : 0}
        items={credentialItems}
        textDirection={textDirection}
      />
    </section>
  );
}
