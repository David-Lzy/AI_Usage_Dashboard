import type { ProviderId, ProviderTone, SyncStatus } from "../providers/types";
import { isProviderId } from "../providers/provider-definitions";

export const CUSTOM_SOURCE_SCHEMA_V1 =
  "ai-usage-dashboard.custom-source.v1";
export const CUSTOM_SOURCE_ID_PREFIX = "custom:";

export const CUSTOM_SOURCE_RESPONSE_MAX_CHARS = 128 * 1024;
export const CUSTOM_SOURCE_MAX_WINDOWS = 8;
export const CUSTOM_SOURCE_MAX_BALANCES = 8;
export const CUSTOM_SOURCE_MAX_FACTS = 16;
export const CUSTOM_SOURCE_DEFAULT_REFRESH_INTERVAL_MINUTES = 15;
export const CUSTOM_SOURCE_MIN_REFRESH_INTERVAL_MINUTES = 3;
export const CUSTOM_SOURCE_MAX_REFRESH_INTERVAL_MINUTES = 24 * 60;

const CUSTOM_SOURCE_ID_PART_PATTERN = /^[a-z0-9][a-z0-9_-]{0,63}$/u;
const UNSAFE_DISPLAY_TEXT_PATTERN = /[<>]/u;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/gu;

export type CustomSourceId = `${typeof CUSTOM_SOURCE_ID_PREFIX}${string}`;
export type DashboardSourceId = ProviderId | CustomSourceId;
export type CustomSourceManager = "codexbar-dashboard";

export type CustomSourceStatus = SyncStatus;
export type CustomSourceTone = ProviderTone;

export type CustomSourceValidationIssueCode =
  | "invalid_source_id"
  | "invalid_url"
  | "unsupported_url_scheme"
  | "response_too_large"
  | "invalid_json"
  | "invalid_schema"
  | "invalid_field"
  | "missing_field"
  | "unsafe_text"
  | "array_too_large"
  | "invalid_number"
  | "empty_payload";

export type CustomSourceValidationIssue = {
  code: CustomSourceValidationIssueCode;
  path: string;
  message: string;
};

export type CustomSourceValidationResult<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      issues: CustomSourceValidationIssue[];
    };

export type CustomSourceRawMetric = {
  label?: unknown;
  unit?: unknown;
  window?: unknown;
  used?: unknown;
  remaining?: unknown;
  total?: unknown;
  resetAt?: unknown;
  resetLabel?: unknown;
};

export type CustomSourceRawFact = {
  label?: unknown;
  value?: unknown;
  detail?: unknown;
};

export type CustomSourceResponseV1 = {
  schema: typeof CUSTOM_SOURCE_SCHEMA_V1;
  id?: string;
  label: string;
  description?: string;
  status: CustomSourceStatus;
  tone?: CustomSourceTone;
  syncedAt?: string;
  summary?: string;
  quota?: CustomSourceRawMetric;
  windows?: CustomSourceRawMetric[];
  balances?: CustomSourceRawMetric[];
  facts?: CustomSourceRawFact[];
  warningReason?: string | null;
};

export type CustomSourceMetric = {
  label: string;
  unit: string;
  window: string | null;
  used: number | null;
  remaining: number | null;
  total: number | null;
  resetAt: string | null;
  resetLabel: string | null;
};

export type CustomSourceFact = {
  label: string;
  value: string;
  detail: string | null;
};

export type CustomSourceSnapshot = {
  sourceId: CustomSourceId;
  endpointId: string | null;
  label: string;
  description: string | null;
  planName: string;
  quotaUnit: string;
  quotaWindow: string;
  used: number | null;
  remaining: number | null;
  total: number | null;
  resetAt: string | null;
  resetLabel: string | null;
  syncedAt: string;
  syncStatus: CustomSourceStatus;
  tone: CustomSourceTone;
  warningReason: string | null;
  lastSyncLabel: string;
  usageSummary: string | null;
  quota: CustomSourceMetric | null;
  windows: CustomSourceMetric[];
  balances: CustomSourceMetric[];
  facts: CustomSourceFact[];
};

export type CustomSourceSetting = {
  id: CustomSourceId;
  label: string;
  description: string | null;
  endpointUrl: string;
  displayEnabled: boolean;
  refreshIntervalMinutes: number;
  createdAt: string;
  updatedAt: string;
  managedBy?: CustomSourceManager;
};

export type CustomSourceSyncState = {
  sourceId: CustomSourceId;
  status: CustomSourceStatus;
  snapshot: CustomSourceSnapshot | null;
  lastAttemptAt: string | null;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  lastFailureReason: string | null;
  stale: boolean;
};

