import type {
  AppSettings,
  PopupCircularProgressItemsPerRow,
  PopupCornerStyle,
  PopupProviderBrowsingMode,
  PopupShadowStyle,
  PopupSizePreset,
} from "../providers/types";

export const DEFAULT_POPUP_SIZE_PRESET: PopupSizePreset = "balanced";
export const DEFAULT_POPUP_PROVIDER_BROWSING_MODE: PopupProviderBrowsingMode =
  "collapsible";
export const DEFAULT_POPUP_CORNER_STYLE: PopupCornerStyle = "rounded";
export const DEFAULT_POPUP_SHADOW_STYLE: PopupShadowStyle = "soft";
export const DEFAULT_POPUP_CIRCULAR_PROGRESS_ITEMS_PER_ROW: PopupCircularProgressItemsPerRow = 2;

export const POPUP_SIZE_PRESET_OPTIONS: Array<{
  value: PopupSizePreset;
  label: string;
}> = [
  {
    value: "compact",
    label: "Compact",
  },
  {
    value: "balanced",
    label: "Balanced",
  },
  {
    value: "wide",
    label: "Wide",
  },
];

export const POPUP_PROVIDER_BROWSING_MODE_OPTIONS: Array<{
  value: PopupProviderBrowsingMode;
  label: string;
}> = [
  {
    value: "collapsible",
    label: "Collapsible cards",
  },
  {
    value: "single",
    label: "One card at a time",
  },
  {
    value: "scroll",
    label: "Continuous scroll",
  },
];

export const POPUP_CORNER_STYLE_OPTIONS: Array<{
  value: PopupCornerStyle;
  label: string;
}> = [
  {
    value: "square",
    label: "Square",
  },
  {
    value: "soft",
    label: "Soft",
  },
  {
    value: "rounded",
    label: "Rounded",
  },
];

export const POPUP_SHADOW_STYLE_OPTIONS: Array<{
  value: PopupShadowStyle;
  label: string;
}> = [
  {
    value: "none",
    label: "None",
  },
  {
    value: "soft",
    label: "Soft",
  },
  {
    value: "elevated",
    label: "Elevated",
  },
];

export const POPUP_CIRCULAR_PROGRESS_ITEMS_PER_ROW_OPTIONS: Array<{
  value: PopupCircularProgressItemsPerRow;
  label: string;
}> = [
  {
    value: 1,
    label: "1 per row",
  },
  {
    value: 2,
    label: "2 per row",
  },
  {
    value: 3,
    label: "3 per row",
  },
  {
    value: 4,
    label: "4 per row",
  },
];

export function normalizePopupSizePreset(
  value: unknown,
  fallback: PopupSizePreset = DEFAULT_POPUP_SIZE_PRESET,
): PopupSizePreset {
  return value === "compact" || value === "balanced" || value === "wide"
    ? value
    : fallback;
}

export function normalizePopupProviderBrowsingMode(
  value: unknown,
  fallback: PopupProviderBrowsingMode = DEFAULT_POPUP_PROVIDER_BROWSING_MODE,
): PopupProviderBrowsingMode {
  return value === "collapsible" || value === "single" || value === "scroll"
    ? value
    : fallback;
}

export function normalizePopupCornerStyle(
  value: unknown,
  fallback: PopupCornerStyle = DEFAULT_POPUP_CORNER_STYLE,
): PopupCornerStyle {
  return value === "square" || value === "soft" || value === "rounded"
    ? value
    : fallback;
}

export function normalizePopupShadowStyle(
  value: unknown,
  fallback: PopupShadowStyle = DEFAULT_POPUP_SHADOW_STYLE,
): PopupShadowStyle {
  return value === "none" || value === "soft" || value === "elevated"
    ? value
    : fallback;
}

export function normalizePopupCircularProgressItemsPerRow(
  value: unknown,
  fallback: PopupCircularProgressItemsPerRow = DEFAULT_POPUP_CIRCULAR_PROGRESS_ITEMS_PER_ROW,
): PopupCircularProgressItemsPerRow {
  return value === 1 || value === 2 || value === 3 || value === 4
    ? value
    : fallback;
}

export function syncPopupAppearanceAttributes(
  settings: Pick<
    AppSettings,
    "popupSizePreset" | "popupCornerStyle" | "popupShadowStyle"
  >,
  element: HTMLElement,
): () => void {
  element.dataset.popupSizePreset = settings.popupSizePreset;
  element.dataset.popupCornerStyle = settings.popupCornerStyle;
  element.dataset.popupShadowStyle = settings.popupShadowStyle;

  return () => {
    delete element.dataset.popupSizePreset;
    delete element.dataset.popupCornerStyle;
    delete element.dataset.popupShadowStyle;
  };
}
