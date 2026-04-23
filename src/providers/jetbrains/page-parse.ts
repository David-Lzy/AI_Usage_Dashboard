export type JetBrainsLicenseQuota = {
  licenseName: string;
  usedCredits: number;
  includedCredits: number;
};

export type JetBrainsParsedUserRow = {
  name: string;
  email: string;
  licensesAndQuotas: JetBrainsLicenseQuota[];
  balanceUsedPercent: number;
  topUpUsage: number;
  topUpLimit: number;
};

export type JetBrainsUsersAndLicensingParsed = {
  cards: {
    usersLicensedForAi: {
      count: number;
      usersAlmostOutOfAiCredits: number | null;
    };
    topUpAiCreditsAvailable: number;
  };
  users: JetBrainsParsedUserRow[];
};

function matchSingle(source: string, pattern: RegExp, label: string): string {
  const match = source.match(pattern);

  if (!match?.[1]) {
    throw new Error(`JetBrains parser could not find ${label}.`);
  }

  return match[1].trim();
}

function parseInteger(value: string, label: string): number {
  const normalized = value.replace("%", "").trim();
  const parsed = Number.parseInt(normalized, 10);

  if (Number.isNaN(parsed)) {
    throw new Error(`JetBrains parser could not parse ${label}.`);
  }

  return parsed;
}

function parseOptionalInteger(source: string, pattern: RegExp): number | null {
  const match = source.match(pattern);

  if (!match?.[1]) {
    return null;
  }

  return parseInteger(match[1], "optional integer");
}

function parseUserRows(html: string): JetBrainsParsedUserRow[] {
  const rowMatches = html.matchAll(/<tr data-user-row="[^"]+">([\s\S]*?)<\/tr>/g);
  const users: JetBrainsParsedUserRow[] = [];

  for (const rowMatch of rowMatches) {
    const rowHtml = rowMatch[1] ?? "";
    const name = matchSingle(
      rowHtml,
      /<td data-field="name">([\s\S]*?)<\/td>/,
      "user name",
    );
    const email = matchSingle(
      rowHtml,
      /<td data-field="email">([\s\S]*?)<\/td>/,
      "user email",
    );
    const balanceUsedPercent = parseInteger(
      matchSingle(
        rowHtml,
        /<td data-field="balance-used-percent">([\s\S]*?)<\/td>/,
        "balance used percent",
      ),
      "balance used percent",
    );
    const topUpUsage = parseInteger(
      matchSingle(
        rowHtml,
        /<td data-field="top-up-usage">([\s\S]*?)<\/td>/,
        "top-up usage",
      ),
      "top-up usage",
    );
    const topUpLimit = parseInteger(
      matchSingle(
        rowHtml,
        /<td data-field="top-up-limit">([\s\S]*?)<\/td>/,
        "top-up limit",
      ),
      "top-up limit",
    );

    const licensesSection = matchSingle(
      rowHtml,
      /<td data-field="licenses-and-quotas">([\s\S]*?)<\/td>/,
      "licenses and quotas",
    );
    const licenseMatches = licensesSection.matchAll(
      /<li data-license-name="([^"]+)">[\s\S]*?<span data-field="used">(\d+)<\/span>[\s\S]*?<span data-field="included">(\d+)<\/span>/g,
    );
    const licensesAndQuotas: JetBrainsLicenseQuota[] = [];

    for (const licenseMatch of licenseMatches) {
      licensesAndQuotas.push({
        licenseName: licenseMatch[1],
        usedCredits: parseInteger(licenseMatch[2], "license used credits"),
        includedCredits: parseInteger(
          licenseMatch[3],
          "license included credits",
        ),
      });
    }

    if (licensesAndQuotas.length === 0) {
      throw new Error(`JetBrains parser found no licenses for ${email}.`);
    }

    users.push({
      name,
      email,
      licensesAndQuotas,
      balanceUsedPercent,
      topUpUsage,
      topUpLimit,
    });
  }

  if (users.length === 0) {
    throw new Error("JetBrains parser found no user rows.");
  }

  return users;
}

export function parseJetBrainsUsersAndLicensingHtml(
  html: string,
): JetBrainsUsersAndLicensingParsed {
  const usersAlmostOutOfAiCredits = parseOptionalInteger(
    html,
    /<span data-field="users-almost-out-of-ai-credits-count">([\s\S]*?)<\/span>/,
  );

  return {
    cards: {
      usersLicensedForAi: {
        count: parseInteger(
          matchSingle(
            html,
            /<p data-field="licensed-users-count">([\s\S]*?)<\/p>/,
            "licensed users count",
          ),
          "licensed users count",
        ),
        usersAlmostOutOfAiCredits,
      },
      topUpAiCreditsAvailable: parseInteger(
        matchSingle(
          html,
          /<p data-field="top-up-ai-credits-available">([\s\S]*?)<\/p>/,
          "top-up AI Credits available",
        ),
        "top-up AI Credits available",
      ),
    },
    users: parseUserRows(html),
  };
}
