import type { AppState, ProviderId } from "../providers/types";
import {
  ACTION_BADGE_ATTENTION_SELECTION,
  findActionBadgeQuotaCandidate,
  normalizeActionBadgeSelection,
} from "../shared/action-badge-preferences";
import {
  DEFAULT_TOOLBAR_ACTION_ICON_PATHS,
  PROVIDER_TOOLBAR_ICON_PAGE_URLS,
} from "../shared/provider-toolbar-icons";

const TOOLBAR_ICON_SIZES = [16, 32] as const;
const iconImageDataCache = new Map<string, ImageData>();

function hasChromeActionIconApi(): boolean {
  return (
    typeof chrome !== "undefined" &&
    typeof chrome.action?.setIcon === "function"
  );
}

function isKnownProviderId(
  providerId: ProviderId | null,
  state: AppState,
): providerId is ProviderId {
  return (
    providerId !== null &&
    state.providerSettings.some((provider) => provider.id === providerId)
  );
}

export function resolveToolbarIconProviderId(state: AppState): ProviderId | null {
  switch (state.settings.toolbarIconMode) {
    case "provider":
      return isKnownProviderId(state.settings.toolbarIconProviderId, state)
        ? state.settings.toolbarIconProviderId
        : null;

    case "match-badge": {
      const selection = normalizeActionBadgeSelection(
        state.settings.actionBadgeSelection,
      );

      if (selection === ACTION_BADGE_ATTENTION_SELECTION) {
        return null;
      }

      return findActionBadgeQuotaCandidate(state, selection)?.providerId ?? null;
    }

    case "custom":
    case "default":
      return null;
  }
}

export function buildProviderFaviconUrl(
  providerId: ProviderId,
  size: number,
): string | null {
  if (typeof chrome === "undefined" || typeof chrome.runtime?.getURL !== "function") {
    return null;
  }

  const pageUrl = PROVIDER_TOOLBAR_ICON_PAGE_URLS[providerId];
  const faviconUrl = new URL(chrome.runtime.getURL("/_favicon/"));
  faviconUrl.searchParams.set("pageUrl", pageUrl);
  faviconUrl.searchParams.set("size", String(size));

  return faviconUrl.href;
}

async function loadImageData(
  sourceUrl: string,
  size: number,
): Promise<ImageData | null> {
  if (
    typeof fetch !== "function" ||
    typeof createImageBitmap !== "function" ||
    typeof OffscreenCanvas === "undefined"
  ) {
    return null;
  }

  const cacheKey = `${size}:${sourceUrl}`;
  const cachedImageData = iconImageDataCache.get(cacheKey);

  if (cachedImageData) {
    return cachedImageData;
  }

  try {
    const response = await fetch(sourceUrl);

    if (!response.ok) {
      return null;
    }

    const bitmap = await createImageBitmap(await response.blob());
    const canvas = new OffscreenCanvas(size, size);
    const context = canvas.getContext("2d");

    if (!context) {
      return null;
    }

    context.clearRect(0, 0, size, size);
    context.drawImage(bitmap, 0, 0, size, size);

    const imageData = context.getImageData(0, 0, size, size);
    iconImageDataCache.set(cacheKey, imageData);
    return imageData;
  } catch {
    return null;
  }
}

async function buildImageDataMapFromSource(
  sourceUrl: string,
): Promise<Record<number, ImageData> | null> {
  const entries: Array<[number, ImageData]> = [];

  for (const size of TOOLBAR_ICON_SIZES) {
    const imageData = await loadImageData(sourceUrl, size);

    if (!imageData) {
      return null;
    }

    entries.push([size, imageData]);
  }

  return Object.fromEntries(entries) as Record<number, ImageData>;
}

async function setDefaultToolbarIcon(): Promise<void> {
  await chrome.action.setIcon({
    path: DEFAULT_TOOLBAR_ACTION_ICON_PATHS,
  });
}

async function setToolbarIconFromSource(sourceUrl: string): Promise<boolean> {
  const imageData = await buildImageDataMapFromSource(sourceUrl);

  if (!imageData) {
    return false;
  }

  await chrome.action.setIcon({ imageData });
  return true;
}

export async function syncToolbarIconFromState(state: AppState): Promise<void> {
  if (!hasChromeActionIconApi()) {
    return;
  }

  if (
    state.settings.toolbarIconMode === "custom" &&
    state.settings.toolbarIconCustomImageDataUrl
  ) {
    const didSetCustomIcon = await setToolbarIconFromSource(
      state.settings.toolbarIconCustomImageDataUrl,
    );

    if (didSetCustomIcon) {
      return;
    }
  }

  const providerId = resolveToolbarIconProviderId(state);

  if (providerId) {
    const faviconUrl = buildProviderFaviconUrl(providerId, 32);

    if (faviconUrl && await setToolbarIconFromSource(faviconUrl)) {
      return;
    }
  }

  await setDefaultToolbarIcon();
}
