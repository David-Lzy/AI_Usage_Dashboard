import { describe, expect, it } from "vitest";

import {
  DEFAULT_POPUP_CIRCULAR_PROGRESS_ITEMS_PER_ROW,
  DEFAULT_POPUP_CORNER_STYLE,
  DEFAULT_POPUP_SHADOW_STYLE,
  DEFAULT_POPUP_SIZE_PRESET,
  POPUP_CIRCULAR_PROGRESS_ITEMS_PER_ROW_OPTIONS,
  POPUP_CORNER_STYLE_OPTIONS,
  POPUP_SHADOW_STYLE_OPTIONS,
  POPUP_SIZE_PRESET_OPTIONS,
  normalizePopupCircularProgressItemsPerRow,
  normalizePopupCornerStyle,
  normalizePopupShadowStyle,
  normalizePopupSizePreset,
  syncPopupAppearanceAttributes,
} from "./popup-appearance";

describe("popup appearance preferences", () => {
  it("keeps shipped popup appearance defaults", () => {
    expect(DEFAULT_POPUP_SIZE_PRESET).toBe("balanced");
    expect(DEFAULT_POPUP_CORNER_STYLE).toBe("rounded");
    expect(DEFAULT_POPUP_SHADOW_STYLE).toBe("soft");
    expect(DEFAULT_POPUP_CIRCULAR_PROGRESS_ITEMS_PER_ROW).toBe(2);
  });

  it("exposes popup options in settings display order", () => {
    expect(POPUP_SIZE_PRESET_OPTIONS.map((option) => option.value)).toEqual([
      "compact",
      "balanced",
      "wide",
    ]);
    expect(POPUP_CORNER_STYLE_OPTIONS.map((option) => option.value)).toEqual([
      "square",
      "soft",
      "rounded",
    ]);
    expect(POPUP_SHADOW_STYLE_OPTIONS.map((option) => option.value)).toEqual([
      "none",
      "soft",
      "elevated",
    ]);
    expect(
      POPUP_CIRCULAR_PROGRESS_ITEMS_PER_ROW_OPTIONS.map(
        (option) => option.value,
      ),
    ).toEqual([1, 2, 3, 4]);
  });

  it("preserves supported popup appearance values", () => {
    expect(normalizePopupSizePreset("compact")).toBe("compact");
    expect(normalizePopupSizePreset("balanced")).toBe("balanced");
    expect(normalizePopupSizePreset("wide")).toBe("wide");
    expect(normalizePopupCornerStyle("square")).toBe("square");
    expect(normalizePopupCornerStyle("soft")).toBe("soft");
    expect(normalizePopupCornerStyle("rounded")).toBe("rounded");
    expect(normalizePopupShadowStyle("none")).toBe("none");
    expect(normalizePopupShadowStyle("soft")).toBe("soft");
    expect(normalizePopupShadowStyle("elevated")).toBe("elevated");
    expect(normalizePopupCircularProgressItemsPerRow(1)).toBe(1);
    expect(normalizePopupCircularProgressItemsPerRow(2)).toBe(2);
    expect(normalizePopupCircularProgressItemsPerRow(3)).toBe(3);
    expect(normalizePopupCircularProgressItemsPerRow(4)).toBe(4);
  });

  it("falls back for unsupported popup appearance values", () => {
    expect(normalizePopupSizePreset("small")).toBe(DEFAULT_POPUP_SIZE_PRESET);
    expect(normalizePopupCornerStyle("pill")).toBe(DEFAULT_POPUP_CORNER_STYLE);
    expect(normalizePopupShadowStyle("heavy")).toBe(DEFAULT_POPUP_SHADOW_STYLE);
    expect(normalizePopupCircularProgressItemsPerRow(5)).toBe(
      DEFAULT_POPUP_CIRCULAR_PROGRESS_ITEMS_PER_ROW,
    );
    expect(normalizePopupCircularProgressItemsPerRow("4")).toBe(
      DEFAULT_POPUP_CIRCULAR_PROGRESS_ITEMS_PER_ROW,
    );
  });

  it("uses explicit fallback overrides for unsupported values", () => {
    expect(normalizePopupSizePreset(null, "wide")).toBe("wide");
    expect(normalizePopupCornerStyle(null, "square")).toBe("square");
    expect(normalizePopupShadowStyle(null, "elevated")).toBe("elevated");
    expect(normalizePopupCircularProgressItemsPerRow(null, 2)).toBe(2);
  });

  it("syncs popup appearance data attributes and cleans them up", () => {
    const element = { dataset: {} } as HTMLElement;

    const cleanup = syncPopupAppearanceAttributes(
      {
        popupSizePreset: "wide",
        popupCornerStyle: "soft",
        popupShadowStyle: "elevated",
      },
      element,
    );

    expect(element.dataset.popupSizePreset).toBe("wide");
    expect(element.dataset.popupCornerStyle).toBe("soft");
    expect(element.dataset.popupShadowStyle).toBe("elevated");

    cleanup();

    expect(element.dataset.popupSizePreset).toBeUndefined();
    expect(element.dataset.popupCornerStyle).toBeUndefined();
    expect(element.dataset.popupShadowStyle).toBeUndefined();
  });
});
