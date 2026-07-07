import { describe, expect, it, vi } from "vitest";

import { SETTINGS_SECTION_IDS } from "../shared/settings-section-ids";
import { runPopupGuidanceAction } from "./popup-guidance-action";

describe("runPopupGuidanceAction", () => {
  it("opens Settings with the optional focused target", async () => {
    const openSettingsRoute = vi.fn(async () => undefined);
    const settingsFocus = {
      kind: "section" as const,
      sectionId: SETTINGS_SECTION_IDS.quickSetup,
    };

    await runPopupGuidanceAction(
      {
        kind: "settings",
        label: "Open settings",
      },
      { settingsFocus },
      { openSettingsRoute },
    );

    expect(openSettingsRoute).toHaveBeenCalledWith(settingsFocus);
  });

  it("opens the dashboard for dashboard actions", async () => {
    const openDashboard = vi.fn(async () => undefined);

    await runPopupGuidanceAction(
      {
        kind: "dashboard",
        label: "Open dashboard",
      },
      {},
      { openDashboard },
    );

    expect(openDashboard).toHaveBeenCalledOnce();
  });

  it("opens provider detail when a provider id is present", async () => {
    const openProvider = vi.fn(async () => undefined);

    await runPopupGuidanceAction(
      {
        kind: "provider-detail",
        label: "Open provider",
        providerId: "codex-personal-page",
      },
      {},
      { openProvider },
    );

    expect(openProvider).toHaveBeenCalledWith("codex-personal-page");
  });

  it("falls back to focused Settings for grant-access actions", async () => {
    const openSettingsRoute = vi.fn(async () => undefined);

    await runPopupGuidanceAction(
      {
        kind: "grant-access",
        label: "Grant access",
        providerId: "codex-personal-page",
      },
      {},
      { openSettingsRoute },
    );

    expect(openSettingsRoute).toHaveBeenCalledWith({
      kind: "quick-setup-provider",
      providerId: "codex-personal-page",
    });
  });

  it("opens source pages with the provider and source state kind", async () => {
    const openSourcePage = vi.fn(async () => undefined);

    await runPopupGuidanceAction(
      {
        kind: "source-page",
        label: "Open source",
        providerId: "cursor-personal-page",
        sourceStateKind: "open_page_required",
      },
      {},
      { openSourcePage },
    );

    expect(openSourcePage).toHaveBeenCalledWith(
      "cursor-personal-page",
      "open_page_required",
      {
        skipExistingTabRefresh: false,
      },
    );
  });

  it("opens source-page title links in view mode without the recovery refresh", async () => {
    const openSourcePage = vi.fn(async () => undefined);

    await runPopupGuidanceAction(
      {
        kind: "source-page",
        label: "Open source",
        providerId: "cursor-personal-page",
        sourcePageNavigationMode: "view",
      },
      {},
      { openSourcePage },
    );

    expect(openSourcePage).toHaveBeenCalledWith(
      "cursor-personal-page",
      undefined,
      {
        skipExistingTabRefresh: true,
      },
    );
  });

  it("ignores hide-provider actions because the hide helper owns them", async () => {
    const openDashboard = vi.fn(async () => undefined);
    const openProvider = vi.fn(async () => undefined);
    const openSettingsRoute = vi.fn(async () => undefined);
    const openSourcePage = vi.fn(async () => undefined);

    await runPopupGuidanceAction(
      {
        kind: "hide-provider",
        label: "Hide",
        providerId: "gemini-policy",
      },
      {},
      {
        openDashboard,
        openProvider,
        openSettingsRoute,
        openSourcePage,
      },
    );

    expect(openDashboard).not.toHaveBeenCalled();
    expect(openProvider).not.toHaveBeenCalled();
    expect(openSettingsRoute).not.toHaveBeenCalled();
    expect(openSourcePage).not.toHaveBeenCalled();
  });
});
