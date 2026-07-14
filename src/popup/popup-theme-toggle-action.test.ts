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
      runPopupThemeToggleAction(state, "dark", { sendMessage }),
    ).resolves.toEqual({
      status: "ready",
      state,
    });
    expect(sendMessage).toHaveBeenCalledWith({
      type: "app:update-settings",
      settings: { themeMode: "dark" },
    });
  });

  it("updates dark mode to system mode", async () => {
    const state = createStateWithThemeMode("dark");
    const sendMessage = vi.fn(async () => ({
      ok: true as const,
      state,
    }));

    await runPopupThemeToggleAction(state, "system", { sendMessage });

    expect(sendMessage).toHaveBeenCalledWith({
      type: "app:update-settings",
      settings: { themeMode: "system" },
    });
  });

  it("updates system mode to time mode", async () => {
    const state = createStateWithThemeMode("system");
    const sendMessage = vi.fn(async () => ({
      ok: true as const,
      state,
    }));

    await runPopupThemeToggleAction(state, "time", {
      sendMessage,
    });

    expect(sendMessage).toHaveBeenCalledWith({
      type: "app:update-settings",
      settings: { themeMode: "time" },
    });
  });

  it("updates time mode to light mode", async () => {
    const state = createStateWithThemeMode("time");
    const sendMessage = vi.fn(async () => ({
      ok: true as const,
      state,
    }));

    await runPopupThemeToggleAction(state, "light", { sendMessage });

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
      runPopupThemeToggleAction(state, "dark", { sendMessage }),
    ).resolves.toEqual({
      status: "error",
      message: "Settings update failed.",
    });
  });

  it("does not write when the selected mode is already active", async () => {
    const state = createStateWithThemeMode("system");
    const sendMessage = vi.fn();

    await expect(
      runPopupThemeToggleAction(state, "system", { sendMessage }),
    ).resolves.toEqual({ status: "ready", state });
    expect(sendMessage).not.toHaveBeenCalled();
  });
});
