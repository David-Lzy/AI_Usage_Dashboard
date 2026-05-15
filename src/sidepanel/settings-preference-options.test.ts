import { describe, expect, it } from "vitest";

import { SAMPLE_APP_STATE } from "../shared/constants";
import { SUPPORTED_APP_LOCALES, createRuntimeI18n } from "../shared/i18n";
import { buildSettingsPreferenceOptions } from "./settings-preference-options";

describe("buildSettingsPreferenceOptions", () => {
  it("builds localized Material preference options from current state", () => {
    const i18n = createRuntimeI18n("en", undefined);
    const options = buildSettingsPreferenceOptions({
      i18n,
      providers: SAMPLE_APP_STATE.providerSettings,
      settings: SAMPLE_APP_STATE.settings,
      snapshots: SAMPLE_APP_STATE.providers,
    });

    expect(options.localeOptions).toContainEqual({
      value: "system",
      label: "System",
    });
    expect(options.localeOptions).toHaveLength(SUPPORTED_APP_LOCALES.length + 1);
    for (const locale of SUPPORTED_APP_LOCALES) {
      expect(options.localeOptions.map((option) => option.value)).toContain(
        locale,
      );
    }
    expect(options.localeOptions).toContainEqual({
      value: "ar",
      label: "العربية",
    });
    expect(options.themeModeOptions).toContainEqual({
      value: "dark",
      label: "Dark",
    });
    expect(options.uiFontFamilyOptions).toEqual([
      { value: "default", label: "Default" },
      { value: "system", label: "System UI" },
      { value: "serif", label: "Serif" },
      { value: "mono", label: "Mono" },
    ]);
    expect(options.toolbarIconModeOptions).toEqual([
      { value: "default", label: "Default" },
      { value: "match-badge", label: "Match toolbar badge" },
      { value: "provider", label: "Provider icon" },
      { value: "custom", label: "Custom image" },
    ]);
    expect(options.toolbarIconProviderOptions).toContainEqual({
      value: "codex",
      label: "Codex",
    });
    expect(options.syncIntervalOptions).toContainEqual({
      value: 3,
      label: "3 minutes",
    });
    expect(options.syncIntervalOptions).toContainEqual({
      value: 15,
      label: "15 minutes",
    });
    expect(options.warningThresholdOptions).toContainEqual({
      value: 80,
      label: "80%",
    });
    expect(options.progressDisplayStyleOptions).toEqual([
      { value: "line", label: "Line" },
      { value: "circle", label: "Circle" },
      { value: "circle-soft", label: "Soft circle" },
      { value: "circle-gauge", label: "Gauge circle" },
    ]);
    expect(options.normalizedActionBadgeSelection).toBe("attention");
    expect(options.actionBadgeOptions[0]).toMatchObject({
      value: "attention",
    });
  });

  it("keeps numeric helper copy localized for the zh-CN pilot", () => {
    const i18n = createRuntimeI18n("zh-CN", undefined);
    const options = buildSettingsPreferenceOptions({
      i18n,
      providers: SAMPLE_APP_STATE.providerSettings,
      settings: SAMPLE_APP_STATE.settings,
      snapshots: SAMPLE_APP_STATE.providers,
    });

    expect(options.syncIntervalUnitLabel).toBe("分钟");
    expect(options.syncIntervalErrorText).toBe("请输入 3-240 分钟。");
    expect(options.warningThresholdErrorText).toBe("请输入 50-99%。");
    expect(options.syncIntervalMenuButtonLabel).toBe("展开默认同步间隔预设");
    expect(options.warningThresholdMenuButtonLabel).toBe("展开告警阈值预设");
    expect(options.progressDisplayStyleOptions).toContainEqual({
      value: "circle-soft",
      label: "柔和圆环",
    });
    expect(options.progressDisplayStyleOptions).toContainEqual({
      value: "circle-gauge",
      label: "仪表圆环",
    });
    expect(options.uiFontFamilyOptions).toContainEqual({
      value: "default",
      label: "默认字体",
    });
    expect(options.toolbarIconModeOptions).toContainEqual({
      value: "match-badge",
      label: "匹配工具栏标记",
    });
  });
});
