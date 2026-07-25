import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import matrixJson from "../../config/provider-authoring-matrix.json";
import { PROVIDER_SOURCE_BLUEPRINTS } from "../shared/constants";
import {
  PROVIDER_DESCRIPTORS,
  PROVIDER_IDS,
  type ProviderDescriptor,
} from "./provider-definitions";
import { getRegisteredProviderDescriptor } from "./registry";
import {
  assertCredentialRedacted,
  assertFailurePreservesPreviousSnapshot,
  assertNormalizedProviderSnapshotContract,
  assertProviderDescriptorContract,
  assertProviderDiagnosticSanitized,
  assertSanitizedProviderFixture,
} from "./testing/provider-contract-harness";
import type { ProviderId, ProviderSnapshot } from "./types";

type ProviderAuthoringMatrixEntry = {
  id: ProviderId;
  adapterOwner: ProviderDescriptor["brandId"];
  adapterTest: string;
  providerNote: string;
  sourceContract: string;
  i18nPolicy: string;
  localizedCopyOwner: string;
  hostAccessContract:
    | "optional_page_origin"
    | "optional_api_origin"
    | "none";
  displayEligibility: "shipped" | "deferred";
};

const matrix = matrixJson as {
  schemaVersion: number;
  providers: ProviderAuthoringMatrixEntry[];
};

function projectFileExists(path: string): boolean {
  return existsSync(resolve(process.cwd(), path));
}

function createSnapshot(
  overrides: Partial<ProviderSnapshot> = {},
): ProviderSnapshot {
  return {
    providerId: "codex-personal-page",
    providerLabel: "Codex Personal",
    planName: "Personal",
    quotaUnit: "percent",
    quotaWindow: "rolling",
    used: 25,
    remaining: 75,
    total: 100,
    resetAt: "2026-07-26T00:00:00.000Z",
    resetLabel: "Resets tomorrow",
    syncedAt: "2026-07-25T00:00:00.000Z",
    syncSource: "page_parse",
    syncStatus: "ok",
    warningReason: null,
    lastSyncLabel: "Synced just now",
    sourceSelectionReason: "Verified session source",
    sourceFallbackReason: null,
    usageWindows: [],
    usageBalances: [],
    usageFacts: [],
    tone: "neutral",
    ...overrides,
  };
}

describe("provider authoring matrix", () => {
  it("covers every descriptor and its maintained ownership artifacts", () => {
    expect(matrix.schemaVersion).toBe(1);
    expect(matrix.providers.map((entry) => entry.id).sort()).toEqual(
      [...PROVIDER_IDS].sort(),
    );

    for (const entry of matrix.providers) {
      const descriptor = PROVIDER_DESCRIPTORS.find(
        (candidate) => candidate.id === entry.id,
      );
      expect(descriptor, entry.id).toBeDefined();
      assertProviderDescriptorContract(descriptor!);
      expect(entry.adapterOwner).toBe(descriptor!.runtime.syncAdapterOwner);
      expect(getRegisteredProviderDescriptor(entry.id)).toBe(descriptor);

      for (const artifact of [
        entry.adapterTest,
        entry.providerNote,
        entry.sourceContract,
        entry.i18nPolicy,
        entry.localizedCopyOwner,
      ]) {
        expect(projectFileExists(artifact), `${entry.id}: ${artifact}`).toBe(true);
      }
    }
  });

  it("keeps source stage, host access, and display eligibility aligned", () => {
    for (const entry of matrix.providers) {
      const descriptor = getRegisteredProviderDescriptor(entry.id);
      const blueprint = PROVIDER_SOURCE_BLUEPRINTS[entry.id];
      const sourcePlan = blueprint.sources.find(
        (candidate) => candidate.kind === descriptor.sourceKind,
      );
      const expectedHostAccess =
        descriptor.connectionMode === "credential"
          ? "optional_api_origin"
          : descriptor.connectionMode === "page_session"
            ? "optional_page_origin"
            : "none";
      const expectedEligibility = blueprint.sources.some(
        (candidate) => candidate.rolloutStage === "shipped",
      )
        ? "shipped"
        : "deferred";

      expect(sourcePlan, `${entry.id} source plan`).toBeDefined();
      expect(sourcePlan?.connectionMode).toBe(descriptor.connectionMode);
      if (descriptor.sourceKind === "policy_only") {
        expect(descriptor.fixedSourcePreference).toBe("auto");
      } else {
        expect(blueprint.preferredSourceKind).toBe(
          descriptor.fixedSourcePreference,
        );
      }
      expect(entry.hostAccessContract).toBe(expectedHostAccess);
      expect(entry.displayEligibility).toBe(expectedEligibility);

      if (entry.displayEligibility === "deferred") {
        expect(descriptor.defaultDisplayEnabled).toBe(false);
        expect(descriptor.quickSetupDefaultVisible).toBe(false);
      }
    }
  });

  it("keeps public authoring and attribution entry points present", () => {
    const guide = readFileSync(
      resolve(process.cwd(), "Doc/Product/Provider_Authoring_Guide.md"),
      "utf8",
    );
    const notices = readFileSync(
      resolve(process.cwd(), "THIRD_PARTY_NOTICES.md"),
      "utf8",
    );

    expect(guide).toContain("concept-only");
    expect(guide).toContain("translated/derived");
    expect(guide).toContain("independent verification");
    expect(guide).toContain("128 KiB");
    expect(notices).toContain("provider-upstream-provenance.json");
  });
});

describe("provider contract harness", () => {
  it("accepts normalized data and preserved failed refreshes", () => {
    const previous = createSnapshot({
      usageFacts: [{ label: "Plan", value: "Personal", detail: null }],
    });
    const failed = createSnapshot({
      syncStatus: "error",
      warningReason: "Provider unavailable",
      usageFacts: previous.usageFacts,
    });

    expect(() =>
      assertNormalizedProviderSnapshotContract(previous),
    ).not.toThrow();
    expect(() =>
      assertFailurePreservesPreviousSnapshot(previous, failed),
    ).not.toThrow();
  });

  it("rejects erased previous data and credential-bearing diagnostics", () => {
    const previous = createSnapshot({ usageBalances: [{
      label: "Credits",
      normalizedLabel: "credits",
      kind: "flex_credit_balance",
      quotaUnit: "credits",
      remaining: 20,
      total: null,
      detail: null,
    }] });
    const failed = createSnapshot({
      syncStatus: "error",
      usageBalances: [],
    });

    expect(() =>
      assertFailurePreservesPreviousSnapshot(previous, failed),
    ).toThrow(/usageBalances/);
    expect(() =>
      assertProviderDiagnosticSanitized({
        code: "adapter.unexpected_error",
        category: "adapter_error",
        severity: "error",
        rawMessage: "Bearer secret-session-token",
      }),
    ).toThrow(/credential-like/);
  });

  it("rejects fixture secrets and oversized fixture payloads", () => {
    expect(() =>
      assertSanitizedProviderFixture({ payload: { used: 10 } }),
    ).not.toThrow();
    expect(() =>
      assertSanitizedProviderFixture({ payload: { access_token: "secret" } }),
    ).toThrow(/credential key/);
    expect(() =>
      assertSanitizedProviderFixture("x".repeat(32), { maxBytes: 8 }),
    ).toThrow(/fixture limit/);
    expect(() =>
      assertCredentialRedacted({ note: "person@example.com" }),
    ).toThrow(/account-identifying/);
  });
});
