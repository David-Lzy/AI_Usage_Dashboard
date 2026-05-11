import type {
  ProviderId,
  ProviderSetting,
  ProviderSnapshot,
  ProviderSourcePreference,
} from "../../providers/types";
import type { RuntimeI18n } from "../../shared/i18n";
import { buildSettingsLocalizedCopy } from "../../shared/localized-copy";
import type { SettingsUserLevelVisibility } from "../settings-user-level-visibility";
import { SettingsSourceCard } from "./SettingsSourceCard";

type SettingsSourceSectionProps = {
  activeSessionPageAttachAvailable: boolean;
  detail: string;
  eyebrow: string;
  i18n: RuntimeI18n;
  providers: ProviderSetting[];
  sectionId?: string;
  sessionPageNavigationAvailable: boolean;
  settingsCopy: ReturnType<typeof buildSettingsLocalizedCopy>;
  snapshots: ProviderSnapshot[];
  title: string;
  userLevelVisibility: SettingsUserLevelVisibility;
  onAttachActiveSessionPage: (providerId: ProviderId) => void;
  onClearPageBinding: (providerId: ProviderId) => void;
  onOpenSessionPage: (providerId: ProviderId) => void;
  onSetSourcePreference: (
    providerId: ProviderId,
    sourcePreference: ProviderSourcePreference,
  ) => void;
};

export function SettingsSourceSection({
  activeSessionPageAttachAvailable,
  detail,
  eyebrow,
  i18n,
  providers,
  sectionId,
  sessionPageNavigationAvailable,
  settingsCopy,
  snapshots,
  title,
  userLevelVisibility,
  onAttachActiveSessionPage,
  onClearPageBinding,
  onOpenSessionPage,
  onSetSourcePreference,
}: SettingsSourceSectionProps) {
  function findSnapshot(providerId: ProviderId): ProviderSnapshot | null {
    return (
      snapshots.find((provider) => provider.providerId === providerId) ?? null
    );
  }

  return (
    <section className="dashboard-section settings-section-anchor" id={sectionId}>
      <div className="dashboard-section__header">
        <div>
          <p className="section-label">{eyebrow}</p>
          <h2 className="section-title">{title}</h2>
        </div>
        <p className="supporting-copy">{detail}</p>
      </div>

      <div className="provider-shell-list">
        {providers.map((provider) => {
          const snapshot = findSnapshot(provider.id);

          if (!snapshot) {
            return null;
          }

          return (
            <SettingsSourceCard
              key={provider.id}
              activeSessionPageAttachAvailable={
                activeSessionPageAttachAvailable
              }
              i18n={i18n}
              provider={provider}
              sessionPageNavigationAvailable={sessionPageNavigationAvailable}
              settingsCopy={settingsCopy}
              snapshot={snapshot}
              userLevelVisibility={userLevelVisibility}
              onAttachActiveSessionPage={onAttachActiveSessionPage}
              onClearPageBinding={onClearPageBinding}
              onOpenSessionPage={onOpenSessionPage}
              onSetSourcePreference={onSetSourcePreference}
            />
          );
        })}
      </div>
    </section>
  );
}
