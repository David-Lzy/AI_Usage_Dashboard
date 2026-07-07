import { describe, expect, it } from "vitest";

import { SETTINGS_SECTION_IDS } from "../shared/settings-section-ids";
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
          providerId: "codex-personal-page",
        },
        [],
      ),
    ).toEqual({
      kind: "quick-setup-provider",
      providerId: "codex-personal-page",
    });
  });

  it("routes grant-access actions to the matching quick setup card", () => {
    expect(
      getSettingsRouteFocusForPopupAction(
        {
          kind: "grant-access",
          label: "Grant access",
          providerId: "codex-personal-page",
        },
        [],
      ),
    ).toEqual({
      kind: "quick-setup-provider",
      providerId: "codex-personal-page",
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
            providerId: "cursor-personal-page",
            permissionStatus: "granted",
            currentSourceStateKind: "ready",
          },
          {
            providerId: "claude-code-admin-api",
            permissionStatus: "granted",
            currentSourceStateKind: "credential_missing",
          },
        ],
      ),
    ).toEqual({
      kind: "credential-provider",
      providerId: "claude-code-admin-api",
    });
  });

  it("routes missing host access to the matching quick setup provider card", () => {
    expect(
      getSettingsRouteFocusForPopupProvider({
        providerId: "cursor-personal-page",
        permissionStatus: "missing",
        currentSourceStateKind: "ready",
      }),
    ).toEqual({
      kind: "quick-setup-provider",
      providerId: "cursor-personal-page",
    });
  });

  it("routes missing credentials to the matching credential card", () => {
    expect(
      getSettingsRouteFocusForPopupProvider({
        providerId: "claude-code-admin-api",
        permissionStatus: "granted",
        currentSourceStateKind: "credential_missing",
      }),
    ).toEqual({
      kind: "credential-provider",
      providerId: "claude-code-admin-api",
    });
  });

  it("does not force a settings target for non-settings provider states", () => {
    expect(
      getSettingsRouteFocusForPopupProvider({
        providerId: "gemini-policy",
        permissionStatus: "granted",
        currentSourceStateKind: "policy_only",
      }),
    ).toEqual({
      kind: "source-provider",
      providerId: "gemini-policy",
    });
  });

  it("does not force a settings target for review-only provider states", () => {
    expect(
      getSettingsRouteFocusForPopupProvider({
        providerId: "claude-code-team-page",
        permissionStatus: "granted",
        currentSourceStateKind: "sync_error",
      }),
    ).toBeNull();
  });
});
