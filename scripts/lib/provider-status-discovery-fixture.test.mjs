import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  normalizeProviderServiceStatusLevel,
  parseProviderStatusDiscoveryFixture,
} from "./provider-status-discovery-fixture.mjs";

const FIXTURE_PATHS = [
  "fixtures/provider-status/openai-status-discovery.fixture.json",
  "fixtures/provider-status/claude-status-discovery.fixture.json",
  "fixtures/provider-status/cursor-status-discovery.fixture.json",
];

async function readFixture(relativePath) {
  return JSON.parse(
    await readFile(path.join(process.cwd(), relativePath), "utf8"),
  );
}

describe("provider status discovery fixtures", () => {
  it("normalizes the bounded official contract examples", async () => {
    const normalized = await Promise.all(
      FIXTURE_PATHS.map(async (fixturePath) =>
        parseProviderStatusDiscoveryFixture(await readFixture(fixturePath)),
      ),
    );

    expect(normalized.map((status) => status.vendor)).toEqual([
      "openai",
      "anthropic",
      "cursor",
    ]);
    for (const status of normalized) {
      expect(status.sourceUrl).toMatch(/^https:\/\/status\./);
      expect(status.level).toBe("operational");
      expect(status.components).toHaveLength(1);
      expect(status.incidents).toHaveLength(1);
      expect(status.incidents[0].url).toMatch(/^https:\/\//);
    }
  });

  it("maps Statuspage and Incident.io status values conservatively", () => {
    expect(normalizeProviderServiceStatusLevel("none")).toBe("operational");
    expect(normalizeProviderServiceStatusLevel("degraded_performance")).toBe(
      "degraded",
    );
    expect(normalizeProviderServiceStatusLevel("partial_outage")).toBe(
      "partial_outage",
    );
    expect(normalizeProviderServiceStatusLevel("critical")).toBe(
      "major_outage",
    );
    expect(normalizeProviderServiceStatusLevel("under_maintenance")).toBe(
      "maintenance",
    );
    expect(normalizeProviderServiceStatusLevel("new_vendor_value")).toBe(
      "unknown",
    );
  });

  it("rejects unapproved hosts, markup, and oversized fixture collections", async () => {
    const fixture = await readFixture(FIXTURE_PATHS[0]);

    expect(() =>
      parseProviderStatusDiscoveryFixture({
        ...fixture,
        sourceUrl: "https://example.com/status.json",
      }),
    ).toThrow("approved official HTTPS host");
    expect(() =>
      parseProviderStatusDiscoveryFixture({
        ...fixture,
        state: { ...fixture.state, description: "<b>Operational</b>" },
      }),
    ).toThrow("contains markup");
    expect(() =>
      parseProviderStatusDiscoveryFixture({
        ...fixture,
        components: Array.from({ length: 9 }, () => fixture.components[0]),
      }),
    ).toThrow("components are invalid");
  });
});
