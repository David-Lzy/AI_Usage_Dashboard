import type { InteractionAuditSignoffImportErrorCode } from "../shared/interaction-audit-signoff-import-error-codes";

export type InteractionAuditSignoffStatus =
  | "not_reviewed"
  | "pass"
  | "follow_up";

export type InteractionAuditSurfaceSignoffDefinition = {
  id: string;
  title: string;
  description: string;
  manualChecks: string[];
};

export type InteractionAuditSurfaceSignoffState = {
  manualCheckStates: boolean[];
  operatorNotes: string;
  signoffStatus: InteractionAuditSignoffStatus;
};

export type InteractionAuditSignoffState = Record<
  string,
  InteractionAuditSurfaceSignoffState
>;

export type InteractionAuditSignoffMetadata = {
  reviewerName: string;
  sessionLabel: string;
  reviewedAt: string;
};

export type InteractionAuditSignoffRequestContext = {
  requestId: string;
  requestCreatedAt: string;
  requestRevisionSha256: string;
};

export type InteractionAuditSignoffExport = {
  metadata: InteractionAuditSignoffMetadata;
  requestContext: InteractionAuditSignoffRequestContext;
  summary: {
    reviewedSurfaceCount: number;
    passSurfaceCount: number;
    followUpSurfaceCount: number;
    completedManualCheckCount: number;
    totalManualCheckCount: number;
  };
  surfaces: Array<{
    id: string;
    title: string;
    description: string;
    signoffStatus: InteractionAuditSignoffStatus;
    operatorNotes: string;
    manualChecks: Array<{
      label: string;
      completed: boolean;
    }>;
  }>;
};

export type InteractionAuditSignoffHandoffSurface = {
  id: string;
  title: string;
  description: string;
  signoffStatus: InteractionAuditSignoffStatus;
  operatorNotes: string;
  completedManualCheckCount: number;
  totalManualCheckCount: number;
  pendingManualChecks: string[];
};

export type InteractionAuditSignoffHandoffSummary = {
  totalSurfaceCount: number;
  reviewedSurfaceCount: number;
  passSurfaceCount: number;
  followUpSurfaceCount: number;
  notReviewedSurfaceCount: number;
  completedManualCheckCount: number;
  totalManualCheckCount: number;
  pendingManualCheckCount: number;
  readyForSignoff: boolean;
  surfaces: InteractionAuditSignoffHandoffSurface[];
  followUpSurfaces: InteractionAuditSignoffHandoffSurface[];
  notReviewedSurfaces: InteractionAuditSignoffHandoffSurface[];
  surfacesWithPendingChecks: InteractionAuditSignoffHandoffSurface[];
};

export type InteractionAuditSignoffImportResult =
  | {
      ok: true;
      state: InteractionAuditSignoffState;
      metadata: InteractionAuditSignoffMetadata;
      requestContext: InteractionAuditSignoffRequestContext;
    }
  | {
      ok: false;
      code: InteractionAuditSignoffImportErrorCode;
      error: string;
    };

export type { InteractionAuditSignoffImportErrorCode } from "../shared/interaction-audit-signoff-import-error-codes";

export const INTERACTION_AUDIT_SIGNOFF_STORAGE_KEY =
  "ai-usage-dashboard:interaction-audit-signoff:v1";
export const INTERACTION_AUDIT_SIGNOFF_METADATA_STORAGE_KEY =
  "ai-usage-dashboard:interaction-audit-signoff-metadata:v1";
export const INTERACTION_AUDIT_SIGNOFF_REQUEST_CONTEXT_STORAGE_KEY =
  "ai-usage-dashboard:interaction-audit-signoff-request-context:v1";

let memoryFallbackState: InteractionAuditSignoffState | null = null;
let memoryFallbackMetadata: InteractionAuditSignoffMetadata | null = null;
let memoryFallbackRequestContext: InteractionAuditSignoffRequestContext | null =
  null;

function cloneSignoffState(
  state: InteractionAuditSignoffState,
): InteractionAuditSignoffState {
  return structuredClone(state);
}

