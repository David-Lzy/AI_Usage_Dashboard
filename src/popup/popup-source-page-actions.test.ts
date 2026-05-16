import { afterEach, describe, expect, it, vi } from "vitest";

import { SAMPLE_APP_STATE } from "../shared/constants";
import { openProviderSourcePage } from "./popup-source-page-actions";

function stubPopupWindow() {
  const open = vi.fn();
  const close = vi.fn();

  vi.stubGlobal("window", {
    close,
    open,
  });

  return {
    close,
    open,
  };
}

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

function createOkSendMessage() {
  return vi.fn(async () => ({
    ok: true as const,
    state: SAMPLE_APP_STATE,
  }));
}

describe("openProviderSourcePage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("falls back to provider detail for providers without shipped session-page plans", async () => {
    const openProviderDetail = vi.fn(async () => undefined);

    await openProviderSourcePage("gemini-policy", undefined, {
      openProviderDetail,
    });

    expect(openProviderDetail).toHaveBeenCalledWith("gemini-policy");
  });

  it("opens the preferred route directly when Chrome tab controls are unavailable", async () => {
    const popupWindow = stubPopupWindow();

    await openProviderSourcePage("codex-personal-page");

    expect(popupWindow.open).toHaveBeenCalledWith(
      "https://chatgpt.com/codex/cloud/settings/analytics",
      "_blank",
      "noopener,noreferrer",
    );
    expect(popupWindow.close).not.toHaveBeenCalled();
  });

  it("binds, refreshes, activates, and closes an existing source-page tab", async () => {
    const popupWindow = stubPopupWindow();
    const sendMessage = createOkSendMessage();
    const update = vi.fn(async () => undefined);

    vi.stubGlobal("chrome", {
      tabs: {
        create: vi.fn(),
        query: vi.fn(async () => [
          tab({
            id: 7,
            active: true,
            title: "Codex usage",
            url: "https://chatgpt.com/codex/cloud/settings/analytics#usage",
          }),
        ]),
        update,
      },
    });

    await openProviderSourcePage("codex-personal-page", "ready", {
      now: () => "2026-05-13T00:00:00.000Z",
      sendMessage,
    });

    expect(sendMessage).toHaveBeenNthCalledWith(1, {
      type: "app:set-provider-page-binding",
      providerId: "codex-personal-page",
      pageBinding: {
        mode: "bound",
        status: "bound",
        tabId: 7,
        matchedUrl:
          "https://chatgpt.com/codex/cloud/settings/analytics#usage",
        matchedTitle: "Codex usage",
        updatedAt: "2026-05-13T00:00:00.000Z",
      },
    });
    expect(sendMessage).toHaveBeenNthCalledWith(2, {
      type: "app:request-refresh",
      providerId: "codex-personal-page",
    });
    expect(update).toHaveBeenCalledWith(7, { active: true });
    expect(popupWindow.close).toHaveBeenCalled();
  });

  it("binds and closes a newly created source-page tab without immediate refresh", async () => {
    const popupWindow = stubPopupWindow();
    const sendMessage = createOkSendMessage();

    vi.stubGlobal("chrome", {
      tabs: {
        create: vi.fn(async () =>
          tab({
            id: 9,
            title: "Cursor usage",
            url: "https://cursor.com/dashboard/usage",
          }),
        ),
        query: vi.fn(async () => []),
        update: vi.fn(),
      },
    });

    await openProviderSourcePage("cursor-personal-page", "open_page_required", {
      now: () => "2026-05-13T00:05:00.000Z",
      sendMessage,
    });

    expect(sendMessage).toHaveBeenCalledOnce();
    expect(sendMessage).toHaveBeenCalledWith({
      type: "app:set-provider-page-binding",
      providerId: "cursor-personal-page",
      pageBinding: {
        mode: "bound",
        status: "bound",
        tabId: 9,
        matchedUrl: "https://cursor.com/dashboard/usage",
        matchedTitle: "Cursor usage",
        updatedAt: "2026-05-13T00:05:00.000Z",
      },
    });
    expect(popupWindow.close).toHaveBeenCalled();
  });
});
