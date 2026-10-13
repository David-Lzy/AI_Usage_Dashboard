import { useState } from "react";

import type { ProviderViewModel } from "../provider-view-models";
import type { RuntimeI18n } from "../i18n";
import { getCodexLocalEstimateCopy } from "../codex-local-estimate-copy";
import { isLocalCompanionCaptureStale } from "../local-companion-settings";
import { getResetExpirySummary } from "../reset-expiry-presentation";

type Props = { provider: ProviderViewModel; i18n: RuntimeI18n; detail: boolean };

export function CodexEstimateStrip({ provider, i18n, detail }: Props) {
  const copy = getCodexLocalEstimateCopy(i18n.resolvedLocale);
  const windows = (provider.usageWindows ?? []).filter((window) => !window.id || window.id === "codex:primary" || window.id === "codex:secondary");
  const weekly = windows.find((window) => window.kind === "weekly" && (!window.id || window.id.startsWith("codex:")));
  const defaultIndex = weekly ? windows.indexOf(weekly) : 0;
  const [chosenIndex, setChosenIndex] = useState<number | null>(null);
  const selectedIndex = detail && chosenIndex !== null && windows[chosenIndex] ? chosenIndex : defaultIndex;
  const windowId = windows[selectedIndex]?.id?.replace(/^codex:/, "");
  const estimate = windowId ? provider.codexLocal?.estimates.find((item) => item.windowId === windowId) : provider.codexLocal?.estimates[selectedIndex];
  const disconnected = provider.syncStatus !== "ok";
  const stale = !disconnected && isLocalCompanionCaptureStale(provider.lastSuccessAt);
  const unavailable = disconnected || stale;
  const status = disconnected ? copy.disconnected : stale ? copy.stale : !provider.codexLocal?.accountVerified ? copy.unverified : estimate?.status === "unpriced" ? copy.unpriced : copy.learning;
  const ready = !unavailable && provider.codexLocal?.accountVerified && estimate?.status === "ready";
  const money = (value: number) => new Intl.NumberFormat(i18n.resolvedLocale, { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
  const count = provider.codexLocal?.availableResetCount;
  const expiredCountCapture = getResetExpirySummary(provider.usageInsights?.resetCredits).expiredCapture;
  const value = (amount: number | null | undefined) => ready && amount !== null && amount !== undefined ? money(amount) : status;

  return (
    <div className="codex-estimate-strip" data-codex-estimate-status={ready ? "ready" : disconnected ? "disconnected" : stale ? "stale" : estimate?.status ?? "unknown"}>
      {detail && windows.length > 1 ? (
        <div className="codex-estimate-strip__tabs" role="group" aria-label={copy.full}>
          {windows.map((window, index) => {
            const label = window.kind === "weekly" ? copy.weekly : window.kind === "rolling_5h" ? copy.fiveHour : `${copy.otherWindow} ${i18n.formatNumber(index + 1)}`;
            return <button key={index} type="button" aria-pressed={selectedIndex === index} className="codex-estimate-strip__tab" onClick={() => setChosenIndex(index)}>{label}</button>;
          })}
        </div>
      ) : null}
      <div className="codex-estimate-strip__metrics">
        <div className="codex-estimate-strip__metric"><span>{copy.used}</span><strong>{value(estimate?.currentUsd)}</strong></div>
        <div className="codex-estimate-strip__metric"><span>{copy.full}</span><strong>{value(estimate?.fullUsd)}</strong></div>
        <div className="codex-estimate-strip__metric"><span>{copy.resets}</span><strong>{unavailable ? status : expiredCountCapture ? copy.stale : count === null || count === undefined ? copy.unknown : i18n.formatNumber(count)}</strong></div>
      </div>
      {detail ? <p className="codex-estimate-strip__detail">
        {ready && estimate?.fullLowerUsd !== null && estimate?.fullUpperUsd !== null ? `${copy.range}: ${money(estimate!.fullLowerUsd!)}–${money(estimate!.fullUpperUsd!)} · ${copy.sample}: ${i18n.formatNumber(estimate!.sampleCount)} · ${copy.confidence}: ${estimate!.confidence === "medium" ? copy.medium : copy.low} · ${estimate!.priceDate}` : null}
        {ready ? <><br />{copy.caveat}</> : null}
      </p> : null}
    </div>
  );
}
