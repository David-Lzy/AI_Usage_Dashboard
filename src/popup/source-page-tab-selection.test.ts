import { describe, expect, it } from "vitest";

import { selectPreferredSourcePageTab } from "./source-page-tab-selection";

function tab(overrides: Partial<chrome.tabs.Tab>): chrome.tabs.Tab {
  return {
    active: false,
    highlighted: false,
    incognito: false,
    index: 0,
    pinned: false,
    selected: false,
    windowId: 1,
    ...overrides,
  } as chrome.tabs.Tab;
}

describe("selectPreferredSourcePageTab", () => {
  it("prefers exact preferred-route tabs over broader route-hint matches", () => {
    const selected = selectPreferredSourcePageTab(
      [
        tab({
          id: 1,
          active: true,
          url: "https://chatgpt.com/",
        }),
        tab({
          id: 2,
          active: false,
          url: "https://chatgpt.com/codex/cloud/settings/analytics",
        }),
      ],
      "https://chatgpt.com/codex/cloud/settings/analytics",
    );

    expect(selected?.id).toBe(2);
  });

  it("prioritizes active tabs within the selected candidate set", () => {
    const selected = selectPreferredSourcePageTab(
      [
        tab({
          id: 1,
          active: false,
          lastAccessed: 200,
          url: "https://cursor.com/dashboard/usage",
        }),
        tab({
          id: 2,
          active: true,
          lastAccessed: 100,
          url: "https://cursor.com/dashboard/usage",
        }),
      ],
      "https://cursor.com/dashboard/usage",
    );

    expect(selected?.id).toBe(2);
  });

  it("uses recency when no candidate tab is active", () => {
    const selected = selectPreferredSourcePageTab(
      [
        tab({
          id: 1,
          lastAccessed: 100,
          url: "https://claude.ai/settings/usage",
        }),
        tab({
          id: 2,
          lastAccessed: 300,
          url: "https://claude.ai/settings/usage",
        }),
      ],
      "https://claude.ai/settings/usage",
    );

    expect(selected?.id).toBe(2);
  });

  it("ignores tabs that cannot be updated or bound", () => {
    const selected = selectPreferredSourcePageTab(
      [
        tab({
          active: true,
          lastAccessed: 500,
          url: "https://cursor.com/dashboard/usage",
        }),
        tab({
          id: 2,
          active: false,
          lastAccessed: 100,
          url: "https://cursor.com/dashboard/usage",
        }),
      ],
      "https://cursor.com/dashboard/usage",
    );

    expect(selected?.id).toBe(2);
  });
});
