import type {
  ProviderId,
  ProviderSourceKind,
  ProviderTone,
  ProviderSetting,
  ProviderSnapshot,
  SettingsUserLevel,
  SummaryItem,
} from "../providers/types";
import {
  buildProviderSourceDisplay,
  getOpenableRouteHint,
  type ProviderSourceDisplay,
  type ProviderSourceStateKind,
} from "../shared/provider-sources";
import type {
  ProviderDiagnosticPresentation,
  buildSettingsLocalizedCopy,
} from "../shared/localized-copy";

export type SettingsSourceField = {
  label: string;
  value: string;
};

export type SettingsSourceDiagnosticGroup = {
  title: string;
  fields: SettingsSourceField[];
  noteLines: string[];
};

export type SettingsSourceChip = {
  label: string;
  tone: ProviderTone;
};

export type SettingsSessionTrackModel = {
  title: string;
  chips: SettingsSourceChip[];
  fields: SettingsSourceField[];
  noteLines: string[];
  noteTone: ProviderTone | null;
};

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

export type SettingsSourceCardLabels = {
  primary: {
    accessModel: string;
    availabilitySummary: string;
    fallback: string;
    noneFallback: string;
    route: string;
    availability: string;
    graduationGate: string;
    selectionReason: string;
    fallbackReason: string;
    selectionDiagnostic: string;
    selectionDiagnosticSummary: string;
    fallbackDiagnostic: string;
    fallbackDiagnosticSummary: string;
    diagnostic: string;
    diagnosticSummary: string;
    readinessDetail: string;
    fidelityDetail: string;
    usedValue: string;
    remainingValue: string;
    resetValue: string;
    credentialPersistence: string;
    cookieStorage: string;
    manualCookieImport: string;
    hostAccess: string;
    pageBinding: string;
    bindingMode: string;
    bindingDetail: string;
  };
  groups: {
    sourceDecision: string;
    valueSemantics: string;
    trustBoundary: string;
  };
  notes: {
    graduationGatePrefix: string;
  };
  sourceKindLabels?: Record<ProviderSourceKind, string>;
  routeFallback?: string;
};

const DEFAULT_SETTINGS_SUMMARY_LABELS: SettingsSummaryLabels = {
  enabled: "Enabled",
  connected: "Connected",
  needsAction: "Needs action",
  storedSecrets: "Stored Secrets",
  boundPages: "Bound Pages",
};

const DEFAULT_SETTINGS_SOURCE_CARD_LABELS: SettingsSourceCardLabels = {
  primary: {
    accessModel: "Access model",
    availabilitySummary: "Availability summary",
    fallback: "Fallback",
    noneFallback: "None",
    route: "Route",
    availability: "Availability",
    graduationGate: "Graduation gate",
    selectionReason: "Selection reason",
    fallbackReason: "Fallback reason",
    selectionDiagnostic: "Selection diagnostic",
    selectionDiagnosticSummary: "Selection summary",
    fallbackDiagnostic: "Fallback diagnostic",
    fallbackDiagnosticSummary: "Fallback summary",
    diagnostic: "Diagnostic",
    diagnosticSummary: "Diagnostic summary",
    readinessDetail: "Readiness detail",
    fidelityDetail: "Fidelity detail",
    usedValue: "Used value",
    remainingValue: "Remaining value",
    resetValue: "Reset value",
    credentialPersistence: "Credential persistence",
    cookieStorage: "Cookie storage",
    manualCookieImport: "Manual cookie import",
    hostAccess: "Host access",
    pageBinding: "Page binding",
    bindingMode: "Binding mode",
    bindingDetail: "Binding detail",
  },
  groups: {
    sourceDecision: "Source decision",
    valueSemantics: "Value semantics",
    trustBoundary: "Trust boundary",
  },
  notes: {
    graduationGatePrefix: "Graduation gate: ",
  },
  sourceKindLabels: {
    official_api: "Official API",
    session_page: "Session page",
    policy_only: "Policy only",
  },
  routeFallback: "Open from provider settings",
};

type SettingsValueFormatter = (value: number) => string;

const DEFAULT_SETTINGS_VALUE_FORMATTER: SettingsValueFormatter = (value) =>
  String(value);

export type SettingsSourceCardModel = {
  primaryFields: SettingsSourceField[];
  summaryNoteLines: string[];
  summaryNoteTone: ProviderTone | null;
  sessionTrack: SettingsSessionTrackModel | null;
  diagnosticGroups: SettingsSourceDiagnosticGroup[];
  diagnosticsCount: number;
};

function buildField(label: string, value: string | null | undefined) {
  const normalizedValue = (value ?? "").trim();

  if (!normalizedValue) {
    return null;
  }

  return {
    label,
    value: normalizedValue,
  };
}

