import { useEffect, useRef, useState } from "react";

import type {
  ProviderAccountId,
  ProviderAccountsByProvider,
  ProviderSnapshot,
} from "../../providers/types";
import { isSub2ApiNonLoopbackHttpUrl } from "../../providers/sub2api/connection";
import { getTestConnectionLabel } from "../../shared/connection-action-localized-copy";
import type { ResolvedAppLocale } from "../../shared/i18n";
import {
  DEFAULT_PROVIDER_ACCOUNT_ID,
  getActiveProviderAccountMetadata,
} from "../../shared/provider-accounts";
import {
  SUB2API_PROVIDER_ID,
  type Sub2ApiDeploymentDraft,
} from "../../shared/sub2api-deployments";
import {
  buildSub2ApiSettingsLocalizedCopy,
  getSub2ApiConnectionTestLocalizedCopy,
} from "../../shared/sub2api-settings-localized-copy";
import { MaterialInfoTooltip } from "./MaterialInfoTooltip";
import { MaterialSelect } from "./MaterialSelect";
import { TechnicalText } from "../../shared/components/TechnicalText";

type Sub2ApiDeploymentSettingsProps = {
  locale: ResolvedAppLocale;
  providerAccounts?: ProviderAccountsByProvider;
  snapshot: ProviderSnapshot | null;
  onSelectAccount: (accountId: ProviderAccountId) => void;
  onSave: (draft: Sub2ApiDeploymentDraft, testConnection: boolean) => void;
  onTest: () => Promise<boolean>;
  onDisconnect: (
    accountId: ProviderAccountId,
    retainCachedSummary: boolean,
  ) => void;
  onRemove: (accountId: ProviderAccountId) => void;
};

type ConnectionTestStatus =
  | "idle"
  | "testing"
  | "success"
  | "failure"
  | "timeout";

