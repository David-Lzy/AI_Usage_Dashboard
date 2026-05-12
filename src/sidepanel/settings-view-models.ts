import type {
  ProviderId,
  ProviderTone,
  ProviderSetting,
  ProviderSnapshot,
  SettingsUserLevel,
  SummaryItem,
} from "../providers/types";
import {
  buildProviderSourceDisplay,
  type ProviderSourceDisplay,
  type ProviderSourceStateKind,
} from "../shared/provider-sources";
import type { buildSettingsLocalizedCopy } from "../shared/localized-copy";

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

export type SettingsSummaryLabels = {
  enabled: string;
  connected: string;
  needsAction: string;
  storedSecrets: string;
  boundPages: string;
};

export type SettingsQuickSetupActionId =
  | "enable_provider"
  | "disable_provider"
  | "grant_access"
  | "open_usage_page"
  | "open_page_and_sign_in"
  | "retry_page"
  | "open_source_page"
  | "use_current_page"
  | "disconnect_page";

export type SettingsQuickSetupActionModel = {
  id: SettingsQuickSetupActionId;
  label: string;
};

export type SettingsQuickSetupCardModel = {
  currentSetupValue: string;
  enabled: boolean;
  helperText: string;
  nextStepValue: string;
  pageStatusValue: string | null;
  primaryAction: SettingsQuickSetupActionModel | null;
  providerId: ProviderId;
  providerLabel: string;
  secondaryActions: SettingsQuickSetupActionModel[];
  statusLabel: string;
  statusTone: ProviderTone;
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
  const enabledCount = providers.filter((provider) => provider.enabled).length;
  let connectedCount = 0;
  let needsActionCount = 0;

  for (const provider of providers) {
    if (!provider.enabled) {
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

function buildQuickSetupCurrentValue(
  sourceDisplay: ProviderSourceDisplay,
  copy: ReturnType<typeof buildSettingsLocalizedCopy>,
) {
  if (sourceDisplay.currentPlan.kind === "policy_only") {
    return copy.quickSetup.currentSetup.policyOnly;
  }

  if (sourceDisplay.currentPlan.connectionMode === "page_session") {
    return copy.quickSetup.currentSetup.sessionPage;
  }

  return copy.quickSetup.currentSetup.savedConnection;
}

function resolveSettingsSetupStateKind(
  sourceDisplay: ProviderSourceDisplay,
  provider: ProviderSetting,
): ProviderSourceStateKind {
  if ((provider.hostOrigins?.length ?? 0) > 0 && provider.status === "missing") {
    return "host_access_missing";
  }

  return sourceDisplay.stateKind;
}

function buildQuickSetupHelperText(
  sourceDisplay: ProviderSourceDisplay,
  stateKind: ProviderSourceStateKind,
  provider: ProviderSetting,
  userLevel: SettingsUserLevel,
  copy: ReturnType<typeof buildSettingsLocalizedCopy>,
) {
  switch (stateKind) {
    case "ready":
      return sourceDisplay.currentPlan.connectionMode === "page_session"
        ? copy.quickSetup.helperText.readySessionPage
        : copy.quickSetup.helperText.readyCredential;
    case "policy_only":
      return copy.quickSetup.helperText.policyOnly;
    case "host_access_missing":
      return copy.quickSetup.helperText.hostAccessMissing(provider.hostsLabel);
    case "credential_missing":
      return userLevel === "basic"
        ? copy.quickSetup.helperText.credentialMissingBasic
        : copy.quickSetup.helperText.credentialMissingAdvanced;
    case "open_page_required":
      return copy.quickSetup.helperText.openPageRequired;
    case "logged_out":
      return copy.quickSetup.helperText.loggedOut;
    case "capture_unavailable":
      return copy.quickSetup.helperText.captureUnavailable;
    case "sync_error":
      return copy.quickSetup.helperText.syncError;
  }
}

export function buildSettingsQuickSetupCardModel(
  provider: ProviderSetting,
  snapshot: ProviderSnapshot,
  copy: ReturnType<typeof buildSettingsLocalizedCopy>,
  userLevel: SettingsUserLevel,
): SettingsQuickSetupCardModel {
  if (!provider.enabled) {
    return {
      currentSetupValue: copy.quickSetup.currentSetup.disabled,
      enabled: false,
      helperText: copy.quickSetup.helperText.disabled,
      nextStepValue: copy.quickSetup.actions.enableProvider,
      pageStatusValue: null,
      primaryAction: {
        id: "enable_provider",
        label: copy.quickSetup.actions.enableProvider,
      },
      providerId: provider.id,
      providerLabel: provider.label,
      secondaryActions: [],
      statusLabel: copy.quickSetup.currentSetup.disabled,
      statusTone: "neutral",
    };
  }

  const sourceDisplay = buildProviderSourceDisplay(snapshot, provider);
  const stateKind = resolveSettingsSetupStateKind(sourceDisplay, provider);
  const sessionPageAvailable =
    sourceDisplay.sessionPagePlan?.rolloutStage === "shipped";
  const secondaryActions: SettingsQuickSetupActionModel[] = [];
  let primaryAction: SettingsQuickSetupActionModel | null = null;
  let nextStepValue = copy.quickSetup.noActionNeeded;

  switch (stateKind) {
    case "host_access_missing":
      primaryAction = {
        id: "grant_access",
        label: copy.quickSetup.actions.grantAccess,
      };
      nextStepValue = primaryAction.label;
      break;
    case "open_page_required":
      primaryAction = {
        id: "open_usage_page",
        label: copy.quickSetup.actions.openUsagePage,
      };
      nextStepValue = primaryAction.label;
      break;
    case "logged_out":
      primaryAction = {
        id: "open_page_and_sign_in",
        label: copy.quickSetup.actions.openAndSignIn,
      };
      nextStepValue = primaryAction.label;
      break;
    case "capture_unavailable":
      primaryAction = {
        id: "retry_page",
        label: copy.quickSetup.actions.retryPage,
      };
      nextStepValue = primaryAction.label;
      break;
    case "credential_missing":
      nextStepValue =
        userLevel === "basic"
          ? copy.quickSetup.helperText.credentialMissingBasic
          : copy.quickSetup.helperText.credentialMissingAdvanced;
      break;
    case "sync_error":
      nextStepValue = copy.quickSetup.helperText.syncError;
      break;
  }

  if (
    sessionPageAvailable &&
    !secondaryActions.some((action) => action.id === "open_source_page")
  ) {
    secondaryActions.push({
      id: "open_source_page",
      label: copy.quickSetup.actions.openSourcePage,
    });
  }

  if (sessionPageAvailable) {
    secondaryActions.push(
      {
        id: "use_current_page",
        label: copy.quickSetup.actions.useCurrentPage,
      },
      {
        id: "disconnect_page",
        label: copy.quickSetup.actions.disconnectPage,
      },
    );
  }

  return {
    currentSetupValue: buildQuickSetupCurrentValue(sourceDisplay, copy),
    enabled: true,
    helperText: buildQuickSetupHelperText(
      sourceDisplay,
      stateKind,
      provider,
      userLevel,
      copy,
    ),
    nextStepValue,
    pageStatusValue: sourceDisplay.pageBindingLabel,
    primaryAction,
    providerId: provider.id,
    providerLabel: provider.label,
    secondaryActions,
    statusLabel:
      stateKind === "host_access_missing"
        ? copy.permissions.hostAccessMissing
        : sourceDisplay.stateLabel,
    statusTone:
      stateKind === "host_access_missing" ? "warning" : sourceDisplay.stateTone,
  };
}
