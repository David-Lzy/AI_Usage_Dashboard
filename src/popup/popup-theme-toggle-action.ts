import type { AppState } from "../providers/types";
import { sendAppMessage } from "../shared/app-client";
import { buildQuickThemeToggle } from "../shared/theme";

export type PopupThemeToggleActionResult =
  | { status: "ready"; state: AppState }
  | { status: "error"; message: string };

type PopupThemeToggleActionDeps = {
  reader?: Parameters<typeof buildQuickThemeToggle>[1];
  sendMessage?: typeof sendAppMessage;
};

export async function runPopupThemeToggleAction(
  appState: AppState,
  {
    reader,
    sendMessage = sendAppMessage,
  }: PopupThemeToggleActionDeps = {},
): Promise<PopupThemeToggleActionResult> {
  const quickThemeToggle = buildQuickThemeToggle(
    appState.settings.themeMode,
    reader,
  );
  const response = await sendMessage({
    type: "app:update-settings",
    settings: { themeMode: quickThemeToggle.nextMode },
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