function cloneSignoffMetadata(
  metadata: InteractionAuditSignoffMetadata,
): InteractionAuditSignoffMetadata {
  return structuredClone(metadata);
}

function cloneSignoffRequestContext(
  requestContext: InteractionAuditSignoffRequestContext,
): InteractionAuditSignoffRequestContext {
  return structuredClone(requestContext);
}

function hasLocalStorage(): boolean {
  return (
    typeof globalThis.localStorage?.getItem === "function" &&
    typeof globalThis.localStorage?.setItem === "function" &&
    typeof globalThis.localStorage?.removeItem === "function"
  );
}

function normalizeSignoffStatus(value: unknown): InteractionAuditSignoffStatus {
  if (value === "pass" || value === "follow_up") {
    return value;
  }

  return "not_reviewed";
}

function buildSurfaceState(
  definition: InteractionAuditSurfaceSignoffDefinition,
): InteractionAuditSurfaceSignoffState {
  return {
    manualCheckStates: definition.manualChecks.map(() => false),
    operatorNotes: "",
    signoffStatus: "not_reviewed",
  };
}

export function buildInitialInteractionAuditSignoffState(
  definitions: InteractionAuditSurfaceSignoffDefinition[],
): InteractionAuditSignoffState {
  return Object.fromEntries(
    definitions.map((definition) => [definition.id, buildSurfaceState(definition)]),
  );
}

export function buildInitialInteractionAuditSignoffMetadata(): InteractionAuditSignoffMetadata {
  return {
    reviewerName: "",
    sessionLabel: "",
    reviewedAt: "",
  };
}

export function buildInitialInteractionAuditSignoffRequestContext(): InteractionAuditSignoffRequestContext {
  return {
    requestId: "",
    requestCreatedAt: "",
    requestRevisionSha256: "",
  };
}

export function normalizeInteractionAuditSignoffMetadata(
  rawMetadata: unknown,
): InteractionAuditSignoffMetadata {
  const metadataRecord =
    rawMetadata && typeof rawMetadata === "object"
      ? (rawMetadata as Partial<InteractionAuditSignoffMetadata>)
      : {};

  return {
    reviewerName:
      typeof metadataRecord.reviewerName === "string"
        ? metadataRecord.reviewerName
        : "",
    sessionLabel:
      typeof metadataRecord.sessionLabel === "string"
        ? metadataRecord.sessionLabel
        : "",
    reviewedAt:
      typeof metadataRecord.reviewedAt === "string" ? metadataRecord.reviewedAt : "",
  };
}

export function normalizeInteractionAuditSignoffRequestContext(
  rawRequestContext: unknown,
): InteractionAuditSignoffRequestContext {
  const requestContextRecord =
    rawRequestContext && typeof rawRequestContext === "object"
      ? (rawRequestContext as Partial<InteractionAuditSignoffRequestContext>)
      : {};

  return {
    requestId:
      typeof requestContextRecord.requestId === "string"
        ? requestContextRecord.requestId
        : "",
    requestCreatedAt:
      typeof requestContextRecord.requestCreatedAt === "string"
        ? requestContextRecord.requestCreatedAt
        : "",
    requestRevisionSha256:
      typeof requestContextRecord.requestRevisionSha256 === "string"
        ? requestContextRecord.requestRevisionSha256
        : "",
  };
}

export function formatInteractionAuditSignoffRequestBinding(
  rawRequestContext: InteractionAuditSignoffRequestContext,
): string {
  const requestContext =
    normalizeInteractionAuditSignoffRequestContext(rawRequestContext);
  const requestId = requestContext.requestId.trim();
  const requestCreatedAt = requestContext.requestCreatedAt.trim();

  if (requestId.length === 0) {
    return "none";
  }

  if (requestCreatedAt.length === 0) {
    return requestId;
  }

  return `${requestId} @ ${requestCreatedAt}`;
}

export function formatInteractionAuditSignoffRequestRevision(
  rawRequestContext: InteractionAuditSignoffRequestContext,
): string {
  const requestContext =
    normalizeInteractionAuditSignoffRequestContext(rawRequestContext);
  const requestRevisionSha256 = requestContext.requestRevisionSha256.trim();

  if (requestRevisionSha256.length === 0) {
    return "not recorded";
  }

  return `sha256:${requestRevisionSha256}`;
}

