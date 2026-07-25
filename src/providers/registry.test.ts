import { beforeEach, describe, expect, it, vi } from "vitest";

import { SAMPLE_APP_STATE, SAMPLE_PROVIDER_SECRETS } from "../shared/constants";
import {
  PROVIDER_DESCRIPTORS,
  PROVIDER_IDS,
  getProviderDescriptor,
} from "./provider-definitions";
import type { ProviderSetting, ProviderSnapshot } from "./types";

type AdapterInput = {
  provider: ProviderSnapshot;
  setting: ProviderSetting;
};

const adapterMocks = vi.hoisted(() => {
  const createAdapter = () =>
    vi.fn((input: AdapterInput) => Promise.resolve({ snapshot: input.provider }));

  return {
    cursor: createAdapter(),
    jetbrains: createAdapter(),
    claudeCode: createAdapter(),
    gemini: createAdapter(),
    codex: createAdapter(),
  };
});

vi.mock("./cursor/adapter", () => ({
  syncCursorProvider: adapterMocks.cursor,
}));
vi.mock("./jetbrains/adapter", () => ({
  syncJetBrainsProvider: adapterMocks.jetbrains,
}));
vi.mock("./claude-code/adapter", () => ({
  syncClaudeCodeProvider: adapterMocks.claudeCode,
}));
vi.mock("./gemini/adapter", () => ({
  syncGeminiProvider: adapterMocks.gemini,
}));
vi.mock("./codex/adapter", () => ({
  syncCodexProvider: adapterMocks.codex,
}));

import {
  buildProviderRegistry,
  getProviderRegistryEntry,
  getProviderSyncAdapter,
  getRegisteredProviderConnectionMode,
  getRegisteredProviderDescriptor,
  hasRegisteredProviderCapability,
} from "./registry";

function getProviderState(providerId: ProviderSnapshot["providerId"]): {
  provider: ProviderSnapshot;
  setting: ProviderSetting;
} {
  const provider = SAMPLE_APP_STATE.providers.find(
    (candidate) => candidate.providerId === providerId,
  );
  const setting = SAMPLE_APP_STATE.providerSettings.find(
    (candidate) => candidate.id === providerId,
  );

  if (!provider || !setting) {
    throw new Error(`Missing sample provider state for ${providerId}`);
  }

  return { provider, setting };
}

function buildContext(setting: ProviderSetting) {
  return {
    attemptedAt: new Date("2026-07-23T10:00:00.000Z"),
    trigger: "manual" as const,
    secrets: SAMPLE_PROVIDER_SECRETS,
    setting,
    warningThresholdPercent: 80,
  };
}

describe("provider runtime registry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds one descriptor-backed entry for every provider id", () => {
    const registry = buildProviderRegistry();

    expect([...registry.keys()]).toEqual(PROVIDER_IDS);
    for (const providerId of PROVIDER_IDS) {
      expect(getRegisteredProviderDescriptor(providerId)).toBe(
        getProviderDescriptor(providerId),
      );
      expect(getProviderSyncAdapter(providerId)).toBe(
        getProviderRegistryEntry(providerId),
      );
    }
  });

  it("exposes descriptor connection and capability metadata", () => {
    expect(getRegisteredProviderConnectionMode("codex-personal-page")).toBe(
      "page_session",
    );
    expect(
      hasRegisteredProviderCapability(
        "cursor-personal-page",
        "aggregateHistory",
      ),
    ).toBe(true);
    expect(
      hasRegisteredProviderCapability("gemini-policy", "serviceStatus"),
    ).toBe(false);
  });

  it("dispatches source entries through their descriptor adapter owner", async () => {
    for (const descriptor of PROVIDER_DESCRIPTORS) {
      const { provider, setting } = getProviderState(descriptor.id);
      await getProviderRegistryEntry(descriptor.id).sync(
        provider,
        buildContext({ ...setting, sourcePreference: "auto" }),
      );
    }

    expect(adapterMocks.cursor).toHaveBeenCalledTimes(2);
    expect(adapterMocks.jetbrains).toHaveBeenCalledTimes(1);
    expect(adapterMocks.claudeCode).toHaveBeenCalledTimes(2);
    expect(adapterMocks.gemini).toHaveBeenCalledTimes(1);
    expect(adapterMocks.codex).toHaveBeenCalledTimes(2);

    for (const mock of Object.values(adapterMocks)) {
      for (const [input] of mock.mock.calls) {
        expect(input.setting.sourcePreference).toBe(
          getProviderDescriptor(input.provider.providerId).fixedSourcePreference,
        );
      }
    }
  });

  it("fails fast for missing, duplicate, or mismatched descriptors", () => {
    expect(() => buildProviderRegistry(PROVIDER_DESCRIPTORS.slice(1))).toThrow(
      /Missing provider descriptors: cursor-personal-page/,
    );
    expect(() =>
      buildProviderRegistry([
        ...PROVIDER_DESCRIPTORS,
        PROVIDER_DESCRIPTORS[0],
      ]),
    ).toThrow(/Duplicate provider descriptor: cursor-personal-page/);

    const [cursor, ...remaining] = PROVIDER_DESCRIPTORS;
    expect(() =>
      buildProviderRegistry([
        {
          ...cursor,
          runtime: {
            ...cursor.runtime,
            syncAdapterOwner: "codex",
          },
        },
        ...remaining,
      ]),
    ).toThrow(/Provider adapter owner mismatch for cursor-personal-page/);
  });

  it("rejects snapshot and setting ids that do not match the entry", () => {
    const cursor = getProviderState("cursor-personal-page");
    const codex = getProviderState("codex-personal-page");

    expect(() =>
      getProviderRegistryEntry("cursor-personal-page").sync(
        codex.provider,
        buildContext(cursor.setting),
      ),
    ).toThrow(/Provider registry mismatch for cursor-personal-page/);
    expect(() =>
      getProviderRegistryEntry("cursor-personal-page").sync(
        cursor.provider,
        buildContext(codex.setting),
      ),
    ).toThrow(/Provider registry mismatch for cursor-personal-page/);
  });
});
