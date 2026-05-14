import type { UiFontFamily } from "../providers/types";

export const DEFAULT_UI_FONT_FAMILY: UiFontFamily = "default";

export const UI_FONT_FAMILY_OPTIONS: Array<{ value: UiFontFamily }> = [
  { value: "default" },
  { value: "system" },
  { value: "serif" },
  { value: "mono" },
];

export const UI_FONT_FAMILY_STACKS: Record<UiFontFamily, string> = {
  default:
    '"Roboto Flex", "Roboto", "Segoe UI", "Noto Sans", "Noto Sans CJK SC", "Noto Sans Arabic", "Noto Sans Devanagari", sans-serif',
  system:
    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", "Noto Sans CJK SC", "Noto Sans Arabic", "Noto Sans Devanagari", sans-serif',
  serif:
    'Georgia, "Times New Roman", "Noto Serif", "Noto Serif CJK SC", "Noto Naskh Arabic", "Noto Serif Devanagari", serif',
  mono:
    '"SFMono-Regular", "Cascadia Mono", "Segoe UI Mono", "Roboto Mono", "Noto Sans Mono", "Noto Sans", monospace',
};

export function normalizeUiFontFamily(value: unknown): UiFontFamily {
  return value === "default" ||
    value === "system" ||
    value === "serif" ||
    value === "mono"
    ? value
    : DEFAULT_UI_FONT_FAMILY;
}

export function getUiFontFamilyStack(value: unknown): string {
  return UI_FONT_FAMILY_STACKS[normalizeUiFontFamily(value)];
}
