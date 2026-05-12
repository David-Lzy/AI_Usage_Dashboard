import type { ThemeRecoveryTargetSnapshot } from "../theme-recovery-review";
import { StatusBadge } from "./StatusBadge";

type ThemeRecoveryProviderListProps = {
  providers: ThemeRecoveryTargetSnapshot[];
};

export function ThemeRecoveryProviderList({
  providers,
}: ThemeRecoveryProviderListProps) {
  return (
    <section className="provider-shell-list theme-recovery-provider-list">
      {providers.map((provider) => (
        <article
          key={provider.providerId}
          className={`provider-card${
            provider.recoveryTone === "warning"
              ? " provider-card--warning"
              : provider.recoveryTone === "error"
                ? " provider-card--error"
                : ""
          }`}
          data-theme-recovery-provider={provider.providerId}
          data-theme-recovery-provider-visible={provider.visible ? "true" : "false"}
        >
          <header className="provider-card__header">
            <div>
              <p className="provider-card__provider">
                {provider.providerLabel}
              </p>
              <p className="provider-card__plan">
                {provider.currentSourceLabel}
              </p>
            </div>
            <StatusBadge
              label={provider.recoveryLabel}
              tone={provider.recoveryTone}
            />
          </header>

          <div className="provider-card__body">
            <div className="provider-card__meta">
              <span className="meta-chip">{provider.hostAccessLabel}</span>
              <span
                className={`meta-chip${
                  provider.currentSourceStateTone === "warning"
                    ? " meta-chip--warning"
                    : provider.currentSourceStateTone === "error"
                      ? " meta-chip--error"
                      : ""
                }`}
              >
                {provider.currentSourceStateLabel}
              </span>
              <span className="meta-chip">{provider.lastSyncLabel}</span>
            </div>
            <p className="body-copy" data-theme-recovery-provider-status>
              {provider.recoveryDetail}
            </p>
            <p className="supporting-copy">
              Source detail: {provider.currentSourceStateDetail}
            </p>
          </div>
        </article>
      ))}
    </section>
  );
}