export type NormalizeCustomSourceResponseOptions = {
  sourceId: CustomSourceId;
  fetchedAt?: string;
};

function createIssue(
  code: CustomSourceValidationIssueCode,
  path: string,
  message: string,
): CustomSourceValidationIssue {
  return { code, path, message };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function statusToTone(status: CustomSourceStatus): CustomSourceTone {
  return status === "ok" ? "neutral" : status;
}

function normalizeDisplayString(
  value: unknown,
  path: string,
  issues: CustomSourceValidationIssue[],
  options: {
    required?: boolean;
    maxLength: number;
    allowNumber?: boolean;
  },
): string | null {
  if (value === undefined || value === null) {
    if (options.required) {
      issues.push(
        createIssue("missing_field", path, "This field is required."),
      );
    }
    return null;
  }

  if (typeof value !== "string" && !(options.allowNumber && typeof value === "number")) {
    issues.push(
      createIssue("invalid_field", path, "Expected a display string."),
    );
    return null;
  }

  const normalized = String(value)
    .replace(CONTROL_CHARACTER_PATTERN, "")
    .replace(/\s+/g, " ")
    .trim();

  if (normalized.length === 0) {
    if (options.required) {
      issues.push(
        createIssue("missing_field", path, "This field cannot be empty."),
      );
    }
    return null;
  }

  if (UNSAFE_DISPLAY_TEXT_PATTERN.test(normalized)) {
    issues.push(
      createIssue(
        "unsafe_text",
        path,
        "HTML-like text is not accepted in custom source display fields.",
      ),
    );
    return null;
  }

  return normalized.slice(0, options.maxLength);
}

function normalizeOptionalNumber(
  value: unknown,
  path: string,
  issues: CustomSourceValidationIssue[],
): number | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    issues.push(
      createIssue(
        "invalid_number",
        path,
        "Expected a finite non-negative number or null.",
      ),
    );
    return null;
  }

  return value;
}

function normalizeOptionalTimestamp(
  value: unknown,
  path: string,
  issues: CustomSourceValidationIssue[],
): string | null {
  const timestamp = normalizeDisplayString(value, path, issues, {
    maxLength: 96,
  });

  if (!timestamp) {
    return null;
  }

  const parsedTimestamp = new Date(timestamp);

  return Number.isNaN(parsedTimestamp.getTime()) ? null : timestamp;
}

function normalizeStatus(
  value: unknown,
  path: string,
  issues: CustomSourceValidationIssue[],
): CustomSourceStatus | null {
  if (value === "ok" || value === "warning" || value === "error") {
    return value;
  }

  issues.push(
    createIssue("invalid_field", path, "Expected ok, warning, or error."),
  );
  return null;
}

function normalizeTone(
  value: unknown,
  fallback: CustomSourceTone,
  path: string,
  issues: CustomSourceValidationIssue[],
): CustomSourceTone {
  if (value === undefined || value === null) {
    return fallback;
  }

  if (value === "neutral" || value === "warning" || value === "error") {
    return value;
  }

  issues.push(
    createIssue(
      "invalid_field",
      path,
      "Expected neutral, warning, or error.",
    ),
  );
  return fallback;
}

function normalizeMetric(
  value: unknown,
  path: string,
  issues: CustomSourceValidationIssue[],
  options: {
    labelRequired: boolean;
    defaultLabel: string;
  },
): CustomSourceMetric | null {
  if (!isRecord(value)) {
    issues.push(
      createIssue("invalid_field", path, "Expected a metric object."),
    );
    return null;
  }

  const label =
    normalizeDisplayString(value.label, `${path}.label`, issues, {
      required: options.labelRequired,
      maxLength: 96,
    }) ?? options.defaultLabel;
  const unit = normalizeDisplayString(value.unit, `${path}.unit`, issues, {
    required: true,
    maxLength: 32,
  });
  const window = normalizeDisplayString(value.window, `${path}.window`, issues, {
    maxLength: 48,
  });
  const resetAt = normalizeDisplayString(value.resetAt, `${path}.resetAt`, issues, {
    maxLength: 96,
  });
  const resetLabel = normalizeDisplayString(
    value.resetLabel,
    `${path}.resetLabel`,
    issues,
    {
      maxLength: 120,
    },
  );
  const used = normalizeOptionalNumber(value.used, `${path}.used`, issues);
  const remaining = normalizeOptionalNumber(
    value.remaining,
    `${path}.remaining`,
    issues,
  );
  const rawTotal = normalizeOptionalNumber(value.total, `${path}.total`, issues);
  const total =
    rawTotal === null &&
    unit?.toLowerCase() === "percent" &&
    (used !== null || remaining !== null)
      ? 100
      : rawTotal;

  if (unit === null) {
    return null;
  }

  if (used === null && remaining === null && total === null) {
    issues.push(
      createIssue(
        "invalid_field",
        path,
        "Metric objects must include used, remaining, or total.",
      ),
    );
    return null;
  }

  return {
    label,
    unit,
    window,
    used,
    remaining,
    total,
    resetAt,
    resetLabel,
  };
}

