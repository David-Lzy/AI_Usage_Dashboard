import type {
  AppLocalePreference,
  ProgressDisplayStyle,
  ProviderId,
} from "../../providers/types";
import { createRuntimeI18n } from "../../shared/i18n";
import { shouldShowSingleUsageProgress } from "../usage-progress-visibility";
import type { ProviderViewModel } from "../view-models";
import { StatusBadge } from "./StatusBadge";
import { UsageProgress } from "./UsageProgress";
import { UsageWindowProgressList } from "./UsageWindowProgressList";

type ProviderCardProps = {
  localePreference: AppLocalePreference;
  progressDisplayStyle: ProgressDisplayStyle;
  provider: ProviderViewModel;
  onOpen: (providerId: ProviderId) => void;
  onOpenSourcePage?: (
    providerId: ProviderId,
    sourceStateKind: ProviderViewModel["currentSourceStateKind"],
  ) => void;
  onRefresh: (providerId: ProviderId) => void;
};

function formatUsageBalanceChip(
  balance: NonNullable<ProviderViewModel["usageBalances"]>[number],
  i18n: ReturnType<typeof createRuntimeI18n>,
): string {
  const remaining =
    balance.remaining === null ? null : i18n.formatNumber(balance.remaining);
  const unitLabel = i18n.resolvedLocale === "zh-CN" ? "积分" : balance.quotaUnit;

  return remaining
    ? `${balance.normalizedLabel}: ${remaining} ${unitLabel}`
    : balance.normalizedLabel;
}

export function ProviderCard({
  localePreference,
  progressDisplayStyle,
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
    (provider.usageBalances?.length ?? 0) > 0;
  const hasUsageWindowProgress = (provider.usageWindows?.length ?? 0) > 0;
  const showSingleUsageProgress = shouldShowSingleUsageProgress(provider);
  const showUsageSummary =
    !hasStructuredUsageContext && Boolean(provider.usageSummary);
  const localizedResetLabel = i18n.localizeResetRuntimeLabel(provider.resetLabel);
  const localizedLastSyncLabel = i18n.localizeRelativeRuntimeLabel(
    provider.lastSyncLabel,
  );
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
            : `Usage unknown · ${provider.quotaUnit}`;

  return (
    <article
      className={`provider-card provider-card--${provider.displayTone}`}
      data-provider-id={provider.providerId}
    >
      <div className="provider-card__header">
        <div>
          <p className="provider-card__provider">{provider.providerLabel}</p>
          <p className="provider-card__plan">{provider.planName}</p>
        </div>
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

      <div className="provider-card__body">
        <p className="body-copy">{usageLabel}</p>
        <p className="supporting-copy">{localizedResetLabel}</p>
        <p className="supporting-copy">{provider.currentSourceContractDetail}</p>

        {showSingleUsageProgress ? (
          <UsageProgress
            used={provider.used}
            remaining={provider.remaining}
            total={provider.total}
            tone={provider.displayTone}
            label={`${provider.quotaWindow} ${provider.quotaUnit}`}
            displayStyle={progressDisplayStyle}
            valueKind={provider.remaining !== null ? "remaining" : "used"}
          />
        ) : null}

        {hasUsageWindowProgress && provider.usageWindows ? (
          <UsageWindowProgressList
            windows={provider.usageWindows}
            i18n={i18n}
            density="compact"
            displayStyle={progressDisplayStyle}
          />
        ) : null}

        <div className="provider-card__meta">
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
          {provider.usageBalances?.slice(0, 2).map((usageBalance) => (
            <span
              key={`${usageBalance.normalizedLabel}-${usageBalance.remaining ?? "unknown"}`}
              className="meta-chip"
            >
              {formatUsageBalanceChip(usageBalance, i18n)}
            </span>
          ))}
          {provider.warningReason ? (
            <span className="meta-chip meta-chip--warning">
              {provider.warningReason}
            </span>
          ) : null}
        </div>
        <p className="supporting-copy">{provider.currentSourceAvailabilitySummary}</p>
        {showUsageSummary ? (
          <p className="supporting-copy">{provider.usageSummary}</p>
        ) : null}
        {showSessionPageContract ? (
          <p className="supporting-copy">
            Session-page track: {provider.sessionPageContractLabel}
          </p>
        ) : null}
      </div>

      <div className="provider-card__footer">
        <button
          className="text-button"
          type="button"
          onClick={() => onOpen(provider.providerId)}
        >
          Open
        </button>
        {showSourcePageAction ? (
          <button
            className="text-button"
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
          className="text-button"
          type="button"
          onClick={() => onRefresh(provider.providerId)}
        >
          Refresh
        </button>
      </div>
    </article>
  );
}
