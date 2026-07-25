export const PROVIDER_STATUS_DISCOVERY_FIXTURE_SCHEMA =
  "ai-usage-dashboard.provider-status-discovery.v1";

const VENDORS = new Set(["openai", "anthropic", "cursor"]);
const LEVELS = new Set([
  "operational",
  "degraded",
  "partial_outage",
  "major_outage",
  "maintenance",
  "unknown",
]);

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function boundedText(value, label, maxLength = 240) {
  if (typeof value !== "string") {
    throw new Error(`${label} must be a string.`);
  }
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized || normalized.length > maxLength || /[<>]/.test(normalized)) {
    throw new Error(`${label} is empty, oversized, or contains markup.`);
  }
  return normalized;
}

function nullableTimestamp(value, label) {
  if (value === null) {
    return null;
  }
  const timestamp = boundedText(value, label, 48);
  if (!Number.isFinite(Date.parse(timestamp))) {
    throw new Error(`${label} must be an ISO-compatible timestamp.`);
  }
  return timestamp;
}

function officialUrl(value, label, allowedHost) {
  const url = new URL(boundedText(value, label, 512));
  if (url.protocol !== "https:" || url.hostname !== allowedHost) {
    throw new Error(`${label} must use the approved official HTTPS host.`);
  }
  return url.toString();
}

export function normalizeProviderServiceStatusLevel(value) {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (["none", "operational", "resolved"].includes(normalized)) {
    return "operational";
  }
  if (["minor", "degraded", "degraded_performance"].includes(normalized)) {
    return "degraded";
  }
  if (normalized === "partial_outage") {
    return "partial_outage";
  }
  if (["major", "critical", "major_outage"].includes(normalized)) {
    return "major_outage";
  }
  if (["maintenance", "under_maintenance"].includes(normalized)) {
    return "maintenance";
  }
  return "unknown";
}

export function parseProviderStatusDiscoveryFixture(input) {
  if (!isRecord(input)) {
    throw new Error("Provider status discovery fixture must be an object.");
  }
  if (input.fixtureSchema !== PROVIDER_STATUS_DISCOVERY_FIXTURE_SCHEMA) {
    throw new Error("Provider status discovery fixture schema is unsupported.");
  }
  if (input.fixtureKind !== "sanitized_contract_example") {
    throw new Error("Provider status discovery fixture kind is unsupported.");
  }
  if (!VENDORS.has(input.vendor)) {
    throw new Error("Provider status discovery fixture vendor is unsupported.");
  }

  const allowedHost = {
    openai: "status.openai.com",
    anthropic: "status.claude.com",
    cursor: "status.cursor.com",
  }[input.vendor];
  const state = input.state;
  if (!isRecord(state)) {
    throw new Error("Provider status discovery fixture state is required.");
  }
  if (!Array.isArray(input.components) || input.components.length > 8) {
    throw new Error("Provider status discovery fixture components are invalid.");
  }

  const components = input.components.map((component, index) => {
    if (!isRecord(component)) {
      throw new Error(`components[${index}] must be an object.`);
    }
    return {
      id: boundedText(component.id, `components[${index}].id`, 96),
      name: boundedText(component.name, `components[${index}].name`, 120),
      level: normalizeProviderServiceStatusLevel(component.status),
      updatedAt: nullableTimestamp(
        component.updatedAt ?? null,
        `components[${index}].updatedAt`,
      ),
    };
  });

  const incident = input.incidentSample;
  let incidents = [];
  if (incident !== null && incident !== undefined) {
    if (!isRecord(incident)) {
      throw new Error("incidentSample must be an object or null.");
    }
    const affectedComponents = incident.affectedComponents;
    if (!Array.isArray(affectedComponents) || affectedComponents.length > 8) {
      throw new Error("incidentSample.affectedComponents is invalid.");
    }
    const incidentUrl = new URL(
      boundedText(incident.url, "incidentSample.url", 512),
    );
    if (incidentUrl.protocol !== "https:" || incidentUrl.hostname !== allowedHost) {
      throw new Error("incidentSample.url must use an approved public status host.");
    }
    incidents = [
      {
        id: boundedText(incident.id, "incidentSample.id", 96),
        name: boundedText(incident.name, "incidentSample.name", 240),
        level: normalizeProviderServiceStatusLevel(incident.impact),
        status: boundedText(incident.status, "incidentSample.status", 64),
        startedAt: nullableTimestamp(
          incident.startedAt ?? null,
          "incidentSample.startedAt",
        ),
        updatedAt: nullableTimestamp(
          incident.updatedAt ?? null,
          "incidentSample.updatedAt",
        ),
        url: incidentUrl.toString(),
        affectedComponents: affectedComponents.map((name, index) =>
          boundedText(
            name,
            `incidentSample.affectedComponents[${index}]`,
            120,
          ),
        ),
      },
    ];
  }

  const level = normalizeProviderServiceStatusLevel(state.indicator);
  if (!LEVELS.has(level)) {
    throw new Error("Normalized provider status level is invalid.");
  }

  return {
    vendor: input.vendor,
    fetchedAt: nullableTimestamp(input.capturedAt, "capturedAt"),
    sourceUrl: officialUrl(input.sourceUrl, "sourceUrl", allowedHost),
    publicStatusUrl: officialUrl(
      input.publicStatusUrl,
      "publicStatusUrl",
      allowedHost,
    ),
    level,
    summary: boundedText(state.description, "state.description", 240),
    updatedAt: nullableTimestamp(state.updatedAt ?? null, "state.updatedAt"),
    components,
    incidents,
  };
}
