import type { AppState, ThemeMode } from "../providers/types";
import { sendAppMessage } from "../shared/app-client";

export type PopupThemeToggleActionResult =
  | { status: "ready"; state: AppState }
  | { status: "error"; message: string };

type PopupThemeToggleActionDeps = {
  sendMessage?: typeof sendAppMessage;
};

export async function runPopupThemeToggleAction(
  appState: AppState,
  targetMode: ThemeMode,
  {
    sendMessage = sendAppMessage,
  }: PopupThemeToggleActionDeps = {},
): Promise<PopupThemeToggleActionResult> {
  if (appState.settings.themeMode === targetMode) {
    return { status: "ready", state: appState };
  }

  const response = await sendMessage({
    type: "app:update-settings",
    settings: { themeMode: targetMode },
  });

  if (!response.ok) {
    return {
      status: "error",
      message: response.error,
    };
  }

  return {
    status: "ready",
    state: response.state,
  };
}
