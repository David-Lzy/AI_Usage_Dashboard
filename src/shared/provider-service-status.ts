import type {
  DisplaySurface,
  ProviderBrandId,
  ProviderId,
  ProviderServiceStatus,
  ProviderServiceStatusFailureReason,
  ProviderServiceStatusLevel,
  ProviderServiceStatusVisibilityBySurface,
  ProviderServiceStatusVendorId,
} from "../providers/types";
import { getProviderDefinition } from "../providers/provider-definitions";

export const PROVIDER_SERVICE_STATUS_SURFACES: readonly DisplaySurface[] = [
  "popup",
  "sidebar",
  "fullPage",
];

export const PROVIDER_SERVICE_STATUS_CONFIG = {
  openai: {
    brandId: "codex",
    endpointUrl: "https://status.openai.com/api/v2/summary.json",
    originPattern: "https://status.openai.com/*",
    statusPageUrl: "https://status.openai.com",
    label: "OpenAI",
  },
  anthropic: {
    brandId: "claude-code",
    endpointUrl: "https://status.claude.com/api/v2/summary.json",
    originPattern: "https://status.claude.com/*",
    statusPageUrl: "https://status.claude.com",
    label: "Anthropic",
  },
  cursor: {
    brandId: "cursor",
    endpointUrl: "https://status.cursor.com/api/v2/summary.json",
    originPattern: "https://status.cursor.com/*",
    statusPageUrl: "https://status.cursor.com",
    label: "Cursor",
  },
} as const satisfies Record<
  ProviderServiceStatusVendorId,
  {
    brandId: ProviderBrandId;
    endpointUrl: string;
    originPattern: string;
    statusPageUrl: string;
    label: string;
  }
>;

export const PROVIDER_SERVICE_STATUS_VENDOR_IDS = Object.keys(
  PROVIDER_SERVICE_STATUS_CONFIG,
) as ProviderServiceStatusVendorId[];

const STATUS_BRAND_IDS = new Set<ProviderBrandId>(
  PROVIDER_SERVICE_STATUS_VENDOR_IDS.map(
    (vendorId) => PROVIDER_SERVICE_STATUS_CONFIG[vendorId].brandId,
  ),
);

const MAX_COMPONENTS = 24;
const MAX_INCIDENTS = 8;
const MAX_TEXT_LENGTH = 240;

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeText(value: unknown, maxLength = MAX_TEXT_LENGTH): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized ? normalized.slice(0, maxLength) : null;
}

