import { describe, expect, it } from "vitest";

import type { ProviderId } from "../providers/types";
import {
  DEFAULT_TOOLBAR_ICON_CUSTOM_IMAGE_DATA_URL,
  DEFAULT_TOOLBAR_ICON_MODE,
  DEFAULT_TOOLBAR_ICON_PROVIDER_ID,
  TOOLBAR_ICON_MODE_OPTIONS,
  normalizeToolbarIconCustomImageDataUrl,
  normalizeToolbarIconMode,
  normalizeToolbarIconProviderId,
} from "./toolbar-icon-preferences";

const KNOWN_PROVIDER_IDS: ProviderId[] = [
  "codex-personal-page",
  "cursor-personal-page",
];

describe("toolbar icon preferences", () => {
  it("keeps shipped toolbar icon defaults", () => {
    expect(DEFAULT_TOOLBAR_ICON_MODE).toBe("match-badge");
    expect(DEFAULT_TOOLBAR_ICON_PROVIDER_ID).toBeNull();
    expect(DEFAULT_TOOLBAR_ICON_CUSTOM_IMAGE_DATA_URL).toBeNull();
  });

  it("exposes toolbar icon modes in settings display order", () => {
    expect(TOOLBAR_ICON_MODE_OPTIONS.map((option) => option.value)).toEqual([
      "default",
      "match-badge",
      "provider",
      "custom",
    ]);
  });

  it("preserves supported toolbar icon modes", () => {
    expect(normalizeToolbarIconMode("default")).toBe("default");
    expect(normalizeToolbarIconMode("match-badge")).toBe("match-badge");
    expect(normalizeToolbarIconMode("provider")).toBe("provider");
    expect(normalizeToolbarIconMode("custom")).toBe("custom");
  });

  it("falls back to the default toolbar icon mode for unsupported values", () => {
    expect(normalizeToolbarIconMode("badge")).toBe(DEFAULT_TOOLBAR_ICON_MODE);
    expect(normalizeToolbarIconMode(null)).toBe(DEFAULT_TOOLBAR_ICON_MODE);
    expect(normalizeToolbarIconMode(undefined)).toBe(DEFAULT_TOOLBAR_ICON_MODE);
  });

  it("keeps only known provider ids for provider toolbar icons", () => {
    expect(
      normalizeToolbarIconProviderId("codex-personal-page", KNOWN_PROVIDER_IDS),
    ).toBe("codex-personal-page");
    expect(
      normalizeToolbarIconProviderId("jetbrains-org-page", KNOWN_PROVIDER_IDS),
    ).toBe(DEFAULT_TOOLBAR_ICON_PROVIDER_ID);
    expect(normalizeToolbarIconProviderId(null, KNOWN_PROVIDER_IDS)).toBe(
      DEFAULT_TOOLBAR_ICON_PROVIDER_ID,
    );
  });

  it("accepts supported local image data URLs for custom toolbar icons", () => {
    expect(normalizeToolbarIconCustomImageDataUrl("data:image/png;base64,AA==")).toBe(
      "data:image/png;base64,AA==",
    );
    expect(
      normalizeToolbarIconCustomImageDataUrl("data:image/jpeg;base64,AA=="),
    ).toBe("data:image/jpeg;base64,AA==");
    expect(
      normalizeToolbarIconCustomImageDataUrl("data:image/webp;base64,AA=="),
    ).toBe("data:image/webp;base64,AA==");
    expect(normalizeToolbarIconCustomImageDataUrl("data:image/gif;base64,AA==")).toBe(
      "data:image/gif;base64,AA==",
    );
    expect(
      normalizeToolbarIconCustomImageDataUrl(
        "data:image/svg+xml;base64,PHN2Zy8+",
      ),
    ).toBe("data:image/svg+xml;base64,PHN2Zy8+");
  });

  it("rejects empty, malformed, non-image, and oversized custom image data URLs", () => {
    expect(normalizeToolbarIconCustomImageDataUrl("")).toBe(
      DEFAULT_TOOLBAR_ICON_CUSTOM_IMAGE_DATA_URL,
    );
    expect(normalizeToolbarIconCustomImageDataUrl(null)).toBe(
      DEFAULT_TOOLBAR_ICON_CUSTOM_IMAGE_DATA_URL,
    );
    expect(normalizeToolbarIconCustomImageDataUrl("https://example.com/icon.png")).toBe(
      DEFAULT_TOOLBAR_ICON_CUSTOM_IMAGE_DATA_URL,
    );
    expect(normalizeToolbarIconCustomImageDataUrl("data:text/html;base64,AA==")).toBe(
      DEFAULT_TOOLBAR_ICON_CUSTOM_IMAGE_DATA_URL,
    );
    expect(normalizeToolbarIconCustomImageDataUrl("data:image/png;base64,@@@")).toBe(
      DEFAULT_TOOLBAR_ICON_CUSTOM_IMAGE_DATA_URL,
    );
    expect(
      normalizeToolbarIconCustomImageDataUrl(
        `data:image/png;base64,${"A".repeat(256 * 1024)}`,
      ),
    ).toBe(DEFAULT_TOOLBAR_ICON_CUSTOM_IMAGE_DATA_URL);
  });
});
