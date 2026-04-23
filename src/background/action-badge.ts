import type { AppState } from "../providers/types";
import { getVisibleProviders } from "../sidepanel/view-models";

export type ActionBadgeModel = {
  text: string;
  title: string;
  backgroundColor: [number, number, number, number];
};

function hasChromeActionApi(): boolean {
  return (
    typeof chrome !== "undefined" &&
    typeof chrome.action?.setBadgeText === "function" &&
    typeof chrome.action?.setBadgeBackgroundColor === "function" &&
    typeof chrome.action?.setTitle === "function"
  );
}

export function buildActionBadgeModel(state: AppState): ActionBadgeModel {
  const visibleProviders = getVisibleProviders(state);
  const attentionProviders = visibleProviders.filter(
    (provider) => provider.displaySyncStatus !== "ok",
  );
  const attentionCount = attentionProviders.length;
  const hasError = attentionProviders.some(
    (provider) => provider.displaySyncStatus === "error",
  );

  if (attentionCount === 0) {
    return {
      text: "",
      title: "AI Usage Dashboard: all visible providers are healthy",
      backgroundColor: [0, 0, 0, 0],
    };
  }

  return {
    text: String(attentionCount),
    title:
      attentionCount === 1
        ? "AI Usage Dashboard: 1 visible provider needs attention"
        : `AI Usage Dashboard: ${attentionCount} visible providers need attention`,
    backgroundColor: hasError ? [179, 38, 30, 255] : [161, 84, 0, 255],
  };
}

export async function syncActionBadgeFromState(state: AppState): Promise<void> {
  if (!hasChromeActionApi()) {
    return;
  }

  const badge = buildActionBadgeModel(state);

  await chrome.action.setBadgeText({ text: badge.text });
  await chrome.action.setBadgeBackgroundColor({
    color: badge.backgroundColor,
  });
  await chrome.action.setTitle({ title: badge.title });
}
