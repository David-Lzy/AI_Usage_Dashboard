import type {
  AppLocalePreference,
  DisplaySurface,
  ProgressColorBand,
  ProgressDisplayStyle,
  ProgressItemsBySurface,
  ProviderId,
} from "../../providers/types";
import { buildRuntimeCommonCopy, createRuntimeI18n } from "../../shared/i18n";
import { hasVisibleProviderProgressItems } from "../../shared/provider-progress-item-selection";
import type { ProviderViewModel } from "../view-models";
import { ProviderProgressItemList } from "./ProviderProgressItemList";
import { StatusBadge } from "./StatusBadge";
import { UsageFactsList } from "./UsageFactsList";

type ProviderCardProps = {
  localePreference: AppLocalePreference;
  progressColorBands: readonly ProgressColorBand[];
  progressDisplayStyle: ProgressDisplayStyle;
  progressItemsBySurface: ProgressItemsBySurface;
  progressThicknessPx: number;
  progressSurface: DisplaySurface;
  provider: ProviderViewModel;
  onOpen: (providerId: ProviderId) => void;
  onOpenSourcePage?: (
    providerId: ProviderId,
    sourceStateKind: ProviderViewModel["currentSourceStateKind"],
  ) => void;
  onRefresh: (providerId: ProviderId) => void;
};

