import { useEffect, useMemo, useState } from "react";

import type { AppState } from "../../providers/types";
import { sendAppMessage } from "../../shared/app-client";
import {
  LOCAL_COMPANION_BRIDGE_DEFAULT_PORT,
  normalizeLocalCompanionBridgeBaseUrl,
  normalizeLocalCompanionPairingCode,
} from "../../shared/local-companion-bridge";
import type {
  LocalCompanionAction,
  LocalCompanionSettingsFailure,
  LocalCompanionSettingsView,
} from "../../shared/local-companion-settings";
import { isLocalCompanionCaptureStale } from "../../shared/local-companion-settings";
import { buildLocalCompanionLocalizedCopy } from "../../shared/local-companion-localized-copy";
import { requestCustomSourceHostAccess } from "../../shared/custom-source-host-access";
import type {
  CustomSourceId,
  CustomSourceSetting,
  CustomSourceSyncState,
} from "../../shared/custom-sources";
import type { ResolvedAppLocale } from "../../shared/i18n";
import { MaterialActionIcon } from "../../shared/components/MaterialActionIcon";
import { MaterialSelect } from "./MaterialSelect";

import "./LocalCompanionBridgeSettings.css";

const DEFAULT_BASE_URL = `http://127.0.0.1:${LOCAL_COMPANION_BRIDGE_DEFAULT_PORT}`;

const INITIAL_VIEW: LocalCompanionSettingsView = {
  baseUrl: null,
  status: "disconnected",
  checkedAt: null,
  failure: null,
  sources: [],
};

type Props = {
  customSources: readonly CustomSourceSetting[];
  customSourceStates: readonly CustomSourceSyncState[];
  locale: ResolvedAppLocale;
};

type ResultNotice = {
  tone: "success" | "error";
  message: string;
};

