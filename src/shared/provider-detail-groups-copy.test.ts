import { describe, expect, it } from "vitest";
import { getProviderDetailGroupsCopy } from "./provider-detail-groups-copy";

describe("Provider detail groups", () => {
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
  ] as const)("names every group in %s", (locale) => {
    const values = Object.values(getProviderDetailGroupsCopy(locale));
    expect(values).toHaveLength(5);
    expect(values.every((value) => value.trim().length > 0)).toBe(true);
    expect(new Set(values).size).toBe(5);
  });
});