function normalizeMetricArray(
  value: unknown,
  path: string,
  issues: CustomSourceValidationIssue[],
  options: {
    maxLength: number;
    defaultLabelPrefix: string;
  },
): CustomSourceMetric[] {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    issues.push(createIssue("invalid_field", path, "Expected an array."));
    return [];
  }

  if (value.length > options.maxLength) {
    issues.push(
      createIssue(
        "array_too_large",
        path,
        `Expected at most ${options.maxLength} entries.`,
      ),
    );
    return [];
  }

  return value.flatMap((entry, index) => {
    const metric = normalizeMetric(entry, `${path}[${index}]`, issues, {
      labelRequired: true,
      defaultLabel: `${options.defaultLabelPrefix} ${index + 1}`,
    });
    return metric ? [metric] : [];
  });
}

function normalizeFacts(
  value: unknown,
  issues: CustomSourceValidationIssue[],
): CustomSourceFact[] {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    issues.push(createIssue("invalid_field", "facts", "Expected an array."));
    return [];
  }

  if (value.length > CUSTOM_SOURCE_MAX_FACTS) {
    issues.push(
      createIssue(
        "array_too_large",
        "facts",
        `Expected at most ${CUSTOM_SOURCE_MAX_FACTS} entries.`,
      ),
    );
    return [];
  }

  return value.flatMap((entry, index) => {
    const path = `facts[${index}]`;

    if (!isRecord(entry)) {
      issues.push(createIssue("invalid_field", path, "Expected a fact object."));
      return [];
    }

    const label = normalizeDisplayString(entry.label, `${path}.label`, issues, {
      required: true,
      maxLength: 96,
    });
    const factValue = normalizeDisplayString(
      entry.value,
      `${path}.value`,
      issues,
      {
        required: true,
        maxLength: 160,
        allowNumber: true,
      },
    );
    const detail = normalizeDisplayString(entry.detail, `${path}.detail`, issues, {
      maxLength: 180,
    });

    return label && factValue
      ? [
          {
            label,
            value: factValue,
            detail,
          },
        ]
      : [];
  });
}

export function isCustomSourceId(value: unknown): value is CustomSourceId {
  if (typeof value !== "string" || !value.startsWith(CUSTOM_SOURCE_ID_PREFIX)) {
    return false;
  }

  return CUSTOM_SOURCE_ID_PART_PATTERN.test(
    value.slice(CUSTOM_SOURCE_ID_PREFIX.length),
  );
}

export function toCustomSourceId(value: string): CustomSourceId | null {
  const idPart = value.startsWith(CUSTOM_SOURCE_ID_PREFIX)
    ? value.slice(CUSTOM_SOURCE_ID_PREFIX.length)
    : value;
  const normalizedIdPart = idPart.trim().toLowerCase();

  return CUSTOM_SOURCE_ID_PART_PATTERN.test(normalizedIdPart)
    ? `${CUSTOM_SOURCE_ID_PREFIX}${normalizedIdPart}`
    : null;
}

export function isDashboardSourceId(value: unknown): value is DashboardSourceId {
  return isProviderId(value) || isCustomSourceId(value);
}

export function normalizeCustomSourceEndpointUrl(
  value: unknown,
): CustomSourceValidationResult<string> {
  if (typeof value !== "string" || value.trim().length === 0) {
    return {
      ok: false,
      issues: [
        createIssue("invalid_url", "endpointUrl", "Endpoint URL is required."),
      ],
    };
  }

  try {
    const parsedUrl = new URL(value.trim());

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return {
        ok: false,
        issues: [
          createIssue(
            "unsupported_url_scheme",
            "endpointUrl",
            "Custom sources support http:// and https:// endpoints only.",
          ),
        ],
      };
    }

    return {
      ok: true,
      value: parsedUrl.toString(),
    };
  } catch {
    return {
      ok: false,
      issues: [
        createIssue("invalid_url", "endpointUrl", "Endpoint URL is invalid."),
      ],
    };
  }
}

