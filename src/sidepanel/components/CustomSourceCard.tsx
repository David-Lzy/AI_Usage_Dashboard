import type {
  AppLocalePreference,
  DisplaySurface,
  ProgressColorAppearance,
  ProgressColorBand,
  ProgressDisplayStyle,
  ProgressItemsBySurface,
} from "../../providers/types";
import { CustomSourceProgressItemList } from "../../shared/components/CustomSourceProgressItemList";
import type { CustomSourceCardCopy } from "../../shared/custom-source-card-localized-copy";
import { getCustomSourceCardCopy } from "../../shared/custom-source-card-localized-copy";
import type { CustomSourceViewModel } from "../../shared/custom-source-view-models";
import { createRuntimeI18n } from "../../shared/i18n";
import { StatusBadge } from "./StatusBadge";
import { UsageFactsList } from "./UsageFactsList";

type CustomSourceCardProps = {
  localePreference: AppLocalePreference;
  progressColorAppearance?: ProgressColorAppearance;
  progressColorBands: readonly ProgressColorBand[];
  progressDisplayStyle: ProgressDisplayStyle;
  progressItemsBySurface: ProgressItemsBySurface;
  progressThicknessPx: number;
  progressSurface: DisplaySurface;
  source: CustomSourceViewModel;
  onOpenSettings: () => void;
  onRefresh: () => void;
};

function getUsageLabel(
  source: CustomSourceViewModel,
  copy: CustomSourceCardCopy,
): string {
  if (source.usageSummary) {
    return source.usageSummary;
  }

  if (source.quota) {
    const metric = source.quota;
    const unit = metric.unit;

    if (metric.remaining !== null && metric.total !== null) {
      return `${metric.remaining} / ${metric.total} ${unit} ${copy.remaining}`;
    }

    if (metric.used !== null && metric.total !== null) {
      return `${metric.used} / ${metric.total} ${unit} ${copy.used}`;
    }

    if (metric.remaining !== null) {
      return `${metric.remaining} ${unit} ${copy.remaining}`;
    }

    if (metric.used !== null) {
      return `${metric.used} ${unit} ${copy.tracked}`;
    }
  }

  return source.hasSnapshot ? source.statusLabel : "";
}

export function CustomSourceCard({
  localePreference,
  progressColorAppearance,
  progressColorBands,
  progressDisplayStyle,
  progressItemsBySurface,
  progressThicknessPx,
  progressSurface,
  source,
  onOpenSettings,
  onRefresh,
}: CustomSourceCardProps) {
  const i18n = createRuntimeI18n(
    localePreference,
    typeof window !== "undefined" ? window : undefined,
  );
  const copy = getCustomSourceCardCopy(i18n.resolvedLocale);
  const usageLabel = getUsageLabel(source, copy);
  const hasProgressItems = source.progressItems.length > 0;
  const hasFacts = source.facts.length > 0;

  return (
    <article
      className={`provider-card provider-card--custom provider-card--${source.displayTone}`}
      data-custom-source-id={source.sourceId}
    >
      <header className="provider-card__header">
        <div className="provider-card__identity">
          <p className="provider-card__provider">{source.label}</p>
          <p className="provider-card__plan">
            {source.description ?? copy.sourceContract}
          </p>
        </div>
        <div className="provider-card__status">
          <StatusBadge label={source.statusLabel} tone={source.displayTone} />
        </div>
      </header>

      <div className="provider-card__body">
        <section
          className="provider-card__summary"
          aria-label={`${source.label} ${copy.summaryAriaSuffix}`}
        >
          <p className="provider-card__usage-label">
            {usageLabel || copy.noSnapshot}
          </p>
          <div className="provider-card__summary-details">
            <p className="supporting-copy">{source.lastSyncLabel}</p>
            <p className="supporting-copy">{copy.sourceContract}</p>
          </div>
        </section>

        {hasProgressItems ? (
          <section className="provider-card__progress-surface">
            <CustomSourceProgressItemList
              density="compact"
              displayStyle={progressDisplayStyle}
              i18n={i18n}
              progressColorAppearance={progressColorAppearance}
              progressColorBands={progressColorBands}
              progressItemsBySurface={progressItemsBySurface}
              progressThicknessPx={progressThicknessPx}
              source={source}
              surface={progressSurface}
            />
          </section>
        ) : null}

        {hasFacts ? (
          <section className="provider-card__progress-surface">
            <UsageFactsList facts={source.facts} density="compact" />
          </section>
        ) : null}

        <div className="provider-card__meta" aria-label={copy.contextAria}>
          <span className="meta-chip">{copy.custom}</span>
          <span className="meta-chip">{source.lastSyncLabel}</span>
          <span className="meta-chip">
            {copy.syncEvery} {source.refreshIntervalMinutes} {copy.minutes}
          </span>
          {source.stale ? (
            <span className="meta-chip meta-chip--warning">{copy.stale}</span>
          ) : null}
          {source.warningReason ? (
            <span className="meta-chip meta-chip--warning">
              {source.warningReason}
            </span>
          ) : null}
        </div>

        <p className="supporting-copy provider-card__availability">
          {copy.endpoint}: {source.endpointUrl}
        </p>
      </div>

      <footer className="provider-card__footer">
        <button
          className="text-button provider-card__action"
          type="button"
          onClick={onOpenSettings}
        >
          {copy.openSettings}
        </button>
        <button
          className="text-button provider-card__action provider-card__action--primary"
          type="button"
          onClick={onRefresh}
        >
          {copy.refresh}
        </button>
      </footer>
    </article>
  );
}
