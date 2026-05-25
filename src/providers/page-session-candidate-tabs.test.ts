import { describe, expect, it, vi } from "vitest";

import {
  getCandidateTabs,
  type PageSessionCandidateTabsApi,
} from "./page-session-candidate-tabs";

describe("getCandidateTabs", () => {
  it("puts a resolved bound tab before auto candidates and filters duplicates", async () => {
    const tabsApi: PageSessionCandidateTabsApi = {
      get: vi.fn().mockResolvedValue({
        id: 9,
        title: "Bound usage tab",
      }),
      query: vi.fn().mockResolvedValue([
        {
          id: 9,
          title: "Duplicate bound tab",
        },
        {
          id: 10,
          title: "Auto usage tab",
        },
      ]),
    };

    await expect(
      getCandidateTabs(tabsApi, {
        urlPatterns: ["https://cursor.com/*"],
        binding: {
          mode: "bound",
          tabId: 9,
        },
      }),
    ).resolves.toEqual({
      candidates: [
        {
          id: 9,
          title: "Bound usage tab",
          bindingMode: "bound",
        },
        {
          id: 10,
          title: "Auto usage tab",
          bindingMode: "auto",
        },
      ],
      bindingMissing: false,
    });
  });

  it("reports a missing bound tab when tab lookup fails", async () => {
    await expect(
      getCandidateTabs(
        {
          get: vi.fn().mockRejectedValue(new Error("No tab")),
          query: vi.fn().mockResolvedValue([]),
        },
        {
          urlPatterns: ["https://cursor.com/*"],
          binding: {
            mode: "bound",
            tabId: 9,
          },
        },
      ),
    ).resolves.toEqual({
      candidates: [],
      bindingMissing: true,
    });
  });

  it("uses query-only bound lookup when tab get is unavailable", async () => {
    await expect(
      getCandidateTabs(
        {
          query: vi
            .fn()
            .mockResolvedValueOnce([
              {
                id: 9,
                title: "Bound usage tab",
              },
            ])
            .mockResolvedValueOnce([
              {
                id: 9,
                title: "Duplicate bound tab",
              },
            ]),
        },
        {
          urlPatterns: ["https://cursor.com/*"],
          binding: {
            mode: "bound",
            tabId: 9,
          },
        },
      ),
    ).resolves.toEqual({
      candidates: [
        {
          id: 9,
          title: "Bound usage tab",
          bindingMode: "bound",
        },
      ],
      bindingMissing: false,
    });
  });

  it("sorts auto candidates by page-session priority", async () => {
    await expect(
      getCandidateTabs(
        {
          query: vi.fn().mockResolvedValue([
            {
              id: 1,
              active: true,
              lastAccessed: 1_765_000_000_000,
              url: "https://cursor.com/dashboard",
            },
            {
              id: 2,
              active: false,
              lastAccessed: 1,
              url: "https://cursor.com/dashboard/usage",
            },
          ]),
        },
        {
          urlPatterns: ["https://cursor.com/*"],
          binding: {
            mode: "auto",
            tabId: null,
            matchedUrl: "https://cursor.com/dashboard/usage",
          },
        },
      ),
    ).resolves.toEqual({
      candidates: [
        {
          id: 2,
          active: false,
          lastAccessed: 1,
          url: "https://cursor.com/dashboard/usage",
          bindingMode: "auto",
        },
        {
          id: 1,
          active: true,
          lastAccessed: 1_765_000_000_000,
          url: "https://cursor.com/dashboard",
          bindingMode: "auto",
        },
      ],
      bindingMissing: false,
    });
  });
});
