import type { RuntimeI18n } from "../i18n";
import type { CommunityResetStore } from "../community-reset-feeds";
import { COMMUNITY_RESET_CONFIG } from "../community-reset-feeds";
import { getCommunityResetCopy } from "../community-reset-copy";
import { getCommunityResetPopupCopy } from "../community-reset-popup-copy";
import { getCommunityResetPopupPresentation, formatCommunityPopupDate, type CommunityPopupHealth } from "../community-reset-popup-presentation";
import { getCodexLocalEstimateCopy } from "../codex-local-estimate-copy";
import { getProviderInsightsCopy } from "../provider-insights-copy";
import { MaterialInfoTooltip } from "../../sidepanel/components/MaterialInfoTooltip";
import { MaterialIcon } from "../../sidepanel/components/MaterialIcon";

export function CommunityResetPopupSummary({ i18n, store, now, detailUrl, external, failed = false }: {
  i18n: RuntimeI18n; store: CommunityResetStore; now: number; detailUrl: string; external: boolean; failed?: boolean;
}) {
  const copy = getCommunityResetPopupCopy(i18n.resolvedLocale), states = getCommunityResetCopy(i18n.resolvedLocale);
  const local = getCodexLocalEstimateCopy(i18n.resolvedLocale), meta = getProviderInsightsCopy(i18n.resolvedLocale);
  const view = getCommunityResetPopupPresentation(store, now);
  const health = failed ? "unavailable" : view.health;
  const healthLabel = (value: CommunityPopupHealth) => value === "stale" ? local.stale : copy[value];
  const entry = view.event?.entries[0];
  const timestamps = [
    ...(entry ? [`${copy.announcementTime}: ${i18n.formatTemporalValue(entry.announcedAt) ?? local.unknown}`] : []),
    ...view.sources.map((source) => `${COMMUNITY_RESET_CONFIG[source.source].label}: ${meta.captured}: ${source.capturedAt ? i18n.formatTemporalValue(source.capturedAt) : local.unknown}; ${healthLabel(source.health)}`),
  ].join("\n");
  return <section className="provider-insights community-popup" data-community-resets="popup" data-community-health={health}>
    <div className="community-popup__header">
      <h3 className="provider-insights__title">{copy.title}</h3>
      <span className="community-popup__health" data-health={health}>
        {healthLabel(health)}
        {timestamps ? <MaterialInfoTooltip className="community-popup__info" tooltipClassName="community-popup__tooltip">{timestamps}</MaterialInfoTooltip> : null}
      </span>
    </div>
    {entry && !failed ? <div className="community-popup__event">
      <div className="community-popup__identity">
        <strong>{view.event?.conflict ? copy.other : copy[entry.kind]}</strong>
        <span className="community-popup__state" data-conflict={view.event?.conflict || undefined}>{view.event?.conflict ? states.conflict : states[entry.state]}</span>
      </div>
      <time dateTime={entry.announcedAt} aria-label={`${copy.announcementTime}: ${i18n.formatTemporalValue(entry.announcedAt) ?? local.unknown}`}>
        <bdi>{formatCommunityPopupDate(entry.announcedAt, i18n.resolvedLocale, now) ?? local.unknown}</bdi>
      </time>
    </div> : <p className="community-popup__empty" role="status">{health === "fresh" ? states.noData : healthLabel(health)}</p>}
    <div className="community-popup__footer">
      {view.attributions.length ? <div className="community-popup__sources" aria-label={copy.source}>
        {view.attributions.map((source) => <span key={source.source} className="community-popup__source" data-health={source.health}>
          <a href={COMMUNITY_RESET_CONFIG[source.source].url} target="_blank" rel="noreferrer"><bdi>{COMMUNITY_RESET_CONFIG[source.source].label}</bdi></a>
          {source.health !== "fresh" && source.health !== health ? <span>{healthLabel(source.health)}</span> : null}
        </span>)}
      </div> : null}
      <a className="text-button text-button--inline community-popup__details" href={failed ? "#settings/section/settings-usage-notifications" : detailUrl} target={external ? "_blank" : undefined} rel="noreferrer" aria-label={failed ? i18n.t("common.actions.settings") : states.openDetails}>
        {failed ? i18n.t("common.actions.settings") : copy.details}<MaterialIcon name="keyboard-arrow-right" />
      </a>
    </div>
    <p className="community-popup__boundary">{copy.boundary}</p>
  </section>;
}