export function normalizeInteractionAuditSignoffState(
  rawState: unknown,
  definitions: InteractionAuditSurfaceSignoffDefinition[],
): InteractionAuditSignoffState {
  const stateRecord =
    rawState && typeof rawState === "object"
      ? (rawState as Record<string, InteractionAuditSurfaceSignoffState>)
      : {};

  return Object.fromEntries(
    definitions.map((definition) => {
      const currentState = stateRecord[definition.id];

      return [
        definition.id,
        {
          manualCheckStates: definition.manualChecks.map((_, index) =>
            Boolean(currentState?.manualCheckStates?.[index]),
          ),
          operatorNotes:
            typeof currentState?.operatorNotes === "string"
              ? currentState.operatorNotes
              : "",
          signoffStatus: normalizeSignoffStatus(currentState?.signoffStatus),
        },
      ];
    }),
  );
}

export function readInteractionAuditSignoffState(
  definitions: InteractionAuditSurfaceSignoffDefinition[],
): InteractionAuditSignoffState {
  if (hasLocalStorage()) {
    try {
      const rawState = globalThis.localStorage.getItem(
        INTERACTION_AUDIT_SIGNOFF_STORAGE_KEY,
      );

      if (!rawState) {
        return buildInitialInteractionAuditSignoffState(definitions);
      }

      return normalizeInteractionAuditSignoffState(
        JSON.parse(rawState) as InteractionAuditSignoffState,
        definitions,
      );
    } catch {
      globalThis.localStorage.removeItem(INTERACTION_AUDIT_SIGNOFF_STORAGE_KEY);
      return buildInitialInteractionAuditSignoffState(definitions);
    }
  }

  return memoryFallbackState
    ? normalizeInteractionAuditSignoffState(
        cloneSignoffState(memoryFallbackState),
        definitions,
      )
    : buildInitialInteractionAuditSignoffState(definitions);
}

export function readInteractionAuditSignoffMetadata(): InteractionAuditSignoffMetadata {
  if (hasLocalStorage()) {
    try {
      const rawMetadata = globalThis.localStorage.getItem(
        INTERACTION_AUDIT_SIGNOFF_METADATA_STORAGE_KEY,
      );

      if (!rawMetadata) {
        return buildInitialInteractionAuditSignoffMetadata();
      }

      return normalizeInteractionAuditSignoffMetadata(
        JSON.parse(rawMetadata) as InteractionAuditSignoffMetadata,
      );
    } catch {
      globalThis.localStorage.removeItem(
        INTERACTION_AUDIT_SIGNOFF_METADATA_STORAGE_KEY,
      );
      return buildInitialInteractionAuditSignoffMetadata();
    }
  }

  return memoryFallbackMetadata
    ? normalizeInteractionAuditSignoffMetadata(
        cloneSignoffMetadata(memoryFallbackMetadata),
      )
    : buildInitialInteractionAuditSignoffMetadata();
}

export function readInteractionAuditSignoffRequestContext(): InteractionAuditSignoffRequestContext {
  if (hasLocalStorage()) {
    try {
      const rawRequestContext = globalThis.localStorage.getItem(
        INTERACTION_AUDIT_SIGNOFF_REQUEST_CONTEXT_STORAGE_KEY,
      );

      if (!rawRequestContext) {
        return buildInitialInteractionAuditSignoffRequestContext();
      }

      return normalizeInteractionAuditSignoffRequestContext(
        JSON.parse(rawRequestContext) as InteractionAuditSignoffRequestContext,
      );
    } catch {
      globalThis.localStorage.removeItem(
        INTERACTION_AUDIT_SIGNOFF_REQUEST_CONTEXT_STORAGE_KEY,
      );
      return buildInitialInteractionAuditSignoffRequestContext();
    }
  }

  return memoryFallbackRequestContext
    ? normalizeInteractionAuditSignoffRequestContext(
        cloneSignoffRequestContext(memoryFallbackRequestContext),
      )
    : buildInitialInteractionAuditSignoffRequestContext();
}