export function normalizeCustomSourceRefreshIntervalMinutes(
  value: unknown,
): number {
  const parsedValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseInt(value, 10)
        : NaN;

  if (
    !Number.isInteger(parsedValue) ||
    parsedValue < CUSTOM_SOURCE_MIN_REFRESH_INTERVAL_MINUTES ||
    parsedValue > CUSTOM_SOURCE_MAX_REFRESH_INTERVAL_MINUTES
  ) {
    return CUSTOM_SOURCE_DEFAULT_REFRESH_INTERVAL_MINUTES;
  }

  return parsedValue;
}

export function createEmptyCustomSourceSyncState(
  sourceId: CustomSourceId,
): CustomSourceSyncState {
  return {
    sourceId,
    status: "warning",
    snapshot: null,
    lastAttemptAt: null,
    lastSuccessAt: null,
    lastFailureAt: null,
    lastFailureReason: null,
    stale: false,
  };
}

export function normalizeCustomSourceSettings(
  value: unknown,
): CustomSourceSetting[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seenIds = new Set<CustomSourceId>();

  return value.flatMap((entry) => {
    if (!isRecord(entry)) {
      return [];
    }

    const id = typeof entry.id === "string" ? toCustomSourceId(entry.id) : null;

    if (!id || seenIds.has(id)) {
      return [];
    }

    const endpointUrl = normalizeCustomSourceEndpointUrl(entry.endpointUrl);

    if (!endpointUrl.ok) {
      return [];
    }

    const issues: CustomSourceValidationIssue[] = [];
    const label =
      normalizeDisplayString(entry.label, "label", issues, {
        maxLength: 80,
      }) ?? id.slice(CUSTOM_SOURCE_ID_PREFIX.length);
    const description = normalizeDisplayString(
      entry.description,
      "description",
      issues,
      {
        maxLength: 180,
      },
    );
    const createdAt =
      normalizeOptionalTimestamp(entry.createdAt, "createdAt", issues) ??
      new Date(0).toISOString();
    const updatedAt =
      normalizeOptionalTimestamp(entry.updatedAt, "updatedAt", issues) ??
      createdAt;

    seenIds.add(id);

    return [
      {
        id,
        label,
        description,
        endpointUrl: endpointUrl.value,
        displayEnabled:
          typeof entry.displayEnabled === "boolean"
            ? entry.displayEnabled
            : typeof entry.enabled === "boolean"
              ? entry.enabled
              : true,
        refreshIntervalMinutes: normalizeCustomSourceRefreshIntervalMinutes(
          entry.refreshIntervalMinutes,
        ),
        createdAt,
        updatedAt,
        ...(entry.managedBy === "codexbar-dashboard"
          ? { managedBy: entry.managedBy }
          : {}),
      },
    ];
  });
}

export function isManagedCustomSource(
  source: Pick<CustomSourceSetting, "managedBy">,
): boolean {
  return source.managedBy === "codexbar-dashboard";
}

function normalizeStoredCustomSourceSnapshot(
  value: unknown,
  sourceId: CustomSourceId,
): CustomSourceSnapshot | null {
  if (!isRecord(value) || value.sourceId !== sourceId) {
    return null;
  }

  return value as CustomSourceSnapshot;
}

export function normalizeCustomSourceSyncStates(
  value: unknown,
  knownSourceIds: readonly CustomSourceId[] = [],
): CustomSourceSyncState[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const knownIds = new Set(knownSourceIds);
  const seenIds = new Set<CustomSourceId>();

  return value.flatMap((entry) => {
    if (!isRecord(entry) || typeof entry.sourceId !== "string") {
      return [];
    }

    const sourceId = toCustomSourceId(entry.sourceId);

    if (
      !sourceId ||
      seenIds.has(sourceId) ||
      (knownIds.size > 0 && !knownIds.has(sourceId))
    ) {
      return [];
    }

    const issues: CustomSourceValidationIssue[] = [];
    const status = normalizeStatus(entry.status, "status", issues) ?? "warning";

    seenIds.add(sourceId);

    return [
      {
        sourceId,
        status,
        snapshot: normalizeStoredCustomSourceSnapshot(entry.snapshot, sourceId),
        lastAttemptAt: normalizeOptionalTimestamp(
          entry.lastAttemptAt,
          "lastAttemptAt",
          issues,
        ),
        lastSuccessAt: normalizeOptionalTimestamp(
          entry.lastSuccessAt,
          "lastSuccessAt",
          issues,
        ),
        lastFailureAt: normalizeOptionalTimestamp(
          entry.lastFailureAt,
          "lastFailureAt",
          issues,
        ),
        lastFailureReason: normalizeDisplayString(
          entry.lastFailureReason,
          "lastFailureReason",
          issues,
          {
            maxLength: 220,
          },
        ),
        stale: entry.stale === true,
      },
    ];
  });
}

