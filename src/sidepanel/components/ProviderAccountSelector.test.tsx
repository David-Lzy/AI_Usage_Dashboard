import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { ProviderAccountsByProvider } from "../../providers/types";
import { ProviderAccountSelector } from "./ProviderAccountSelector";

const providerAccounts: ProviderAccountsByProvider = {
  "cursor-team-api": {
    activeAccountId: "default",
    accounts: [
      {
        id: "default",
        label: "Default",
        createdAt: null,
        lastSuccessAt: null,
      },
      {
        id: "account_12345678",
        label: "Workspace 2",
        createdAt: "2026-07-25T00:00:00.000Z",
        lastSuccessAt: null,
      },
    ],
    inactiveAccounts: {},
  },
};

describe("ProviderAccountSelector", () => {
  it("renders an equal Material selector only when capability is enabled", () => {
    const html = renderToStaticMarkup(
      <ProviderAccountSelector
        accountLabel="Provider account"
        providerId="cursor-team-api"
        providerAccounts={providerAccounts}
        capabilityResolver={() => true}
        onChange={() => undefined}
      />,
    );

    expect(html).toContain('data-provider-account-selector=""');
    expect(html).toContain("Provider account");
    expect(html).toContain("Default");
  });

  it("does not reserve UI space for providers without the capability", () => {
    const html = renderToStaticMarkup(
      <ProviderAccountSelector
        accountLabel="Provider account"
        providerId="cursor-team-api"
        providerAccounts={providerAccounts}
        capabilityResolver={() => false}
        onChange={() => undefined}
      />,
    );

    expect(html).toBe("");
  });
});
