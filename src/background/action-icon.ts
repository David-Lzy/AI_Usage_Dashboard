import type { AppState, ProviderId } from "../providers/types";
import {
  ACTION_BADGE_ATTENTION_SELECTION,
  getEffectiveActionBadgeSelection,
  findActionBadgeQuotaCandidate,
} from "../shared/action-badge-preferences";
import {
  DEFAULT_TOOLBAR_ACTION_ICON_PATHS,
  PROVIDER_TOOLBAR_ICON_PAGE_URLS,
} from "../shared/provider-toolbar-icons";
import { getBrowserCapabilities } from "../shared/extension-side-panel-controls";

const TOOLBAR_ICON_SIZES = [16, 32] as const;
const LOCAL_TOOLBAR_ICON_PROVIDER_IDS = new Set<ProviderId>([
  "codex-personal-page",
  "codex-enterprise-api",
]);
const PROVIDER_FAVICON_CACHE_STORAGE_PREFIX =
  "toolbarIconProviderFaviconCache:v1:";
const PROVIDER_FAVICON_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const iconImageDataCache = new Map<string, ImageData>();

type CachedToolbarIconImageData = {
  width: number;
  height: number;
  data: number[];
};

type CachedProviderFaviconEntry = {
  cachedAt: number;
  pageUrl: string;
  images: Partial<Record<(typeof TOOLBAR_ICON_SIZES)[number], CachedToolbarIconImageData>>;
};

function hasChromeActionIconApi(): boolean {
  return (
    typeof chrome !== "undefined" &&
    typeof chrome.action?.setIcon === "function"
  );
}

function hasChromeLocalStorageApi(): boolean {
  return (
    typeof chrome !== "undefined" &&
    typeof chrome.storage?.local?.get === "function" &&
    typeof chrome.storage.local.set === "function"
  );
}

function isKnownProviderId(
  providerId: unknown,
  state: AppState,
): providerId is ProviderId {
  return (
    typeof providerId === "string" &&
    state.providerSettings.some((provider) => provider.id === providerId)
  );
}

