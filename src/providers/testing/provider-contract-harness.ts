import {
  PROVIDER_CAPABILITY_IDS,
  type ProviderDescriptor,
} from "../provider-definitions";
import type {
  ProviderDiagnostic,
  ProviderId,
  ProviderSnapshot,
} from "../types";

export const PROVIDER_FIXTURE_MAX_BYTES = 128 * 1024;

const FORBIDDEN_SECRET_KEY = /^(?:authorization|cookie|set-cookie|access[_-]?token|refresh[_-]?token|api[_-]?key|admin[_-]?api[_-]?key|analytics[_-]?api[_-]?key|password|secret|account[_-]?id|user[_-]?id|workspace[_-]?id)$/i;
const FORBIDDEN_SECRET_VALUE = /(?:\bBearer\s+[A-Za-z0-9._~+\/-]+=*|\bsk-[A-Za-z0-9_-]{12,}|\b[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i;

function fail(message: string): never {
  throw new Error(`Provider contract violation: ${message}`);
}

function assertNonEmptyString(value: unknown, label: string): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    fail(`${label} must be a non-empty string`);
  }
}

function assertFiniteNullableNumber(value: unknown, label: string): void {
  if (value !== null && (typeof value !== "number" || !Number.isFinite(value))) {
    fail(`${label} must be null or a finite number`);
  }
}

function visitValue(
  value: unknown,
  visitor: (key: string | null, value: unknown, path: string) => void,
  path = "$",
  key: string | null = null,
): void {
  visitor(key, value, path);

  if (Array.isArray(value)) {
    value.forEach((entry, index) =>
      visitValue(entry, visitor, `${path}[${index}]`, null),
    );
    return;
  }

  if (value && typeof value === "object") {
    for (const [entryKey, entryValue] of Object.entries(value)) {
      visitValue(entryValue, visitor, `${path}.${entryKey}`, entryKey);
    }
  }
}

export function assertProviderDescriptorContract(
  descriptor: ProviderDescriptor,
): void {
  assertNonEmptyString(descriptor.id, "descriptor.id");
  assertNonEmptyString(descriptor.brandId, `${descriptor.id}.brandId`);
  assertNonEmptyString(descriptor.label, `${descriptor.id}.label`);
  assertNonEmptyString(descriptor.shortLabel, `${descriptor.id}.shortLabel`);

  if (descriptor.runtime.syncAdapterOwner !== descriptor.brandId) {
    fail(`${descriptor.id} adapter owner must match its brand`);
  }

  for (const capabilityId of PROVIDER_CAPABILITY_IDS) {
    if (typeof descriptor.runtime.capabilities[capabilityId] !== "boolean") {
      fail(`${descriptor.id}.${capabilityId} must be boolean`);
    }
  }

  if (
    descriptor.audience === "deferred" &&
    (descriptor.defaultDisplayEnabled || descriptor.quickSetupDefaultVisible)
  ) {
    fail(`${descriptor.id} is deferred and cannot be visible by default`);
  }

  if (
    descriptor.connectionMode === "none" &&
    descriptor.runtime.executionMode === "shared_strategy"
  ) {
    fail(`${descriptor.id} has no connection but declares a network strategy`);
  }
}

export function assertNormalizedProviderSnapshotContract(
  snapshot: ProviderSnapshot,
  expectedProviderId: ProviderId = snapshot.providerId,
): void {
  if (snapshot.providerId !== expectedProviderId) {
    fail(
      `snapshot provider id ${snapshot.providerId} does not match ${expectedProviderId}`,
    );
  }

  assertNonEmptyString(snapshot.providerLabel, "snapshot.providerLabel");
  assertNonEmptyString(snapshot.planName, "snapshot.planName");
  assertNonEmptyString(snapshot.syncedAt, "snapshot.syncedAt");

  if (!Number.isFinite(Date.parse(snapshot.syncedAt))) {
    fail("snapshot.syncedAt must be an ISO-compatible timestamp");
  }

  assertFiniteNullableNumber(snapshot.used, "snapshot.used");
  assertFiniteNullableNumber(snapshot.remaining, "snapshot.remaining");
  assertFiniteNullableNumber(snapshot.total, "snapshot.total");

  for (const diagnostic of [
    snapshot.warningDiagnostic,
    snapshot.sourceSelectionDiagnostic,
    snapshot.sourceFallbackDiagnostic,
  ]) {
    if (diagnostic) {
      assertProviderDiagnosticSanitized(diagnostic);
    }
  }
}

export function assertFailurePreservesPreviousSnapshot(
  previous: ProviderSnapshot,
  failed: ProviderSnapshot,
): void {
  if (failed.syncStatus !== "error") {
    fail("failure-preservation check requires an error snapshot");
  }
  if (previous.providerId !== failed.providerId) {
    fail("a failed refresh cannot cross source-entry identities");
  }

  const retainedFields = [
    "used",
    "remaining",
    "total",
    "usageWindows",
    "usageBalances",
    "usageFacts",
    "usageHistory",
    "cursorUsage",
  ] as const;

  for (const field of retainedFields) {
    const previousValue = previous[field];
    if (
      previousValue !== null &&
      previousValue !== undefined &&
      JSON.stringify(failed[field]) !== JSON.stringify(previousValue)
    ) {
      fail(`failed refresh erased or changed previous ${field}`);
    }
  }
}

export function assertCredentialRedacted(value: unknown, label = "value"): void {
  visitValue(value, (key, entryValue, path) => {
    if (key && FORBIDDEN_SECRET_KEY.test(key)) {
      fail(`${label} contains forbidden credential key at ${path}`);
    }
    if (typeof entryValue === "string" && FORBIDDEN_SECRET_VALUE.test(entryValue)) {
      fail(`${label} contains credential-like or account-identifying text at ${path}`);
    }
  });
}

export function assertProviderDiagnosticSanitized(
  diagnostic: ProviderDiagnostic,
): void {
  assertNonEmptyString(diagnostic.code, "diagnostic.code");
  assertNonEmptyString(diagnostic.rawMessage, "diagnostic.rawMessage");
  assertCredentialRedacted(diagnostic, "diagnostic");
}

export function assertSanitizedProviderFixture(
  fixture: unknown,
  options: Readonly<{ maxBytes?: number; label?: string }> = {},
): void {
  const label = options.label ?? "fixture";
  const serialized = JSON.stringify(fixture);
  const maxBytes = options.maxBytes ?? PROVIDER_FIXTURE_MAX_BYTES;

  if (Buffer.byteLength(serialized, "utf8") > maxBytes) {
    fail(`${label} exceeds the ${maxBytes}-byte fixture limit`);
  }

  assertCredentialRedacted(fixture, label);
}
