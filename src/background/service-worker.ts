import { ensurePeriodicSyncAlarm, isPeriodicSyncAlarm } from "./alarms";
import { syncActionBadgeFromState } from "./action-badge";
import { handleAppMessage, type AppMessage } from "./message-bus";
import {
  markProviderBindingsStaleForRemovedTab,
  markProviderBindingsStaleForTabUrlChange,
} from "./page-binding-lifecycle";
import { syncStoredProviderCredentials } from "./provider-credentials";
import { syncStoredProviderPermissions } from "./provider-permissions";
import { runSyncEngine } from "./sync-engine";
import { seedAppStateIfEmpty } from "../shared/storage";
import { readStoreScreenshotRuntimeLock } from "../shared/store-screenshot-runtime-lock";

async function bootstrapBackground() {
  await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });

  if (await readStoreScreenshotRuntimeLock()) {
    const state = await seedAppStateIfEmpty();
    await ensurePeriodicSyncAlarm(state.settings);
    await syncActionBadgeFromState(state);
    return;
  }

  await syncStoredProviderPermissions();
  const state = await syncStoredProviderCredentials();
  await ensurePeriodicSyncAlarm(state.settings);
  await syncActionBadgeFromState(state);
}

chrome.runtime.onInstalled.addListener(() => {
  void bootstrapBackground();
});

chrome.runtime.onStartup.addListener(() => {
  void bootstrapBackground();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (isPeriodicSyncAlarm(alarm)) {
    void (async () => {
      if (await readStoreScreenshotRuntimeLock()) {
        const state = await seedAppStateIfEmpty();
        await syncActionBadgeFromState(state);
        return;
      }

      await syncStoredProviderPermissions();
      await syncStoredProviderCredentials();
      const state = await runSyncEngine({ trigger: "alarm" });
      await syncActionBadgeFromState(state);
    })().catch(() => undefined);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  void (async () => {
    if (await readStoreScreenshotRuntimeLock()) {
      return;
    }

    const state = await markProviderBindingsStaleForRemovedTab(tabId);

    if (state) {
      await syncActionBadgeFromState(state);
    }
  })().catch(() => undefined);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (typeof changeInfo.url !== "string" || changeInfo.url.length === 0) {
    return;
  }

  const nextUrl = changeInfo.url;

  void (async () => {
    if (await readStoreScreenshotRuntimeLock()) {
      return;
    }

    const state = await markProviderBindingsStaleForTabUrlChange(
      tabId,
      nextUrl,
    );

    if (state) {
      await syncActionBadgeFromState(state);
    }
  })().catch(() => undefined);
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "baseline:ping") {
    sendResponse({
      ok: true,
      message: "background service worker is running",
      timestamp: new Date().toISOString(),
    });
  }

  if (typeof message?.type === "string" && message.type.startsWith("app:")) {
    void handleAppMessage(message as AppMessage).then((response) => {
      if (response.ok) {
        void syncActionBadgeFromState(response.state);
      }

      sendResponse(response);
    });
    return true;
  }
});
