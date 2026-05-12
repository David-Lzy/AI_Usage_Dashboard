import { describe, expect, it, vi } from "vitest";

import { SETTINGS_SECTION_IDS } from "../sidepanel/settings-section-ids";
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
        providerId: "codex",
      },
      {},
      { openProvider },
    );

    expect(openProvider).toHaveBeenCalledWith("codex");
  });

  it("opens source pages with the provider and source state kind", async () => {
    const openSourcePage = vi.fn(async () => undefined);

    await runPopupGuidanceAction(
      {
        kind: "source-page",
        label: "Open source",
        providerId: "cursor",
        sourceStateKind: "open_page_required",
      },
      {},
      { openSourcePage },
    );

    expect(openSourcePage).toHaveBeenCalledWith(
      "cursor",
      "open_page_required",
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
        providerId: "gemini",
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
