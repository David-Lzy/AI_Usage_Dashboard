import { describe, expect, it } from "vitest";

import { SAMPLE_APP_STATE } from "../shared/constants";
import {
  PROVIDER_CAPABILITY_IDS,
  PROVIDER_DEFINITIONS,
  PROVIDER_DESCRIPTORS,
  PROVIDER_IDS,
  getProviderDefinition,
  getProviderDescriptor,
  hasProviderCapability,
} from "./provider-definitions";
import type { ProviderId } from "./types";

const EXPECTED_PROVIDER_ID_RECORD = {
  "cursor-personal-page": true,
  "cursor-team-api": true,
  "claude-code-team-page": true,
  "claude-code-admin-api": true,
  "codex-personal-page": true,
  "codex-enterprise-api": true,
  "gemini-policy": true,
  "jetbrains-org-page": true,
} satisfies Record<ProviderId, true>;

const EXPECTED_PROVIDER_IDS = Object.keys(
  EXPECTED_PROVIDER_ID_RECORD,
) as ProviderId[];

describe("provider descriptors", () => {
  it("defines exactly one descriptor for every shipped provider id", () => {
    const descriptorIds = PROVIDER_DESCRIPTORS.map((descriptor) => descriptor.id);

    expect(descriptorIds).toEqual(EXPECTED_PROVIDER_IDS);
    expect(new Set(descriptorIds).size).toBe(EXPECTED_PROVIDER_IDS.length);
    expect(PROVIDER_IDS).toEqual(EXPECTED_PROVIDER_IDS);
    expect(PROVIDER_DEFINITIONS).toBe(PROVIDER_DESCRIPTORS);
  });

  it("keeps every static capability explicit and boolean", () => {
    for (const descriptor of PROVIDER_DESCRIPTORS) {
      expect(Object.keys(descriptor.runtime.capabilities).sort()).toEqual(
        [...PROVIDER_CAPABILITY_IDS].sort(),
      );

      for (const capability of PROVIDER_CAPABILITY_IDS) {
        expect(typeof descriptor.runtime.capabilities[capability]).toBe(
          "boolean",
        );
      }
    }
  });

  it("exposes adapter ownership without changing the definition API", () => {
    expect(
      getProviderDescriptor("codex-personal-page").runtime.syncAdapterOwner,
    ).toBe("codex");
    expect(
      getProviderDescriptor("cursor-team-api").runtime.syncAdapterOwner,
    ).toBe("cursor");
    expect(getProviderDefinition("claude-code-team-page")).toBe(
      getProviderDescriptor("claude-code-team-page"),
    );
  });

  it("makes each runtime execution mode explicit", () => {
    for (const descriptor of PROVIDER_DESCRIPTORS) {
      expect(descriptor.runtime.executionMode).toBe(
        descriptor.audience === "policy"
          ? "no_network_policy"
          : descriptor.audience === "deferred"
            ? "no_network_deferred"
            : "shared_strategy",
      );
    }
  });

  it("does not treat capability support as current snapshot availability", () => {
    const codex = SAMPLE_APP_STATE.providers.find(
      (provider) => provider.providerId === "codex-personal-page",
    );

    expect(codex).toBeDefined();
    expect({ ...codex, usageHistory: undefined }.usageHistory).toBeUndefined();
    expect(
      hasProviderCapability("codex-personal-page", "aggregateHistory"),
    ).toBe(true);
    expect(hasProviderCapability("gemini-policy", "quotaWindows")).toBe(false);
    expect(hasProviderCapability("codex-personal-page", "serviceStatus")).toBe(
      true,
    );
    expect(hasProviderCapability("cursor-team-api", "serviceStatus")).toBe(
      true,
    );
    expect(hasProviderCapability("gemini-policy", "serviceStatus")).toBe(false);
  });
});
