import { describe, expect, it } from "vitest";

import manifest from "../manifest.json";
import type { ProviderId, ProviderSourcePlan } from "../providers/types";
import { PROVIDER_SOURCE_BLUEPRINTS, SAMPLE_APP_STATE } from "./constants";

type HostPattern = {
  raw: string;
  scheme: string;
  host: string;
  path: string;
};

const OPTIONAL_HOST_PERMISSIONS = manifest.optional_host_permissions;

function parseHostPattern(value: string): HostPattern | null {
  const schemeSeparatorIndex = value.indexOf("://");

  if (schemeSeparatorIndex < 0) {
    return null;
  }

  const scheme = value.slice(0, schemeSeparatorIndex);
  const valueAfterScheme = value.slice(schemeSeparatorIndex + 3);
  const pathStartIndex = valueAfterScheme.indexOf("/");
  const host =
    pathStartIndex >= 0
      ? valueAfterScheme.slice(0, pathStartIndex)
      : valueAfterScheme;
  const path = pathStartIndex >= 0 ? valueAfterScheme.slice(pathStartIndex) : "/";

  if (!scheme || !host) {
    return null;
  }

  return {
    raw: value,
    scheme,
    host,
    path,
  };
}

function doesHostPatternCover(candidate: string, target: string): boolean {
  const candidatePattern = parseHostPattern(candidate);
  const targetPattern = parseHostPattern(target);

  if (!candidatePattern || !targetPattern) {
    return false;
  }

  if (candidatePattern.scheme !== targetPattern.scheme) {
    return false;
  }

  if (targetPattern.host.includes("*")) {
    return candidatePattern.host === targetPattern.host;
  }

  if (candidatePattern.host.startsWith("*.")) {
    const suffix = candidatePattern.host.slice(1);
    return targetPattern.host.endsWith(suffix);
  }

  if (candidatePattern.host !== targetPattern.host) {
    return false;
  }

  if (candidatePattern.path === "/*" || candidatePattern.path === "*") {
    return true;
  }

  if (candidatePattern.path.endsWith("*")) {
    return targetPattern.path.startsWith(candidatePattern.path.slice(0, -1));
  }

  return candidatePattern.path === targetPattern.path;
}

function expectPatternCoverage({
  candidatePatterns,
  targetPattern,
  context,
}: {
  candidatePatterns: string[];
  targetPattern: string;
  context: string;
}) {
  expect(
    candidatePatterns.some((candidatePattern) =>
      doesHostPatternCover(candidatePattern, targetPattern),
    ),
    `${context}: ${targetPattern}`,
  ).toBe(true);
}

function shouldExpectHostPermissionCoverage(
  sourcePlan: ProviderSourcePlan,
  hostOrigins: string[],
): boolean {
  return (
    sourcePlan.connectionMode !== "none" &&
    (sourcePlan.rolloutStage === "shipped" || hostOrigins.length > 0)
  );
}

describe("provider source host permission contract", () => {
  it("keeps every Settings host origin present in manifest optional host permissions", () => {
    for (const providerSetting of SAMPLE_APP_STATE.providerSettings) {
      for (const hostOrigin of providerSetting.hostOrigins) {
        expect(
          OPTIONAL_HOST_PERMISSIONS,
          `${providerSetting.id} host origin must be requestable by the manifest: ${hostOrigin}`,
        ).toContain(hostOrigin);
      }
    }
  });

  it("keeps requestable provider route hints covered by Settings host origins", () => {
    for (const providerSetting of SAMPLE_APP_STATE.providerSettings) {
      const providerId = providerSetting.id as ProviderId;
      const blueprint = PROVIDER_SOURCE_BLUEPRINTS[providerId];

      for (const sourcePlan of blueprint.sources) {
        if (
          !shouldExpectHostPermissionCoverage(
            sourcePlan,
            providerSetting.hostOrigins,
          )
        ) {
          continue;
        }

        for (const routeHint of sourcePlan.routeHints) {
          expectPatternCoverage({
            candidatePatterns: providerSetting.hostOrigins,
            targetPattern: routeHint,
            context: `${providerId} ${sourcePlan.kind} route hint is not covered by Settings host origins`,
          });
        }
      }
    }
  });

  it("keeps requestable provider route hints covered by manifest optional host permissions", () => {
    for (const providerSetting of SAMPLE_APP_STATE.providerSettings) {
      const providerId = providerSetting.id as ProviderId;
      const blueprint = PROVIDER_SOURCE_BLUEPRINTS[providerId];

      for (const sourcePlan of blueprint.sources) {
        if (
          !shouldExpectHostPermissionCoverage(
            sourcePlan,
            providerSetting.hostOrigins,
          )
        ) {
          continue;
        }

        for (const routeHint of sourcePlan.routeHints) {
          expectPatternCoverage({
            candidatePatterns: OPTIONAL_HOST_PERMISSIONS,
            targetPattern: routeHint,
            context: `${providerId} ${sourcePlan.kind} route hint is not covered by manifest optional host permissions`,
          });
        }
      }
    }
  });

  it("keeps deferred Gemini project metrics outside current host permissions", () => {
    const geminiSetting = SAMPLE_APP_STATE.providerSettings.find(
      (providerSetting) => providerSetting.id === "gemini-policy",
    );

    expect(geminiSetting?.hostOrigins).toEqual([]);
    expect(OPTIONAL_HOST_PERMISSIONS).not.toContain(
      "https://console.cloud.google.com/*",
    );
  });
});
