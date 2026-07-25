import { describe, expect, it } from "vitest";

import manifest from "../manifest.json";
import {
  getSub2ApiHostOriginPattern,
  normalizeSub2ApiConnection,
} from "../providers/sub2api/connection";
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

  if (candidatePattern.host === "*") {
    return true;
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

function isDynamicRouteHint(value: string): boolean {
  return value.startsWith("<configured-origin>");
}

describe("provider source host permission contract", () => {
  it("keeps custom source HTTP and HTTPS endpoint origins requestable", () => {
    expectPatternCoverage({
      candidatePatterns: OPTIONAL_HOST_PERMISSIONS,
      targetPattern: "http://localhost/*",
      context: "custom source HTTP endpoints must be requestable",
    });
    expectPatternCoverage({
      candidatePatterns: OPTIONAL_HOST_PERMISSIONS,
      targetPattern: "https://example.com/*",
      context: "custom source HTTPS endpoints must be requestable",
    });
  });

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
          if (isDynamicRouteHint(routeHint)) {
            continue;
          }
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
          if (isDynamicRouteHint(routeHint)) {
            continue;
          }
          expectPatternCoverage({
            candidatePatterns: OPTIONAL_HOST_PERMISSIONS,
            targetPattern: routeHint,
            context: `${providerId} ${sourcePlan.kind} route hint is not covered by manifest optional host permissions`,
          });
        }
      }
    }
  });

  it("derives requestable Sub2API host access from the configured deployment", () => {
    const setting = SAMPLE_APP_STATE.providerSettings.find(
      (providerSetting) => providerSetting.id === "sub2api-api-key",
    );
    const blueprint = PROVIDER_SOURCE_BLUEPRINTS["sub2api-api-key"];

    expect(setting?.hostOrigins).toEqual([]);
    expect(blueprint.sources[0]?.routeHints).toContain(
      "<configured-origin>/v1/usage",
    );

    for (const baseUrl of [
      "https://gateway.example.test",
      "http://127.0.0.1:8080",
    ]) {
      const connection = normalizeSub2ApiConnection({
        displayLabel: "Test gateway",
        baseUrl,
        insecureTransportAcknowledged: baseUrl.startsWith("http:"),
      });
      if (!connection.ok) {
        throw new Error("Expected a valid synthetic Sub2API connection");
      }
      expectPatternCoverage({
        candidatePatterns: OPTIONAL_HOST_PERMISSIONS,
        targetPattern: getSub2ApiHostOriginPattern(connection.value),
        context: "configured Sub2API origins must be requestable",
      });
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