export function normalizeCustomSourceResponse(
  value: unknown,
  options: NormalizeCustomSourceResponseOptions,
): CustomSourceValidationResult<CustomSourceSnapshot> {
  const issues: CustomSourceValidationIssue[] = [];

  if (!isCustomSourceId(options.sourceId)) {
    issues.push(
      createIssue(
        "invalid_source_id",
        "sourceId",
        "Custom source ids must use the custom:<id> format.",
      ),
    );
  }

  if (!isRecord(value)) {
    return {
      ok: false,
      issues: [
        createIssue("invalid_field", "$", "Expected a JSON object response."),
      ],
    };
  }

  if (value.schema !== CUSTOM_SOURCE_SCHEMA_V1) {
    issues.push(
      createIssue(
        "invalid_schema",
        "schema",
        `Expected ${CUSTOM_SOURCE_SCHEMA_V1}.`,
      ),
    );
  }

  const label = normalizeDisplayString(value.label, "label", issues, {
    required: true,
    maxLength: 80,
  });
  const endpointId = normalizeDisplayString(value.id, "id", issues, {
    maxLength: 80,
  });
  const description = normalizeDisplayString(
    value.description,
    "description",
    issues,
    {
      maxLength: 180,
    },
  );
  const status = normalizeStatus(value.status, "status", issues);
  const tone = normalizeTone(
    value.tone,
    status ? statusToTone(status) : "error",
    "tone",
    issues,
  );
  const syncedAt =
    normalizeDisplayString(value.syncedAt, "syncedAt", issues, {
      maxLength: 96,
    }) ??
    options.fetchedAt ??
    new Date().toISOString();
  const summary = normalizeDisplayString(value.summary, "summary", issues, {
    maxLength: 220,
  });
  const warningReason = normalizeDisplayString(
    value.warningReason,
    "warningReason",
    issues,
    {
      maxLength: 220,
    },
  );
  const quota = value.quota
    ? normalizeMetric(value.quota, "quota", issues, {
        labelRequired: false,
        defaultLabel: "Primary quota",
      })
    : null;
  const windows = normalizeMetricArray(value.windows, "windows", issues, {
    maxLength: CUSTOM_SOURCE_MAX_WINDOWS,
    defaultLabelPrefix: "Window",
  });
  const balances = normalizeMetricArray(value.balances, "balances", issues, {
    maxLength: CUSTOM_SOURCE_MAX_BALANCES,
    defaultLabelPrefix: "Balance",
  });
  const facts = normalizeFacts(value.facts, issues);

  if (!quota && windows.length === 0 && balances.length === 0 && facts.length === 0 && !summary) {
    issues.push(
      createIssue(
        "empty_payload",
        "$",
        "Custom source responses must include quota, windows, balances, facts, or summary.",
      ),
    );
  }

  if (issues.length > 0 || !label || !status) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    value: {
      sourceId: options.sourceId,
      endpointId,
      label,
      description,
      planName: description ?? "Custom JSON source",
      quotaUnit: quota?.unit ?? "custom",
      quotaWindow: quota?.window ?? "custom",
      used: quota?.used ?? null,
      remaining: quota?.remaining ?? null,
      total: quota?.total ?? null,
      resetAt: quota?.resetAt ?? null,
      resetLabel: quota?.resetLabel ?? null,
      syncedAt,
      syncStatus: status,
      tone,
      warningReason,
      lastSyncLabel: "Custom source synced just now",
      usageSummary: summary,
      quota,
      windows,
      balances,
      facts,
    },
  };
}

export function parseCustomSourceResponseJson(
  rawResponseText: string,
  options: NormalizeCustomSourceResponseOptions,
): CustomSourceValidationResult<CustomSourceSnapshot> {
  if (rawResponseText.length > CUSTOM_SOURCE_RESPONSE_MAX_CHARS) {
    return {
      ok: false,
      issues: [
        createIssue(
          "response_too_large",
          "$",
          `Response body exceeds ${CUSTOM_SOURCE_RESPONSE_MAX_CHARS} characters.`,
        ),
      ],
    };
  }

  try {
    return normalizeCustomSourceResponse(JSON.parse(rawResponseText), options);
  } catch {
    return {
      ok: false,
      issues: [
        createIssue("invalid_json", "$", "Response body is not valid JSON."),
      ],
    };
  }
}
