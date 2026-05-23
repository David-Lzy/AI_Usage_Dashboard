import type {
  ProviderId,
  ProviderSetting,
  ProviderSnapshot,
  ProviderSourcePreference,
} from "../../providers/types";
import type { RuntimeI18n } from "../../shared/i18n";
import { buildSettingsLocalizedCopy } from "../../shared/settings-localized-copy";
import type { SettingsActivePopoverSessionState } from "../../shared/surface-session-state";
import type { SettingsUserLevelVisibility } from "../settings-user-level-visibility";
import {
  ProviderCarousel,
  type ProviderCarouselItem,
} from "./ProviderCarousel";
import { MaterialInfoTooltip } from "./MaterialInfoTooltip";
import { SettingsSourceCard } from "./SettingsSourceCard";

type SettingsSourceSectionProps = {
  activeSessionPageAttachAvailable: boolean;
  carouselIndex?: number;
  detail: string;
  eyebrow: string;
  focusedProviderId?: ProviderId | null;
  i18n: RuntimeI18n;
  providers: ProviderSetting[];
  sectionId?: string;
  sessionPageNavigationAvailable: boolean;
  settingsCopy: ReturnType<typeof buildSettingsLocalizedCopy>;
  snapshots: ProviderSnapshot[];
  title: string;
  userLevelVisibility: SettingsUserLevelVisibility;
  activePopover?: SettingsActivePopoverSessionState | null;
  onActivePopoverChange?: (
    nextPopover: SettingsActivePopoverSessionState | null,
  ) => void;
  onAttachActiveSessionPage: (providerId: ProviderId) => void;
  onCarouselIndexChange?: (index: number) => void;
  onClearPageBinding: (providerId: ProviderId) => void;
  onOpenSessionPage: (providerId: ProviderId) => void;
  onSetSourcePreference: (
    providerId: ProviderId,
    sourcePreference: ProviderSourcePreference,
  ) => void;
};

export function SettingsSourceSection({
  activeSessionPageAttachAvailable,
  carouselIndex,
  detail,
  eyebrow,
  focusedProviderId = null,
  i18n,
  providers,
  sectionId,
  sessionPageNavigationAvailable,
  settingsCopy,
  snapshots,
  title,
  userLevelVisibility,
  activePopover,
  onActivePopoverChange,
  onAttachActiveSessionPage,
  onCarouselIndexChange,
  onClearPageBinding,
  onOpenSessionPage,
  onSetSourcePreference,
}: SettingsSourceSectionProps) {
  function findSnapshot(providerId: ProviderId): ProviderSnapshot | null {
    return (
      snapshots.find((provider) => provider.providerId === providerId) ?? null
    );
  }

  const sourceItems: ProviderCarouselItem[] = providers.flatMap((provider) => {
    const snapshot = findSnapshot(provider.id);

    return snapshot
      ? [
          {
            id: provider.id,
            label: provider.label,
            content: (
              <SettingsSourceCard
                activeSessionPageAttachAvailable={
                  activeSessionPageAttachAvailable
                }
                i18n={i18n}
                provider={provider}
                sessionPageNavigationAvailable={sessionPageNavigationAvailable}
                settingsCopy={settingsCopy}
                snapshot={snapshot}
                userLevelVisibility={userLevelVisibility}
                activePopover={activePopover}
                onActivePopoverChange={onActivePopoverChange}
                onAttachActiveSessionPage={onAttachActiveSessionPage}
                onClearPageBinding={onClearPageBinding}
                onOpenSessionPage={onOpenSessionPage}
                onSetSourcePreference={onSetSourcePreference}
              />
            ),
          },
        ]
      : [];
  });
  const focusedSourceIndex = sourceItems.findIndex(
    (item) => item.id === focusedProviderId,
  );

  return (
    <section className="dashboard-section settings-section-anchor" id={sectionId}>
      <div className="dashboard-section__header">
        <div>
          <p className="section-label">{eyebrow}</p>
          <div className="section-title-with-info">
            <h2 className="section-title">{title}</h2>
            <MaterialInfoTooltip>{detail}</MaterialInfoTooltip>
          </div>
        </div>
      </div>

      <ProviderCarousel
        ariaLabel={title}
        initialIndex={
          focusedSourceIndex > -1 ? focusedSourceIndex : (carouselIndex ?? 0)
        }
        items={sourceItems}
        textDirection={i18n.resolvedTextDirection}
        onActiveItemChange={(_item, index) => onCarouselIndexChange?.(index)}
      />
    </section>
  );
}
