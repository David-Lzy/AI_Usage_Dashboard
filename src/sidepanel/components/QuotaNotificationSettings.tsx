import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";

import type { AppState } from "../../providers/types";
import type { RuntimeI18n } from "../../shared/i18n";
import {
  readQuotaNotificationSettings,
  requestQuotaNotificationPermission,
  sendQuotaNotificationTest,
  subscribeToQuotaNotificationSettings,
  updateQuotaNotificationSettings,
} from "../../shared/quota-notification-client";
import { buildQuotaNotificationLocalizedCopy } from "../../shared/quota-notification-localized-copy";
import {
  listQuotaNotificationAccounts,
  type QuotaNotificationChange,
  type QuotaNotificationPreferences,
} from "../../shared/quota-notifications";
import "./QuotaNotificationSettings.css";

type QuotaNotificationSettingsView = {
  preferences: QuotaNotificationPreferences;
  permission: "granted" | "denied" | "unsupported";
};

type QuotaNotificationSettingsProps = {
  state: Pick<AppState, "providers" | "providerSettings" | "providerAccounts">;
  i18n: RuntimeI18n;
  warningThresholdPercent: number;
  embedded?: boolean;
};

export function QuotaNotificationSettings({
  state,
  i18n,
  warningThresholdPercent,
  embedded = false,
}: QuotaNotificationSettingsProps) {
  const copy = buildQuotaNotificationLocalizedCopy(i18n.resolvedLocale);
  const [view, setView] = useState<QuotaNotificationSettingsView | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [thresholdDraft, setThresholdDraft] = useState(
    String(warningThresholdPercent),
  );
  const permissionRequestPendingRef = useRef(false);
  const accounts = useMemo(
    () => listQuotaNotificationAccounts(state).filter((account) => account.windows.length > 0),
    [state],
  );

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const nextView = await readQuotaNotificationSettings();
        if (!active) {
          return;
        }
        setView(nextView);
        setThresholdDraft(String(nextView.preferences.thresholdPercent));
        setStatus(null);
      } catch {
        if (active) {
          setStatus(copy.unavailable);
        }
      }
    };

    void load();
    const unsubscribe = subscribeToQuotaNotificationSettings(() => {
      void load();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [copy.unavailable]);

  const preferences = view?.preferences;
  const controlsDisabled = busy || !preferences || view.permission !== "granted";

  async function save(change: QuotaNotificationChange) {
    setBusy(true);
    setStatus(null);
    try {
      const nextView = await updateQuotaNotificationSettings(change);
      setView(nextView);
      setThresholdDraft(String(nextView.preferences.thresholdPercent));
    } catch {
      setStatus(copy.saveFailed);
    } finally {
      setBusy(false);
    }
  }

  async function handleEnabledChange(event: ChangeEvent<HTMLInputElement>) {
    const enabled = event.currentTarget.checked;

    if (enabled) {
      if (permissionRequestPendingRef.current) {
        return;
      }
      permissionRequestPendingRef.current = true;
      const permissionRequest = requestQuotaNotificationPermission();
      setBusy(true);
      const granted = await permissionRequest;
      permissionRequestPendingRef.current = false;

      if (!granted) {
        setView((current) =>
          current ? { ...current, permission: "denied" } : current,
        );
        setStatus(copy.permissionNotGranted);
        setBusy(false);
        return;
      }
    }

    await save({ type: "enabled", value: enabled });
  }

  function commitThreshold() {
    if (thresholdDraft.trim() === "") {
      setThresholdDraft(String(preferences?.thresholdPercent ?? warningThresholdPercent));
      return;
    }
    const value = Number(thresholdDraft);
    const threshold = Math.min(100, Math.max(1, Math.round(value)));

    if (!Number.isFinite(value)) {
      setThresholdDraft(String(preferences?.thresholdPercent ?? warningThresholdPercent));
      return;
    }

    setThresholdDraft(String(threshold));
    if (threshold !== preferences?.thresholdPercent) {
      void save({ type: "threshold", value: threshold });
    }
  }

  function handleThresholdKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.currentTarget.blur();
    }
  }

  async function handleTest() {
    setBusy(true);
    setStatus(null);
    try {
      setStatus((await sendQuotaNotificationTest()) ? copy.testSent : copy.testFailed);
    } catch {
      setStatus(copy.testFailed);
    } finally {
      setBusy(false);
    }
  }

  const statusMessage = status ?? getStatusMessage(view, copy);

  return (
    <section
      className={`dashboard-section quota-notification-settings${embedded ? " quota-notification-settings--embedded" : ""}`}
      data-quota-notifications=""
      aria-busy={busy || !view}
    >
      <div className="dashboard-section__header">
        <div>
          {embedded ? null : <p className="section-label">{copy.eyebrow}</p>}
          <h2 className="section-title">{copy.title}</h2>
        </div>
      </div>

      {!view || !preferences ? (
        <p className="supporting-copy" role="status">
          {statusMessage ?? copy.loading}
        </p>
      ) : (
        <div className="quota-notification-settings__body">
          <div className="quota-notification-settings__general">
            <label className="switch-row quota-notification-settings__switch">
              <span className="switch-row__title">{copy.enabled}</span>
              <input
                className="switch-row__control quota-notification-settings__toggle"
                type="checkbox"
                checked={preferences.enabled}
                disabled={
                  busy ||
                  (view.permission === "unsupported" && !preferences.enabled)
                }
                data-notification-action="enable"
                onChange={(event) => void handleEnabledChange(event)}
              />
            </label>

            <fieldset
              className="quota-notification-settings__controls"
              disabled={controlsDisabled || !preferences.enabled}
            >
              <label className="switch-row quota-notification-settings__pause">
                <span className="switch-row__title">{copy.paused}</span>
                <input
                  className="switch-row__control quota-notification-settings__toggle"
                  type="checkbox"
                  checked={preferences.paused}
                  data-notification-action="pause"
                  onChange={(event) =>
                    void save({ type: "paused", value: event.currentTarget.checked })
                  }
                />
              </label>

              <label className="form-field quota-notification-settings__threshold">
                <span className="form-field__label">{copy.threshold}</span>
                <span className="quota-notification-settings__number-control">
                  <input
                    className="form-field__control"
                    type="number"
                    min="1"
                    max="100"
                    step="1"
                    inputMode="numeric"
                    value={thresholdDraft}
                    data-notification-action="threshold"
                    onBlur={commitThreshold}
                    onChange={(event) => setThresholdDraft(event.currentTarget.value)}
                    onKeyDown={handleThresholdKeyDown}
                  />
                  <span className="quota-notification-settings__unit">{copy.percent}</span>
                </span>
              </label>

              <button
                className="text-button text-button--outlined quota-notification-settings__test"
                type="button"
                disabled={preferences.paused}
                data-notification-action="test"
                onClick={() => void handleTest()}
              >
                {copy.test}
              </button>
            </fieldset>

            {statusMessage ? (
              <p className="supporting-copy quota-notification-settings__status" role="status">
                {statusMessage}
              </p>
            ) : null}
          </div>

          <fieldset
            className="quota-notification-settings__scopes"
            disabled={controlsDisabled || !preferences.enabled}
          >
            <legend className="quota-notification-settings__scope-label">
              {copy.accounts}
            </legend>
            <div className="quota-notification-settings__account-list">
              {accounts.length === 0 ? (
                <p className="supporting-copy" role="status">
                  {copy.noSupportedWindows}
                </p>
              ) : (
                accounts.map((account) => {
                  const accountEnabled = !preferences.disabledAccountKeys.includes(
                    account.key,
                  );

                  return (
                    <div
                      className="quota-notification-settings__account"
                      key={account.key}
                      data-notification-account={account.key}
                    >
                      <label className="quota-notification-settings__check-row">
                        <input
                          className="quota-notification-settings__checkbox"
                          type="checkbox"
                          checked={accountEnabled}
                          data-notification-account={account.key}
                          onChange={(event) =>
                            void save({
                              type: "account",
                              key: account.key,
                              enabled: event.currentTarget.checked,
                            })
                          }
                        />
                        <span>{account.label}</span>
                      </label>
                      <div className="quota-notification-settings__windows">
                        <p className="quota-notification-settings__scope-label">
                          {copy.windows}
                        </p>
                        {account.windows.map((window) => (
                          <label
                            className="quota-notification-settings__check-row quota-notification-settings__window"
                            key={window.key}
                            data-notification-window={window.key}
                          >
                            <input
                              className="quota-notification-settings__checkbox"
                              type="checkbox"
                              checked={!preferences.disabledWindowKeys.includes(window.key)}
                              disabled={!accountEnabled}
                              data-notification-window={window.key}
                              onChange={(event) =>
                                void save({
                                  type: "window",
                                  key: window.key,
                                  enabled: event.currentTarget.checked,
                                })
                              }
                            />
                            <span>
                              {window.kind === "unknown"
                                ? copy.windows
                                : copy.windowKindLabels[window.kind]}
                              {window.modelLabel ? ` · ${window.modelLabel}` : ""}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </fieldset>
        </div>
      )}
    </section>
  );
}

function getStatusMessage(
  view: QuotaNotificationSettingsView | null,
  copy: ReturnType<typeof buildQuotaNotificationLocalizedCopy>,
): string | null {
  if (!view) {
    return null;
  }
  if (view.permission === "unsupported") {
    return copy.permissionUnsupported;
  }
  if (view.permission === "denied") {
    return copy.permissionNotGranted;
  }
  if (view.preferences.paused) {
    return copy.pausedStatus;
  }
  return view.preferences.enabled ? copy.readyStatus : null;
}
