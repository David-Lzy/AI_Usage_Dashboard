import type {
  ProviderSourceKind,
  ProviderTone,
  ProviderSetting,
  ProviderSnapshot,
  SummaryItem,
} from "../providers/types";
import {
  getOpenableRouteHint,
  type ProviderSourceDisplay,
} from "../shared/provider-sources";
import type { ProviderDiagnosticPresentation } from "../shared/localized-copy";

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
  visible: string;
  storedSecrets: string;
  boundPages: string;
  needsAccess: string;
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
  visible: "Visible",
  storedSecrets: "Stored Secrets",
  boundPages: "Bound Pages",
  needsAccess: "Needs Access",
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
  _snapshots: ProviderSnapshot[],
  labels: SettingsSummaryLabels = DEFAULT_SETTINGS_SUMMARY_LABELS,
  formatValue: SettingsValueFormatter = DEFAULT_SETTINGS_VALUE_FORMATTER,
): SummaryItem[] {
  const visibleCount = providers.filter((provider) => provider.enabled).length;
  const storedSecretsCount = providers.filter(
    (provider) => provider.credentialStatus === "configured",
  ).length;
  const boundPageCount = providers.filter(
    (provider) => provider.pageBinding.status === "bound",
  ).length;
  const accessGapCount = providers.filter(
    (provider) => provider.enabled && provider.status === "missing",
  ).length;

  return [
    {
      label: labels.visible,
      value: formatValue(visibleCount),
      tone: "neutral",
    },
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
    {
      label: labels.needsAccess,
      value: formatValue(accessGapCount),
      tone: accessGapCount > 0 ? "warning" : "neutral",
    },
  ];
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
