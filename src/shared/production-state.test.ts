import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { afterEach, describe, expect, it } from "vitest";

import type { AppState, ProviderSnapshot } from "../providers/types";
import {
  createDefaultAppState,
  DEFAULT_APP_STATE,
  DEFAULT_PROVIDER_SECRETS,
} from "./production-state";
import { SAMPLE_APP_STATE } from "./demo-state";

const PROVIDER_IDS = [
  "cursor-personal-page",
  "cursor-team-api",
  "jetbrains-org-page",
  "claude-code-team-page",
  "claude-code-admin-api",
  "gemini-policy",
  "codex-personal-page",
  "codex-enterprise-api",
  "sub2api-api-key",
] as const;

const originalSampleAppState = structuredClone(SAMPLE_APP_STATE);
const originalDefaultAppState = structuredClone(DEFAULT_APP_STATE);

function restoreObject<T extends object>(target: T, original: T): void {
  for (const key of Object.keys(target)) {
    delete (target as Record<string, unknown>)[key];
  }

  Object.assign(target, structuredClone(original));
}

function expectEmptyProviderSnapshot(provider: ProviderSnapshot): void {
  expect(provider.used).toBeNull();
  expect(provider.remaining).toBeNull();
  expect(provider.total).toBeNull();
  expect(provider.resetAt).toBe("");
  expect(provider.syncedAt).toBe("");
  expect(provider.lastAttemptAt).toBeNull();
  expect(provider.lastSuccessAt).toBeNull();
  expect(provider.usageWindows).toEqual([]);
  expect(provider.usageBalances).toEqual([]);
  expect(provider.usageFacts).toEqual([]);
  expect(provider.usageSummary).toBeNull();
  expect(provider).not.toHaveProperty("usageHistory");
  expect(provider).not.toHaveProperty("cursorUsage");
  expect(provider).not.toHaveProperty("apiGatewayMetering");
}

function findDemoStateImports(entryFileName: string): string[] {
  const visited = new Set<string>();
  const demoStateImports: string[] = [];

  const visit = (fileName: string): void => {
    if (visited.has(fileName)) {
      return;
    }
    visited.add(fileName);

    const sourceFile = ts.createSourceFile(
      fileName,
      readFileSync(fileName, "utf8"),
      ts.ScriptTarget.Latest,
      true,
    );

    for (const statement of sourceFile.statements) {
      if (
        !(ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement)) ||
        !statement.moduleSpecifier || !ts.isStringLiteral(statement.moduleSpecifier)
      ) {
        continue;
      }

      const specifier = statement.moduleSpecifier.text;
      if (/(^|\/)demo-state(?:\.ts)?$/.test(specifier)) {
        demoStateImports.push(fileName);
      }
      if (!specifier.startsWith(".")) {
        continue;
      }

      const baseName = resolve(dirname(fileName), specifier);
      const dependency = [".ts", ".tsx", "/index.ts", "/index.tsx"]
        .map((suffix) => `${baseName}${suffix}`)
        .find(existsSync);
      if (dependency) {
        visit(dependency);
      }
    }
  };

  visit(entryFileName);
  return demoStateImports;
}

afterEach(() => {
  restoreObject(SAMPLE_APP_STATE, originalSampleAppState);
  restoreObject(DEFAULT_APP_STATE, originalDefaultAppState);
});

