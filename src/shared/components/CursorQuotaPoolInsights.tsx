import type { ProviderQuotaPool } from "../../providers/types";
import type { RuntimeI18n } from "../i18n";
import { getProviderInsightsUiCopy } from "../provider-insights-ui-copy";
import { getProviderInsightsCopy } from "../provider-insights-copy";
import { getCodexLocalEstimateCopy } from "../codex-local-estimate-copy";
import { isLocalCompanionCaptureStale } from "../local-companion-settings";
import "./provider-insights.css";

export function CursorQuotaPoolInsights({ pools, i18n, compact = false }: { pools: readonly ProviderQuotaPool[]; i18n: RuntimeI18n; compact?: boolean }) {
  if (!pools.length) return null;
  const ui = getProviderInsightsUiCopy(i18n.resolvedLocale), meta = getProviderInsightsCopy(i18n.resolvedLocale), state = getCodexLocalEstimateCopy(i18n.resolvedLocale);
  return <section className="provider-insights" data-cursor-quota-pools="">
    <h3 className="provider-insights__title">{ui.quotaTitle}</h3>
    <ul className="provider-insights__rows">
      {pools.map((pool) => {
        const expired = pool.resetAt !== null && Date.parse(pool.resetAt) <= Date.now();
        const stale = isLocalCompanionCaptureStale(pool.capturedAt);
        const label = pool.id === "cursor_models" ? "Cursor Models" : pool.id === "other_models" ? "Other Models" : "Grok Bot";
        return <li key={pool.id}>
          <div className="provider-insights__row"><span>{label} · {pool.kind === "monthly" ? ui.monthly : ui.weekly}</span>
            <strong><bdi>{expired ? ui.expired : stale ? state.stale : pool.usedPercent === null ? state.unknown : `${i18n.formatNumber(pool.usedPercent)}% ${ui.used}`}</bdi></strong></div>
          {!compact ? <>
            <p className="provider-insights__metadata">{meta.page} · {meta.captured}: {i18n.formatTemporalValue(pool.capturedAt)}</p>
            <p className="provider-insights__metadata">{ui.sourcePeriod}: {pool.resetAt ? i18n.formatTemporalValue(pool.resetAt) : pool.resetText ?? state.unknown}</p>
          </> : null}
        </li>;
      })}
    </ul>
  </section>;
}
