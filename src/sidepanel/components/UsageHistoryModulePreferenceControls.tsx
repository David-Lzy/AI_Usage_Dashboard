import type {
  DisplaySurface,
  ProviderSetting,
  ProviderSnapshot,
  ProviderUsageHistoryModuleId,
  UsageHistoryModulesBySurface,
} from "../../providers/types";
import type { ResolvedAppLocale } from "../../shared/i18n";
import type { buildSettingsLocalizedCopy } from "../../shared/settings-localized-copy";
import { buildUsageHistoryLocalizedCopy } from "../../shared/usage-history-localized-copy";
import {
  isProviderUsageHistoryModuleVisible,
  PROVIDER_USAGE_HISTORY_MODULE_IDS,
  setProviderUsageHistoryModuleVisibility,
} from "../../shared/usage-history-visibility";
import "../../shared/components/usage-history-charts.css";

const SURFACES: readonly DisplaySurface[] = ["popup", "sidebar", "fullPage"];

export function UsageHistoryModulePreferenceControls({
  locale,
  providers,
  snapshots,
  settingsCopy,
  value,
  onChange,
}: {
  locale: ResolvedAppLocale;
  providers: readonly ProviderSetting[];
  snapshots: readonly ProviderSnapshot[];
  settingsCopy: ReturnType<typeof buildSettingsLocalizedCopy>;
  value: UsageHistoryModulesBySurface;
  onChange: (value: UsageHistoryModulesBySurface) => void;
}) {
  const copy = buildUsageHistoryLocalizedCopy(locale);
  const historyProviderIds = new Set(
    snapshots
      .filter((snapshot) => snapshot.usageHistory)
      .map((snapshot) => snapshot.providerId),
  );
  const configurableProviders = providers.filter(
    (provider) =>
      provider.id === "codex-personal-page" || historyProviderIds.has(provider.id),
  );

  if (configurableProviders.length === 0) {
    return null;
  }

  const moduleLabels: Record<ProviderUsageHistoryModuleId, string> = {
    personal_usage_by_surface: copy.personalUsage,
    turns_history: copy.turns,
  };

  return (
    <section className="usage-history-preferences" data-usage-history-preferences="">
      <div>
        <p className="section-label">{locale === "zh-CN" ? "使用历史" : "Usage history"}</p>
        <h3 className="section-title">
          {locale === "zh-CN" ? "按界面显示历史模块" : "Show history modules by surface"}
        </h3>
        <p className="supporting-copy">
          {locale === "zh-CN"
            ? "个人使用和轮次趋势可以在 Popup、侧栏和完整页面中分别隐藏。"
            : "Personal usage and turns can be hidden independently on popup, sidebar, and full-page surfaces."}
        </p>
      </div>
      {configurableProviders.map((provider) => (
        <div className="usage-history-preferences__provider" key={provider.id}>
          <h4 className="usage-history-preferences__provider-title">{provider.label}</h4>
          <div className="usage-history-preferences__surface-grid">
            {SURFACES.map((surface) => (
              <fieldset className="usage-history-preferences__surface" key={surface}>
                <legend>{settingsCopy.progressItems.surfaceLabels[surface]}</legend>
                {PROVIDER_USAGE_HISTORY_MODULE_IDS.map((moduleId) => (
                  <label className="usage-history-preferences__option" key={moduleId}>
                    <input
                      type="checkbox"
                      checked={isProviderUsageHistoryModuleVisible(
                        value,
                        surface,
                        provider.id,
                        moduleId,
                      )}
                      onChange={(event) =>
                        onChange(
                          setProviderUsageHistoryModuleVisibility(
                            value,
                            surface,
                            provider.id,
                            moduleId,
                            event.currentTarget.checked,
                          ),
                        )
                      }
                    />
                    <span>{moduleLabels[moduleId]}</span>
                  </label>
                ))}
              </fieldset>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