export function writeInteractionAuditSignoffState(
  state: InteractionAuditSignoffState,
  definitions: InteractionAuditSurfaceSignoffDefinition[],
): InteractionAuditSignoffState {
  const normalizedState = normalizeInteractionAuditSignoffState(state, definitions);

  if (hasLocalStorage()) {
    globalThis.localStorage.setItem(
      INTERACTION_AUDIT_SIGNOFF_STORAGE_KEY,
      JSON.stringify(normalizedState),
    );
  } else {
    memoryFallbackState = cloneSignoffState(normalizedState);
  }

  return normalizedState;
}

export function writeInteractionAuditSignoffMetadata(
  metadata: InteractionAuditSignoffMetadata,
): InteractionAuditSignoffMetadata {
  const normalizedMetadata = normalizeInteractionAuditSignoffMetadata(metadata);

  if (hasLocalStorage()) {
    globalThis.localStorage.setItem(
      INTERACTION_AUDIT_SIGNOFF_METADATA_STORAGE_KEY,
      JSON.stringify(normalizedMetadata),
    );
  } else {
    memoryFallbackMetadata = cloneSignoffMetadata(normalizedMetadata);
  }

  return normalizedMetadata;
}

export function writeInteractionAuditSignoffRequestContext(
  requestContext: InteractionAuditSignoffRequestContext,
): InteractionAuditSignoffRequestContext {
  const normalizedRequestContext =
    normalizeInteractionAuditSignoffRequestContext(requestContext);

  if (hasLocalStorage()) {
    globalThis.localStorage.setItem(
      INTERACTION_AUDIT_SIGNOFF_REQUEST_CONTEXT_STORAGE_KEY,
      JSON.stringify(normalizedRequestContext),
    );
  } else {
    memoryFallbackRequestContext = cloneSignoffRequestContext(
      normalizedRequestContext,
    );
  }

  return normalizedRequestContext;
}

export function clearInteractionAuditSignoffState() {
  if (hasLocalStorage()) {
    globalThis.localStorage.removeItem(INTERACTION_AUDIT_SIGNOFF_STORAGE_KEY);
    return;
  }

  memoryFallbackState = null;
}

export function clearInteractionAuditSignoffMetadata() {
  if (hasLocalStorage()) {
    globalThis.localStorage.removeItem(
      INTERACTION_AUDIT_SIGNOFF_METADATA_STORAGE_KEY,
    );
    return;
  }

  memoryFallbackMetadata = null;
}

export function clearInteractionAuditSignoffRequestContext() {
  if (hasLocalStorage()) {
    globalThis.localStorage.removeItem(
      INTERACTION_AUDIT_SIGNOFF_REQUEST_CONTEXT_STORAGE_KEY,
    );
    return;
  }

  memoryFallbackRequestContext = null;
}

export function buildInteractionAuditSignoffSummary(
  definitions: InteractionAuditSurfaceSignoffDefinition[],
  state: InteractionAuditSignoffState,
) {
  let reviewedSurfaceCount = 0;
  let passSurfaceCount = 0;
  let followUpSurfaceCount = 0;
  let completedManualCheckCount = 0;
  let totalManualCheckCount = 0;

  for (const definition of definitions) {
    const surfaceState = state[definition.id] ?? buildSurfaceState(definition);

    totalManualCheckCount += definition.manualChecks.length;
    completedManualCheckCount += surfaceState.manualCheckStates.filter(Boolean).length;

    if (surfaceState.signoffStatus !== "not_reviewed") {
      reviewedSurfaceCount += 1;
    }

    if (surfaceState.signoffStatus === "pass") {
      passSurfaceCount += 1;
    }

    if (surfaceState.signoffStatus === "follow_up") {
      followUpSurfaceCount += 1;
    }
  }

  return {
    reviewedSurfaceCount,
    passSurfaceCount,
    followUpSurfaceCount,
    completedManualCheckCount,
    totalManualCheckCount,
  };
}

