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
  });
});
