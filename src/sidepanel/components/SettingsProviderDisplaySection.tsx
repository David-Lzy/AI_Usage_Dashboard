import type {
  AppSettings,
  ProgressItemsBySurface,
  ProviderOrderBySurface,
  ProviderSetting,
  ProviderSnapshot,
} from "../../providers/types";
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
  onProviderOrderBySurfaceChange: (
    providerOrderBySurface: ProviderOrderBySurface,
  ) => void;
  onProgressItemsBySurfaceChange: (
    progressItemsBySurface: ProgressItemsBySurface,
  ) => void;
};

export function SettingsProviderDisplaySection({
  providers,
  providerSourceDisplayCopy,
  sectionId,
  settings,
  settingsCopy,
  snapshots,
  onProviderOrderBySurfaceChange,
  onProgressItemsBySurfaceChange,
}: SettingsProviderDisplaySectionProps) {
  const displayEligibleProviders = filterDisplayEligibleProviderSettings(
    providers,
    snapshots,
    providerSourceDisplayCopy,
  );
  const displayVisibleProviders = displayEligibleProviders.filter(
    (provider) => provider.enabled,
  );

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
          providers={displayVisibleProviders}
          providerOrderBySurface={settings.providerOrderBySurface}
          onChange={onProviderOrderBySurfaceChange}
        />

        <ProviderProgressItemPreferenceControls
          copy={settingsCopy.progressItems}
          providers={displayVisibleProviders}
          snapshots={snapshots}
          progressItemsBySurface={settings.progressItemsBySurface}
          onChange={onProgressItemsBySurfaceChange}
        />
      </div>
    </section>
  );
}