export function buildInteractionAuditSignoffExport(
  definitions: InteractionAuditSurfaceSignoffDefinition[],
  state: InteractionAuditSignoffState,
  metadata: InteractionAuditSignoffMetadata = buildInitialInteractionAuditSignoffMetadata(),
  requestContext: InteractionAuditSignoffRequestContext = buildInitialInteractionAuditSignoffRequestContext(),
): InteractionAuditSignoffExport {
  return {
    metadata: normalizeInteractionAuditSignoffMetadata(metadata),
    requestContext: normalizeInteractionAuditSignoffRequestContext(requestContext),
    summary: buildInteractionAuditSignoffSummary(definitions, state),
    surfaces: definitions.map((definition) => {
      const surfaceState = state[definition.id] ?? buildSurfaceState(definition);

      return {
        id: definition.id,
        title: definition.title,
        description: definition.description,
        signoffStatus: surfaceState.signoffStatus,
        operatorNotes: surfaceState.operatorNotes,
        manualChecks: definition.manualChecks.map((label, index) => ({
          label,
          completed: Boolean(surfaceState.manualCheckStates[index]),
        })),
      };
    }),
  };
}

export function buildInteractionAuditSignoffHandoffSummary(
  definitions: InteractionAuditSurfaceSignoffDefinition[],
  state: InteractionAuditSignoffState,
): InteractionAuditSignoffHandoffSummary {
  const baseSummary = buildInteractionAuditSignoffSummary(definitions, state);
  const surfaces = definitions.map((definition) => {
    const surfaceState = state[definition.id] ?? buildSurfaceState(definition);
    const pendingManualChecks = definition.manualChecks.filter(
      (_, index) => !surfaceState.manualCheckStates[index],
    );

    return {
      id: definition.id,
      title: definition.title,
      description: definition.description,
      signoffStatus: surfaceState.signoffStatus,
      operatorNotes: surfaceState.operatorNotes.trim(),
      completedManualCheckCount:
        definition.manualChecks.length - pendingManualChecks.length,
      totalManualCheckCount: definition.manualChecks.length,
      pendingManualChecks,
    };
  });
  const followUpSurfaces = surfaces.filter(
    (surface) => surface.signoffStatus === "follow_up",
  );
  const notReviewedSurfaces = surfaces.filter(
    (surface) => surface.signoffStatus === "not_reviewed",
  );
  const surfacesWithPendingChecks = surfaces.filter(
    (surface) => surface.pendingManualChecks.length > 0,
  );
  const pendingManualCheckCount = surfacesWithPendingChecks.reduce(
    (count, surface) => count + surface.pendingManualChecks.length,
    0,
  );

  return {
    totalSurfaceCount: surfaces.length,
    reviewedSurfaceCount: baseSummary.reviewedSurfaceCount,
    passSurfaceCount: baseSummary.passSurfaceCount,
    followUpSurfaceCount: baseSummary.followUpSurfaceCount,
    notReviewedSurfaceCount: notReviewedSurfaces.length,
    completedManualCheckCount: baseSummary.completedManualCheckCount,
    totalManualCheckCount: baseSummary.totalManualCheckCount,
    pendingManualCheckCount,
    readyForSignoff:
      baseSummary.reviewedSurfaceCount === surfaces.length &&
      baseSummary.followUpSurfaceCount === 0 &&
      pendingManualCheckCount === 0,
    surfaces,
    followUpSurfaces,
    notReviewedSurfaces,
    surfacesWithPendingChecks,
  };
}

