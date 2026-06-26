import type {
  AppState,
  AppSettings,
  ProgressItemsBySurface,
  ProviderOrderBySurface,
  ProviderSetting,
  ProviderSnapshot,
} from "../../providers/types";
import type {
  CustomSourceSetting,
  CustomSourceSyncState,
} from "../../shared/custom-sources";
import { getVisibleCustomSources } from "../../shared/custom-source-view-models";
import type { ProviderSourceDisplayCopy } from "../../shared/provider-sources";
import { filterDisplayEligibleProviderSettings } from "../../shared/provider-display-eligibility";
import type { buildSettingsLocalizedCopy } from "../../shared/settings-localized-copy";
import { MaterialInfoTooltip } from "./MaterialInfoTooltip";
import { ProviderOrderPreferenceControls } from "./ProviderOrderPreferenceControls";
import { ProviderProgressItemPreferenceControls } from "./ProviderProgressItemPreferenceControls";

type SettingsProviderDisplaySectionProps = {
  providers: ProviderSetting[];
  providerSourceDisplayCopy: ProviderSourceDisplayCopy;
  sectionId?: string;
  settings: AppSettings;
  settingsCopy: ReturnType<typeof buildSettingsLocalizedCopy>;
  snapshots: ProviderSnapshot[];
  providerProgressDetailsOpen?: Record<string, boolean>;
  customSources?: readonly CustomSourceSetting[];
  customSourceStates?: readonly CustomSourceSyncState[];
  onProviderOrderBySurfaceChange: (
    providerOrderBySurface: ProviderOrderBySurface,
  ) => void;
  onProgressItemsBySurfaceChange: (
    progressItemsBySurface: ProgressItemsBySurface,
  ) => void;
  onProviderProgressDetailsOpenChange?: (
    providerProgressDetailsOpen: Record<string, boolean>,
  ) => void;
};

export function SettingsProviderDisplaySection({
  providers,
  providerSourceDisplayCopy,
  sectionId,
  settings,
  settingsCopy,
  snapshots,
  customSources = [],
  customSourceStates = [],
  providerProgressDetailsOpen,
  onProviderOrderBySurfaceChange,
  onProgressItemsBySurfaceChange,
  onProviderProgressDetailsOpenChange,
}: SettingsProviderDisplaySectionProps) {
  const displayEligibleProviders = filterDisplayEligibleProviderSettings(
    providers,
    snapshots,
    providerSourceDisplayCopy,
  );
  const displayVisibleProviders = displayEligibleProviders.filter(
    (provider) => provider.displayEnabled,
  );
  const customSourceViewModels = getVisibleCustomSources({
    providers: snapshots,
    providerSettings: providers,
    settings,
    customSources: [...customSources],
    customSourceStates: [...customSourceStates],
  } satisfies AppState);
  const orderSources = [
    ...displayVisibleProviders.map((provider) => ({
      id: provider.id,
      label: provider.label,
    })),
    ...customSourceViewModels.map((source) => ({
      id: source.sourceId,
      label: `${source.label} · Custom`,
    })),
  ];
  const customProgressSources = customSourceViewModels.map((source) => ({
    id: source.sourceId,
    label: `${source.label} · Custom`,
    progressItems: source.progressItems,
  }));

  return (
    <section
      className="status-card settings-section-anchor settings-provider-display"
      data-settings-provider-display-section=""
      id={sectionId}
    >
      <div className="dashboard-section__header">
        <div className="section-title-with-info">
          <h2 className="section-title">
            {settingsCopy.preferenceGroups.providerDisplayShow}
          </h2>
          <MaterialInfoTooltip>
            {settingsCopy.preferenceGroups.providerDisplayDetail}
          </MaterialInfoTooltip>
        </div>
      </div>

      <div className="settings-provider-display__body">
        <ProviderOrderPreferenceControls
          copy={settingsCopy.providerOrder}
          providers={orderSources}
          providerOrderBySurface={settings.providerOrderBySurface}
          onChange={onProviderOrderBySurfaceChange}
        />

        <ProviderProgressItemPreferenceControls
          copy={settingsCopy.progressItems}
          customSources={customProgressSources}
          detailsOpenByProvider={providerProgressDetailsOpen}
          providers={displayVisibleProviders}
          snapshots={snapshots}
          progressItemsBySurface={settings.progressItemsBySurface}
          onChange={onProgressItemsBySurfaceChange}
          onDetailsOpenByProviderChange={onProviderProgressDetailsOpenChange}
        />
      </div>
    </section>
  );
}
