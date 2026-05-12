import { describe, expect, it, vi } from "vitest";

import type { AppState, ThemeMode } from "../providers/types";
import { SAMPLE_APP_STATE } from "../shared/constants";
import { runPopupThemeToggleAction } from "./popup-theme-toggle-action";

function createStateWithThemeMode(themeMode: ThemeMode): AppState {
  return {
    ...SAMPLE_APP_STATE,
    settings: {
      ...SAMPLE_APP_STATE.settings,
      themeMode,
    },
  };
}

describe("runPopupThemeToggleAction", () => {
  it("updates light mode to dark mode", async () => {
    const state = createStateWithThemeMode("light");
    const sendMessage = vi.fn(async () => ({
      ok: true as const,
      state,
    }));

    await expect(
      runPopupThemeToggleAction(state, { sendMessage }),
    ).resolves.toEqual({
      status: "ready",
      state,
    });
    expect(sendMessage).toHaveBeenCalledWith({
      type: "app:update-settings",
      settings: { themeMode: "dark" },
    });
  });

  it("updates dark mode to light mode", async () => {
    const state = createStateWithThemeMode("dark");
    const sendMessage = vi.fn(async () => ({
      ok: true as const,
      state,
    }));

    await runPopupThemeToggleAction(state, { sendMessage });

    expect(sendMessage).toHaveBeenCalledWith({
      type: "app:update-settings",
      settings: { themeMode: "light" },
    });
  });

  it("uses resolved system mode before choosing the next mode", async () => {
    const state = createStateWithThemeMode("system");
    const sendMessage = vi.fn(async () => ({
      ok: true as const,
      state,
    }));

    await runPopupThemeToggleAction(state, {
      reader: {
        matchMedia: () => ({ matches: true }),
      },
      sendMessage,
    });

    expect(sendMessage).toHaveBeenCalledWith({
      type: "app:update-settings",
      settings: { themeMode: "light" },
    });
  });

  it("returns update errors without changing the state shape", async () => {
    const state = createStateWithThemeMode("light");
    const sendMessage = vi.fn(async () => ({
      ok: false as const,
      error: "Settings update failed.",
    }));

    await expect(
      runPopupThemeToggleAction(state, { sendMessage }),
    ).resolves.toEqual({
      status: "error",
      message: "Settings update failed.",
    });
  });
});
