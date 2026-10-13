import type { RuntimeI18n } from "../i18n";
import type { ProviderViewModel } from "../provider-view-models";
import { getProviderInsightsCopy } from "../provider-insights-copy";
import { getCodexLocalEstimateCopy } from "../codex-local-estimate-copy";
import { isLocalCompanionCaptureStale } from "../local-companion-settings";
import { getProviderInsightsUiCopy } from "../provider-insights-ui-copy";
import { getResetExpirySummary } from "../reset-expiry-presentation";

export function CodexUsageInsightsSummary({ provider, i18n, detail, includeLocalCount = false }: { provider: ProviderViewModel; i18n: RuntimeI18n; detail: boolean; includeLocalCount?: boolean }) {
  if (provider.providerId !== "codex-personal-page" || !provider.usageInsights) return null;
  const copy = getProviderInsightsCopy(i18n.resolvedLocale);
  const localCopy = getCodexLocalEstimateCopy(i18n.resolvedLocale);
  const { resetCredits } = provider.usageInsights;
  if (!resetCredits) return null;
  const ui = getProviderInsightsUiCopy(i18n.resolvedLocale);
  const expiry = getResetExpirySummary(resetCredits);
  const date = (value: string) => i18n.formatTemporalValue(value);
  const showCount = !provider.codexLocal || includeLocalCount;
  const stale = resetCredits && (isLocalCompanionCaptureStale(resetCredits.capturedAt) || expiry.expiredCapture);
  const count = resetCredits?.availableCount;
  return <div className="codex-estimate-strip" data-usage-insights="codex">
    {showCount ? <p className="supporting-copy">{localCopy.resets}: <strong>{stale ? localCopy.stale : count === null || count === undefined ? localCopy.unknown : i18n.formatNumber(count)}</strong></p> : null}
    {expiry.knownExpiry ? <p className="supporting-copy">{ui.knownExpiry}: {expiry.precise ? date(expiry.knownExpiry) : expiry.knownExpiry}</p>
      : resetCredits.availableCount !== 0 ? <p className="supporting-copy">{ui.expiryUnknown}</p> : null}
    {detail && resetCredits ? <div className="codex-estimate-strip__detail">
      <p>{resetCredits.source === "local_companion" ? copy.local : copy.page} · {copy.captured}: {date(resetCredits.capturedAt)}{!resetCredits.accountVerified ? ` · ${localCopy.unverified}` : ""}</p>
      {resetCredits.offers?.map((offer, index) => offer.expiresAt || offer.expiryText ? <p key={index}>{copy.expires}: {offer.expiresAt ? date(offer.expiresAt) : offer.expiryText}{offer.expiresAt && Date.parse(offer.expiresAt) <= Date.now() ? ` · ${ui.expired}` : offer.available === false ? ` · ${copy.unavailable}` : ""}</p> : null)}
      {resetCredits.detailsComplete === false ? <p>{copy.partial}</p> : null}
      {resetCredits.offers === null ? <p>{localCopy.unknown}</p> : null}
    </div> : null}
  </div>;
}
