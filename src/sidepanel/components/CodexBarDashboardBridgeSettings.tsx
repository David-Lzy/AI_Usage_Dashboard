import { useEffect, useMemo, useState } from "react";

import { sendAppMessage } from "../../shared/app-client";
import {
  CODEXBAR_DASHBOARD_PATH,
  normalizeCodexBarDashboardEndpoint,
} from "../../shared/codexbar-dashboard-bridge";
import { readCodexBarDashboardConnection } from "../../shared/codexbar-dashboard-connection";
import { requestCustomSourceHostAccess } from "../../shared/custom-source-host-access";
import {
  isManagedCustomSource,
  type CustomSourceSetting,
  type CustomSourceSyncState,
} from "../../shared/custom-sources";
import { MaterialInfoTooltip } from "./MaterialInfoTooltip";

const DEFAULT_ENDPOINT = `http://127.0.0.1:8080${CODEXBAR_DASHBOARD_PATH}`;

type Props = {
  customSources: readonly CustomSourceSetting[];
  customSourceStates: readonly CustomSourceSyncState[];
  locale: string;
};

type Copy = {
  eyebrow: string;
  title: string;
  detail: string;
  experimental: string;
  endpoint: string;
  token: string;
  tokenHint: string;
  connect: string;
  connecting: string;
  clearToken: string;
  disconnect: string;
  connected: string;
  notConnected: string;
  sources: string;
  noSources: string;
  permissionDenied: string;
};

const EN_COPY: Copy = {
  eyebrow: "Experimental local integration",
  title: "CodexBar dashboard bridge",
  detail:
    "Connect only to an authenticated CodexBar dashboard snapshot on 127.0.0.1. Identity fields and raw errors are discarded.",
  experimental: "Experimental",
  endpoint: "Dashboard endpoint",
  token: "Dashboard bearer token",
  tokenHint:
    "Start codexbar serve with a strong CODEXBAR_DASHBOARD_TOKEN. The token stays in extension-local storage and is never shown again.",
  connect: "Connect / test",
  connecting: "Connecting...",
  clearToken: "Clear token",
  disconnect: "Disconnect",
  connected: "Connected locally",
  notConnected: "Not connected",
  sources: "Sanitized source rows",
  noSources: "No sanitized source rows are currently stored.",
  permissionDenied: "Loopback host access was not granted.",
};

const ZH_COPY: Copy = {
  eyebrow: "实验性本地集成",
  title: "CodexBar 仪表板桥接",
  detail:
    "仅连接 127.0.0.1 上经过认证的 CodexBar dashboard snapshot；账号 identity 和原始错误会被丢弃。",
  experimental: "实验性",
  endpoint: "Dashboard 端点",
  token: "Dashboard bearer token",
  tokenHint:
    "请使用高强度 CODEXBAR_DASHBOARD_TOKEN 启动 codexbar serve。Token 仅保存在扩展本地，保存后不会再次显示。",
  connect: "连接并测试",
  connecting: "连接中...",
  clearToken: "清除 Token",
  disconnect: "断开连接",
  connected: "已连接本机服务",
  notConnected: "尚未连接",
  sources: "脱敏来源列表",
  noSources: "当前没有已保存的脱敏来源。",
  permissionDenied: "未授予本机 loopback 访问权限。",
};

function getCopy(locale: string): Copy {
  return locale === "zh-CN" ? ZH_COPY : EN_COPY;
}

function getStatusChipClass(status: string): string {
  return status === "error"
    ? "status-chip status-chip--error"
    : status === "warning" || status === "pending"
      ? "status-chip status-chip--warning"
      : "status-chip";
}