export function buildInteractionAuditSignoffDraft(
  definitions: InteractionAuditSurfaceSignoffDefinition[],
  state: InteractionAuditSignoffState,
  metadata: InteractionAuditSignoffMetadata = buildInitialInteractionAuditSignoffMetadata(),
  requestContext: InteractionAuditSignoffRequestContext = buildInitialInteractionAuditSignoffRequestContext(),
): string {
  const report = buildInteractionAuditSignoffExport(
    definitions,
    state,
    metadata,
    requestContext,
  );
  const lines = [
    "# Interaction Audit Workspace Draft",
    "",
    "This draft reflects the current audit-hub workspace state. It does not claim that a final operator signoff is complete.",
    "",
    "Review session:",
    `- Reviewer: ${report.metadata.reviewerName.trim().length > 0 ? report.metadata.reviewerName.trim() : "not set"}`,
    `- Session: ${report.metadata.sessionLabel.trim().length > 0 ? report.metadata.sessionLabel.trim() : "not set"}`,
    `- Reviewed at: ${report.metadata.reviewedAt.trim().length > 0 ? report.metadata.reviewedAt.trim() : "not set"}`,
    `- Request binding: ${formatInteractionAuditSignoffRequestBinding(report.requestContext)}`,
    `- Request revision: ${formatInteractionAuditSignoffRequestRevision(report.requestContext)}`,
    "",
    `Reviewed surfaces: ${report.summary.reviewedSurfaceCount} / ${report.surfaces.length}`,
    `Pass: ${report.summary.passSurfaceCount}`,
    `Follow-up required: ${report.summary.followUpSurfaceCount}`,
    `Completed checks: ${report.summary.completedManualCheckCount} / ${report.summary.totalManualCheckCount}`,
    "",
  ];

  for (const surface of report.surfaces) {
    lines.push(`## ${surface.title}`);
    lines.push("");
    lines.push(surface.description);
    lines.push("");
    lines.push("Manual checks:");

    for (const check of surface.manualChecks) {
      lines.push(`- [${check.completed ? "x" : " "}] ${check.label}`);
    }

    lines.push("");
    lines.push("Operator notes:");
    lines.push(
      surface.operatorNotes.trim().length > 0
        ? `- ${surface.operatorNotes.trim()}`
        : "- none yet",
    );
    lines.push("");
    lines.push("Signoff:");
    lines.push(`- [${surface.signoffStatus === "pass" ? "x" : " "}] Pass`);
    lines.push(
      `- [${surface.signoffStatus === "follow_up" ? "x" : " "}] Follow-up required`,
    );
    lines.push("");
  }

  return `${lines.join("\n").trim()}\n`;
}

export function buildInteractionAuditSignoffHandoffDraft(
  definitions: InteractionAuditSurfaceSignoffDefinition[],
  state: InteractionAuditSignoffState,
  metadata: InteractionAuditSignoffMetadata = buildInitialInteractionAuditSignoffMetadata(),
  requestContext: InteractionAuditSignoffRequestContext = buildInitialInteractionAuditSignoffRequestContext(),
): string {
  const summary = buildInteractionAuditSignoffHandoffSummary(definitions, state);
  const lines = [
    "# Interaction Audit Handoff Summary",
    "",
    "This summary reflects the current audit-hub workspace state and highlights what still blocks final operator signoff.",
    "",
    "Review session:",
    `- Reviewer: ${metadata.reviewerName.trim().length > 0 ? metadata.reviewerName.trim() : "not set"}`,
    `- Session: ${metadata.sessionLabel.trim().length > 0 ? metadata.sessionLabel.trim() : "not set"}`,
    `- Reviewed at: ${metadata.reviewedAt.trim().length > 0 ? metadata.reviewedAt.trim() : "not set"}`,
    `- Request binding: ${formatInteractionAuditSignoffRequestBinding(requestContext)}`,
    `- Request revision: ${formatInteractionAuditSignoffRequestRevision(requestContext)}`,
    "",
    `Ready for signoff: ${summary.readyForSignoff ? "yes" : "no"}`,
    `Reviewed surfaces: ${summary.reviewedSurfaceCount} / ${summary.totalSurfaceCount}`,
    `Pass: ${summary.passSurfaceCount}`,
    `Follow-up required: ${summary.followUpSurfaceCount}`,
    `Not reviewed: ${summary.notReviewedSurfaceCount}`,
    `Pending checks: ${summary.pendingManualCheckCount} / ${summary.totalManualCheckCount}`,
    "",
    "## Follow-up required",
    "",
  ];

  if (summary.followUpSurfaces.length === 0) {
    lines.push("- none");
    lines.push("");
  } else {
    for (const surface of summary.followUpSurfaces) {
      lines.push(`### ${surface.title}`);
      lines.push("");
      lines.push(`- Pending checks: ${surface.pendingManualChecks.length} / ${surface.totalManualCheckCount}`);
      lines.push(
        `- Notes: ${surface.operatorNotes.length > 0 ? surface.operatorNotes : "none yet"}`,
      );
      lines.push("");
    }
  }

  lines.push("## Not reviewed");
  lines.push("");

  if (summary.notReviewedSurfaces.length === 0) {
    lines.push("- none");
    lines.push("");
  } else {
    for (const surface of summary.notReviewedSurfaces) {
      lines.push(
        `- ${surface.title} (${surface.pendingManualChecks.length} pending checks)`,
      );
    }
    lines.push("");
  }

  lines.push("## Pending manual checks");
  lines.push("");

  if (summary.surfacesWithPendingChecks.length === 0) {
    lines.push("- none");
    lines.push("");
  } else {
    for (const surface of summary.surfacesWithPendingChecks) {
      lines.push(`### ${surface.title}`);
      lines.push("");

      for (const check of surface.pendingManualChecks) {
        lines.push(`- ${check}`);
      }

      lines.push("");
      lines.push(
        `- Notes: ${surface.operatorNotes.length > 0 ? surface.operatorNotes : "none yet"}`,
      );
      lines.push("");
    }
  }

  return `${lines.join("\n").trim()}\n`;
}

