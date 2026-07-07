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
const iconImageDataCache = new Map<string, ImageData>();

function hasChromeActionIconApi(): boolean {
  return (
    typeof chrome !== "undefined" &&
    typeof chrome.action?.setIcon === "function"
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
    if (await setToolbarIconFromLocalProvider(providerId)) {
      return;
    }

    const faviconUrl = buildProviderFaviconUrl(providerId, 32);

    if (faviconUrl && await setToolbarIconFromSource(faviconUrl)) {
      return;
    }
  }

  await setDefaultToolbarIcon();
}