export function ProviderCard({
  localePreference,
  progressColorBands,
  progressDisplayStyle,
  progressItemsBySurface,
  progressThicknessPx,
  progressSurface,
  provider,
  onOpen,
  onOpenSourcePage,
  onRefresh,
}: ProviderCardProps) {
  const i18n = createRuntimeI18n(
    localePreference,
    typeof window !== "undefined" ? window : undefined,
  );
  const showSessionPageContract =
    provider.sessionPageContractLabel !== null &&
    provider.sessionPageContractLabel !== provider.currentSourceContractLabel;
  const showSourcePageAction =
    provider.openableSessionPageUrl !== null && onOpenSourcePage !== undefined;
  const hasStructuredUsageContext =
    (provider.usageWindows?.length ?? 0) > 0 ||
    (provider.usageBalances?.length ?? 0) > 0 ||
    (provider.usageFacts?.length ?? 0) > 0;
  const hasUsageFacts = (provider.usageFacts?.length ?? 0) > 0;
  const hasProviderProgressItems = hasVisibleProviderProgressItems(
    provider,
    progressSurface,
    progressItemsBySurface,
  );
  const showUsageSummary =
    !hasStructuredUsageContext && Boolean(provider.usageSummary);
  const localizedResetLabel = i18n.localizeResetRuntimeLabel(provider.resetLabel);
  const localizedLastSyncLabel = i18n.localizeRelativeRuntimeLabel(
    provider.lastSyncLabel,
  );
  const visibleUsageContextLabel =
    buildRuntimeCommonCopy(i18n).visibleUsageContext;
  const fidelityChipClassName =
    provider.currentSourceFidelityTone === "error"
      ? "meta-chip meta-chip--error"
      : provider.currentSourceFidelityTone === "warning"
        ? "meta-chip meta-chip--warning"
        : "meta-chip";
  const usageLabel =
    provider.quotaUnit === "percent"
      ? provider.used !== null && provider.remaining !== null
        ? `${i18n.formatPercentValue(provider.used)} used · ${i18n.formatPercentValue(provider.remaining)} remaining`
        : provider.used !== null
          ? `${i18n.formatPercentValue(provider.used)} used`
          : provider.remaining !== null
            ? `${i18n.formatPercentValue(provider.remaining)} remaining`
            : "Usage window percent unavailable"
      : provider.used !== null && provider.total !== null
        ? `${i18n.formatNumber(provider.used)} / ${i18n.formatNumber(provider.total)} ${provider.quotaUnit}`
        : provider.used !== null
          ? `${i18n.formatNumber(provider.used)} ${provider.quotaUnit} tracked`
          : provider.total !== null
            ? `Unknown / ${i18n.formatNumber(provider.total)} ${provider.quotaUnit}`
            : hasUsageFacts
              ? visibleUsageContextLabel
              : `Usage unknown · ${provider.quotaUnit}`;

  return (
    <article
      className={`provider-card provider-card--${provider.displayTone}`}
      data-provider-id={provider.providerId}
    >
      <header className="provider-card__header">
        <div className="provider-card__identity">
          <p className="provider-card__provider">{provider.providerLabel}</p>
          <p className="provider-card__plan">{provider.planName}</p>
        </div>
        <div className="provider-card__status">
          <StatusBadge
            label={
              provider.permissionStatus === "missing"
                ? "Needs access"
                : provider.displaySyncStatus === "ok"
                  ? "Healthy"
                  : provider.displaySyncStatus === "warning"
                    ? "Warning"
                    : "Sync issue"
            }
            tone={provider.displayTone}
          />
        </div>
      </header>

      <div className="provider-card__body">
        <section
          className="provider-card__summary"
          aria-label={`${provider.providerLabel} usage summary`}
        >
          <p className="provider-card__usage-label">{usageLabel}</p>
          <div className="provider-card__summary-details">
            <p className="supporting-copy">{localizedResetLabel}</p>
            <p className="supporting-copy">
              {provider.currentSourceContractDetail}
            </p>
          </div>
        </section>

        {hasProviderProgressItems ? (
          <section className="provider-card__progress-surface">
            <ProviderProgressItemList
              density="compact"
              displayStyle={progressDisplayStyle}
              i18n={i18n}
              progressColorBands={progressColorBands}
              progressItemsBySurface={progressItemsBySurface}
              progressThicknessPx={progressThicknessPx}
              provider={provider}
              surface={progressSurface}
            />
          </section>
        ) : null}

        {hasUsageFacts && provider.usageFacts ? (
          <section className="provider-card__progress-surface">
            <UsageFactsList facts={provider.usageFacts} density="compact" />
          </section>
        ) : null}

        <div className="provider-card__meta" aria-label="Provider source context">
          <span className="meta-chip">{provider.currentSourceLabel}</span>
          <span className="meta-chip">{provider.currentSourceContractLabel}</span>
          <span className={fidelityChipClassName}>
            {provider.currentSourceFidelityLabel}
          </span>
          <span className="meta-chip">{localizedLastSyncLabel}</span>
          {provider.currentSourceStateKind === "credential_missing" ||
          provider.currentSourceStateKind === "open_page_required" ||
          provider.currentSourceStateKind === "logged_out" ||
          provider.currentSourceStateKind === "capture_unavailable" ? (
            <span
              className={`meta-chip ${provider.currentSourceStateTone === "error" ? "meta-chip--error" : "meta-chip--warning"}`}
            >
              {provider.currentSourceStateLabel}
            </span>
          ) : null}
          {provider.permissionStatus === "missing" ? (
            <span className="meta-chip meta-chip--warning">
              Host access missing
            </span>
          ) : null}
          {provider.warningReason ? (
            <span className="meta-chip meta-chip--warning">
              {provider.warningReason}
            </span>
          ) : null}
        </div>
        <p className="supporting-copy provider-card__availability">
          {provider.currentSourceAvailabilitySummary}
        </p>
        {showUsageSummary ? (
          <p className="supporting-copy provider-card__availability">
            {provider.usageSummary}
          </p>
        ) : null}
        {showSessionPageContract ? (
          <p className="supporting-copy provider-card__availability">
            Session-page track: {provider.sessionPageContractLabel}
          </p>
        ) : null}
      </div>

      <footer className="provider-card__footer">
        <button
          className="text-button provider-card__action"
          type="button"
          onClick={() => onOpen(provider.providerId)}
        >
          Open
        </button>
        {showSourcePageAction ? (
          <button
            className="text-button provider-card__action"
            data-provider-card-open-source-page="true"
            type="button"
            title="Open source page"
            onClick={() =>
              onOpenSourcePage(
                provider.providerId,
                provider.currentSourceStateKind,
              )
            }
          >
            Source page
          </button>
        ) : null}
        <button
          className="text-button provider-card__action provider-card__action--primary"
          type="button"
          onClick={() => onRefresh(provider.providerId)}
        >
          Refresh
        </button>
      </footer>
    </article>
  );
}
