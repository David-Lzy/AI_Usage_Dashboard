import type { AppState } from "../providers/types";
import { buildActionBadgeModel } from "../sidepanel/action-badge-model";

export {
  buildActionBadgeModel,
  type ActionBadgeModel,
} from "../sidepanel/action-badge-model";

function hasChromeActionApi(): boolean {
  return (
    typeof chrome !== "undefined" &&
    typeof chrome.action?.setBadgeText === "function" &&
    typeof chrome.action?.setBadgeBackgroundColor === "function" &&
    typeof chrome.action?.setTitle === "function"
  );
}

export async function syncActionBadgeFromState(
  state: AppState,
  timestampMs = Date.now(),
): Promise<void> {
  if (!hasChromeActionApi()) {
    return;
  }

  const badge = buildActionBadgeModel(state, timestampMs);

  await chrome.action.setBadgeText({ text: badge.text });
  await chrome.action.setBadgeBackgroundColor({
    color: badge.backgroundColor,
  });
  await chrome.action.setTitle({ title: badge.title });
}
