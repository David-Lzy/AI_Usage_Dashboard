// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (c) 2026 David-Lzy (https://github.com/David-Lzy). All rights reserved.
// Source: https://github.com/David-Lzy/AI_Usage_Dashboard

import {
  ensureActionBadgeRotationAlarm,
  ensurePeriodicSyncAlarm,
  isActionBadgeRotationAlarm,
  isPeriodicSyncAlarm,
} from "./alarms";
import type { AppMessage } from "../shared/app-message-types";
import { syncActionBadgeFromState } from "./action-badge";
import { syncToolbarIconFromState } from "./action-icon";
import { handleAppMessage } from "./message-bus";
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
import { BUILD_INFO } from "../shared/build-info";
import { configureChromeSidePanelActionBehavior } from "../shared/extension-side-panel-controls";
import { subscribeToAppStateStorageChanges } from "../shared/app-state-storage-events";
import { APP_STATE_STORAGE_KEY } from "../shared/constants";
import type { QuotaNotificationMessage } from "../shared/quota-notification-client";
import { quotaNotificationController } from "./quota-notification-runtime";

subscribeToAppStateStorageChanges(() => {
  void quotaNotificationController.evaluate().catch(() => undefined);
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes[APP_STATE_STORAGE_KEY] && !changes[APP_STATE_STORAGE_KEY].newValue) {
    void quotaNotificationController.reset().catch(() => undefined);
  }
});

async function syncActionToolbarFromState(state: AppState) {
  const timestampMs = Date.now();

  await syncActionBadgeFromState(state, timestampMs);
  await syncToolbarIconFromState(state, timestampMs);
}

async function ensureBackgroundAlarms(state: AppState) {
  await ensurePeriodicSyncAlarm(state.settings);
  await ensureActionBadgeRotationAlarm(state);
}

async function syncProviderPermissionState() {
  if (await readStoreScreenshotRuntimeLock()) {
    return;
  }

  const state = await syncStoredProviderPermissions();
  await syncActionToolbarFromState(state);
}

async function bootstrapBackground() {
  console.info(
    `%cAI Usage Dashboard ${BUILD_INFO.version}`,
    "font-weight:bold",
    `| © 2026 David-Lzy | AGPL-3.0 | ${BUILD_INFO.sourceOrigin}`,
    `| build: ${BUILD_INFO.gitCommit} @ ${BUILD_INFO.buildTimestamp}`,
  );

  await configureChromeSidePanelActionBehavior();

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

chrome.permissions.onAdded.addListener(() => {
  void syncProviderPermissionState().catch(() => undefined);
});

chrome.permissions.onRemoved.addListener(() => {
  void syncProviderPermissionState().catch(() => undefined);
  void quotaNotificationController.evaluate().catch(() => undefined);
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
      await ensureActionBadgeRotationAlarm(state);
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
  if (typeof message?.type === "string" && message.type.startsWith("quota-notifications:")) {
    if (_sender.id !== chrome.runtime.id) { sendResponse({ ok: false }); return false; }
    void quotaNotificationController.handle(message as QuotaNotificationMessage)
      .then(sendResponse, () => sendResponse({ ok: false }));
    return true;
  }
  if (message?.type === "baseline:ping") {
    sendResponse({
      ok: true,
      message: "background service worker is running",
      timestamp: new Date().toISOString(),
    });
  }

  if (typeof message?.type === "string" && message.type.startsWith("app:")) {
    void handleAppMessage(message as AppMessage).then((response) => {
      if (response.ok && message.type !== "app:read-state") {
        void syncActionToolbarFromState(response.state);
      }

      sendResponse(response);
    });
    return true;
  }
});