function buildDiagnosticGroup(
  title: string,
  fields: Array<SettingsSourceField | null>,
  noteLines: Array<string | null | undefined>,
): SettingsSourceDiagnosticGroup | null {
  const normalizedFields = fields.filter(
    (field): field is SettingsSourceField => field !== null,
  );
  const normalizedNoteLines = noteLines.filter((line): line is string =>
    Boolean(line?.trim()),
  );

  if (normalizedFields.length === 0 && normalizedNoteLines.length === 0) {
    return null;
  }

  return {
    title,
    fields: normalizedFields,
    noteLines: normalizedNoteLines,
  };
}

function buildSessionTrackModel(
  sourceDisplay: ProviderSourceDisplay,
  labels: SettingsSourceCardLabels = DEFAULT_SETTINGS_SOURCE_CARD_LABELS,
): SettingsSessionTrackModel | null {
  const sessionPagePlan = sourceDisplay.sessionPagePlan;

  if (!sessionPagePlan) {
    return null;
  }

  const routeHint = getOpenableRouteHint(sessionPagePlan.routeHints);
  const chips = [
    {
      label:
        sourceDisplay.sessionPageRolloutStageLabel ??
        sessionPagePlan.rolloutStage,
      tone:
        sessionPagePlan.rolloutStage === "shipped" ? "neutral" : "warning",
    },
    sourceDisplay.sessionPageContractLabel
      ? {
          label: sourceDisplay.sessionPageContractLabel,
          tone:
            sessionPagePlan.rolloutStage === "shipped" ? "neutral" : "warning",
        }
      : null,
    sourceDisplay.sessionPageFidelityLabel
      ? {
          label: sourceDisplay.sessionPageFidelityLabel,
          tone: sourceDisplay.sessionPageFidelityTone ?? "warning",
        }
      : null,
  ].filter((chip): chip is SettingsSourceChip => chip !== null);

  const fields = [
    buildField(labels.primary.route, routeHint ?? labels.routeFallback ?? DEFAULT_SETTINGS_SOURCE_CARD_LABELS.routeFallback),
    buildField(labels.primary.availability, sourceDisplay.sessionPageAvailabilitySummary),
    buildField(labels.primary.graduationGate, sourceDisplay.sessionPageGraduationGateLabel),
  ].filter((field): field is SettingsSourceField => field !== null);

  const noteLines = [
    sourceDisplay.sessionPageContractDetail,
    sourceDisplay.sessionPageFidelityDetail,
    sourceDisplay.sessionPageGraduationGateDetail
      ? `${labels.notes.graduationGatePrefix}${sourceDisplay.sessionPageGraduationGateDetail}`
      : null,
  ].filter((line, index, lines): line is string => {
    const normalizedLine = line?.trim();

    return Boolean(normalizedLine) && lines.indexOf(line) === index;
  });

  return {
    title: sessionPagePlan.label,
    chips,
    fields,
    noteLines,
    noteTone:
      noteLines.length === 0
        ? null
        : sessionPagePlan.rolloutStage === "shipped"
          ? "neutral"
          : "warning",
  };
}

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

export function getCompactSourceSetupValue(
  sourceDisplay: ProviderSourceDisplay,
  copy: ReturnType<typeof buildSettingsLocalizedCopy>,
) {
  if (sourceDisplay.currentPlan.kind === "policy_only") {
    return copy.sources.compactCurrentSetup.policyOnly;
  }

  if (sourceDisplay.currentPlan.connectionMode === "page_session") {
    return copy.sources.compactCurrentSetup.sessionPage;
  }

  return copy.sources.compactCurrentSetup.savedConnection;
}

export function buildSettingsSourceCompactFields(
  sourceDisplay: ProviderSourceDisplay,
  copy: ReturnType<typeof buildSettingsLocalizedCopy>,
): SettingsSourceField[] {
  return [
    {
      label: copy.sources.compactFields.currentSetup,
      value: getCompactSourceSetupValue(sourceDisplay, copy),
    },
    {
      label: copy.sources.compactFields.setupStatus,
      value: sourceDisplay.stateLabel,
    },
    sourceDisplay.pageBindingLabel
      ? {
          label: copy.sources.compactFields.pageStatus,
          value: sourceDisplay.pageBindingLabel,
        }
      : null,
    sourceDisplay.sessionPagePlan
      ? {
          label: copy.sources.compactFields.pageRoute,
          value:
            getOpenableRouteHint(sourceDisplay.sessionPagePlan.routeHints) ??
            copy.sources.routeFallback,
        }
      : null,
  ].filter((field): field is SettingsSourceField => field !== null);
}

