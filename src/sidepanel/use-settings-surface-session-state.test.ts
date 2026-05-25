import { describe, expect, it } from "vitest";

import {
  POPUP_APPEARANCE_PREVIEW_DEFAULT_REMAINING_PERCENT,
} from "./components/ToolbarPopupPreview";
import {
  buildSettingsSurfaceSessionStateSnapshot,
  createDefaultSettingsSurfaceSessionUiState,
  resolveSettingsSurfaceSessionUiState,
} from "./use-settings-surface-session-state";

describe("settings surface session state", () => {
  it("creates conservative default UI state without sensitive drafts", () => {
    expect(
      createDefaultSettingsSurfaceSessionUiState({
        activeSectionId: "settings-appearance",
        defaultAdvancedOpen: false,
        defaultUiMoreOpen: false,
        forceAdvancedOpen: false,
      }),
    ).toEqual({
      activeSectionId: "settings-appearance",
      advancedOpen: false,
      uiMoreOpen: false,
      toolbarPopupPreviewOpen: false,
      popupPreviewRemainingPercent:
        POPUP_APPEARANCE_PREVIEW_DEFAULT_REMAINING_PERCENT,
      toolbarPopupPreviewPosition: null,
      activePopover: null,
      providerProgressDetailsOpen: {},
      carouselIndexById: {},
    });
  });

  it("restores UI-only settings state while honoring explicit route focus", () => {
    const defaults = createDefaultSettingsSurfaceSessionUiState({
      activeSectionId: "settings-overview",
      defaultAdvancedOpen: false,
      defaultUiMoreOpen: false,
      forceAdvancedOpen: false,
    });

    expect(
      resolveSettingsSurfaceSessionUiState({
        defaults,
        forceAdvancedOpen: true,
        forceUiMoreOpen: true,
        restored: {
          activeSectionId: "settings-provider-display",
          advancedOpen: false,
          uiMoreOpen: false,
          toolbarPopupPreview: {
            open: true,
            percent: 151,
            position: {
              left: 300,
              top: 120,
            },
          },
          providerProgressDetailsOpen: {
            "codex-personal-page": true,
          },
          activePopover: {
            id: "progress-color-band:high:color",
            customPanelOpen: true,
          },
          carouselIndexById: {
            "quick-setup": 3,
          },
        },
      }),
    ).toEqual({
      activeSectionId: "settings-provider-display",
      advancedOpen: true,
      uiMoreOpen: true,
      toolbarPopupPreviewOpen: true,
      popupPreviewRemainingPercent: 100,
      toolbarPopupPreviewPosition: {
        left: 300,
        top: 120,
      },
      activePopover: {
        id: "progress-color-band:high:color",
        customPanelOpen: true,
      },
      providerProgressDetailsOpen: {
        "codex-personal-page": true,
      },
      carouselIndexById: {
        "quick-setup": 3,
      },
    });
  });

  it("builds a settings-only session snapshot without draft payloads", () => {
    const uiState = resolveSettingsSurfaceSessionUiState({
      defaults: createDefaultSettingsSurfaceSessionUiState({
        activeSectionId: "settings-appearance",
        defaultAdvancedOpen: false,
        defaultUiMoreOpen: false,
        forceAdvancedOpen: false,
      }),
      forceAdvancedOpen: false,
      forceUiMoreOpen: false,
      restored: {
        activeSectionId: "settings-appearance",
        advancedOpen: true,
        uiMoreOpen: true,
        toolbarPopupPreview: {
          open: true,
          percent: 63,
          position: {
            left: 280,
            top: 96,
          },
        },
        providerProgressDetailsOpen: {
          "claude-code-team-page": true,
        },
        activePopover: {
          id: "popup-progress-style",
        },
        carouselIndexById: {
          credentials: 1,
        },
      },
    });

    const snapshot = buildSettingsSurfaceSessionStateSnapshot(uiState, 512, 0.5);

    expect(snapshot).toEqual({
      routeName: "settings",
      routeKey: "#settings",
      scrollProgress: 0.5,
      scrollY: 512,
      settings: {
        activeSectionId: "settings-appearance",
        advancedOpen: true,
        uiMoreOpen: true,
        toolbarPopupPreview: {
          open: true,
          percent: 63,
          position: {
            left: 280,
            top: 96,
          },
        },
        activePopover: {
          id: "popup-progress-style",
        },
        providerProgressDetailsOpen: {
          "claude-code-team-page": true,
        },
        carouselIndexById: {
          credentials: 1,
        },
      },
      providerDetail: null,
    });
    expect(JSON.stringify(snapshot)).not.toContain("apiKey");
    expect(JSON.stringify(snapshot)).not.toContain("importJson");
    expect(JSON.stringify(snapshot)).not.toContain("cookie");
  });
});
