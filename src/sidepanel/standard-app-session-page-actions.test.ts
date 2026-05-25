import { afterEach, describe, expect, it, vi } from "vitest";

import type { AppMessage } from "../shared/app-message-types";
import { SAMPLE_APP_STATE } from "../shared/constants";
import type { AppToast } from "./use-standard-app-runtime";
import { createStandardAppSessionPageActions } from "./standard-app-session-page-actions";

function createActionHarness(
  overrides: Partial<Parameters<typeof createStandardAppSessionPageActions>[0]> = {},
) {
  const applyMessage = vi.fn(
    async (_message: AppMessage, _successToast?: AppToast) => true,
  );
  const setToast = vi.fn();
  const appState = structuredClone(SAMPLE_APP_STATE);
  const actions = createStandardAppSessionPageActions({
    appState,
    applyMessage,
    isFullPageSurface: false,
    setToast,
    ...overrides,
  });

  return { actions, applyMessage, setToast };
}

describe("createStandardAppSessionPageActions", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reports session-page controls unavailable outside extension mode", () => {
    const { actions } = createActionHarness();

    expect(actions.sessionPageNavigationAvailable).toBe(false);
    expect(actions.activeSessionPageAttachAvailable).toBe(false);
  });

  it("surfaces open-page helper unavailability without dispatching messages", () => {
    const { actions, applyMessage, setToast } = createActionHarness();

    actions.handleOpenSessionPage("codex-personal-page");

    expect(setToast).toHaveBeenCalledWith(
      expect.objectContaining({
        tone: "error",
        title: "Codex page helper unavailable",
      }),
    );
    expect(applyMessage).not.toHaveBeenCalled();
  });

  it("keeps active-page attach disabled on full-page surfaces", () => {
    vi.stubGlobal("chrome", {
      runtime: {
        id: "extension-id",
      },
      tabs: {
        query: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    });
    const { actions, setToast } = createActionHarness({
      isFullPageSurface: true,
    });

    expect(actions.sessionPageNavigationAvailable).toBe(true);
    expect(actions.activeSessionPageAttachAvailable).toBe(false);

    actions.handleAttachActiveSessionPage("codex-personal-page");

    expect(setToast).toHaveBeenCalledWith(
      expect.objectContaining({
        tone: "error",
        title: "Codex active-page attach unavailable",
      }),
    );
  });
});