describe("production state", () => {
  it("creates nine blank provider snapshots without sample usage or capture data", () => {
    const state = createDefaultAppState();

    expect(state.providers.map((provider) => provider.providerId)).toEqual(
      PROVIDER_IDS,
    );
    expect(state.providers).toHaveLength(9);
    state.providers.forEach(expectEmptyProviderSnapshot);
    expect(state).not.toHaveProperty("providerAccounts");
  });

  it("does not inherit mutable demo fixture usage or inactive account data", () => {
    const sample = SAMPLE_APP_STATE as AppState & {
      providerAccounts?: NonNullable<AppState["providerAccounts"]>;
    };
    const provider = sample.providers[0] as ProviderSnapshot & {
      usageHistory?: unknown;
      cursorUsage?: unknown;
      apiGatewayMetering?: unknown;
    };

    Object.assign(provider, {
      used: 999_999_999,
      remaining: 888_888_888,
      total: 1_888_888_887,
      resetAt: "2099-12-31T23:59:59.999Z",
      syncedAt: "2099-12-31T23:59:59.999Z",
      lastAttemptAt: "2099-12-31T23:59:59.999Z",
      lastSuccessAt: "2099-12-31T23:59:59.999Z",
      usageWindows: [{ fixture: "huge-window" }],
      usageBalances: [{ fixture: "huge-balance" }],
      usageFacts: [{ fixture: "huge-fact" }],
      usageHistory: { fixture: "huge-history" },
      cursorUsage: { fixture: "huge-cursor-usage" },
      apiGatewayMetering: { fixture: "huge-api-gateway-metering" },
      futureSensitiveField: "synthetic-default-isolation-sentinel",
    });
    sample.providerAccounts = {
      "cursor-personal-page": {
        activeAccountId: "fixture-account",
        accounts: [
          {
            id: "fixture-account",
            label: "Fixture account",
            createdAt: "2099-12-31T23:59:59.999Z",
            lastSuccessAt: "2099-12-31T23:59:59.999Z",
          },
        ],
        inactiveAccounts: {
          "fixture-account": {
            snapshot: provider,
            setting: sample.providerSettings[0],
          },
        },
      },
    };

    const state = createDefaultAppState();

    expectEmptyProviderSnapshot(state.providers[0]);
    expect(state.providers[0]).not.toHaveProperty("futureSensitiveField");
    expect(state).not.toHaveProperty("providerAccounts");
  });

  it("returns independent settings and empty credentials", () => {
    const first = createDefaultAppState();
    const second = createDefaultAppState();

    first.settings.locale = "de";
    first.settings.actionBadgeSelections.push("fixture-badge");
    first.settings.providerOrderBySurface.popup.push("cursor-personal-page");
    first.settings.progressColorBands[0].colorHex = "#000000";

    expect(second.settings.locale).toBe("system");
    expect(second.settings.actionBadgeSelections).not.toContain("fixture-badge");
    expect(second.settings.providerOrderBySurface.popup).not.toContain(
      "cursor-personal-page",
    );
    expect(second.settings.progressColorBands[0].colorHex).not.toBe("#000000");
    expect(DEFAULT_PROVIDER_SECRETS).toEqual({
      "cursor-team-api": { adminApiKey: null },
      "claude-code-admin-api": { adminApiKey: null },
      "codex-enterprise-api": { analyticsApiKey: null, workspaceId: null },
      "sub2api-api-key": { apiKey: null },
    });
  });

  it("does not derive fresh state from mutations to the exported default", () => {
    DEFAULT_APP_STATE.providers[0].used = 999_999_999;
    DEFAULT_APP_STATE.providers[0].usageFacts = [
      { label: "Fixture", value: "999999999", detail: "must not leak" },
    ];
    DEFAULT_APP_STATE.settings.locale = "fr";

    const fresh = createDefaultAppState();

    expectEmptyProviderSnapshot(fresh.providers[0]);
    expect(fresh.settings.locale).toBe("system");
  });

  it("keeps production, storage and reset dependencies free of demo-state imports", () => {
    for (const entry of ["./production-state.ts", "./constants.ts", "./storage.ts", "./provider-secrets.ts", "../sidepanel/standard-app-settings-actions.ts", "../sidepanel/use-standard-app-runtime.ts"]) {
      const fileName = fileURLToPath(new URL(entry, import.meta.url));
      expect(findDemoStateImports(fileName), entry).toEqual([]);
    }
  });
});
