import type {
  AppSettings,
  PopupCornerStyle,
  PopupShadowStyle,
  PopupSizePreset,
} from "../providers/types";

export const DEFAULT_POPUP_SIZE_PRESET: PopupSizePreset = "balanced";
export const DEFAULT_POPUP_CORNER_STYLE: PopupCornerStyle = "rounded";
export const DEFAULT_POPUP_SHADOW_STYLE: PopupShadowStyle = "soft";

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

export function normalizePopupSizePreset(
  value: unknown,
  fallback: PopupSizePreset = DEFAULT_POPUP_SIZE_PRESET,
): PopupSizePreset {
  return value === "compact" || value === "balanced" || value === "wide"
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
