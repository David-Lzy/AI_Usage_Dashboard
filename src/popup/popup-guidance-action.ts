import type { SettingsRouteFocus } from "../sidepanel/route-state";
import {
  openFullDashboard,
  openProviderDetail,
  openSettings,
} from "./popup-route-actions";
import { openProviderSourcePage } from "./popup-source-page-actions";
import type { PopupGuidanceAction } from "./view-model-types";

type PopupGuidanceActionDeps = {
  openDashboard?: typeof openFullDashboard;
  openProvider?: typeof openProviderDetail;
  openSettingsRoute?: typeof openSettings;
  openSourcePage?: typeof openProviderSourcePage;
};

export async function runPopupGuidanceAction(
  action: PopupGuidanceAction,
  options: {
    settingsFocus?: SettingsRouteFocus | null;
  } = {},
  {
    openDashboard = openFullDashboard,
    openProvider = openProviderDetail,
    openSettingsRoute = openSettings,
    openSourcePage = openProviderSourcePage,
  }: PopupGuidanceActionDeps = {},
) {
  if (action.kind === "hide-provider") {
    return;
  }

  if (action.kind === "settings") {
    await openSettingsRoute(options.settingsFocus ?? undefined);
    return;
  }

  if (action.kind === "dashboard") {
    await openDashboard();
    return;
  }

  if (action.kind === "provider-detail" && action.providerId) {
    await openProvider(action.providerId);
    return;
  }

  if (action.kind === "source-page" && action.providerId) {
    await openSourcePage(action.providerId, action.sourceStateKind);
  }
}