const CONNECTION_TEST_TIMEOUT_MS = 20_000;
const CONNECTION_TEST_TICK_MS = 250;

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
  onTest,
  onDisconnect,
  onRemove,
}: Sub2ApiDeploymentSettingsProps) {
  const copy = buildSub2ApiSettingsLocalizedCopy(locale);
  const connectionTestCopy = getSub2ApiConnectionTestLocalizedCopy(locale);
  const testConnectionLabel = getTestConnectionLabel(locale);
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
  const [connectionTestStatus, setConnectionTestStatus] =
    useState<ConnectionTestStatus>("idle");
  const [connectionTestRemainingMs, setConnectionTestRemainingMs] = useState(
    CONNECTION_TEST_TIMEOUT_MS,
  );
  const connectionTestRunIdRef = useRef(0);
  const connectionTestIntervalRef = useRef<ReturnType<
    typeof globalThis.setInterval
  > | null>(null);
  const connectionTestTimeoutRef = useRef<ReturnType<
    typeof globalThis.setTimeout
  > | null>(null);

  function clearConnectionTestTimers() {
    if (connectionTestIntervalRef.current !== null) {
      globalThis.clearInterval(connectionTestIntervalRef.current);
      connectionTestIntervalRef.current = null;
    }
    if (connectionTestTimeoutRef.current !== null) {
      globalThis.clearTimeout(connectionTestTimeoutRef.current);
      connectionTestTimeoutRef.current = null;
    }
  }

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

  useEffect(
    () => () => {
      connectionTestRunIdRef.current += 1;
      clearConnectionTestTimers();
    },
    [],
  );

  useEffect(() => {
    connectionTestRunIdRef.current += 1;
    clearConnectionTestTimers();
    setConnectionTestStatus("idle");
    setConnectionTestRemainingMs(CONNECTION_TEST_TIMEOUT_MS);
  }, [
    activeAccountId,
    apiKey,
    baseUrl,
    displayLabel,
    insecureTransportAcknowledged,
    isAdding,
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
  const hasUnsavedConnectionChanges =
    isAdding ||
    Boolean(apiKey.trim()) ||
    displayLabel !==
      (activeConnection?.displayLabel ?? activeMetadata?.label ?? "") ||
    baseUrl !== (activeConnection?.baseUrl ?? "") ||
    insecureTransportAcknowledged !==
      (activeConnection?.insecureTransportAcknowledged ?? false);

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

  function submit() {
    onSave(draft, false);
    setApiKey("");
  }

  async function testConnection() {
    if (connectionTestStatus === "testing") {
      return;
    }

    clearConnectionTestTimers();
    const runId = connectionTestRunIdRef.current + 1;
    connectionTestRunIdRef.current = runId;
    const startedAt = Date.now();
    setConnectionTestStatus("testing");
    setConnectionTestRemainingMs(CONNECTION_TEST_TIMEOUT_MS);

    connectionTestIntervalRef.current = globalThis.setInterval(() => {
      const remainingMs = Math.max(
        0,
        CONNECTION_TEST_TIMEOUT_MS - (Date.now() - startedAt),
      );
      setConnectionTestRemainingMs(remainingMs);
    }, CONNECTION_TEST_TICK_MS);

    const timeout = new Promise<ConnectionTestStatus>((resolve) => {
      connectionTestTimeoutRef.current = globalThis.setTimeout(
        () => resolve("timeout"),
        CONNECTION_TEST_TIMEOUT_MS,
      );
    });
    const result = onTest()
      .then<ConnectionTestStatus>((ok) => (ok ? "success" : "failure"))
      .catch((): ConnectionTestStatus => "failure");
    const outcome = await Promise.race([result, timeout]);

    clearConnectionTestTimers();
    if (connectionTestRunIdRef.current !== runId) {
      return;
    }
    setConnectionTestRemainingMs(0);
    setConnectionTestStatus(outcome);
  }

  const connectionTestProgress =
    connectionTestStatus === "testing"
      ? Math.round(
          ((CONNECTION_TEST_TIMEOUT_MS - connectionTestRemainingMs) /
            CONNECTION_TEST_TIMEOUT_MS) *
            100,
        )
      : 100;
  const connectionTestStatusText =
    connectionTestStatus === "testing"
      ? `${connectionTestCopy.testing} · ${new Intl.NumberFormat(locale, {
          style: "unit",
          unit: "second",
          unitDisplay: "short",
          maximumFractionDigits: 0,
        }).format(Math.max(1, Math.ceil(connectionTestRemainingMs / 1_000)))}`
      : connectionTestStatus === "success"
        ? connectionTestCopy.success
        : connectionTestStatus === "failure"
          ? connectionTestCopy.failure
          : connectionTestCopy.timeout;

  return (
    <section
      className="sub2api-deployment-settings"
      data-sub2api-deployment-settings=""
      data-credential-provider-id={SUB2API_PROVIDER_ID}
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

      <details className="sub2api-deployment-settings__trust">
        <summary>{copy.trustTitle}</summary>
        <p>{copy.trustDetail}</p>
      </details>

      <div className="sub2api-deployment-settings__connection-bar">
        {!isAdding && collection?.accounts.length ? (
          <div className="sub2api-deployment-settings__selector">
            <MaterialSelect
              fieldIdPrefix="sub2api-active-deployment"
              label={copy.deployment}
              value={activeAccountId}
              options={collection.accounts.map((account) => ({
                value: account.id,
                label: account.label,
              }))}
              disabled={connectionTestStatus === "testing"}
              onChange={(accountId) => onSelectAccount(accountId)}
            />
          </div>
        ) : null}
        <div
          className="sub2api-deployment-settings__connection-mode"
          aria-label={`${copy.connectionMode}: ${copy.connectionModeValue}`}
        >
          <span>{copy.connectionMode}</span>
          <strong>
            <TechnicalText>{copy.connectionModeValue}</TechnicalText>
          </strong>
        </div>
      </div>

      <div className="sub2api-deployment-settings__form">
        <label className="form-field">
          <span className="form-field__label">{copy.displayLabel}</span>
          <input
            className="form-field__control"
            autoComplete="off"
            dir="auto"
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
            dir="ltr"
            inputMode="url"
            placeholder="https://gateway.example.com"
            value={baseUrl}
            onChange={(event) => {
              setBaseUrl(event.currentTarget.value);
              setInsecureTransportAcknowledged(false);
            }}
          />
        </label>
        <div className="sub2api-deployment-settings__api-key">
          <label className="form-field">
            <span className="form-field__label">{copy.apiKey}</span>
            <input
              className="form-field__control"
              autoCapitalize="none"
              autoComplete="new-password"
              dir="ltr"
              data-stored-credential-placeholder={
                !isAdding && activeConnection ? "" : undefined
              }
              placeholder={
                !isAdding && activeConnection
                  ? "••••••••••••"
                  : copy.apiKeyPlaceholder
              }
              type="password"
              value={apiKey}
              onChange={(event) => setApiKey(event.currentTarget.value)}
            />
          </label>
          <button
            className="text-button sub2api-deployment-settings__test"
            data-sub2api-action="test"
            type="button"
            disabled={
              !activeConnection ||
              hasUnsavedConnectionChanges ||
              connectionTestStatus === "testing"
            }
            onClick={() => void testConnection()}
          >
            {testConnectionLabel}
          </button>
          {!isAdding && activeConnection ? (
            <span className="supporting-copy form-field__supporting-text">
              {copy.apiKeyPreserved}
            </span>
          ) : null}
          {connectionTestStatus !== "idle" ? (
            <div
              className={`sub2api-deployment-settings__test-feedback sub2api-deployment-settings__test-feedback--${connectionTestStatus}`}
              data-sub2api-test-status={connectionTestStatus}
              aria-live="polite"
            >
              <div className="sub2api-deployment-settings__test-feedback-copy">
                {connectionTestStatusText}
              </div>
              <div
                className="sub2api-deployment-settings__test-progress"
                role="progressbar"
                aria-label={connectionTestStatusText}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={connectionTestProgress}
              >
                <span style={{ inlineSize: `${connectionTestProgress}%` }} />
              </div>
            </div>
          ) : null}
        </div>
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

      <div className="sub2api-deployment-settings__footer">
        <div className="sub2api-deployment-settings__actions">
          <button
            className="icon-button icon-button--primary"
            data-sub2api-action="save"
            type="button"
            disabled={connectionTestStatus === "testing"}
            onClick={submit}
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
      </div>

      <details className="sub2api-deployment-settings__protocol">
        <summary>{copy.protocolTitle}</summary>
        <p>{copy.protocolDetail}</p>
        <p>{copy.protocolExcluded}</p>
      </details>
    </section>
  );
}