export function buildSettingsSourceCardModel(
  sourceDisplay: ProviderSourceDisplay,
  labels: SettingsSourceCardLabels = DEFAULT_SETTINGS_SOURCE_CARD_LABELS,
  warningDiagnosticPresentation: ProviderDiagnosticPresentation | null = null,
  sourceSelectionDiagnosticPresentation: ProviderDiagnosticPresentation | null = null,
  sourceFallbackDiagnosticPresentation: ProviderDiagnosticPresentation | null = null,
): SettingsSourceCardModel {
  const fallbackValue =
    sourceDisplay.fallbackPlans.length > 0
      ? sourceDisplay.fallbackPlans
          .map((plan) => ((labels.sourceKindLabels ?? DEFAULT_SETTINGS_SOURCE_CARD_LABELS.sourceKindLabels!)[plan.kind] ?? plan.kind))
          .join(" · ")
      : labels.primary.noneFallback;

  const primaryFields = [
    buildField(labels.primary.accessModel, sourceDisplay.accessModelLabel),
    buildField(labels.primary.availabilitySummary, sourceDisplay.availabilitySummary),
    buildField(labels.primary.fallback, fallbackValue),
  ].filter((field): field is SettingsSourceField => field !== null);

  const summaryNoteLines = [
    sourceDisplay.sourceFallbackReason,
    sourceDisplay.stateKind !== "ready" &&
    sourceDisplay.stateKind !== "policy_only"
      ? sourceDisplay.stateDetail
      : null,
  ].filter((line, index, lines): line is string => {
    const normalizedLine = line?.trim();

    return Boolean(normalizedLine) && lines.indexOf(line) === index;
  });

  const summaryNoteTone =
    summaryNoteLines.length === 0
      ? null
      : sourceDisplay.stateTone === "error"
        ? "error"
        : "warning";

  const diagnosticGroups = [
    buildDiagnosticGroup(
      labels.groups.sourceDecision,
      [
        buildField(labels.primary.selectionReason, sourceDisplay.sourceSelectionReason),
        buildField(
          labels.primary.selectionDiagnostic,
          sourceSelectionDiagnosticPresentation?.label,
        ),
        buildField(
          labels.primary.selectionDiagnosticSummary,
          sourceSelectionDiagnosticPresentation?.summary,
        ),
        buildField(labels.primary.fallbackReason, sourceDisplay.sourceFallbackReason),
        buildField(
          labels.primary.fallbackDiagnostic,
          sourceFallbackDiagnosticPresentation?.label,
        ),
        buildField(
          labels.primary.fallbackDiagnosticSummary,
          sourceFallbackDiagnosticPresentation?.summary,
        ),
        buildField(
          labels.primary.diagnostic,
          warningDiagnosticPresentation?.label,
        ),
        buildField(
          labels.primary.diagnosticSummary,
          warningDiagnosticPresentation?.summary,
        ),
        buildField(labels.primary.readinessDetail, sourceDisplay.stateDetail),
        buildField(labels.primary.graduationGate, sourceDisplay.currentGraduationGateLabel),
      ],
      [
        sourceDisplay.currentGraduationGateDetail
          ? `${labels.notes.graduationGatePrefix}${sourceDisplay.currentGraduationGateDetail}`
          : null,
        sourceDisplay.currentPlan.note,
      ],
    ),
    buildDiagnosticGroup(
      labels.groups.valueSemantics,
      [
        buildField(labels.primary.fidelityDetail, sourceDisplay.fidelityDetail),
        buildField(labels.primary.usedValue, sourceDisplay.usedAvailabilityLabel),
        buildField(labels.primary.remainingValue, sourceDisplay.remainingAvailabilityLabel),
        buildField(labels.primary.resetValue, sourceDisplay.resetAvailabilityLabel),
      ],
      [],
    ),
    buildDiagnosticGroup(
      labels.groups.trustBoundary,
      [
        buildField(labels.primary.accessModel, sourceDisplay.accessModelLabel),
        buildField(
          labels.primary.credentialPersistence,
          sourceDisplay.credentialPersistenceLabel,
        ),
        buildField(labels.primary.cookieStorage, sourceDisplay.cookiePolicyLabel),
        buildField(
          labels.primary.manualCookieImport,
          sourceDisplay.manualCookieImportLabel,
        ),
        buildField(labels.primary.hostAccess, sourceDisplay.hostAccessLabel),
        buildField(labels.primary.pageBinding, sourceDisplay.pageBindingLabel),
        buildField(labels.primary.bindingMode, sourceDisplay.pageBindingModeLabel),
        buildField(labels.primary.bindingDetail, sourceDisplay.pageBindingDetail),
      ],
      [
        sourceDisplay.accessModelDetail,
        sourceDisplay.credentialPersistenceDetail,
        sourceDisplay.cookiePolicyDetail,
        sourceDisplay.manualCookieImportDetail,
        sourceDisplay.hostAccessDetail,
      ],
    ),
  ].filter(
    (group): group is SettingsSourceDiagnosticGroup => group !== null,
  );

  const diagnosticsCount = diagnosticGroups.reduce(
    (count, group) => count + group.fields.length + group.noteLines.length,
    0,
  );

  return {
    primaryFields,
    summaryNoteLines,
    summaryNoteTone,
    sessionTrack: buildSessionTrackModel(sourceDisplay, labels),
    diagnosticGroups,
    diagnosticsCount,
  };
}
