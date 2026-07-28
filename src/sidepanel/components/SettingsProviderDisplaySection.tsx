import type {
  ApiGatewayMeteringDisplayPreferences,
  AppState,
  AppSettings,
  ProgressItemsBySurface,
  ProviderAccountId,
  ProviderAccountsByProvider,
  ProviderId,
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
import { ProviderAccountSelector } from "./ProviderAccountSelector";
import { createRuntimeI18n } from "../../shared/i18n";
import {
  createDefaultApiGatewayMeteringDisplayPreferences,
} from "../../shared/api-gateway-metering";
import {
  getActiveProviderAccountId,
  getActiveProviderAccountMetadata,
  getProviderAccountOptions,
} from "../../shared/provider-accounts";
import type { Sub2ApiDeploymentDraft } from "../../shared/sub2api-deployments";
import { SUB2API_PROVIDER_ID } from "../../shared/sub2api-deployments";
import { Sub2ApiDeploymentSettings } from "./Sub2ApiDeploymentSettings";
import { ApiGatewayMeteringModulePreferenceControls } from "./ApiGatewayMeteringModulePreferenceControls";

type SettingsProviderDisplaySectionProps = {
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
  onSelectProviderAccount?: (
    providerId: ProviderId,
    accountId: ProviderAccountId,
  ) => void;
  onSaveSub2ApiDeployment?: (
    draft: Sub2ApiDeploymentDraft,
    testConnection: boolean,
  ) => void;
  onTestSub2ApiDeployment?: () => Promise<boolean>;
  onDisconnectSub2ApiDeployment?: (
    accountId: ProviderAccountId,
    retainCachedSummary: boolean,
  ) => void;
  onRemoveSub2ApiDeployment?: (accountId: ProviderAccountId) => void;
  onSub2ApiMeteringDisplayPreferencesChange?: (
    accountId: ProviderAccountId,
    preferences: ApiGatewayMeteringDisplayPreferences,
  ) => void;
};

export function SettingsProviderDisplaySection({
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
  onSelectProviderAccount = () => undefined,
  onSaveSub2ApiDeployment = () => undefined,
  onTestSub2ApiDeployment = async () => false,
  onDisconnectSub2ApiDeployment = () => undefined,
  onRemoveSub2ApiDeployment = () => undefined,
  onSub2ApiMeteringDisplayPreferencesChange = () => undefined,
}: SettingsProviderDisplaySectionProps) {
  const i18n = createRuntimeI18n(
    locale,
    typeof window !== "undefined" ? window : undefined,
  );
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
  const multiAccountProviders = displayVisibleProviders.filter(
    (provider) =>
      provider.id !== SUB2API_PROVIDER_ID &&
      getProviderAccountOptions({ providerAccounts }, provider.id),
  );
  const sub2ApiProvider = providers.find(
    ({ id }) => id === SUB2API_PROVIDER_ID,
  );
  const sub2ApiSnapshot =
    snapshots.find(({ providerId }) => providerId === SUB2API_PROVIDER_ID) ??
    null;
  const sub2ApiAccountId = getActiveProviderAccountId(
    { providerAccounts },
    SUB2API_PROVIDER_ID,
  );
  const sub2ApiDisplayPreferences =
    getActiveProviderAccountMetadata(
      { providerAccounts },
      SUB2API_PROVIDER_ID,
    )?.apiGatewayMeteringDisplayPreferences ??
    createDefaultApiGatewayMeteringDisplayPreferences();

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
        {sub2ApiProvider ? (
          <>
            <Sub2ApiDeploymentSettings
              locale={locale}
              providerAccounts={providerAccounts}
              snapshot={sub2ApiSnapshot}
              onSelectAccount={(accountId) =>
                onSelectProviderAccount(SUB2API_PROVIDER_ID, accountId)
              }
              onSave={onSaveSub2ApiDeployment}
              onTest={onTestSub2ApiDeployment}
              onDisconnect={onDisconnectSub2ApiDeployment}
              onRemove={onRemoveSub2ApiDeployment}
            />
            <ApiGatewayMeteringModulePreferenceControls
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

        {multiAccountProviders.length > 0 ? (
          <div
            className="provider-account-settings"
            data-provider-account-settings=""
          >
            <h3 className="settings-subsection-title">
              {i18n.t("provider.account.settings_title")}
            </h3>
            <div className="provider-account-settings__grid">
              {multiAccountProviders.map((provider) => (
                <ProviderAccountSelector
                  key={provider.id}
                  accountLabel={`${provider.label} · ${i18n.t("provider.account.selector_label")}`}
                  providerId={provider.id}
                  providerAccounts={providerAccounts}
                  onChange={onSelectProviderAccount}
                />
              ))}
            </div>
          </div>
        ) : null}

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

        <UsageHistoryModulePreferenceControls
          locale={locale}
          providers={displayVisibleProviders}
          settingsCopy={settingsCopy}
          snapshots={snapshots}
          value={settings.usageHistoryModulesBySurface}
          onChange={onUsageHistoryModulesBySurfaceChange}
        />

        <ProviderServiceStatusPreferenceControls
          locale={locale}
          settingsCopy={settingsCopy}
          value={settings.providerServiceStatusVisibilityBySurface}
          onChange={onProviderServiceStatusVisibilityBySurfaceChange}
        />

        {displayVisibleProviders.some(
          (provider) => provider.id === "cursor-personal-page",
        ) ? (
          <CursorUsageModulePreferenceControls
            locale={locale}
            settingsCopy={settingsCopy}
          />
        ) : null}
      </div>
    </section>
  );
}