export function resolveToolbarIconProviderId(
  state: AppState,
  timestampMs = Date.now(),
): ProviderId | null {
  switch (state.settings.toolbarIconMode) {
    case "provider":
      return isKnownProviderId(state.settings.toolbarIconProviderId, state)
        ? state.settings.toolbarIconProviderId
        : null;

    case "match-badge": {
      const selection = getEffectiveActionBadgeSelection(state, timestampMs);

      if (selection === ACTION_BADGE_ATTENTION_SELECTION) {
        return null;
      }

      const providerId =
        findActionBadgeQuotaCandidate(state, selection)?.providerId ?? null;

      return isKnownProviderId(providerId, state) ? providerId : null;
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
  if (
    !getBrowserCapabilities().supportsProviderFaviconIcon ||
    typeof chrome === "undefined" ||
    typeof chrome.runtime?.getURL !== "function"
  ) {
    return null;
  }

  const pageUrl = PROVIDER_TOOLBAR_ICON_PAGE_URLS[providerId];
  const faviconUrl = new URL(chrome.runtime.getURL("/_favicon/"));
  faviconUrl.searchParams.set("pageUrl", pageUrl);
  faviconUrl.searchParams.set("size", String(size));

  return faviconUrl.href;
}

function buildProviderFaviconCacheStorageKey(providerId: ProviderId): string {
  return `${PROVIDER_FAVICON_CACHE_STORAGE_PREFIX}${providerId}`;
}

function isFinitePositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function isCachedToolbarIconImageData(
  value: unknown,
): value is CachedToolbarIconImageData {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as CachedToolbarIconImageData;
  return (
    isFinitePositiveNumber(candidate.width) &&
    isFinitePositiveNumber(candidate.height) &&
    Array.isArray(candidate.data) &&
    candidate.data.length === candidate.width * candidate.height * 4 &&
    candidate.data.every(
      (channel) =>
        typeof channel === "number" &&
        Number.isFinite(channel) &&
        channel >= 0 &&
        channel <= 255,
    )
  );
}

function isCachedProviderFaviconEntry(
  value: unknown,
): value is CachedProviderFaviconEntry {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as CachedProviderFaviconEntry;
  return (
    typeof candidate.cachedAt === "number" &&
    Number.isFinite(candidate.cachedAt) &&
    typeof candidate.pageUrl === "string" &&
    candidate.pageUrl.length > 0 &&
    Boolean(candidate.images) &&
    typeof candidate.images === "object"
  );
}

function cachedImageDataToImageData(
  cachedImageData: CachedToolbarIconImageData,
): ImageData | null {
  if (typeof ImageData === "undefined") {
    return null;
  }

  return new ImageData(
    new Uint8ClampedArray(cachedImageData.data),
    cachedImageData.width,
    cachedImageData.height,
  );
}

function imageDataToCachedImageData(
  imageData: ImageData,
): CachedToolbarIconImageData {
  return {
    width: imageData.width,
    height: imageData.height,
    data: Array.from(imageData.data),
  };
}

function buildCachedProviderFaviconEntry(
  pageUrl: string,
  imageData: Record<number, ImageData>,
  timestampMs: number,
): CachedProviderFaviconEntry {
  const images: CachedProviderFaviconEntry["images"] = {};

  for (const size of TOOLBAR_ICON_SIZES) {
    images[size] = imageDataToCachedImageData(imageData[size]);
  }

  return {
    cachedAt: timestampMs,
    pageUrl,
    images,
  };
}

function readImageDataMapFromCachedProviderFaviconEntry(
  entry: CachedProviderFaviconEntry,
  pageUrl: string,
  timestampMs: number,
): Record<number, ImageData> | null {
  if (
    entry.pageUrl !== pageUrl ||
    timestampMs - entry.cachedAt < 0 ||
    timestampMs - entry.cachedAt >= PROVIDER_FAVICON_CACHE_TTL_MS
  ) {
    return null;
  }

  const imageDataEntries: Array<[number, ImageData]> = [];

  for (const size of TOOLBAR_ICON_SIZES) {
    const cachedImageData = entry.images[size];

    if (!isCachedToolbarIconImageData(cachedImageData)) {
      return null;
    }

    const imageData = cachedImageDataToImageData(cachedImageData);

    if (!imageData) {
      return null;
    }

    imageDataEntries.push([size, imageData]);
  }

  return Object.fromEntries(imageDataEntries) as Record<number, ImageData>;
}

async function readCachedProviderFaviconImageData(
  providerId: ProviderId,
  pageUrl: string,
  timestampMs: number,
): Promise<Record<number, ImageData> | null> {
  if (!hasChromeLocalStorageApi()) {
    return null;
  }

  const storageKey = buildProviderFaviconCacheStorageKey(providerId);

  try {
    const result = await chrome.storage.local.get(storageKey);
    const entry = result[storageKey];

    if (!isCachedProviderFaviconEntry(entry)) {
      return null;
    }

    return readImageDataMapFromCachedProviderFaviconEntry(
      entry,
      pageUrl,
      timestampMs,
    );
  } catch {
    return null;
  }
}

async function writeCachedProviderFaviconImageData(
  providerId: ProviderId,
  pageUrl: string,
  imageData: Record<number, ImageData>,
  timestampMs: number,
): Promise<void> {
  if (!hasChromeLocalStorageApi()) {
    return;
  }

  try {
    await chrome.storage.local.set({
      [buildProviderFaviconCacheStorageKey(providerId)]:
        buildCachedProviderFaviconEntry(pageUrl, imageData, timestampMs),
    });
  } catch {
    // Favicon cache is an optimization. Icon rendering should not depend on it.
  }
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

  let bitmap: ImageBitmap | null = null;

  try {
    const response = await fetch(sourceUrl);

    if (!response.ok) {
      return null;
    }

    bitmap = await createImageBitmap(await response.blob());
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
  } finally {
    bitmap?.close();
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

async function setToolbarIconFromProviderFavicon(
  providerId: ProviderId,
  timestampMs: number,
): Promise<boolean> {
  const pageUrl = PROVIDER_TOOLBAR_ICON_PAGE_URLS[providerId];
  const faviconUrl = buildProviderFaviconUrl(providerId, 32);

  if (!faviconUrl) {
    return false;
  }

  const cachedImageData = await readCachedProviderFaviconImageData(
    providerId,
    pageUrl,
    timestampMs,
  );

  if (cachedImageData) {
    await chrome.action.setIcon({ imageData: cachedImageData });
    return true;
  }

  const imageData = await buildImageDataMapFromSource(faviconUrl);

  if (!imageData) {
    return false;
  }

  await writeCachedProviderFaviconImageData(
    providerId,
    pageUrl,
    imageData,
    timestampMs,
  );
  await chrome.action.setIcon({ imageData });
  return true;
}

function buildCodexToolbarIconImageData(size: number): ImageData | null {
  if (typeof OffscreenCanvas === "undefined") {
    return null;
  }

  const canvas = new OffscreenCanvas(size, size);
  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  const center = size / 2;
  const tileInset = Math.max(1, size * 0.08);
  const tileRadius = Math.max(3, size * 0.22);
  const terminalStrokeWidth = Math.max(1.6, size * 0.1);
  const accentStrokeWidth = Math.max(1.4, size * 0.09);

  context.clearRect(0, 0, size, size);
  context.fillStyle = "#F8FAFC";
  context.strokeStyle = "#0F172A";
  context.lineWidth = Math.max(1, size * 0.06);
  context.beginPath();
  context.moveTo(tileInset + tileRadius, tileInset);
  context.lineTo(size - tileInset - tileRadius, tileInset);
  context.arcTo(
    size - tileInset,
    tileInset,
    size - tileInset,
    tileInset + tileRadius,
    tileRadius,
  );
  context.lineTo(size - tileInset, size - tileInset - tileRadius);
  context.arcTo(
    size - tileInset,
    size - tileInset,
    size - tileInset - tileRadius,
    size - tileInset,
    tileRadius,
  );
  context.lineTo(tileInset + tileRadius, size - tileInset);
  context.arcTo(
    tileInset,
    size - tileInset,
    tileInset,
    size - tileInset - tileRadius,
    tileRadius,
  );
  context.lineTo(tileInset, tileInset + tileRadius);
  context.arcTo(
    tileInset,
    tileInset,
    tileInset + tileRadius,
    tileInset,
    tileRadius,
  );
  context.closePath();
  context.fill();
  context.stroke();

  context.strokeStyle = "#2563EB";
  context.lineWidth = accentStrokeWidth;
  context.lineCap = "round";
  context.beginPath();
  context.arc(
    center,
    center,
    size * 0.31,
    Math.PI * 0.72,
    Math.PI * 1.72,
  );
  context.stroke();

  context.strokeStyle = "#0F172A";
  context.lineWidth = terminalStrokeWidth;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.beginPath();
  context.moveTo(size * 0.42, size * 0.35);
  context.lineTo(size * 0.58, size * 0.5);
  context.lineTo(size * 0.42, size * 0.65);
  context.stroke();

  context.strokeStyle = "#10B981";
  context.lineWidth = terminalStrokeWidth;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(size * 0.63, size * 0.66);
  context.lineTo(size * 0.73, size * 0.66);
  context.stroke();

  return context.getImageData(0, 0, size, size);
}

function buildLocalProviderIconImageDataMap(
  providerId: ProviderId,
): Record<number, ImageData> | null {
  if (!LOCAL_TOOLBAR_ICON_PROVIDER_IDS.has(providerId)) {
    return null;
  }

  const entries: Array<[number, ImageData]> = [];

  for (const size of TOOLBAR_ICON_SIZES) {
    const imageData = buildCodexToolbarIconImageData(size);

    if (!imageData) {
      return null;
    }

    entries.push([size, imageData]);
  }

  return Object.fromEntries(entries) as Record<number, ImageData>;
}

async function setToolbarIconFromLocalProvider(
  providerId: ProviderId,
): Promise<boolean> {
  const imageData = buildLocalProviderIconImageDataMap(providerId);

  if (!imageData) {
    return false;
  }

  await chrome.action.setIcon({ imageData });
  return true;
}

export async function syncToolbarIconFromState(
  state: AppState,
  timestampMs = Date.now(),
): Promise<void> {
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

  const providerId = resolveToolbarIconProviderId(state, timestampMs);

  if (providerId) {
    if (await setToolbarIconFromProviderFavicon(providerId, timestampMs)) {
      return;
    }

    if (await setToolbarIconFromLocalProvider(providerId)) {
      return;
    }
  }

  await setDefaultToolbarIcon();
}
