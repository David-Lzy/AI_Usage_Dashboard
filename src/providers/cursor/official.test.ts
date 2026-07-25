import { describe, expect, it, vi } from "vitest";

import { createCursorOfficialClient } from "./official";

describe("createCursorOfficialClient", () => {
  it("forwards the shared strategy abort signal to live requests", async () => {
    const signal = new AbortController().signal;
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json: async () => ({ teamMembers: [] }),
    } as Response);
    const client = createCursorOfficialClient({
      source: "live",
      apiKey: "cursor-live-key",
      fetchImpl,
      signal,
    });

    await expect(client.getTeamMembers()).resolves.toEqual({ teamMembers: [] });
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.cursor.com/teams/members",
      {
        method: "GET",
        signal,
        headers: {
          Authorization: "Basic Y3Vyc29yLWxpdmUta2V5Og==",
          "Content-Type": "application/json",
        },
      },
    );
  });
});
