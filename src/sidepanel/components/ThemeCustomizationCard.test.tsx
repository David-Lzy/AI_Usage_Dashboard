import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SAMPLE_APP_STATE } from "../../shared/constants";
import { createRuntimeI18n } from "../../shared/i18n";
import { buildSettingsLocalizedCopy } from "../../shared/localized-copy";
import { ThemeCustomizationCard } from "./ThemeCustomizationCard";

describe("ThemeCustomizationCard", () => {
  it("renders a valid custom seed preview", () => {
    const i18n = createRuntimeI18n("en", undefined);
    const settingsCopy = buildSettingsLocalizedCopy(i18n);
    const html = renderToStaticMarkup(
      <ThemeCustomizationCard
        i18n={i18n}
        resolvedThemeMode="light"
        settings={{
          ...SAMPLE_APP_STATE.settings,
          themeCustomSeedHex: "#2F6FED",
          themePreset: "custom",
        }}
        settingsCopy={settingsCopy}
        themeCustomSeedDraft="#2f6fed"
        onApplyThemeCustomSeed={() => {}}
        onResetThemeCustomSeed={() => {}}
        onThemeCustomSeedDraftChange={() => {}}
      />,
    );

    expect(html).toContain('class="theme-customization-card"');
    expect(html).toContain('data-theme-stability-surface="settings-theme-customization-card"');
    expect(html).toContain('class="theme-customization-form"');
    expect(html).toContain('class="theme-preview-grid"');
    expect(html).toContain("Previewing #2F6FED");
  });

  it("keeps invalid custom seeds out of the preview grid", () => {
    const i18n = createRuntimeI18n("en", undefined);
    const settingsCopy = buildSettingsLocalizedCopy(i18n);
    const html = renderToStaticMarkup(
      <ThemeCustomizationCard
        i18n={i18n}
        resolvedThemeMode="dark"
        settings={{
          ...SAMPLE_APP_STATE.settings,
          themeCustomSeedHex: null,
          themePreset: "default",
        }}
        settingsCopy={settingsCopy}
        themeCustomSeedDraft="not-a-color"
        onApplyThemeCustomSeed={() => {}}
        onResetThemeCustomSeed={() => {}}
        onThemeCustomSeedDraftChange={() => {}}
      />,
    );

    expect(html).not.toContain('class="theme-preview-grid"');
    expect(html).toContain("Enter a valid #RRGGBB value");
    expect(html).toContain("disabled");
  });

  it("renders zh-CN pilot theme customization copy", () => {
    const i18n = createRuntimeI18n("zh-CN", undefined);
    const settingsCopy = buildSettingsLocalizedCopy(i18n);
    const html = renderToStaticMarkup(
      <ThemeCustomizationCard
        i18n={i18n}
        resolvedThemeMode="light"
        settings={SAMPLE_APP_STATE.settings}
        settingsCopy={settingsCopy}
        themeCustomSeedDraft="#2f6fed"
        onApplyThemeCustomSeed={() => {}}
        onResetThemeCustomSeed={() => {}}
        onThemeCustomSeedDraftChange={() => {}}
      />,
    );

    expect(html).toContain("已校验的强调色种子");
    expect(html).toContain("自定义种子预览");
  });
});
