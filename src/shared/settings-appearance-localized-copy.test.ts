import { describe, expect, it } from "vitest";
import { getSettingsAppearanceCopy } from "./settings-appearance-localized-copy";

describe("appearance groups", () => {
  it.each([
    "en",
    "zh-CN",
    "zh-TW",
    "ja",
    "ko",
    "es-419",
    "pt-BR",
    "fr",
    "de",
    "it",
    "ru",
    "ar",
    "hi",
    "id",
  ] as const)("has distinct localized labels for %s", (locale) => {
    const labels = Object.values(getSettingsAppearanceCopy(locale));
    expect(labels).toHaveLength(5);
    expect(new Set(labels).size).toBe(5);
    expect(labels.every((label) => label.trim().length > 0)).toBe(true);
  });
});
