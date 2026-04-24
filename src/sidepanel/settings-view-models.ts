import type {
  ProviderTone,
  ProviderSetting,
  ProviderSnapshot,
  SummaryItem,
} from "../providers/types";
import {
  getOpenableRouteHint,
  getRolloutStageLabel,
  getSourceKindLabel,
  type ProviderSourceDisplay,
} from "../shared/provider-sources";

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

const DEFAULT_SETTINGS_SUMMARY_LABELS: SettingsSummaryLabels = {
  visible: "Visible",
  storedSecrets: "Stored Secrets",
  boundPages: "Bound Pages",
  needsAccess: "Needs Access",
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
): SettingsSessionTrackModel | null {
  const sessionPagePlan = sourceDisplay.sessionPagePlan;

  if (!sessionPagePlan) {
    return null;
  }

  const routeHint = getOpenableRouteHint(sessionPagePlan.routeHints);
  const chips = [
    {
      label: getRolloutStageLabel(sessionPagePlan.rolloutStage),
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
          tone:
            sourceDisplay.sessionPageFidelityLabel === "Exact vendor value"
              ? "neutral"
              : "warning",
        }
      : null,
  ].filter((chip): chip is SettingsSourceChip => chip !== null);

  const fields = [
    buildField("Route", routeHint ?? "Open from provider settings"),
    buildField("Availability", sourceDisplay.sessionPageAvailabilitySummary),
    buildField("Graduation gate", sourceDisplay.sessionPageGraduationGateLabel),
  ].filter((field): field is SettingsSourceField => field !== null);

  const noteLines = [
    sourceDisplay.sessionPageContractDetail,
    sourceDisplay.sessionPageFidelityDetail,
    sourceDisplay.sessionPageGraduationGateDetail
      ? `Graduation gate: ${sourceDisplay.sessionPageGraduationGateDetail}`
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
): SettingsSourceCardModel {
  const primaryFields = [
    buildField("Access model", sourceDisplay.accessModelLabel),
    buildField("Availability summary", sourceDisplay.availabilitySummary),
    buildField(
      "Fallback",
      sourceDisplay.fallbackPlans.length > 0
        ? sourceDisplay.fallbackPlans
            .map((plan) => getSourceKindLabel(plan.kind))
            .join(" · ")
        : "None",
    ),
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
      "Source decision",
      [
        buildField("Selection reason", sourceDisplay.sourceSelectionReason),
        buildField("Fallback reason", sourceDisplay.sourceFallbackReason),
        buildField("Readiness detail", sourceDisplay.stateDetail),
        buildField("Graduation gate", sourceDisplay.currentGraduationGateLabel),
      ],
      [
        sourceDisplay.currentGraduationGateDetail
          ? `Graduation gate: ${sourceDisplay.currentGraduationGateDetail}`
          : null,
        sourceDisplay.currentPlan.note,
      ],
    ),
    buildDiagnosticGroup(
      "Value semantics",
      [
        buildField("Fidelity detail", sourceDisplay.fidelityDetail),
        buildField("Used value", sourceDisplay.usedAvailabilityLabel),
        buildField("Remaining value", sourceDisplay.remainingAvailabilityLabel),
        buildField("Reset value", sourceDisplay.resetAvailabilityLabel),
      ],
      [],
    ),
    buildDiagnosticGroup(
      "Trust boundary",
      [
        buildField("Access model", sourceDisplay.accessModelLabel),
        buildField(
          "Credential persistence",
          sourceDisplay.credentialPersistenceLabel,
        ),
        buildField("Cookie storage", sourceDisplay.cookiePolicyLabel),
        buildField(
          "Manual cookie import",
          sourceDisplay.manualCookieImportLabel,
        ),
        buildField("Host access", sourceDisplay.hostAccessLabel),
        buildField("Page binding", sourceDisplay.pageBindingLabel),
        buildField("Binding mode", sourceDisplay.pageBindingModeLabel),
        buildField("Binding detail", sourceDisplay.pageBindingDetail),
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
    sessionTrack: buildSessionTrackModel(sourceDisplay),
    diagnosticGroups,
    diagnosticsCount,
  };
}
