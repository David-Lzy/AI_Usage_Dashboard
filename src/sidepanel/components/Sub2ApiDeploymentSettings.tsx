import { useEffect, useState } from "react";

import type {
  ProviderAccountId,
  ProviderAccountsByProvider,
  ProviderSnapshot,
} from "../../providers/types";
import { isSub2ApiNonLoopbackHttpUrl } from "../../providers/sub2api/connection";
import type { ResolvedAppLocale } from "../../shared/i18n";
import {
  DEFAULT_PROVIDER_ACCOUNT_ID,
  getActiveProviderAccountMetadata,
} from "../../shared/provider-accounts";
import {
  SUB2API_PROVIDER_ID,
  type Sub2ApiDeploymentDraft,
} from "../../shared/sub2api-deployments";
import { buildSub2ApiSettingsLocalizedCopy } from "../../shared/sub2api-settings-localized-copy";
import { MaterialInfoTooltip } from "./MaterialInfoTooltip";
import { MaterialSelect } from "./MaterialSelect";

type Sub2ApiDeploymentSettingsProps = {
  locale: ResolvedAppLocale;
  providerAccounts?: ProviderAccountsByProvider;
  snapshot: ProviderSnapshot | null;
  onSelectAccount: (accountId: ProviderAccountId) => void;
  onSave: (draft: Sub2ApiDeploymentDraft, testConnection: boolean) => void;
  onDisconnect: (
    accountId: ProviderAccountId,
    retainCachedSummary: boolean,
  ) => void;
  onRemove: (accountId: ProviderAccountId) => void;
};

