import { useEffect, useState } from "react";

import { sendAppMessage } from "../../shared/app-client";
import {
  LOCAL_COMPANION_BRIDGE_DEFAULT_PORT,
  normalizeLocalCompanionBridgeBaseUrl,
  normalizeLocalCompanionPairingCode,
} from "../../shared/local-companion-bridge";
import type { CodexLocalSourceMode } from "../../shared/codex-local-bridge";
import { getCodexLocalConnectionCopy } from "../../shared/codex-local-localized-copy";
import { requestCustomSourceHostAccess } from "../../shared/custom-source-host-access";
import type { ResolvedAppLocale } from "../../shared/i18n";
import type { LocalCompanionAction, LocalCompanionSettingsView } from "../../shared/local-companion-settings";
import { MaterialSelect } from "./MaterialSelect";

import "./CodexLocalConnectionSettings.css";

type Props = { locale: ResolvedAppLocale };

export function CodexLocalConnectionSettings({ locale }: Props) {
  const copy = getCodexLocalConnectionCopy(locale);
  const [view, setView] = useState<LocalCompanionSettingsView | null>(null);
  const [baseUrl, setBaseUrl] = useState(`http://127.0.0.1:${LOCAL_COMPANION_BRIDGE_DEFAULT_PORT}`);
  const [pairingCode, setPairingCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    void sendAppMessage({ type: "app:local-companion", action: "codex-status" }).then((result) => {
      if (active && result.ok && result.localCompanion) {
        setView(result.localCompanion);
        if (result.localCompanion.baseUrl) setBaseUrl(result.localCompanion.baseUrl);
      }
    }).catch(() => {
      if (active) setNotice(copy.unavailable);
    });
    return () => { active = false; };
  }, [copy.unavailable]);

  async function invoke(action: LocalCompanionAction) {
    setBusy(true);
    setNotice("");
    try {
      const result = await sendAppMessage({ type: "app:local-companion", ...action });
      if (!result.ok) {
        setNotice(copy.failed);
        return;
      }
      if (!result.localCompanion || result.localCompanion.failure) {
        setNotice(result.localCompanion?.failure === "permission_required" ? copy.permissionRequired : copy.failed);
        return;
      }
      setView(result.localCompanion);
      setNotice(result.localCompanion.status === "connected" ? copy.connected : copy.disconnected);
    } catch {
      setNotice(copy.unavailable);
    } finally {
      setBusy(false);
    }
  }

  async function pair() {
    const url = normalizeLocalCompanionBridgeBaseUrl(baseUrl);
    const code = normalizeLocalCompanionPairingCode(pairingCode);
    if (!url.ok || !code) {
      setNotice(copy.failed);
      setPairingCode("");
      return;
    }
    setBusy(true);
    try {
      if (!await requestCustomSourceHostAccess(url.value).catch(() => false)) {
        setNotice(copy.permissionRequired);
        return;
      }
      await invoke({ action: "pair-codex", baseUrl: url.value, pairingCode: code });
    } finally {
      setPairingCode("");
      setBusy(false);
    }
  }

  const connected = Boolean(view?.status === "connected" && view.codexAvailable);
  const mode = view?.codexMode ?? "browser";
  return (
    <div className="codex-local-settings" data-codex-local-settings="">
      <div className="codex-local-settings__heading">
        <div>
          <h3 className="settings-subsection-title">{copy.title}</h3>
          <p className="body-copy">{copy.detail}</p>
        </div>
        <span className="status-chip" data-codex-local-status={view?.status ?? "disconnected"}>
          {connected ? copy.connected : view?.status === "expired" ? copy.expired : view?.status === "unavailable" ? copy.unavailable : copy.disconnected}
        </span>
      </div>
      <div className="codex-local-settings__mode">
        <MaterialSelect<CodexLocalSourceMode>
          label={copy.mode}
          value={mode}
          fieldIdPrefix="codex-local-mode"
          disabled={busy}
          options={[
            { value: "browser", label: copy.browser },
            ...(connected || mode === "local" ? [{ value: "local" as const, label: copy.local }] : []),
            ...(connected || mode === "hybrid" ? [{ value: "hybrid" as const, label: copy.hybrid }] : []),
          ]}
          onChange={(next) => void invoke({ action: "set-codex-mode", mode: next })}
        />
        <p className="body-copy">{mode === "local" ? copy.localNote : mode === "hybrid" ? copy.hybridNote : ""}</p>
      </div>
      <div className="codex-local-settings__pairing">
        <label className="form-field">
          <span className="form-field__label">{copy.baseUrl}</span>
          <input className="form-field__control" value={baseUrl} inputMode="url" spellCheck={false} disabled={busy || connected} onChange={(event) => setBaseUrl(event.currentTarget.value)} />
        </label>
        {!connected ? <label className="form-field">
          <span className="form-field__label">{copy.pairingCode}</span>
          <input className="form-field__control" value={pairingCode} autoComplete="one-time-code" maxLength={9} disabled={busy} onChange={(event) => setPairingCode(event.currentTarget.value.toUpperCase())} />
        </label> : null}
      </div>
      <div className="codex-local-settings__actions">
        {!connected ? <button className="text-button text-button--primary" type="button" disabled={busy} onClick={() => void pair()}>{copy.pair}</button> : null}
        {view?.status !== "disconnected" && view ? <button className="text-button" type="button" disabled={busy} onClick={() => void invoke({ action: "disconnect-codex" })}>{copy.disconnect}</button> : null}
      </div>
      {notice ? <p className="codex-local-settings__notice" role="status">{notice}</p> : null}
    </div>
  );
}
