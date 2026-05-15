import type { ProviderId, ToolbarIconMode } from "../providers/types";

export const DEFAULT_TOOLBAR_ICON_MODE: ToolbarIconMode = "default";
export const DEFAULT_TOOLBAR_ICON_PROVIDER_ID: ProviderId | null = null;
export const DEFAULT_TOOLBAR_ICON_CUSTOM_IMAGE_DATA_URL: string | null = null;

export const TOOLBAR_ICON_MODE_OPTIONS = [
  { value: "default" },
  { value: "match-badge" },
  { value: "provider" },
  { value: "custom" },
] as const satisfies readonly { value: ToolbarIconMode }[];

const MAX_CUSTOM_ICON_DATA_URL_LENGTH = 256 * 1024;

export function normalizeToolbarIconMode(value: unknown): ToolbarIconMode {
  return value === "default" ||
    value === "match-badge" ||
    value === "provider" ||
    value === "custom"
    ? value
    : DEFAULT_TOOLBAR_ICON_MODE;
}

export function normalizeToolbarIconProviderId(
  value: unknown,
  knownProviderIds: readonly ProviderId[],
): ProviderId | null {
  return typeof value === "string" &&
    knownProviderIds.includes(value as ProviderId)
    ? (value as ProviderId)
    : DEFAULT_TOOLBAR_ICON_PROVIDER_ID;
}

export function normalizeToolbarIconCustomImageDataUrl(
  value: unknown,
): string | null {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > MAX_CUSTOM_ICON_DATA_URL_LENGTH
  ) {
    return DEFAULT_TOOLBAR_ICON_CUSTOM_IMAGE_DATA_URL;
  }

  return /^data:image\/(?:png|jpeg|webp|gif|svg\+xml);base64,[A-Za-z0-9+/=]+$/u.test(
    value,
  )
    ? value
    : DEFAULT_TOOLBAR_ICON_CUSTOM_IMAGE_DATA_URL;
}