function normalizeTimestamp(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function mapOfficialStatusLevel(value: unknown): ProviderServiceStatusLevel {
  switch (value) {
    case "none":
    case "operational":
    case "resolved":
    case "completed":
      return "operational";
    case "minor":
    case "degraded":
    case "degraded_performance":
    case "monitoring":
    case "identified":
    case "investigating":
      return "degraded";
    case "maintenance":
    case "under_maintenance":
    case "scheduled":
    case "in_progress":
      return "maintenance";
    case "major":
    case "critical":
    case "outage":
    case "partial_outage":
    case "major_outage":
      return "outage";
    default:
      return "unknown";
  }
}

function levelRank(level: ProviderServiceStatusLevel): number {
  switch (level) {
    case "outage":
      return 4;
    case "degraded":
      return 3;
    case "maintenance":
      return 2;
    case "operational":
      return 1;
    case "unknown":
    default:
      return 0;
  }
}

function mostSevereLevel(
  levels: readonly ProviderServiceStatusLevel[],
): ProviderServiceStatusLevel {
  return levels.reduce<ProviderServiceStatusLevel>(
    (current, level) =>
      levelRank(level) > levelRank(current) ? level : current,
    "unknown",
  );
}

export function createDefaultProviderServiceStatusVisibilityBySurface(): ProviderServiceStatusVisibilityBySurface {
  return Object.fromEntries(
    PROVIDER_SERVICE_STATUS_SURFACES.map((surface) => [
      surface,
      {
        codex: false,
        "claude-code": false,
        cursor: false,
      },
    ]),
  ) as ProviderServiceStatusVisibilityBySurface;
}

export function normalizeProviderServiceStatusVisibilityBySurface(
  value: unknown,
): ProviderServiceStatusVisibilityBySurface {
  const defaults = createDefaultProviderServiceStatusVisibilityBySurface();
  if (!isRecord(value)) {
    return defaults;
  }

  for (const surface of PROVIDER_SERVICE_STATUS_SURFACES) {
    const surfaceValue = value[surface];
    if (!isRecord(surfaceValue)) {
      continue;
    }

    for (const brandId of STATUS_BRAND_IDS) {
      defaults[surface][brandId] = surfaceValue[brandId] === true;
    }
  }

  return defaults;
}

export function setProviderServiceStatusVisibility(
  value: ProviderServiceStatusVisibilityBySurface,
  surface: DisplaySurface,
  brandId: ProviderBrandId,
  visible: boolean,
): ProviderServiceStatusVisibilityBySurface {
  return {
    ...value,
    [surface]: {
      ...value[surface],
      [brandId]: visible,
    },
  };
}

export function isProviderServiceStatusVisible(
  value: ProviderServiceStatusVisibilityBySurface,
  surface: DisplaySurface,
  providerId: ProviderId,
): boolean {
  const brandId = getProviderDefinition(providerId).brandId;
  return value[surface]?.[brandId] === true;
}

export function getProviderServiceStatusForProvider(
  statuses: readonly ProviderServiceStatus[] | undefined,
  providerId: ProviderId,
): ProviderServiceStatus | null {
  const brandId = getProviderDefinition(providerId).brandId;
  return statuses?.find((status) => status.brandId === brandId) ?? null;
}

export function getEnabledProviderServiceStatusVendorIds(
  value: ProviderServiceStatusVisibilityBySurface,
): ProviderServiceStatusVendorId[] {
  return PROVIDER_SERVICE_STATUS_VENDOR_IDS.filter((vendorId) => {
    const brandId = PROVIDER_SERVICE_STATUS_CONFIG[vendorId].brandId;
    return PROVIDER_SERVICE_STATUS_SURFACES.some(
      (surface) => value[surface]?.[brandId] === true,
    );
  });
}

export function parseProviderServiceStatusSummary({
  checkedAt,
  payload,
  vendorId,
}: {
  checkedAt: Date;
  payload: unknown;
  vendorId: ProviderServiceStatusVendorId;
}): ProviderServiceStatus | null {
  if (!isRecord(payload)) {
    return null;
  }

  const config = PROVIDER_SERVICE_STATUS_CONFIG[vendorId];
  const page = isRecord(payload.page) ? payload.page : null;
  const pageStatus = isRecord(payload.status) ? payload.status : null;
  if (!page || !pageStatus) {
    return null;
  }

  const indicator = normalizeText(pageStatus.indicator, 40);
  const description = normalizeText(pageStatus.description);
  if (!indicator || !description) {
    return null;
  }

  const components = Array.isArray(payload.components)
    ? payload.components
        .slice(0, MAX_COMPONENTS)
        .flatMap((component) => {
          if (!isRecord(component)) {
            return [];
          }
          const id = normalizeText(component.id, 96);
          const name = normalizeText(component.name);
          if (!id || !name) {
            return [];
          }
          return [
            {
              id,
              name,
              level: mapOfficialStatusLevel(component.status),
              updatedAt: normalizeTimestamp(component.updated_at),
            },
          ];
        })
    : [];
  const incidents = Array.isArray(payload.incidents)
    ? payload.incidents
        .slice(0, MAX_INCIDENTS)
        .flatMap((incident) => {
          if (!isRecord(incident)) {
            return [];
          }
          const id = normalizeText(incident.id, 96);
          const name = normalizeText(incident.name);
          const status = normalizeText(incident.status, 48);
          if (!id || !name || !status) {
            return [];
          }
          return [
            {
              id,
              name,
              level: mostSevereLevel([
                mapOfficialStatusLevel(incident.impact),
                mapOfficialStatusLevel(status),
              ]),
              status,
              updatedAt: normalizeTimestamp(incident.updated_at),
              url: `${config.statusPageUrl}/incidents/${encodeURIComponent(id)}`,
            },
          ];
        })
    : [];
  const level = mostSevereLevel([
    mapOfficialStatusLevel(indicator),
    ...components.map((component) => component.level),
    ...incidents.map((incident) => incident.level),
  ]);

  return {
    vendorId,
    brandId: config.brandId,
    level,
    description,
    statusPageUrl: config.statusPageUrl,
    checkedAt: checkedAt.toISOString(),
    sourceUpdatedAt: normalizeTimestamp(page.updated_at),
    retryAt: null,
    stale: false,
    failureReason: null,
    components,
    incidents,
  };
}

export function createUnknownProviderServiceStatus({
  checkedAt,
  failureReason,
  retryAt,
  vendorId,
}: {
  checkedAt: Date;
  failureReason: Exclude<ProviderServiceStatusFailureReason, null>;
  retryAt: Date;
  vendorId: ProviderServiceStatusVendorId;
}): ProviderServiceStatus {
  const config = PROVIDER_SERVICE_STATUS_CONFIG[vendorId];
  return {
    vendorId,
    brandId: config.brandId,
    level: "unknown",
    description: null,
    statusPageUrl: config.statusPageUrl,
    checkedAt: checkedAt.toISOString(),
    sourceUpdatedAt: null,
    retryAt: retryAt.toISOString(),
    stale: true,
    failureReason,
    components: [],
    incidents: [],
  };
}

export function normalizeProviderServiceStatuses(
  value: unknown,
): ProviderServiceStatus[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const byVendor = new Map<ProviderServiceStatusVendorId, ProviderServiceStatus>();
  for (const candidate of value) {
    if (!isRecord(candidate)) {
      continue;
    }
    const vendorId = candidate.vendorId;
    if (
      typeof vendorId !== "string" ||
      !PROVIDER_SERVICE_STATUS_VENDOR_IDS.includes(
        vendorId as ProviderServiceStatusVendorId,
      )
    ) {
      continue;
    }
    const normalizedVendorId = vendorId as ProviderServiceStatusVendorId;
    const checkedAt = normalizeTimestamp(candidate.checkedAt);
    const config = PROVIDER_SERVICE_STATUS_CONFIG[normalizedVendorId];
    const level = mapOfficialStatusLevel(candidate.level);
    if (!checkedAt || level === "unknown" && candidate.level !== "unknown") {
      continue;
    }
    const failureReason = [
      "permission_missing",
      "offline",
      "timeout",
      "rate_limited",
      "http_error",
      "invalid_response",
    ].includes(String(candidate.failureReason))
      ? (candidate.failureReason as Exclude<ProviderServiceStatusFailureReason, null>)
      : null;
    byVendor.set(normalizedVendorId, {
      vendorId: normalizedVendorId,
      brandId: config.brandId,
      level,
      description: normalizeText(candidate.description),
      statusPageUrl: config.statusPageUrl,
      checkedAt,
      sourceUpdatedAt: normalizeTimestamp(candidate.sourceUpdatedAt),
      retryAt: normalizeTimestamp(candidate.retryAt),
      stale: candidate.stale === true,
      failureReason,
      components: Array.isArray(candidate.components)
        ? candidate.components.slice(0, MAX_COMPONENTS).flatMap((component) => {
            if (!isRecord(component)) return [];
            const id = normalizeText(component.id, 96);
            const name = normalizeText(component.name);
            if (!id || !name) return [];
            return [{
              id,
              name,
              level: mapOfficialStatusLevel(component.level),
              updatedAt: normalizeTimestamp(component.updatedAt),
            }];
          })
        : [],
      incidents: Array.isArray(candidate.incidents)
        ? candidate.incidents.slice(0, MAX_INCIDENTS).flatMap((incident) => {
            if (!isRecord(incident)) return [];
            const id = normalizeText(incident.id, 96);
            const name = normalizeText(incident.name);
            const status = normalizeText(incident.status, 48);
            if (!id || !name || !status) return [];
            return [{
              id,
              name,
              level: mapOfficialStatusLevel(incident.level),
              status,
              updatedAt: normalizeTimestamp(incident.updatedAt),
              url: `${config.statusPageUrl}/incidents/${encodeURIComponent(id)}`,
            }];
          })
        : [],
    });
  }

  return PROVIDER_SERVICE_STATUS_VENDOR_IDS.flatMap((vendorId) => {
    const status = byVendor.get(vendorId);
    return status ? [status] : [];
  });
}
