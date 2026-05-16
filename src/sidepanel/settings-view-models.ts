import type {
  ProviderSetting,
  ProviderSnapshot,
  SettingsUserLevel,
  SummaryItem,
} from "../providers/types";
import { buildProviderSourceDisplay } from "../shared/provider-sources";
import { resolveSettingsSetupStateKind } from "./settings-quick-setup-view-models";

export type {
  SettingsSessionTrackModel,
  SettingsSourceCardLabels,
  SettingsSourceCardModel,
  SettingsSourceChip,
  SettingsSourceDiagnosticGroup,
  SettingsSourceField,
} from "./settings-source-card-view-models";
export {
  buildSettingsSourceCardModel,
  buildSettingsSourceCompactFields,
  getCompactSourceSetupValue,
} from "./settings-source-card-view-models";
export type {
  SettingsQuickSetupActionId,
  SettingsQuickSetupActionModel,
  SettingsQuickSetupCardModel,
} from "./settings-quick-setup-view-models";
export { buildSettingsQuickSetupCardModel } from "./settings-quick-setup-view-models";

export type SettingsSummaryLabels = {
  enabled: string;
  connected: string;
  needsAction: string;
  storedSecrets: string;
  boundPages: string;
};

const DEFAULT_SETTINGS_SUMMARY_LABELS: SettingsSummaryLabels = {
  enabled: "Enabled",
  connected: "Connected",
  needsAction: "Needs action",
  storedSecrets: "Stored Secrets",
  boundPages: "Bound Pages",
};

type SettingsValueFormatter = (value: number) => string;

const DEFAULT_SETTINGS_VALUE_FORMATTER: SettingsValueFormatter = (value) =>
  String(value);

export function buildSettingsSummaryItems(
  providers: ProviderSetting[],
  snapshots: ProviderSnapshot[],
  userLevel: SettingsUserLevel = "basic",
  labels: SettingsSummaryLabels = DEFAULT_SETTINGS_SUMMARY_LABELS,
  formatValue: SettingsValueFormatter = DEFAULT_SETTINGS_VALUE_FORMATTER,
): SummaryItem[] {
  const snapshotMap = new Map(
    snapshots.map((snapshot) => [snapshot.providerId, snapshot]),
  );
  const enabledCount = providers.filter((provider) => provider.displayEnabled).length;
  let connectedCount = 0;
  let needsActionCount = 0;

  for (const provider of providers) {
    if (!provider.displayEnabled) {
      continue;
    }

    const snapshot = snapshotMap.get(provider.id);

    if (!snapshot) {
      needsActionCount += 1;
      continue;
    }

    const sourceDisplay = buildProviderSourceDisplay(snapshot, provider);
    const stateKind = resolveSettingsSetupStateKind(sourceDisplay, provider);

    if (stateKind === "ready") {
      connectedCount += 1;
      continue;
    }

    if (stateKind !== "policy_only") {
      needsActionCount += 1;
    }
  }

  const storedSecretsCount = providers.filter(
    (provider) => provider.credentialStatus === "configured",
  ).length;
  const boundPageCount = providers.filter(
    (provider) => provider.pageBinding.status === "bound",
  ).length;
  const items: SummaryItem[] = [
    {
      label: labels.enabled,
      value: formatValue(enabledCount),
      tone: "neutral",
    },
    {
      label: labels.connected,
      value: formatValue(connectedCount),
      tone: "neutral",
    },
    {
      label: labels.needsAction,
      value: formatValue(needsActionCount),
      tone: needsActionCount > 0 ? "warning" : "neutral",
    },
  ];

  if (userLevel === "developer" || userLevel === "debug") {
    items.push(
      {
        label: labels.storedSecrets,
        value: formatValue(storedSecretsCount),
        tone: "neutral",
      },
      {
        label: labels.boundPages,
        value: formatValue(boundPageCount),
        tone: "neutral",
      },
    );
  }

  return items;
}
