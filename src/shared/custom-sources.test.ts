import { describe, expect, it } from "vitest";

import type { DashboardSourceId } from "./custom-sources";
import {
  CUSTOM_SOURCE_RESPONSE_MAX_CHARS,
  CUSTOM_SOURCE_SCHEMA_V1,
  isCustomSourceId,
  isDashboardSourceId,
  normalizeCustomSourceEndpointUrl,
  normalizeCustomSourceResponse,
  parseCustomSourceResponseJson,
  toCustomSourceId,
} from "./custom-sources";

const SOURCE_ID = "custom:build-quota" as const;
const FETCHED_AT = "2026-06-26T08:00:00.000Z";

describe("custom sources", () => {
  it("normalizes a minimum custom source response", () => {
    const result = normalizeCustomSourceResponse(
      {
        schema: CUSTOM_SOURCE_SCHEMA_V1,
        label: "Build Quota",
        status: "ok",
        quota: {
          unit: "minutes",
          window: "monthly",
          used: 320,
          remaining: 680,
          total: 1000,
        },
      },
      { sourceId: SOURCE_ID, fetchedAt: FETCHED_AT },
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Expected a valid custom source response.");
    }
    expect(result.value).toMatchObject({
      sourceId: SOURCE_ID,
      label: "Build Quota",
      planName: "Custom JSON source",
      quotaUnit: "minutes",
      quotaWindow: "monthly",
      used: 320,
      remaining: 680,
      total: 1000,
      syncedAt: FETCHED_AT,
      syncStatus: "ok",
      tone: "neutral",
      warningReason: null,
    });
    expect(result.value.quota?.label).toBe("Primary quota");
  });

  it("normalizes a full custom source response with windows, balances, and facts", () => {
    const result = parseCustomSourceResponseJson(
      JSON.stringify({
        schema: CUSTOM_SOURCE_SCHEMA_V1,
        id: "build-quota",
        label: "Build Quota",
        description: "CI minutes for the current billing month",
        status: "warning",
        tone: "warning",
        syncedAt: "2026-06-26T08:00:00Z",
        summary: "680 of 1000 CI minutes remaining",
        quota: {
          unit: "minutes",
          window: "monthly",
          used: 320,
          remaining: 680,
          total: 1000,
          resetAt: "2026-07-01T00:00:00Z",
          resetLabel: "Resets July 1",
        },
        windows: [
          {
            label: "Monthly CI minutes",
            unit: "percent",
            used: 32,
            remaining: 68,
            resetLabel: "Resets July 1",
          },
        ],
        balances: [
          {
            label: "Included minutes",
            unit: "minutes",
            used: 320,
            remaining: 680,
            total: 1000,
          },
        ],
        facts: [
          {
            label: "Plan",
            value: "Team",
            detail: "Monthly included CI minutes",
          },
        ],
        warningReason: "Below the preferred reserve.",
      }),
      { sourceId: SOURCE_ID, fetchedAt: FETCHED_AT },
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Expected a valid custom source response.");
    }
    expect(result.value.endpointId).toBe("build-quota");
    expect(result.value.description).toBe(
      "CI minutes for the current billing month",
    );
    expect(result.value.usageSummary).toBe(
      "680 of 1000 CI minutes remaining",
    );
    expect(result.value.warningReason).toBe("Below the preferred reserve.");
    expect(result.value.windows).toEqual([
      {
        label: "Monthly CI minutes",
        unit: "percent",
        window: null,
        used: 32,
        remaining: 68,
        total: 100,
        resetAt: null,
        resetLabel: "Resets July 1",
      },
    ]);
    expect(result.value.balances).toHaveLength(1);
    expect(result.value.facts).toEqual([
      {
        label: "Plan",
        value: "Team",
        detail: "Monthly included CI minutes",
      },
    ]);
  });

  it("accepts http and https endpoint URLs", () => {
    expect(normalizeCustomSourceEndpointUrl("http://localhost:4173/quota")).toEqual({
      ok: true,
      value: "http://localhost:4173/quota",
    });
    expect(normalizeCustomSourceEndpointUrl("https://example.com/quota")).toEqual({
      ok: true,
      value: "https://example.com/quota",
    });
  });

  it("rejects unsupported endpoint URL schemes", () => {
    for (const url of [
      "javascript:alert(1)",
      "data:application/json,{}",
      "file:///tmp/source.json",
      "chrome-extension://extension/source.json",
      "moz-extension://extension/source.json",
    ]) {
      const result = normalizeCustomSourceEndpointUrl(url);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.issues[0]?.code).toBe("unsupported_url_scheme");
      }
    }
  });

  it("rejects invalid schema and invalid JSON", () => {
    const invalidSchema = normalizeCustomSourceResponse(
      {
        schema: "other",
        label: "Build Quota",
        status: "ok",
        quota: {
          unit: "minutes",
          remaining: 10,
        },
      },
      { sourceId: SOURCE_ID, fetchedAt: FETCHED_AT },
    );
    const invalidJson = parseCustomSourceResponseJson("{not-json", {
      sourceId: SOURCE_ID,
      fetchedAt: FETCHED_AT,
    });

    expect(invalidSchema.ok).toBe(false);
    if (!invalidSchema.ok) {
      expect(invalidSchema.issues.map((issue) => issue.code)).toContain(
        "invalid_schema",
      );
    }
    expect(invalidJson.ok).toBe(false);
    if (!invalidJson.ok) {
      expect(invalidJson.issues[0]?.code).toBe("invalid_json");
    }
  });

  it("rejects oversized response bodies and oversized arrays", () => {
    const oversizedBody = parseCustomSourceResponseJson(
      " ".repeat(CUSTOM_SOURCE_RESPONSE_MAX_CHARS + 1),
      { sourceId: SOURCE_ID, fetchedAt: FETCHED_AT },
    );
    const oversizedWindows = normalizeCustomSourceResponse(
      {
        schema: CUSTOM_SOURCE_SCHEMA_V1,
        label: "Build Quota",
        status: "ok",
        windows: Array.from({ length: 9 }, (_, index) => ({
          label: `Window ${index + 1}`,
          unit: "percent",
          remaining: 50,
        })),
      },
      { sourceId: SOURCE_ID, fetchedAt: FETCHED_AT },
    );

    expect(oversizedBody.ok).toBe(false);
    if (!oversizedBody.ok) {
      expect(oversizedBody.issues[0]?.code).toBe("response_too_large");
    }
    expect(oversizedWindows.ok).toBe(false);
    if (!oversizedWindows.ok) {
      expect(oversizedWindows.issues.map((issue) => issue.code)).toContain(
        "array_too_large",
      );
    }
  });

  it("rejects unsafe display text and invalid numeric values", () => {
    const unsafeText = normalizeCustomSourceResponse(
      {
        schema: CUSTOM_SOURCE_SCHEMA_V1,
        label: "<script>alert(1)</script>",
        status: "ok",
        quota: {
          unit: "minutes",
          remaining: 10,
        },
      },
      { sourceId: SOURCE_ID, fetchedAt: FETCHED_AT },
    );
    const invalidNumber = normalizeCustomSourceResponse(
      {
        schema: CUSTOM_SOURCE_SCHEMA_V1,
        label: "Build Quota",
        status: "ok",
        quota: {
          unit: "minutes",
          remaining: -1,
        },
      },
      { sourceId: SOURCE_ID, fetchedAt: FETCHED_AT },
    );

    expect(unsafeText.ok).toBe(false);
    if (!unsafeText.ok) {
      expect(unsafeText.issues.map((issue) => issue.code)).toContain(
        "unsafe_text",
      );
    }
    expect(invalidNumber.ok).toBe(false);
    if (!invalidNumber.ok) {
      expect(invalidNumber.issues.map((issue) => issue.code)).toContain(
        "invalid_number",
      );
    }
  });

  it("keeps custom ids separate while allowing mixed dashboard source ids", () => {
    const customId = toCustomSourceId("Build_Quota");
    const sourceIds: DashboardSourceId[] = [
      "codex-personal-page",
      "custom:build_quota",
    ];

    expect(customId).toBe("custom:build_quota");
    expect(isCustomSourceId(customId)).toBe(true);
    expect(isDashboardSourceId("codex-personal-page")).toBe(true);
    expect(isDashboardSourceId("custom:build_quota")).toBe(true);
    expect(isDashboardSourceId("unknown")).toBe(false);
    expect(sourceIds).toEqual(["codex-personal-page", "custom:build_quota"]);
  });
});
