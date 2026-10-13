import type { RuntimeI18n } from "../i18n";
import type { ProviderViewModel } from "../provider-view-models";
import { getProviderInsightsCopy } from "../provider-insights-copy";
import { getCodexLocalEstimateCopy } from "../codex-local-estimate-copy";
import { isLocalCompanionCaptureStale } from "../local-companion-settings";

export function CodexUsageInsightsSummary({ provider, i18n, detail }: { provider: ProviderViewModel; i18n: RuntimeI18n; detail: boolean }) {
  if (provider.providerId !== "codex-personal-page" || !provider.usageInsights) return null;
  const copy = getProviderInsightsCopy(i18n.resolvedLocale);
  const localCopy = getCodexLocalEstimateCopy(i18n.resolvedLocale);
  const { quotaScope, resetCredits } = provider.usageInsights;
  if (!quotaScope && !resetCredits) return null;
  const date = (value: string) => new Intl.DateTimeFormat(i18n.resolvedLocale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  const showCount = resetCredits && !provider.codexLocal;
  const stale = resetCredits && isLocalCompanionCaptureStale(resetCredits.capturedAt);
  const count = resetCredits?.availableCount;
  return <div className="codex-estimate-strip" data-usage-insights="codex">
    {quotaScope?.scope === "shared_plan" ? <p className="supporting-copy">{copy.sharedScope}{detail ? ` · ${copy.page} · ${copy.captured}: ${date(quotaScope.capturedAt)}` : ""}</p> : null}
    {showCount ? <p className="supporting-copy">{localCopy.resets}: <strong>{stale ? localCopy.stale : count === null || count === undefined ? localCopy.unknown : i18n.formatNumber(count)}</strong></p> : null}
    {detail && resetCredits ? <div className="codex-estimate-strip__detail">
      <p>{resetCredits.source === "local_companion" ? copy.local : copy.page} · {copy.captured}: {date(resetCredits.capturedAt)}{!resetCredits.accountVerified ? ` · ${localCopy.unverified}` : ""}</p>
      {resetCredits.offers?.map((offer, index) => offer.expiresAt || offer.expiryText ? <p key={index}>{copy.expires}: {offer.expiresAt ? date(offer.expiresAt) : offer.expiryText}</p> : null)}
      {resetCredits.detailsComplete === false ? <p>{copy.partial}</p> : null}
    </div> : null}
  </div>;
}
