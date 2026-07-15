import { useState } from "react";

import type { DisplaySurface } from "../../providers/types";
import {
  moveCursorUsageModulePreference,
  readCursorUsageUiPreferences,
  setCursorUsageModuleVisibility,
  writeCursorUsageUiPreferences,
  type CursorUsageUiModuleId,
  type CursorUsageUiPreferences,
} from "../../shared/cursor-usage-ui-preferences";
import { buildCursorUsageLocalizedCopy } from "../../shared/cursor-usage-localized-copy";
import type { ResolvedAppLocale } from "../../shared/i18n";
import type { buildSettingsLocalizedCopy } from "../../shared/settings-localized-copy";
import { MaterialInfoTooltip } from "./MaterialInfoTooltip";

const SURFACES: readonly DisplaySurface[] = ["popup", "sidebar", "fullPage"];

export function CursorUsageModulePreferenceControls({
  locale,
  settingsCopy,
}: {
  locale: ResolvedAppLocale;
  settingsCopy: ReturnType<typeof buildSettingsLocalizedCopy>;
}) {
  const [preferences, setPreferences] = useState<CursorUsageUiPreferences>(() =>
    readCursorUsageUiPreferences(),
  );
  const copy = buildCursorUsageLocalizedCopy(locale);
  const moduleLabels: Record<CursorUsageUiModuleId, string> = {
    billing_summary: copy.billingSummary,
    usage_history: copy.recentUsage,
  };

  const updatePreferences = (nextPreferences: CursorUsageUiPreferences) => {
    setPreferences(nextPreferences);
    writeCursorUsageUiPreferences(nextPreferences);
  };

  return (
    <section
      className="usage-history-preferences cursor-usage-preferences"
      data-cursor-usage-preferences=""
    >
      <div>
        <p className="section-label">Cursor</p>
        <div className="section-title-with-info">
          <h3 className="section-title">{copy.billingSummary}</h3>
          <MaterialInfoTooltip>
            {`${copy.billingSummary} and ${copy.recentUsage} can be shown and reordered independently on each surface.`}
          </MaterialInfoTooltip>
        </div>
      </div>
      <div className="usage-history-preferences__surface-grid">
        {SURFACES.map((surface) => {
          const surfacePreferences = preferences[surface];
          const surfaceLabel = settingsCopy.progressItems.surfaceLabels[surface];
          const visibleCount = surfacePreferences.filter(
            (preference) => preference.visible,
          ).length;

          return (
            <section
              className="provider-progress-surface usage-history-preferences__surface"
              key={surface}
            >
              <div className="provider-progress-surface__header">
                <p className="provider-progress-surface__title">{surfaceLabel}</p>
                <span className="meta-chip">
                  {settingsCopy.progressItems.visibleCount(
                    visibleCount,
                    surfacePreferences.length,
                  )}
                </span>
              </div>
              <ol className="provider-progress-list">
                {surfacePreferences.map((preference, index) => {
                  const moduleLabel = moduleLabels[preference.id];
                  const isFirst = index === 0;
                  const isLast = index === surfacePreferences.length - 1;

                  return (
                    <li
                      className="provider-progress-list__item usage-history-preferences__item"
                      data-cursor-usage-module-row={preference.id}
                      key={preference.id}
                    >
                      <span
                        className="provider-progress-list__handle"
                        aria-hidden="true"
                      >
                        ::
                      </span>
                      <label className="provider-progress-list__visibility">
                        <input
                          checked={preference.visible}
                          type="checkbox"
                          onChange={(event) =>
                            updatePreferences(
                              setCursorUsageModuleVisibility(
                                preferences,
                                surface,
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
                          disabled={isFirst}
                          type="button"
                          onClick={() =>
                            updatePreferences(
                              moveCursorUsageModulePreference(
                                preferences,
                                surface,
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
                          disabled={isLast}
                          type="button"
                          onClick={() =>
                            updatePreferences(
                              moveCursorUsageModulePreference(
                                preferences,
                                surface,
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
    </section>
  );
}
