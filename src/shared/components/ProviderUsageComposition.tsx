import type { ProviderViewModel } from "../provider-view-models";
import type { RuntimeI18n } from "../i18n";
import { getProviderInsightsUiCopy } from "../provider-insights-ui-copy";
import { getProviderInsightsCopy } from "../provider-insights-copy";
import { isLocalCompanionCaptureStale } from "../local-companion-settings";
import { getCodexLocalEstimateCopy } from "../codex-local-estimate-copy";
import "./provider-insights.css";

export function ProviderUsageComposition({ provider, i18n, compact = false }: { provider: ProviderViewModel; i18n: RuntimeI18n; compact?: boolean }) {
  const ui = getProviderInsightsUiCopy(i18n.resolvedLocale), meta = getProviderInsightsCopy(i18n.resolvedLocale);
  const distribution = provider.usageInsights?.distribution, scope = provider.usageInsights?.quotaScope;
  const state = getCodexLocalEstimateCopy(i18n.resolvedLocale);
  return <section className="provider-insights" data-provider-composition="">
    <h3 className="provider-insights__title">{ui.compositionTitle}</h3>
    <p className="supporting-copy">{ui.compositionNote}</p>
    {scope?.scope === "shared_plan" ? <p className="supporting-copy" data-usage-statistics-scope="">{ui.usageScope}</p> : null}
    {distribution ? <>
      <p className="provider-insights__metadata">{meta.page} · {meta.captured}: {i18n.formatTemporalValue(distribution.capturedAt)}{!distribution.accountVerified ? ` · ${state.unverified}` : ""}{isLocalCompanionCaptureStale(distribution.capturedAt) ? ` · ${state.stale}` : ""}</p>
      <p className="provider-insights__metadata">{ui.period}: <bdi>{distribution.rangeStart ?? state.unknown} / {distribution.rangeEnd ?? state.unknown}</bdi></p>
      <ul className="provider-insights__rows">
        {distribution.values.slice(0, compact ? 3 : 16).map((item, index) => <li key={item.id}>
          <div className="provider-insights__row"><span>{item.label}</span><strong><bdi>{i18n.formatNumber(item.value)}%</bdi></strong></div>
          {!compact ? <div className="provider-insights__composition-bar" aria-hidden="true"><span style={{ width: `${item.value}%`, background: `var(--app-usage-history-series-${index % 4 + 1})` }} /></div> : null}
        </li>)}
      </ul>
    </> : <p className="supporting-copy">{ui.noComposition}</p>}
  </section>;
}
