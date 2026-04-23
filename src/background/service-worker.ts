import { ensurePeriodicSyncAlarm, isPeriodicSyncAlarm } from "./alarms";
import { syncActionBadgeFromState } from "./action-badge";
import { handleAppMessage, type AppMessage } from "./message-bus";
import { syncStoredProviderCredentials } from "./provider-credentials";
import { syncStoredProviderPermissions } from "./provider-permissions";
import { runSyncEngine } from "./sync-engine";

async function bootstrapBackground() {
  await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
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
    void syncStoredProviderPermissions()
      .then(() => syncStoredProviderCredentials())
      .then(() => runSyncEngine({ trigger: "alarm" }))
      .then((state) => syncActionBadgeFromState(state))
      .catch(() => undefined);
  }
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
