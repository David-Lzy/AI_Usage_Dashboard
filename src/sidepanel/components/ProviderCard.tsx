import type { ProviderId } from "../../providers/types";
import type { ProviderViewModel } from "../view-models";
import { StatusBadge } from "./StatusBadge";
import { UsageProgress } from "./UsageProgress";

type ProviderCardProps = {
  provider: ProviderViewModel;
  onOpen: (providerId: ProviderId) => void;
  onRefresh: (providerId: ProviderId) => void;
};

export function ProviderCard({
  provider,
  onOpen,
  onRefresh,
}: ProviderCardProps) {
  const showSessionPageContract =
    provider.sessionPageContractLabel !== null &&
    provider.sessionPageContractLabel !== provider.currentSourceContractLabel;
  const fidelityChipClassName =
    provider.currentSourceFidelityTone === "error"
      ? "meta-chip meta-chip--error"
      : provider.currentSourceFidelityTone === "warning"
        ? "meta-chip meta-chip--warning"
        : "meta-chip";
  const usageLabel =
    provider.quotaUnit === "percent"
      ? provider.used !== null && provider.remaining !== null
        ? `${provider.used}% used · ${provider.remaining}% remaining`
        : provider.used !== null
          ? `${provider.used}% used`
          : provider.remaining !== null
            ? `${provider.remaining}% remaining`
            : "Usage window percent unavailable"
      : provider.used !== null && provider.total !== null
        ? `${provider.used} / ${provider.total} ${provider.quotaUnit}`
        : provider.used !== null
          ? `${provider.used} ${provider.quotaUnit} tracked`
          : provider.total !== null
            ? `Unknown / ${provider.total} ${provider.quotaUnit}`
            : `Usage unknown · ${provider.quotaUnit}`;

  return (
    <article className={`provider-card provider-card--${provider.displayTone}`}>
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
        <p className="supporting-copy">{provider.resetLabel}</p>
        <p className="supporting-copy">{provider.currentSourceContractDetail}</p>

        <UsageProgress
          used={provider.used}
          total={provider.total}
          tone={provider.displayTone}
          label={`${provider.quotaWindow} ${provider.quotaUnit}`}
        />

        <div className="provider-card__meta">
          <span className="meta-chip">{provider.currentSourceLabel}</span>
          <span className="meta-chip">{provider.currentSourceContractLabel}</span>
          <span className={fidelityChipClassName}>
            {provider.currentSourceFidelityLabel}
          </span>
          <span className="meta-chip">{provider.lastSyncLabel}</span>
          {provider.currentSourceStateKind === "credential_missing" ||
          provider.currentSourceStateKind === "open_page_required" ||
          provider.currentSourceStateKind === "logged_out" ? (
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
        <p className="supporting-copy">{provider.currentSourceAvailabilitySummary}</p>
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
