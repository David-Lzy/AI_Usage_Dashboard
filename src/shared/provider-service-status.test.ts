import { describe, expect, it } from "vitest";

import {
  createDefaultProviderServiceStatusVisibilityBySurface,
  getEnabledProviderServiceStatusVendorIds,
  mapOfficialStatusLevel,
  normalizeProviderServiceStatuses,
  normalizeProviderServiceStatusVisibilityBySurface,
  parseProviderServiceStatusSummary,
  setProviderServiceStatusVisibility,
} from "./provider-service-status";

const NOW = new Date("2026-07-25T06:00:00.000Z");

function createSummaryPayload() {
  return {
    page: {
      id: "status-page",
      name: "OpenAI",
      updated_at: "2026-07-25T05:58:00.000Z",
    },
    status: {
      indicator: "minor",
      description: "Minor Service Outage",
    },
    components: [
      {
        id: "codex-api",
        name: "Codex API",
        status: "degraded_performance",
        updated_at: "2026-07-25T05:57:00.000Z",
      },
    ],
    incidents: [
      {
        id: "incident-1",
        name: "Elevated errors",
        status: "monitoring",
        impact: "minor",
        updated_at: "2026-07-25T05:59:00.000Z",
        shortlink: "https://stspg.io/private-redirect",
      },
    ],
  };
}

describe("provider service status model", () => {
  it("keeps all official vendor modules disabled by default", () => {
    const value = createDefaultProviderServiceStatusVisibilityBySurface();

    expect(getEnabledProviderServiceStatusVendorIds(value)).toEqual([]);
    expect(value.popup).toMatchObject({
      codex: false,
      "claude-code": false,
      cursor: false,
    });
  });

  it("normalizes only known brands and exact boolean visibility", () => {
    expect(
      normalizeProviderServiceStatusVisibilityBySurface({
        popup: { codex: true, cursor: "true", gemini: true },
        sidebar: { "claude-code": true },
        fullPage: null,
      }),
    ).toEqual({
      popup: { codex: true, "claude-code": false, cursor: false },
      sidebar: { codex: false, "claude-code": true, cursor: false },
      fullPage: { codex: false, "claude-code": false, cursor: false },
    });
  });

  it("resolves enabled vendors from all surfaces without duplicates", () => {
    let value = createDefaultProviderServiceStatusVisibilityBySurface();
    value = setProviderServiceStatusVisibility(value, "popup", "codex", true);
    value = setProviderServiceStatusVisibility(value, "sidebar", "codex", true);
    value = setProviderServiceStatusVisibility(value, "fullPage", "cursor", true);

    expect(getEnabledProviderServiceStatusVendorIds(value)).toEqual([
      "openai",
      "cursor",
    ]);
  });

  it("parses a bounded Statuspage summary and replaces redirect links", () => {
    const status = parseProviderServiceStatusSummary({
      vendorId: "openai",
      checkedAt: NOW,
      payload: createSummaryPayload(),
    });

    expect(status).toMatchObject({
      vendorId: "openai",
      brandId: "codex",
      level: "degraded",
      description: "Minor Service Outage",
      stale: false,
      failureReason: null,
      components: [{ id: "codex-api", level: "degraded" }],
      incidents: [
        {
          id: "incident-1",
          level: "degraded",
          url: "https://status.openai.com/incidents/incident-1",
        },
      ],
    });
  });

  it("rejects malformed payloads and maps known official states", () => {
    expect(
      parseProviderServiceStatusSummary({
        vendorId: "cursor",
        checkedAt: NOW,
        payload: { status: { indicator: "none" } },
      }),
    ).toBeNull();
    expect(mapOfficialStatusLevel("under_maintenance")).toBe("maintenance");
    expect(mapOfficialStatusLevel("major_outage")).toBe("outage");
    expect(mapOfficialStatusLevel("surprise")).toBe("unknown");
  });

  it("normalizes stored entries and enforces official incident URLs", () => {
    const parsed = parseProviderServiceStatusSummary({
      vendorId: "openai",
      checkedAt: NOW,
      payload: createSummaryPayload(),
    });

    expect(normalizeProviderServiceStatuses([parsed, { vendorId: "fake" }]))
      .toMatchObject([
        {
          vendorId: "openai",
          incidents: [
            { url: "https://status.openai.com/incidents/incident-1" },
          ],
        },
      ]);
  });
});