function formatCaptured(
  value: string | null,
  locale: ResolvedAppLocale,
): string | null {
  if (!value || Number.isNaN(new Date(value).valueOf())) {
    return null;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getFailureMessage(
  failure: string | null | undefined,
  copy: ReturnType<typeof buildLocalCompanionLocalizedCopy>,
): string {
  if (failure && Object.prototype.hasOwnProperty.call(copy.failures, failure)) {
    return copy.failures[failure as LocalCompanionSettingsFailure];
  }

  return copy.failures.unavailable;
}

export function LocalCompanionBridgeSettings({
  customSources,
  customSourceStates,
  locale,
}: Props) {
  const copy = buildLocalCompanionLocalizedCopy(locale);
  const [view, setView] = useState<LocalCompanionSettingsView>(INITIAL_VIEW);
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [pairingCode, setPairingCode] = useState("");
  const [selectedSourceId, setSelectedSourceId] = useState<CustomSourceId | "">(
    "",
  );
  const [busyAction, setBusyAction] = useState<
    LocalCompanionAction["action"] | null
  >(null);
  const [notice, setNotice] = useState<ResultNotice | null>(null);
  const [returnedState, setReturnedState] = useState<Pick<
    AppState,
    "customSources" | "customSourceStates"
  > | null>(null);

  const effectiveSources = returnedState?.customSources ?? customSources;
  const effectiveStates =
    returnedState?.customSourceStates ?? customSourceStates;
  const selectedSource = view.sources.find(
    (source) => source.sourceId === selectedSourceId,
  );
  const selectedManagedState = useMemo(() => {
    if (!selectedSource?.managedId) {
      return null;
    }
    return (
      effectiveStates.find(
        (state) => state.sourceId === selectedSource.managedId,
      ) ?? null
    );
  }, [effectiveStates, selectedSource?.managedId]);
  const selectedManagedSource = useMemo(() => {
    if (!selectedSource?.managedId) {
      return null;
    }
    return (
      effectiveSources.find(
        (source) => source.id === selectedSource.managedId,
      ) ?? null
    );
  }, [effectiveSources, selectedSource?.managedId]);
  const capturedAt =
    selectedManagedState?.lastSuccessAt ??
    selectedManagedState?.snapshot?.syncedAt ??
    null;
  const isSelectedManagedStateStale = Boolean(
    selectedManagedState &&
    (selectedManagedState.stale ||
      isLocalCompanionCaptureStale(selectedManagedState.lastSuccessAt)),
  );

  useEffect(() => {
    let disposed = false;

    void invoke({ action: "status" }, false).then((nextView) => {
      if (disposed || !nextView) {
        return;
      }
      setView(nextView);
      if (nextView.baseUrl) {
        setBaseUrl(nextView.baseUrl);
      }
    });

    return () => {
      disposed = true;
    };
  }, []);

  useEffect(() => {
    if (
      selectedSourceId &&
      view.sources.some((source) => source.sourceId === selectedSourceId)
    ) {
      return;
    }
    setSelectedSourceId(view.sources[0]?.sourceId ?? "");
  }, [selectedSourceId, view.sources]);

  useEffect(() => {
    setReturnedState(null);
  }, [customSources, customSourceStates]);

  async function invoke(
    action: LocalCompanionAction,
    showFeedback = true,
  ): Promise<LocalCompanionSettingsView | null> {
    setBusyAction(action.action);
    try {
      const response = await sendAppMessage({
        type: "app:local-companion",
        ...action,
      });
      if (!response.ok) {
        if (showFeedback) {
          setNotice({
            tone: "error",
            message: getFailureMessage(response.error, copy),
          });
        }
        return null;
      }

      const nextView = response.localCompanion ?? INITIAL_VIEW;
      setView(nextView);
      setReturnedState({
        customSources: response.state.customSources,
        customSourceStates: response.state.customSourceStates,
      });
      if (nextView.baseUrl) {
        setBaseUrl(nextView.baseUrl);
      }
      if (showFeedback) {
        setNotice(
          nextView.failure
            ? {
                tone: "error",
                message: getFailureMessage(nextView.failure, copy),
              }
            : { tone: "success", message: copy.statuses[nextView.status] },
        );
      }
      return nextView;
    } catch {
      if (showFeedback) {
        setNotice({ tone: "error", message: copy.failures.unavailable });
      }
      return null;
    } finally {
      setBusyAction(null);
    }
  }

  async function handlePair() {
    const normalizedUrl = normalizeLocalCompanionBridgeBaseUrl(baseUrl);
    const normalizedCode = normalizeLocalCompanionPairingCode(pairingCode);
    if (!normalizedUrl.ok) {
      setNotice({ tone: "error", message: copy.failures.invalid_base_url });
      setPairingCode("");
      return;
    }
    if (!normalizedCode) {
      setNotice({ tone: "error", message: copy.failures.invalid_pairing_code });
      setPairingCode("");
      return;
    }

    setBusyAction("pair");
    try {
      const hasAccess = await requestCustomSourceHostAccess(
        normalizedUrl.value,
      ).catch(() => false);
      if (!hasAccess) {
        setNotice({
          tone: "error",
          message: copy.failures.permission_required,
        });
        return;
      }
      await invoke(
        {
          action: "pair",
          baseUrl: normalizedUrl.value,
          pairingCode: normalizedCode,
        },
        true,
      );
    } finally {
      setPairingCode("");
      setBusyAction(null);
    }
  }

  const isBusy = busyAction !== null;
  const canManageSource = Boolean(selectedSource);
  const canRemoveSource = Boolean(
    selectedSource?.managedId && selectedManagedSource,
  );

  return (
    <section
      className="settings-section-anchor local-companion-bridge-settings"
      data-local-companion-bridge-settings=""
      data-local-companion-settings=""
    >
      <header className="dashboard-section__header local-companion-bridge-settings__header">
        <div>
          <p className="section-label">{copy.eyebrow}</p>
          <h2 className="section-title">{copy.title}</h2>
        </div>
        <span className="status-chip" data-companion-status={view.status}>
          {copy.statuses[view.status]}
        </span>
      </header>

      <p className="body-copy">{copy.detail}</p>

      <div className="local-companion-bridge-settings__form">
        <label className="form-field">
          <span className="form-field__label">{copy.baseUrl}</span>
          <input
            className="form-field__control"
            data-local-companion-base-url=""
            data-companion-input="base-url"
            data-i18n-scrollable-value="true"
            inputMode="url"
            spellCheck={false}
            value={baseUrl}
            onChange={(event) => setBaseUrl(event.currentTarget.value)}
          />
        </label>
        <label className="form-field">
          <span className="form-field__label">{copy.pairingCode}</span>
          <input
            className="form-field__control"
            data-local-companion-pairing-code=""
            data-companion-input="pairing-code"
            autoComplete="one-time-code"
            inputMode="text"
            maxLength={9}
            pattern="[A-Za-z0-9]{4}-[A-Za-z0-9]{4}"
            value={pairingCode}
            onChange={(event) =>
              setPairingCode(event.currentTarget.value.toUpperCase())
            }
          />
        </label>
      </div>

      <div className="local-companion-bridge-settings__actions">
        <button
          className="text-button text-button--primary"
          data-local-companion-action="pair"
          data-companion-action="pair"
          type="button"
          disabled={isBusy}
          onClick={() => void handlePair()}
        >
          {copy.pair}
        </button>
        <button
          className="text-button"
          data-local-companion-action="refresh-index"
          data-companion-action="refresh-index"
          type="button"
          disabled={isBusy || view.status !== "connected"}
          onClick={() => void invoke({ action: "refresh-index" })}
        >
          {copy.refreshIndex}
        </button>
        <button
          className="text-button"
          data-local-companion-action="disconnect"
          data-companion-action="disconnect"
          type="button"
          disabled={isBusy || view.status === "disconnected"}
          onClick={() => void invoke({ action: "disconnect" })}
        >
          {copy.disconnect}
        </button>
      </div>

      <div className="local-companion-bridge-settings__source-row">
        <div data-companion-source="">
          <MaterialSelect<CustomSourceId | "">
            label={copy.source}
            value={selectedSourceId}
            fieldIdPrefix="local-companion-source"
            disabled={isBusy || view.sources.length === 0}
            options={
              view.sources.length > 0
                ? view.sources.map((source) => ({
                    value: source.sourceId,
                    label: source.label,
                  }))
                : [{ value: "", label: copy.noSources }]
            }
            onChange={setSelectedSourceId}
          />
        </div>
        <div className="local-companion-bridge-settings__source-actions">
          <button
            className="icon-button"
            data-local-companion-action="refresh-source"
            data-companion-action="refresh-source"
            type="button"
            title={copy.refreshSource}
            aria-label={copy.refreshSource}
            disabled={isBusy || !canManageSource}
            onClick={() => {
              if (selectedSource) {
                void invoke({
                  action: "refresh-source",
                  sourceId: selectedSource.sourceId,
                });
              }
            }}
          >
            <MaterialActionIcon name="refresh" />
          </button>
          <button
            className="icon-button"
            data-local-companion-action="remove-source"
            data-companion-action="remove-source"
            type="button"
            title={copy.removeSource}
            aria-label={copy.removeSource}
            disabled={isBusy || !canRemoveSource}
            onClick={() => {
              if (selectedSource?.managedId) {
                void invoke({
                  action: "remove-source",
                  sourceId: selectedSource.sourceId,
                });
              }
            }}
          >
            <MaterialActionIcon name="delete-outline" />
          </button>
        </div>
      </div>

      {view.sources.length === 0 ? (
        <p className="body-copy">{copy.noSources}</p>
      ) : null}

      <dl className="local-companion-bridge-settings__metadata">
        <div>
          <dt>{copy.managedState}</dt>
          <dd>
            {selectedManagedState
              ? copy.managedStatuses[selectedManagedState.status]
              : copy.unavailable}
          </dd>
        </div>
        <div>
          <dt>{copy.captured}</dt>
          <dd>{formatCaptured(capturedAt, locale) ?? copy.unavailable}</dd>
        </div>
        {isSelectedManagedStateStale ? (
          <div className="local-companion-bridge-settings__stale">
            <dt>{copy.managedState}</dt>
            <dd>{copy.stale}</dd>
          </div>
        ) : null}
      </dl>

      {view.failure && !notice ? (
        <p className="local-companion-bridge-settings__notice" role="alert">
          {getFailureMessage(view.failure, copy)}
        </p>
      ) : null}
      {notice ? (
        <p
          className="local-companion-bridge-settings__notice"
          data-local-companion-notice={notice.tone}
          role={notice.tone === "error" ? "alert" : "status"}
        >
          {notice.message}
        </p>
      ) : null}
      {isBusy ? (
        <p className="sr-only" role="status">
          {copy.working}
        </p>
      ) : null}
    </section>
  );
}