function formatLastSuccess(
  value: string | null | undefined,
  locale: ResolvedAppLocale,
  fallback: string,
): string {
  if (!value) {
    return fallback;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? fallback
    : new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

export function Sub2ApiDeploymentSettings({
  locale,
  providerAccounts,
  snapshot,
  onSelectAccount,
  onSave,
  onDisconnect,
  onRemove,
}: Sub2ApiDeploymentSettingsProps) {
  const copy = buildSub2ApiSettingsLocalizedCopy(locale);
  const collection = providerAccounts?.[SUB2API_PROVIDER_ID];
  const activeAccountId =
    collection?.activeAccountId ?? DEFAULT_PROVIDER_ACCOUNT_ID;
  const activeMetadata = getActiveProviderAccountMetadata(
    { providerAccounts },
    SUB2API_PROVIDER_ID,
  );
  const activeConnection = activeMetadata?.apiGatewayConnection ?? null;
  const [isAdding, setIsAdding] = useState(false);
  const [displayLabel, setDisplayLabel] = useState(
    activeConnection?.displayLabel ?? activeMetadata?.label ?? "",
  );
  const [baseUrl, setBaseUrl] = useState(activeConnection?.baseUrl ?? "");
  const [apiKey, setApiKey] = useState("");
  const [insecureTransportAcknowledged, setInsecureTransportAcknowledged] =
    useState(activeConnection?.insecureTransportAcknowledged ?? false);
  const [retainCachedSummary, setRetainCachedSummary] = useState(true);

  useEffect(() => {
    setIsAdding(false);
    setDisplayLabel(
      activeConnection?.displayLabel ?? activeMetadata?.label ?? "",
    );
    setBaseUrl(activeConnection?.baseUrl ?? "");
    setApiKey("");
    setInsecureTransportAcknowledged(
      activeConnection?.insecureTransportAcknowledged ?? false,
    );
  }, [
    activeAccountId,
    activeConnection?.baseUrl,
    activeConnection?.displayLabel,
    activeConnection?.insecureTransportAcknowledged,
    activeMetadata?.label,
  ]);

  const requiresInsecureAcknowledgement =
    isSub2ApiNonLoopbackHttpUrl(baseUrl);
  const draft: Sub2ApiDeploymentDraft = {
    accountId: isAdding ? null : activeAccountId,
    displayLabel,
    baseUrl,
    apiKey: apiKey.trim() ? apiKey : null,
    insecureTransportAcknowledged,
  };
  const scope = snapshot?.apiGatewayMetering?.scope;
  const scopeLabel =
    scope === "api_key"
      ? copy.scopeApiKey
      : scope === "account"
        ? copy.scopeAccount
        : copy.scopeUnknown;

  function beginAddDeployment() {
    setIsAdding(true);
    setDisplayLabel("");
    setBaseUrl("");
    setApiKey("");
    setInsecureTransportAcknowledged(false);
  }

  function cancelAddDeployment() {
    setIsAdding(false);
    setDisplayLabel(
      activeConnection?.displayLabel ?? activeMetadata?.label ?? "",
    );
    setBaseUrl(activeConnection?.baseUrl ?? "");
    setApiKey("");
    setInsecureTransportAcknowledged(
      activeConnection?.insecureTransportAcknowledged ?? false,
    );
  }

  function submit(testConnection: boolean) {
    onSave(draft, testConnection);
    setApiKey("");
  }

  return (
    <section
      className="sub2api-deployment-settings"
      data-sub2api-deployment-settings=""
    >
      <div className="dashboard-section__header sub2api-deployment-settings__header">
        <div>
          <p className="section-label">{copy.eyebrow}</p>
          <div className="section-title-with-info">
            <h3 className="section-title">{copy.title}</h3>
            <MaterialInfoTooltip>{copy.detail}</MaterialInfoTooltip>
          </div>
        </div>
        {isAdding ? (
          <button
            className="text-button"
            type="button"
            onClick={cancelAddDeployment}
          >
            {copy.cancel}
          </button>
        ) : (
          <button
            className="text-button"
            type="button"
            onClick={beginAddDeployment}
          >
            {copy.addDeployment}
          </button>
        )}
      </div>

      <p className="body-copy sub2api-deployment-settings__detail">
        {copy.detail}
      </p>

      <div className="sub2api-deployment-settings__trust" role="note">
        <strong>{copy.trustTitle}</strong>
        <span>{copy.trustDetail}</span>
      </div>

      {!isAdding && collection?.accounts.length ? (
        <MaterialSelect
          fieldIdPrefix="sub2api-active-deployment"
          label={copy.deployment}
          value={activeAccountId}
          options={collection.accounts.map((account) => ({
            value: account.id,
            label: account.label,
          }))}
          onChange={(accountId) => onSelectAccount(accountId)}
        />
      ) : null}

      <div className="sub2api-deployment-settings__form">
        <label className="form-field">
          <span className="form-field__label">{copy.displayLabel}</span>
          <input
            className="form-field__control"
            autoComplete="off"
            maxLength={64}
            value={displayLabel}
            onChange={(event) => setDisplayLabel(event.currentTarget.value)}
          />
        </label>
        <label className="form-field sub2api-deployment-settings__origin">
          <span className="form-field__label">{copy.baseUrl}</span>
          <input
            className="form-field__control"
            autoCapitalize="none"
            autoComplete="url"
            inputMode="url"
            placeholder="https://gateway.example.com"
            value={baseUrl}
            onChange={(event) => {
              setBaseUrl(event.currentTarget.value);
              setInsecureTransportAcknowledged(false);
            }}
          />
        </label>
        <label className="form-field">
          <span className="form-field__label">{copy.connectionMode}</span>
          <input
            className="form-field__control"
            disabled
            value={copy.connectionModeValue}
          />
        </label>
        <label className="form-field sub2api-deployment-settings__api-key">
          <span className="form-field__label">{copy.apiKey}</span>
          <input
            className="form-field__control"
            autoCapitalize="none"
            autoComplete="new-password"
            placeholder={copy.apiKeyPlaceholder}
            type="password"
            value={apiKey}
            onChange={(event) => setApiKey(event.currentTarget.value)}
          />
          {!isAdding && activeConnection ? (
            <span className="supporting-copy form-field__supporting-text">
              {copy.apiKeyPreserved}
            </span>
          ) : null}
        </label>
      </div>

      {requiresInsecureAcknowledgement ? (
        <div
          className="sub2api-deployment-settings__insecure"
          data-sub2api-insecure-warning=""
          role="alert"
        >
          <strong>{copy.insecureTitle}</strong>
          <span>{copy.insecureDetail}</span>
          <label>
            <input
              type="checkbox"
              checked={insecureTransportAcknowledged}
              onChange={(event) =>
                setInsecureTransportAcknowledged(event.currentTarget.checked)
              }
            />
            <span>{copy.acknowledgeInsecure}</span>
          </label>
        </div>
      ) : null}

      <dl className="sub2api-deployment-settings__metadata">
        <div>
          <dt>{copy.lastSync}</dt>
          <dd>
            {formatLastSuccess(
              activeMetadata?.lastSuccessAt,
              locale,
              copy.neverSynced,
            )}
          </dd>
        </div>
        <div>
          <dt>{copy.sourceScope}</dt>
          <dd>{scopeLabel}</dd>
        </div>
      </dl>

      <div className="sub2api-deployment-settings__actions">
        <button
          className="icon-button icon-button--primary"
          type="button"
          onClick={() => submit(true)}
        >
          {copy.saveAndTest}
        </button>
        <button
          className="text-button"
          type="button"
          onClick={() => submit(false)}
        >
          {copy.save}
        </button>
        {!isAdding && activeConnection ? (
          <button
            className="text-button"
            type="button"
            onClick={() => onDisconnect(activeAccountId, retainCachedSummary)}
          >
            {copy.disconnect}
          </button>
        ) : null}
        {!isAdding && activeAccountId !== DEFAULT_PROVIDER_ACCOUNT_ID ? (
          <button
            className="text-button sub2api-deployment-settings__remove"
            type="button"
            onClick={() => onRemove(activeAccountId)}
          >
            {copy.remove}
          </button>
        ) : null}
      </div>

      {!isAdding && activeConnection ? (
        <label className="sub2api-deployment-settings__retain">
          <input
            type="checkbox"
            checked={retainCachedSummary}
            onChange={(event) =>
              setRetainCachedSummary(event.currentTarget.checked)
            }
          />
          <span>{copy.retainCachedSummary}</span>
        </label>
      ) : null}

      <details className="sub2api-deployment-settings__protocol">
        <summary>{copy.protocolTitle}</summary>
        <p>{copy.protocolDetail}</p>
        <p>{copy.protocolExcluded}</p>
      </details>
    </section>
  );
}
