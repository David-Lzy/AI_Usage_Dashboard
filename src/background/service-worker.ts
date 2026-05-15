import {
  ensureActionBadgeRotationAlarm,
  ensurePeriodicSyncAlarm,
  isActionBadgeRotationAlarm,
  isPeriodicSyncAlarm,
} from "./alarms";
import { syncActionBadgeFromState } from "./action-badge";
import { syncToolbarIconFromState } from "./action-icon";
import { handleAppMessage, type AppMessage } from "./message-bus";
import type { AppState } from "../providers/types";
import {
  markProviderBindingsStaleForRemovedTab,
  markProviderBindingsStaleForTabUrlChange,
  reconcileProviderBindingsForReplacedTab,
} from "./page-binding-lifecycle";
import { syncStoredProviderCredentials } from "./provider-credentials";
import { syncStoredProviderPermissions } from "./provider-permissions";
import { runSyncEngine } from "./sync-engine";
import { seedAppStateIfEmpty } from "../shared/storage";
import { readStoreScreenshotRuntimeLock } from "../shared/store-screenshot-runtime-lock";

async function syncActionToolbarFromState(state: AppState) {
  const timestampMs = Date.now();

  await syncActionBadgeFromState(state, timestampMs);
  await syncToolbarIconFromState(state, timestampMs);
}

async function ensureBackgroundAlarms(state: AppState) {
  await ensurePeriodicSyncAlarm(state.settings);
  await ensureActionBadgeRotationAlarm(state.settings);
}

async function bootstrapBackground() {
  await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });

  if (await readStoreScreenshotRuntimeLock()) {
    const state = await seedAppStateIfEmpty();
    await ensureBackgroundAlarms(state);
    await syncActionToolbarFromState(state);
    return;
  }

  await syncStoredProviderPermissions();
  const state = await syncStoredProviderCredentials();
  await ensureBackgroundAlarms(state);
  await syncActionToolbarFromState(state);
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
        await syncActionToolbarFromState(state);
        return;
      }

      await syncStoredProviderPermissions();
      await syncStoredProviderCredentials();
      const state = await runSyncEngine({ trigger: "alarm" });
      await syncActionToolbarFromState(state);
    })().catch(() => undefined);
  }

  if (isActionBadgeRotationAlarm(alarm)) {
    void (async () => {
      const state = await seedAppStateIfEmpty();
      await ensureActionBadgeRotationAlarm(state.settings);
      await syncActionToolbarFromState(state);
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
      await syncActionToolbarFromState(state);
    }
  })().catch(() => undefined);
});

chrome.tabs.onReplaced.addListener((addedTabId, removedTabId) => {
  void (async () => {
    if (await readStoreScreenshotRuntimeLock()) {
      return;
    }

    const replacementTab = await chrome.tabs
      .get(addedTabId)
      .catch(() => null);
    const state = await reconcileProviderBindingsForReplacedTab(
      removedTabId,
      {
        tabId: addedTabId,
        url: replacementTab?.url ?? null,
        title: replacementTab?.title ?? null,
      },
      new Date().toISOString(),
    );

    if (state) {
      await syncActionToolbarFromState(state);
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
      await syncActionToolbarFromState(state);
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
        void syncActionToolbarFromState(response.state);
      }

      sendResponse(response);
    });
    return true;
  }
});