export function parseInteractionAuditSignoffImport(
  rawInput: string,
  definitions: InteractionAuditSurfaceSignoffDefinition[],
): InteractionAuditSignoffImportResult {
  if (rawInput.trim().length === 0) {
    return {
      ok: false,
      code: "empty_input",
      error: "Paste exported signoff JSON before importing.",
    };
  }

  let parsedValue: unknown;

  try {
    parsedValue = JSON.parse(rawInput) as unknown;
  } catch {
    return {
      ok: false,
      code: "invalid_json",
      error: "Signoff import JSON could not be parsed.",
    };
  }

  const surfaceIds = new Set(definitions.map((definition) => definition.id));

  if (
    parsedValue &&
    typeof parsedValue === "object" &&
    "surfaces" in parsedValue &&
    Array.isArray((parsedValue as { surfaces: unknown[] }).surfaces)
  ) {
    const exportValue = parsedValue as {
      surfaces: Array<{
        id?: unknown;
        signoffStatus?: unknown;
        operatorNotes?: unknown;
        manualChecks?: Array<{
          completed?: unknown;
        }>;
      }>;
    };

    const nextState = buildInitialInteractionAuditSignoffState(definitions);

    for (const surface of exportValue.surfaces) {
      if (typeof surface?.id !== "string" || !surfaceIds.has(surface.id)) {
        continue;
      }

      const definition = definitions.find((entry) => entry.id === surface.id);

      if (!definition) {
        continue;
      }

      nextState[surface.id] = {
        manualCheckStates: definition.manualChecks.map((_, index) =>
          Boolean(surface.manualChecks?.[index]?.completed),
        ),
        operatorNotes:
          typeof surface.operatorNotes === "string" ? surface.operatorNotes : "",
        signoffStatus: normalizeSignoffStatus(surface.signoffStatus),
      };
    }

    return {
      ok: true,
      state: nextState,
      metadata: normalizeInteractionAuditSignoffMetadata(
        (
          parsedValue as {
            metadata?: unknown;
          }
        ).metadata,
      ),
      requestContext: normalizeInteractionAuditSignoffRequestContext(
        (
          parsedValue as {
            requestContext?: unknown;
          }
        ).requestContext,
      ),
    };
  }

  if (parsedValue && typeof parsedValue === "object") {
    return {
      ok: true,
      state: normalizeInteractionAuditSignoffState(parsedValue, definitions),
      metadata: buildInitialInteractionAuditSignoffMetadata(),
      requestContext: buildInitialInteractionAuditSignoffRequestContext(),
    };
  }

  return {
    ok: false,
    code: "unsupported_shape",
    error: "Signoff import JSON did not match the expected workspace or export shape.",
  };
}
