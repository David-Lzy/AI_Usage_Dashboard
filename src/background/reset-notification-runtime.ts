import { COMMUNITY_RESET_CONFIG, COMMUNITY_RESET_STORAGE_KEY, normalizeCommunityResetStore, type CommunityResetSource } from "../shared/community-reset-feeds";
import { codexResetPairingTag, readCodexResetCapture } from "../shared/codex-reset-capture";
import { getExtensionApiNamespace, getExtensionPermissionsApi } from "../shared/extension-api";
import { readLocalCompanionPairing } from "../shared/local-companion-pairing";
import { hasCustomSourceHostAccess } from "../shared/custom-source-host-access";
import { createRuntimeI18n } from "../shared/i18n";
import { getActiveProviderAccountId } from "../shared/provider-accounts";
import { getResetNotificationCopy } from "../shared/reset-notification-localized-copy";
import { RESET_NOTIFICATION_STORAGE_KEY, type ResetNotificationEvent, type ResetNotificationTarget } from "../shared/reset-notifications";
import { readAppState } from "../shared/storage";
import { readStoreScreenshotRuntimeLock } from "../shared/store-screenshot-runtime-lock";
import { communityResetController } from "./community-reset-runtime";
import { quotaNotificationPermission } from "./quota-notification-runtime";
import { createResetNotificationController } from "./reset-notification-controller";

async function readLocal(key: string): Promise<unknown> {
  return typeof chrome !== "undefined" && chrome.storage?.local ? (await chrome.storage.local.get(key))[key] : undefined;
}
async function sourceAccess(source: CommunityResetSource): Promise<boolean> {
  try { return await getExtensionPermissionsApi()?.contains?.({ origins: [COMMUNITY_RESET_CONFIG[source].origin] }) === true; }
  catch { return false; }
}
export function resetNotificationText(event: ResetNotificationEvent | { kind: "test" }, locale: ReturnType<typeof createRuntimeI18n>["resolvedLocale"]) {
  const copy = getResetNotificationCopy(locale);
  if (event.kind === "test") return { title: copy.testTitle, message: copy.testBody };
  if (event.kind === "account_grant") return { title: copy.accountTitle, message: copy.accountBody };
  const message = event.types.length > 1 ? copy.mixedBody : event.types[0] === "grant" ? copy.grantBody : copy.resetBody;
  return { title: copy.communityTitle, message: `${message}\n${copy.source}: ${event.sources.map((source) => COMMUNITY_RESET_CONFIG[source].url).join(" · ")}` };
}
export function resetNotificationClickUrl(target: ResetNotificationTarget, extensionUrl: (path: string) => string,
  currentAccountId: string | null): string {
  if (target.kind === "community") return COMMUNITY_RESET_CONFIG[target.source].url;
  const hash = target.accountKey === JSON.stringify([target.providerId, currentAccountId])
    ? `#provider-detail/${target.providerId}` : "#settings/section/settings-quick-setup";
  return `${extensionUrl("src/sidepanel/index.html")}?surface=full-page${hash}`;
}
export const resetNotificationController = createResetNotificationController({
  readState: readAppState,
  readFeed: async () => normalizeCommunityResetStore(await readLocal(COMMUNITY_RESET_STORAGE_KEY)),
  readStore: async () => readLocal(RESET_NOTIFICATION_STORAGE_KEY),
  writeStore: async (store) => { if (typeof chrome !== "undefined" && chrome.storage?.local) await chrome.storage.local.set({ [RESET_NOTIFICATION_STORAGE_KEY]: store }); },
  readCapture: async () => {
    const pairing = await readLocalCompanionPairing(), capture = await readCodexResetCapture();
    if (!pairing?.token || pairing.status !== "connected" || !pairing.codexAvailable || pairing.codexMode === "browser" || !capture) return null;
    if (!await hasCustomSourceHostAccess(pairing.baseUrl).catch(() => false)) return null;
    return await codexResetPairingTag(pairing.baseUrl, pairing.token) === capture.pairingTag ? capture : null;
  },
  permission: quotaNotificationPermission,
  suppressed: readStoreScreenshotRuntimeLock,
  sourceAccess,
  stopCommunityDesktop: async () => {
    const feed = normalizeCommunityResetStore(await readLocal(COMMUNITY_RESET_STORAGE_KEY));
    if (feed.preferences.mode === "desktop") await communityResetController.handle({ type: "community-resets:update",
      preferences: { ...feed.preferences, mode: "in_app" } });
  },
  deliver: async (id, event, state) => {
    const api = getExtensionApiNamespace();
    if (!api?.notifications?.create || !api.runtime?.getURL) throw new Error("Notifications are unavailable.");
    await api.notifications.create(id, { type: "basic", iconUrl: api.runtime.getURL("icons/icon128.png"),
      ...resetNotificationText(event, createRuntimeI18n(state.settings.locale).resolvedLocale) });
  },
  openTarget: async (target, state) => {
    const api = getExtensionApiNamespace();
    if (!api?.tabs?.create || !api.runtime?.getURL) return;
    await api.tabs.create({ url: resetNotificationClickUrl(target, api.runtime.getURL,
      state && target.kind === "account" ? getActiveProviderAccountId(state, target.providerId) : null) });
  },
});
