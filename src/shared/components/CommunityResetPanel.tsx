import type { RuntimeI18n } from "../i18n";
import { useCommunityResetView } from "../use-community-reset-view";
import { getCommunityResetCopy } from "../community-reset-copy";
import { getProviderInsightsUiCopy } from "../provider-insights-ui-copy";
import { getProviderInsightsCopy } from "../provider-insights-copy";
import { getCodexLocalEstimateCopy } from "../codex-local-estimate-copy";
import { COMMUNITY_RESET_CONFIG, COMMUNITY_RESET_ENDPOINTS, mergeCommunityResetEvents, isCommunityResetCacheFresh, type CommunityResetStore, type CommunityResetSource } from "../community-reset-feeds";
import { buildQuotaNotificationLocalizedCopy } from "../quota-notification-localized-copy";
import { MotionDetails } from "./MotionDetails";
import "./provider-insights.css";
import { useEffect, useState } from "react";
import { getExtensionApiNamespace, hasExtensionRuntime } from "../extension-api";

export function CommunityResetPanel({ i18n, compact = false, store: supplied }: { i18n: RuntimeI18n; compact?: boolean; store?: CommunityResetStore }) {
  const { view, loading, failed } = useCommunityResetView();
  const store = supplied ?? view.store;
  const copy = getCommunityResetCopy(i18n.resolvedLocale), ui = getProviderInsightsUiCopy(i18n.resolvedLocale), meta = getProviderInsightsCopy(i18n.resolvedLocale);
  const local = getCodexLocalEstimateCopy(i18n.resolvedLocale), quota = buildQuotaNotificationLocalizedCopy(i18n.resolvedLocale);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (store.preferences.mode === "off") return;
    const update = () => { if (document.visibilityState !== "hidden") setNow(Date.now()); };
    const timer = setInterval(update, 60_000);
    document.addEventListener("visibilitychange", update);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", update); };
  }, [store.preferences.mode]);
  if (!supplied && failed) return <section className="provider-insights" data-community-resets="unavailable">
    <h3 className="provider-insights__title">{ui.communityTitle}</h3>
    <p className="supporting-copy" role="status">{copy.unavailable}</p>
    <a className="text-button text-button--inline" href="#settings/section/settings-usage-notifications">{i18n.t("common.actions.settings")}</a>
  </section>;
  if (!supplied && loading || store.preferences.mode === "off") return compact ? null : <section className="provider-insights" data-community-resets="off">
    <h3 className="provider-insights__title">{ui.communityTitle}</h3>
    <p className="supporting-copy">{loading ? quota.loading : quota.modeOff}</p>
    <a className="text-button text-button--inline" href="#settings/section/settings-usage-notifications">{i18n.t("common.actions.settings")}</a>
  </section>;
  const events = mergeCommunityResetEvents(store);
  const api = getExtensionApiNamespace();
  const detailUrl = hasExtensionRuntime(api) && api?.runtime?.getURL
    ? `${api.runtime.getURL("src/sidepanel/index.html")}?surface=full-page#provider-detail/codex-personal-page` : "#provider-detail/codex-personal-page";
  const sources = store.preferences.sources;
  const sourceMetadata = (source: CommunityResetSource) => {
    const caches = Object.entries(store.caches).filter(([endpoint]) => COMMUNITY_RESET_ENDPOINTS[endpoint as keyof typeof COMMUNITY_RESET_ENDPOINTS].source === source).map(([, cache]) => cache!);
    const capturedAt = caches.map((cache) => cache.capturedAt).filter((value): value is string => value !== null).sort().at(-1);
    return <p className="provider-insights__metadata" key={source}><a href={COMMUNITY_RESET_CONFIG[source].url} target="_blank" rel="noreferrer">{COMMUNITY_RESET_CONFIG[source].label}</a>
      {` · ${meta.captured}: ${capturedAt ? i18n.formatTemporalValue(capturedAt) : local.unknown}`}
      {caches.some((cache) => cache.failure === "permission") ? ` · ${copy.denied}` : caches.some((cache) => cache.failure) || failed ? ` · ${copy.unavailable}`
        : !caches.length || caches.some((cache) => !isCommunityResetCacheFresh(cache, now)) ? ` · ${local.stale}` : ""}</p>;
  };
  const rows = (limit: number) => events.slice(0, limit).map((event) => {
    const entry = event.entries[0];
    const label = event.conflict ? copy.conflict : copy[entry.state];
    return <li key={event.key}>
      <div className="provider-insights__row"><span>{label}</span><time dateTime={entry.announcedAt}>{i18n.formatTemporalValue(entry.announcedAt)}</time></div>
      {!compact ? <p className="supporting-copy">{entry.summary}</p> : null}
      <p className="provider-insights__metadata">{[...new Set(event.entries.map((item) => item.source))].map((source) => {
        const capturedAt = Object.values(store.caches).flatMap((cache) => cache?.fragment?.events.some((item) => item.source === source && item.id === event.entries.find((entry) => entry.source === source)?.id) && cache.capturedAt ? [cache.capturedAt] : []).sort().at(-1);
        return <span key={source}><a href={COMMUNITY_RESET_CONFIG[source].url} target="_blank" rel="noreferrer">{COMMUNITY_RESET_CONFIG[source].label}</a>{` · ${meta.captured}: ${capturedAt ? i18n.formatTemporalValue(capturedAt) : local.unknown} `}</span>;
      })}
        {!compact && entry.originalUrl ? <a href={entry.originalUrl} target="_blank" rel="noreferrer">{copy.original}</a> : null}</p>
      {!compact && entry.scheduledFor ? <p className="provider-insights__metadata">{copy.scheduled}: {i18n.formatTemporalValue(entry.scheduledFor)}</p> : null}
      {!compact && event.conflict ? <ul className="provider-insights__conflict">
        {event.entries.map((item, index) => <li key={`${item.source}:${index}`}>
          <a href={COMMUNITY_RESET_CONFIG[item.source].url} target="_blank" rel="noreferrer">{COMMUNITY_RESET_CONFIG[item.source].label}</a>
          {` · ${copy[item.state]} · ${i18n.formatTemporalValue(item.announcedAt)}`}
          <p className="supporting-copy">{item.summary}</p>
          {item.scheduledFor ? <p>{copy.scheduled}: {i18n.formatTemporalValue(item.scheduledFor)}</p> : null}
          {item.originalUrl ? <a href={item.originalUrl} target="_blank" rel="noreferrer">{copy.original}</a> : null}
        </li>)}
      </ul> : null}
    </li>;
  });
  return <section className="provider-insights" data-community-resets={compact ? "compact" : "detail"}>
    <h3 className="provider-insights__title">{ui.communityTitle}</h3>
    <p className="supporting-copy">{copy.warning}</p>
    {sources.map(sourceMetadata)}
    {events.length ? <ul className="provider-insights__rows">{rows(compact ? 1 : 5)}</ul> : <p className="supporting-copy">{copy.noData}</p>}
    {!compact && events.length > 5 ? <MotionDetails summary={copy.history}><ul className="provider-insights__rows">{rows(20).slice(5)}</ul></MotionDetails> : null}
    {!compact ? Object.entries(store.caches).flatMap(([endpoint, cache]) => store.preferences.sources.includes(COMMUNITY_RESET_ENDPOINTS[endpoint as keyof typeof COMMUNITY_RESET_ENDPOINTS].source)
      ? (cache?.fragment?.forecasts ?? []).map((forecast, index) => <div className="provider-insights__forecast" key={`${endpoint}:${index}`}>
        <h4 className="provider-insights__title">{copy.forecast}</h4>
        <p className="provider-insights__metadata"><a href={COMMUNITY_RESET_CONFIG[forecast.source].url} target="_blank" rel="noreferrer">{COMMUNITY_RESET_CONFIG[forecast.source].label}</a> · {meta.captured}: {i18n.formatTemporalValue(forecast.capturedAt)}</p>
        {forecast.percent24h !== null || forecast.percent48h !== null ? <>
          <div className="provider-insights__row"><span>{copy.probability24}</span><strong>{forecast.percent24h === null ? local.unknown : `${i18n.formatNumber(forecast.percent24h)}%`}</strong></div>
          <div className="provider-insights__row"><span>{copy.probability48}</span><strong>{forecast.percent48h === null ? local.unknown : `${i18n.formatNumber(forecast.percent48h)}%`}</strong></div>
        </> : null}
        {forecast.watchPercent !== null ? <p className="supporting-copy">{forecast.windowLabel ?? copy.forecast}: {i18n.formatNumber(forecast.watchPercent)}%</p> : null}
        <p className="provider-insights__metadata">{local.confidence}: {forecast.confidence === "low" ? local.low : forecast.confidence === "medium" ? local.medium : forecast.confidence === "high" ? copy.high : local.unknown}
          {forecast.expiresAt ? ` · ${meta.expires}: ${i18n.formatTemporalValue(forecast.expiresAt)}` : ""}</p>
        {cache && !isCommunityResetCacheFresh(cache, now) || forecast.expiresAt && Date.parse(forecast.expiresAt) <= now ? <p className="provider-insights__metadata">{local.stale}</p> : null}
      </div>) : []) : <a className="text-button text-button--inline" href={detailUrl} target={hasExtensionRuntime(api) ? "_blank" : undefined} rel="noreferrer">{copy.openDetails}</a>}
  </section>;
}
