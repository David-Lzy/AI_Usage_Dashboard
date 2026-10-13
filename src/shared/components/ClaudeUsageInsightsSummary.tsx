import type { RuntimeI18n } from "../i18n";
import type { ProviderViewModel } from "../provider-view-models";
import { getProviderInsightsCopy } from "../provider-insights-copy";
import { getCodexLocalEstimateCopy } from "../codex-local-estimate-copy";
import { isLocalCompanionCaptureStale } from "../local-companion-settings";
import { getProviderInsightsUiCopy } from "../provider-insights-ui-copy";

export function ClaudeUsageInsightsSummary({ provider, i18n, detail }: { provider: ProviderViewModel; i18n: RuntimeI18n; detail: boolean }) {
  if (provider.providerId !== "claude-code-team-page" || !provider.usageInsights) return null;
  const { resetCredits, balances } = provider.usageInsights;
  if (!resetCredits && !balances?.length) return null;
  const copy = getProviderInsightsCopy(i18n.resolvedLocale);
  const state = getCodexLocalEstimateCopy(i18n.resolvedLocale);
  const ui = getProviderInsightsUiCopy(i18n.resolvedLocale);
  const date = (value: string) => i18n.formatTemporalValue(value);
  const metric = (label: string, value: string, key: string) => <div className="codex-estimate-strip__metric" key={key}><span>{label}</span><strong>{value}</strong></div>;
  return <div className="codex-estimate-strip" data-usage-insights="claude">
    <div className="codex-estimate-strip__metrics">
      {resetCredits?.offers?.filter((offer) => offer.kind === "full" || offer.kind === "rolling_5h").map((offer, index) => metric(
        offer.kind === "full" ? copy.fullReset : copy.fiveHourReset,
        offer.expiresAt && Date.parse(offer.expiresAt) <= Date.now() ? ui.expired : isLocalCompanionCaptureStale(resetCredits.capturedAt) ? state.stale : offer.available === null ? state.unknown : offer.available ? copy.available : copy.unavailable, `${offer.kind}:${index}`))}
      {balances?.map((balance) => metric(balance.id === "cloud_session" ? copy.cloudCredits : copy.usageCredits,
        balance.expiresAt && Date.parse(balance.expiresAt) <= Date.now() ? ui.expired : isLocalCompanionCaptureStale(balance.capturedAt) ? state.stale : balance.remaining === null ? state.unknown
          : balance.unit === "credits" ? i18n.formatNumber(balance.remaining)
            : new Intl.NumberFormat(i18n.resolvedLocale, { style: "currency", currency: balance.unit }).format(balance.remaining), balance.id))}
    </div>
    {detail ? <div className="codex-estimate-strip__detail">
      {resetCredits ? <p>{copy.page} · {copy.captured}: {date(resetCredits.capturedAt)} · {state.unverified}</p> : null}
      {resetCredits?.offers?.map((offer, index) => offer.expiresAt || offer.expiryText ? <p key={index}>{offer.kind === "full" ? copy.fullReset : copy.fiveHourReset} · {copy.expires}: {offer.expiresAt ? date(offer.expiresAt) : offer.expiryText}</p> : null)}
      {balances?.map((balance) => <p key={balance.id}>{balance.id === "cloud_session" ? copy.cloudCredits : copy.usageCredits} · {copy.page} · {copy.captured}: {date(balance.capturedAt)}{balance.expiresAt || balance.expiryText ? ` · ${copy.expires}: ${balance.expiresAt ? date(balance.expiresAt) : balance.expiryText}` : ""}</p>)}
    </div> : null}
  </div>;
}
