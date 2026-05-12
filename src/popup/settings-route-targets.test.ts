import { describe, expect, it } from "vitest";

import { SETTINGS_SECTION_IDS } from "../sidepanel/settings-section-ids";
import {
  getSettingsRouteFocusForPopupAction,
  getSettingsRouteFocusForPopupProvider,
  getSettingsRouteFocusForPopupVisibleProviders,
} from "./settings-route-targets";

describe("popup settings route targets", () => {
  it("routes no-visible-provider guidance to the quick setup section", () => {
    expect(getSettingsRouteFocusForPopupVisibleProviders([])).toEqual({
      kind: "section",
      sectionId: SETTINGS_SECTION_IDS.quickSetup,
    });
  });

  it("does not route missing or non-settings popup actions", () => {
    expect(getSettingsRouteFocusForPopupAction(null, [])).toBeNull();
    expect(
      getSettingsRouteFocusForPopupAction(
        {
          kind: "dashboard",
          label: "Open dashboard",
        },
        [],
      ),
    ).toBeNull();
  });

  it("routes provider-specific settings actions to the matching quick setup card", () => {
    expect(
      getSettingsRouteFocusForPopupAction(
        {
          kind: "settings",
          label: "Open Quick Setup",
          providerId: "codex",
        },
        [],
      ),
    ).toEqual({
      kind: "quick-setup-provider",
      providerId: "codex",
    });
  });

  it("routes generic settings actions from the first relevant visible provider", () => {
    expect(
      getSettingsRouteFocusForPopupAction(
        {
          kind: "settings",
          label: "Open settings",
        },
        [
          {
            providerId: "cursor",
            permissionStatus: "granted",
            currentSourceStateKind: "ready",
          },
          {
            providerId: "claude-code",
            permissionStatus: "granted",
            currentSourceStateKind: "credential_missing",
          },
        ],
      ),
    ).toEqual({
      kind: "credential-provider",
      providerId: "claude-code",
    });
  });

  it("routes missing host access to the matching quick setup provider card", () => {
    expect(
      getSettingsRouteFocusForPopupProvider({
        providerId: "cursor",
        permissionStatus: "missing",
        currentSourceStateKind: "ready",
      }),
    ).toEqual({
      kind: "quick-setup-provider",
      providerId: "cursor",
    });
  });

  it("routes missing credentials to the matching credential card", () => {
    expect(
      getSettingsRouteFocusForPopupProvider({
        providerId: "claude-code",
        permissionStatus: "granted",
        currentSourceStateKind: "credential_missing",
      }),
    ).toEqual({
      kind: "credential-provider",
      providerId: "claude-code",
    });
  });

  it("does not force a settings target for non-settings provider states", () => {
    expect(
      getSettingsRouteFocusForPopupProvider({
        providerId: "gemini",
        permissionStatus: "granted",
        currentSourceStateKind: "policy_only",
      }),
    ).toEqual({
      kind: "source-provider",
      providerId: "gemini",
    });
  });

  it("does not force a settings target for review-only provider states", () => {
    expect(
      getSettingsRouteFocusForPopupProvider({
        providerId: "claude-code",
        permissionStatus: "granted",
        currentSourceStateKind: "sync_error",
      }),
    ).toBeNull();
  });
});
