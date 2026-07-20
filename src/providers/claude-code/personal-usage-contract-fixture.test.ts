import { describe, expect, it } from "vitest";

import fixture from "../../../fixtures/claude/personal-usage-contract.fixture.json";

describe("Claude personal usage contract fixture", () => {
  it("records the current usage route and structured limit fields", () => {
    expect(fixture.route).toEqual({
      canonical: "https://claude.ai/new#settings/usage",
      legacyEntry: "https://claude.ai/settings/usage",
    });
    expect(fixture.identity).toMatchObject({
      planLabel: "Pro",
      accountClass: "individual_paid",
      source: "rendered_usage_dialog",
    });
    expect(fixture.usage.limits).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "session", group: "session" }),
        expect.objectContaining({ kind: "weekly_all", group: "weekly" }),
      ]),
    );
  });

  it("contains only synthetic aggregate-safe evidence", () => {
    const serialized = JSON.stringify(fixture);

    expect(serialized).not.toMatch(
      /cookie|authorization|bearer|access[_-]?token|account[_-]?id|organization[_-]?id|user[_-]?id|email|session[_-]?id/i,
    );
    expect(serialized).not.toMatch(
      /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i,
    );
  });
});