export function CodexBarDashboardBridgeSettings({
  customSources,
  customSourceStates,
  locale,
}: Props) {
  const copy = getCopy(locale);
  const [endpointUrl, setEndpointUrl] = useState(DEFAULT_ENDPOINT);
  const [token, setToken] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [result, setResult] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const managedSources = useMemo(
    () => customSources.filter(isManagedCustomSource),
    [customSources],
  );
  const managedStateById = useMemo(
    () => new Map(customSourceStates.map((state) => [state.sourceId, state])),
    [customSourceStates],
  );

  useEffect(() => {
    let disposed = false;
    void readCodexBarDashboardConnection().then((connection) => {
      if (disposed) {
        return;
      }
      setIsConnected(Boolean(connection));
      if (connection) {
        setEndpointUrl(connection.endpointUrl);
      }
    });
    return () => {
      disposed = true;
    };
  }, [managedSources.length]);

  async function handleConnect() {
    const endpoint = normalizeCodexBarDashboardEndpoint(endpointUrl);
    if (!endpoint.ok) {
      setResult({ tone: "error", message: endpoint.message });
      return;
    }
    setIsBusy(true);
    try {
      const hasAccess = await requestCustomSourceHostAccess(endpoint.value).catch(
        () => false,
      );
      if (!hasAccess) {
        setResult({ tone: "error", message: copy.permissionDenied });
        return;
      }
      const response = await sendAppMessage({
        type: "app:connect-codexbar-dashboard",
        endpointUrl: endpoint.value,
        token: token.trim() || null,
      });
      if (!response.ok) {
        setResult({ tone: "error", message: response.error });
        return;
      }
      setResult({
        tone: response.notice?.tone ?? "success",
        message: response.notice?.message ?? copy.connected,
      });
      if (response.notice?.tone !== "error") {
        setIsConnected(true);
        setToken("");
      }
    } finally {
      setIsBusy(false);
    }
  }

  async function handleClearToken() {
    const response = await sendAppMessage({
      type: "app:clear-codexbar-dashboard-token",
    });
    setResult(
      response.ok
        ? {
            tone: response.notice?.tone ?? "success",
            message: response.notice?.message ?? copy.clearToken,
          }
        : { tone: "error", message: response.error },
    );
  }

  async function handleDisconnect() {
    const response = await sendAppMessage({
      type: "app:disconnect-codexbar-dashboard",
    });
    setResult(
      response.ok
        ? {
            tone: response.notice?.tone ?? "success",
            message: response.notice?.message ?? copy.disconnect,
          }
        : { tone: "error", message: response.error },
    );
    if (response.ok) {
      setIsConnected(false);
      setToken("");
    }
  }

  return (
    <section
      className="status-card settings-section-anchor codexbar-bridge-settings"
      data-codexbar-bridge-settings=""
    >
      <div className="dashboard-section__header codexbar-bridge-settings__header">
        <div>
          <p className="section-label">{copy.eyebrow}</p>
          <div className="section-title-with-info">
            <h2 className="section-title">{copy.title}</h2>
            <MaterialInfoTooltip>{copy.detail}</MaterialInfoTooltip>
          </div>
        </div>
        <span className="status-chip status-chip--warning">{copy.experimental}</span>
      </div>

      <p className="body-copy">{copy.detail}</p>

      <div className="codexbar-bridge-settings__form">
        <label className="form-field codexbar-bridge-settings__endpoint">
          <span className="form-field__label">{copy.endpoint}</span>
          <input
            className="form-field__control"
            data-i18n-scrollable-value="true"
            spellCheck={false}
            value={endpointUrl}
            onChange={(event) => setEndpointUrl(event.currentTarget.value)}
          />
        </label>
        <label className="form-field">
          <span className="form-field__label">{copy.token}</span>
          <input
            className="form-field__control"
            type="password"
            autoComplete="off"
            placeholder={isConnected ? "••••••••" : ""}
            value={token}
            onChange={(event) => setToken(event.currentTarget.value)}
          />
        </label>
      </div>
      <p className="body-copy codexbar-bridge-settings__hint">{copy.tokenHint}</p>

      <div className="codexbar-bridge-settings__actions">
        <button
          className="icon-button icon-button--primary"
          type="button"
          disabled={isBusy}
          onClick={() => void handleConnect()}
        >
          {isBusy ? copy.connecting : copy.connect}
        </button>
        <button className="text-button" type="button" onClick={() => void handleClearToken()}>
          {copy.clearToken}
        </button>
        <button
          className="text-button codexbar-bridge-settings__disconnect"
          type="button"
          onClick={() => void handleDisconnect()}
        >
          {copy.disconnect}
        </button>
        <span
          className={getStatusChipClass(isConnected ? "ok" : "warning")}
          data-status={isConnected ? "ok" : "warning"}
        >
          {isConnected ? copy.connected : copy.notConnected}
        </span>
      </div>

      {result ? (
        <p className="codexbar-bridge-settings__result" data-tone={result.tone}>
          {result.message}
        </p>
      ) : null}

      <div className="codexbar-bridge-settings__sources">
        <strong>{copy.sources}</strong>
        {managedSources.length > 0 ? (
          <ul>
            {managedSources.map((source) => {
              const state = managedStateById.get(source.id);
              return (
                <li key={source.id}>
                  <span>{source.label}</span>
                  <span
                    className={getStatusChipClass(state?.status ?? "warning")}
                    data-status={state?.status ?? "warning"}
                  >
                    {state?.status ?? "pending"}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="body-copy">{copy.noSources}</p>
        )}
      </div>
    </section>
  );
}
