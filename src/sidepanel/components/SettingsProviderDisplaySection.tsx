import type {
  ApiGatewayMeteringDisplayPreferences,
  AppState,
  AppSettings,
  DisplaySurface,
  ProgressItemsBySurface,
  ProviderAccountId,
  ProviderAccountsByProvider,
  ProviderOrderBySurface,
  ProviderSetting,
  ProviderSnapshot,
  UsageHistoryModulesBySurface,
  ProviderServiceStatusVisibilityBySurface,
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
import { UsageHistoryModulePreferenceControls } from "./UsageHistoryModulePreferenceControls";
import type { ResolvedAppLocale } from "../../shared/i18n";
import { CursorUsageModulePreferenceControls } from "./CursorUsageModulePreferenceControls";
import { ProviderServiceStatusPreferenceControls } from "./ProviderServiceStatusPreferenceControls";
import { createDefaultApiGatewayMeteringDisplayPreferences } from "../../shared/api-gateway-metering";
import {
  getActiveProviderAccountId,
  getActiveProviderAccountMetadata,
} from "../../shared/provider-accounts";
import { SUB2API_PROVIDER_ID } from "../../shared/sub2api-deployments";
import { ApiGatewayMeteringModulePreferenceControls } from "./ApiGatewayMeteringModulePreferenceControls";
import { getSettingsAppearanceCopy } from "../../shared/settings-appearance-localized-copy";

type SettingsProviderDisplaySectionProps = {
  surface?: DisplaySurface;
  providers: ProviderSetting[];
  providerSourceDisplayCopy: ProviderSourceDisplayCopy;
  sectionId?: string;
  settings: AppSettings;
  settingsCopy: ReturnType<typeof buildSettingsLocalizedCopy>;
  snapshots: ProviderSnapshot[];
  providerAccounts?: ProviderAccountsByProvider;
  locale?: ResolvedAppLocale;
  providerProgressDetailsOpen?: Record<string, boolean>;
  customSources?: readonly CustomSourceSetting[];
  customSourceStates?: readonly CustomSourceSyncState[];
  onProviderOrderBySurfaceChange: (
    providerOrderBySurface: ProviderOrderBySurface,
  ) => void;
  onProgressItemsBySurfaceChange: (
    progressItemsBySurface: ProgressItemsBySurface,
  ) => void;
  onUsageHistoryModulesBySurfaceChange?: (
    usageHistoryModulesBySurface: UsageHistoryModulesBySurface,
  ) => void;
  onProviderServiceStatusVisibilityBySurfaceChange?: (
    value: ProviderServiceStatusVisibilityBySurface,
  ) => void;
  onProviderProgressDetailsOpenChange?: (
    providerProgressDetailsOpen: Record<string, boolean>,
  ) => void;
  onSub2ApiMeteringDisplayPreferencesChange?: (
    accountId: ProviderAccountId,
    preferences: ApiGatewayMeteringDisplayPreferences,
  ) => void;
};

export function SettingsProviderDisplaySection({
  surface,
  providers,
  providerSourceDisplayCopy,
  sectionId,
  settings,
  settingsCopy,
  snapshots,
  providerAccounts,
  locale = "en",
  customSources = [],
  customSourceStates = [],
  providerProgressDetailsOpen,
  onProviderOrderBySurfaceChange,
  onProgressItemsBySurfaceChange,
  onUsageHistoryModulesBySurfaceChange = () => undefined,
  onProviderServiceStatusVisibilityBySurfaceChange = () => undefined,
  onProviderProgressDetailsOpenChange,
  onSub2ApiMeteringDisplayPreferencesChange = () => undefined,
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
  const sub2ApiProvider = providers.find(
    ({ id }) => id === SUB2API_PROVIDER_ID,
  );
  const sub2ApiAccountId = getActiveProviderAccountId(
    { providerAccounts },
    SUB2API_PROVIDER_ID,
  );
  const sub2ApiDisplayPreferences =
    getActiveProviderAccountMetadata({ providerAccounts }, SUB2API_PROVIDER_ID)
      ?.apiGatewayMeteringDisplayPreferences ??
    createDefaultApiGatewayMeteringDisplayPreferences();

  return (
    <section
      className="status-card settings-section-anchor settings-provider-display"
      data-settings-provider-display-section=""
      data-settings-display-surface={surface}
      id={sectionId}
    >
      <div className="dashboard-section__header">
        <div className="section-title-with-info">
          <h2 className="section-title">
            {getSettingsAppearanceCopy(locale).content}
          </h2>
          {surface && (
            <span className="meta-chip">
              {settingsCopy.progressItems.surfaceLabels[surface]}
            </span>
          )}
          <MaterialInfoTooltip>
            {settingsCopy.preferenceGroups.providerDisplayDetail}
          </MaterialInfoTooltip>
        </div>
      </div>

      <div className="settings-provider-display__body">
        {sub2ApiProvider ? (
          <>
            <ApiGatewayMeteringModulePreferenceControls
              surface={surface}
              locale={locale}
              settingsCopy={settingsCopy}
              value={sub2ApiDisplayPreferences}
              onChange={(preferences) =>
                onSub2ApiMeteringDisplayPreferencesChange(
                  sub2ApiAccountId,
                  preferences,
                )
              }
            />
          </>
        ) : null}

        <ProviderOrderPreferenceControls
          surface={surface}
          copy={settingsCopy.providerOrder}
          providers={orderSources}
          providerOrderBySurface={settings.providerOrderBySurface}
          onChange={onProviderOrderBySurfaceChange}
        />

        <ProviderProgressItemPreferenceControls
          surface={surface}
          copy={settingsCopy.progressItems}
          customSources={customProgressSources}
          detailsOpenByProvider={providerProgressDetailsOpen}
          providers={displayVisibleProviders}
          snapshots={snapshots}
          progressItemsBySurface={settings.progressItemsBySurface}
          onChange={onProgressItemsBySurfaceChange}
          onDetailsOpenByProviderChange={onProviderProgressDetailsOpenChange}
        />

        <UsageHistoryModulePreferenceControls
          surface={surface}
          locale={locale}
          providers={displayVisibleProviders}
          settingsCopy={settingsCopy}
          snapshots={snapshots}
          value={settings.usageHistoryModulesBySurface}
          onChange={onUsageHistoryModulesBySurfaceChange}
        />

        <ProviderServiceStatusPreferenceControls
          surface={surface}
          locale={locale}
          settingsCopy={settingsCopy}
          value={settings.providerServiceStatusVisibilityBySurface}
          onChange={onProviderServiceStatusVisibilityBySurfaceChange}
        />

        {displayVisibleProviders.some(
          (provider) => provider.id === "cursor-personal-page",
        ) ? (
          <CursorUsageModulePreferenceControls
            surface={surface}
            locale={locale}
            settingsCopy={settingsCopy}
          />
        ) : null}
      </div>
    </section>
  );
}
