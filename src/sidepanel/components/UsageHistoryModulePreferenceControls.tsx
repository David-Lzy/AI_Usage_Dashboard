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
  moveProviderUsageHistoryModulePreference,
  resolveProviderUsageHistoryModules,
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
        <p className="section-label">{copy.settingsSectionLabel}</p>
        <h3 className="section-title">{copy.settingsTitle}</h3>
        <p className="supporting-copy">{copy.settingsDetail}</p>
      </div>
      {configurableProviders.map((provider) => (
        <div className="usage-history-preferences__provider" key={provider.id}>
          <h4 className="usage-history-preferences__provider-title">{provider.label}</h4>
          <div className="usage-history-preferences__surface-grid">
            {SURFACES.map((surface) => {
              const preferences = resolveProviderUsageHistoryModules(
                value,
                surface,
                provider.id,
              );
              const visibleCount = preferences.filter(
                (preference) => preference.visible,
              ).length;
              const surfaceLabel =
                settingsCopy.progressItems.surfaceLabels[surface];

              return (
                <section
                  className="provider-progress-surface usage-history-preferences__surface"
                  key={surface}
                >
                  <div className="provider-progress-surface__header">
                    <p className="provider-progress-surface__title">
                      {surfaceLabel}
                    </p>
                    <span className="meta-chip">
                      {settingsCopy.progressItems.visibleCount(
                        visibleCount,
                        preferences.length,
                      )}
                    </span>
                  </div>
                  <ol className="provider-progress-list">
                    {preferences.map((preference, index) => {
                      const moduleLabel = moduleLabels[preference.id];
                      const isFirst = index === 0;
                      const isLast = index === preferences.length - 1;

                      return (
                        <li
                          key={preference.id}
                          className="provider-progress-list__item usage-history-preferences__item"
                        >
                          <label className="provider-progress-list__visibility">
                            <input
                              type="checkbox"
                              checked={preference.visible}
                              aria-label={settingsCopy.progressItems.visibilityAction(
                                preference.visible ? "hide" : "show",
                                moduleLabel,
                                surfaceLabel,
                              )}
                              onChange={(event) =>
                                onChange(
                                  setProviderUsageHistoryModuleVisibility(
                                    value,
                                    surface,
                                    provider.id,
                                    preference.id,
                                    event.currentTarget.checked,
                                  ),
                                )
                              }
                            />
                            <span>
                              {preference.visible
                                ? settingsCopy.progressItems.shown
                                : settingsCopy.progressItems.hidden}
                            </span>
                          </label>
                          <span className="provider-progress-list__main">
                            <span className="provider-progress-list__label">
                              {moduleLabel}
                            </span>
                          </span>
                          <span className="provider-progress-list__actions">
                            <button
                              className="text-button provider-progress-list__action"
                              type="button"
                              disabled={isFirst}
                              aria-label={settingsCopy.progressItems.moveUpAction(
                                moduleLabel,
                                surfaceLabel,
                              )}
                              onClick={() =>
                                onChange(
                                  moveProviderUsageHistoryModulePreference(
                                    value,
                                    surface,
                                    provider.id,
                                    preference.id,
                                    "up",
                                  ),
                                )
                              }
                            >
                              {settingsCopy.progressItems.up}
                            </button>
                            <button
                              className="text-button provider-progress-list__action"
                              type="button"
                              disabled={isLast}
                              aria-label={settingsCopy.progressItems.moveDownAction(
                                moduleLabel,
                                surfaceLabel,
                              )}
                              onClick={() =>
                                onChange(
                                  moveProviderUsageHistoryModulePreference(
                                    value,
                                    surface,
                                    provider.id,
                                    preference.id,
                                    "down",
                                  ),
                                )
                              }
                            >
                              {settingsCopy.progressItems.down}
                            </button>
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                </section>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
