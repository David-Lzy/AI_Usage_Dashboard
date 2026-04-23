import { describe, expect, it } from "vitest";

import fixtureHtml from "../../../fixtures/jetbrains/users-and-licensing.fixture.html?raw";

import { parseJetBrainsUsersAndLicensingHtml } from "./page-parse";

describe("parseJetBrainsUsersAndLicensingHtml", () => {
  it("extracts cards and user quota rows from the sanitized fixture", () => {
    const parsed = parseJetBrainsUsersAndLicensingHtml(fixtureHtml);

    expect(parsed.cards.usersLicensedForAi.count).toBe(12);
    expect(parsed.cards.usersLicensedForAi.usersAlmostOutOfAiCredits).toBe(2);
    expect(parsed.cards.topUpAiCreditsAvailable).toBe(145);
    expect(parsed.users).toHaveLength(2);
    expect(parsed.users[0]).toEqual({
      name: "Alex",
      email: "alex@company.com",
      licensesAndQuotas: [
        {
          licenseName: "AI Pro",
          usedCredits: 8,
          includedCredits: 20,
        },
        {
          licenseName: "All Products Pack",
          usedCredits: 4,
          includedCredits: 20,
        },
      ],
      balanceUsedPercent: 54,
      topUpUsage: 2,
      topUpLimit: 10,
    });
    expect(parsed.users[1]).toEqual({
      name: "Morgan",
      email: "morgan@company.com",
      licensesAndQuotas: [
        {
          licenseName: "AI Ultimate",
          usedCredits: 60,
          includedCredits: 70,
        },
      ],
      balanceUsedPercent: 86,
      topUpUsage: 0,
      topUpLimit: 15,
    });
  });
});
