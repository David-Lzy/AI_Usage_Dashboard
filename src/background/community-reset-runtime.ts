import {
  COMMUNITY_RESET_ALARM, COMMUNITY_RESET_CONFIG, COMMUNITY_RESET_STORAGE_KEY,
  type CommunityResetSource,
} from "../shared/community-reset-feeds";
import { getExtensionPermissionsApi } from "../shared/extension-api";
import { readStoreScreenshotRuntimeLock } from "../shared/store-screenshot-runtime-lock";
import { createCommunityResetController } from "./community-reset-controller";

async function hostAccess(source: CommunityResetSource): Promise<boolean> {
  try { return await getExtensionPermissionsApi()?.contains?.({ origins: [COMMUNITY_RESET_CONFIG[source].origin] }) === true; }
  catch { return false; }
}
export const communityResetController = createCommunityResetController({
  readStore: async () => (await chrome.storage.local.get(COMMUNITY_RESET_STORAGE_KEY))[COMMUNITY_RESET_STORAGE_KEY],
  writeStore: async (store) => { await chrome.storage.local.set({ [COMMUNITY_RESET_STORAGE_KEY]: store }); },
  hostAccess,
  suppressed: readStoreScreenshotRuntimeLock,
  schedule: async (enabled) => {
    if (!enabled) { await chrome.alarms.clear(COMMUNITY_RESET_ALARM); return; }
    if ((await chrome.alarms.get(COMMUNITY_RESET_ALARM))?.periodInMinutes !== 5) {
      await chrome.alarms.create(COMMUNITY_RESET_ALARM, { delayInMinutes: 1, periodInMinutes: 5 });
    }
  },
});
