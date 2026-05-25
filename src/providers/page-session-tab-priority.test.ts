import { describe, expect, it } from "vitest";

import { sortTabsByPriority } from "./page-session-tab-priority";

describe("sortTabsByPriority", () => {
  it("prefers the exact matched URL over active and recent tabs", () => {
    const sorted = sortTabsByPriority(
      [
        {
          id: 1,
          active: true,
          lastAccessed: 1_000,
          url: "https://cursor.com/dashboard",
          title: "Cursor Home",
        },
        {
          id: 2,
          active: false,
          lastAccessed: 1,
          url: "https://cursor.com/dashboard/usage",
          title: "Cursor Usage",
        },
      ],
      {
        matchedUrl: "https://cursor.com/dashboard/usage",
      },
    );

    expect(sorted.map((tab) => tab.id)).toEqual([2, 1]);
  });

  it("keeps exact URL matches ahead of Chrome epoch recency fallback", () => {
    const sorted = sortTabsByPriority(
      [
        {
          id: 1,
          active: true,
          lastAccessed: 1_765_000_000_000,
          url: "https://cursor.com/dashboard",
          title: "Cursor Home",
        },
        {
          id: 2,
          active: false,
          lastAccessed: 1,
          url: "https://cursor.com/dashboard/usage",
          title: "Cursor Usage",
        },
      ],
      {
        matchedUrl: "https://cursor.com/dashboard/usage",
      },
    );

    expect(sorted.map((tab) => tab.id)).toEqual([2, 1]);
  });

  it("keeps hash-only URL matches ahead of prefix matches", () => {
    const sorted = sortTabsByPriority(
      [
        {
          id: 1,
          url: "https://chatgpt.com/codex/cloud/settings/analytics/details",
        },
        {
          id: 2,
          url: "https://chatgpt.com/codex/cloud/settings/analytics",
        },
      ],
      {
        matchedUrl: "https://chatgpt.com/codex/cloud/settings/analytics#usage",
      },
    );

    expect(sorted.map((tab) => tab.id)).toEqual([2, 1]);
  });

  it("uses prefix URL matches before active-tab and recency fallback", () => {
    const sorted = sortTabsByPriority(
      [
        {
          id: 1,
          active: true,
          lastAccessed: 10_000,
          url: "https://chatgpt.com/",
        },
        {
          id: 2,
          active: false,
          lastAccessed: 1,
          url: "https://chatgpt.com/codex/cloud/settings/analytics/details",
        },
      ],
      {
        matchedUrl: "https://chatgpt.com/codex/cloud/settings/analytics",
      },
    );

    expect(sorted.map((tab) => tab.id)).toEqual([2, 1]);
  });

  it("keeps prefix URL matches ahead of Chrome epoch recency fallback", () => {
    const sorted = sortTabsByPriority(
      [
        {
          id: 1,
          active: true,
          lastAccessed: 1_765_000_000_000,
          url: "https://chatgpt.com/",
        },
        {
          id: 2,
          active: false,
          lastAccessed: 1,
          url: "https://chatgpt.com/codex/cloud/settings/analytics/details",
        },
      ],
      {
        matchedUrl: "https://chatgpt.com/codex/cloud/settings/analytics",
      },
    );

    expect(sorted.map((tab) => tab.id)).toEqual([2, 1]);
  });

  it("uses matched title before active-tab and recency fallback", () => {
    const sorted = sortTabsByPriority(
      [
        {
          id: 1,
          active: true,
          lastAccessed: 10_000,
          title: "Cursor Home",
        },
        {
          id: 2,
          active: false,
          lastAccessed: 1,
          title: "Cursor Usage",
        },
      ],
      {
        matchedTitle: "Cursor Usage",
      },
    );

    expect(sorted.map((tab) => tab.id)).toEqual([2, 1]);
  });

  it("keeps matched title ahead of Chrome epoch recency fallback", () => {
    const sorted = sortTabsByPriority(
      [
        {
          id: 1,
          active: true,
          lastAccessed: 1_765_000_000_000,
          title: "Cursor Home",
        },
        {
          id: 2,
          active: false,
          lastAccessed: 1,
          title: "Cursor Usage",
        },
      ],
      {
        matchedTitle: "Cursor Usage",
      },
    );

    expect(sorted.map((tab) => tab.id)).toEqual([2, 1]);
  });

  it("combines active-tab boost with last accessed time", () => {
    const sorted = sortTabsByPriority([
      {
        id: 1,
        active: false,
        lastAccessed: 5_000,
      },
      {
        id: 2,
        active: true,
        lastAccessed: 1,
      },
    ]);

    expect(sorted.map((tab) => tab.id)).toEqual([2, 1]);
  });
});
