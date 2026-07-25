import {
  useState,
  type DragEvent,
  type KeyboardEvent,
} from "react";

import type {
  ApiGatewayMeteringDisplayPreferences,
  ApiGatewayMeteringModuleId,
  DisplaySurface,
} from "../../providers/types";
import {
  moveApiGatewayMeteringModulePreference,
  reorderApiGatewayMeteringModulePreference,
  setApiGatewayMeteringModuleVisibility,
} from "../../shared/api-gateway-metering";
import type { ResolvedAppLocale } from "../../shared/i18n";
import type { buildSettingsLocalizedCopy } from "../../shared/settings-localized-copy";
import { buildSub2ApiSettingsLocalizedCopy } from "../../shared/sub2api-settings-localized-copy";
import { MaterialIcon } from "./MaterialIcon";
import { MaterialInfoTooltip } from "./MaterialInfoTooltip";

const SURFACES: readonly DisplaySurface[] = ["popup", "sidebar", "fullPage"];

type DraggedModule = {
  surface: DisplaySurface;
  moduleId: ApiGatewayMeteringModuleId;
};

export function ApiGatewayMeteringModulePreferenceControls({
  locale,
  settingsCopy,
  value,
  onChange,
}: {
  locale: ResolvedAppLocale;
  settingsCopy: ReturnType<typeof buildSettingsLocalizedCopy>;
  value: ApiGatewayMeteringDisplayPreferences;
  onChange: (value: ApiGatewayMeteringDisplayPreferences) => void;
}) {
  const [draggedModule, setDraggedModule] = useState<DraggedModule | null>(null);
  const copy = buildSub2ApiSettingsLocalizedCopy(locale);

  function handleDrop(
    surface: DisplaySurface,
    targetModuleId: ApiGatewayMeteringModuleId,
    event: DragEvent<HTMLLIElement>,
  ) {
    event.preventDefault();
    if (!draggedModule || draggedModule.surface !== surface) {
      return;
    }
    onChange(
      reorderApiGatewayMeteringModulePreference(
        value,
        surface,
        draggedModule.moduleId,
        targetModuleId,
      ),
    );
    setDraggedModule(null);
  }

  function handleKeyDown(
    surface: DisplaySurface,
    moduleId: ApiGatewayMeteringModuleId,
    event: KeyboardEvent<HTMLLIElement>,
  ) {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") {
      return;
    }
    event.preventDefault();
    onChange(
      moveApiGatewayMeteringModulePreference(
        value,
        surface,
        moduleId,
        event.key === "ArrowUp" ? "up" : "down",
      ),
    );
  }

  return (
    <section
      className="api-gateway-module-preferences"
      data-api-gateway-module-preferences=""
    >
      <div>
        <p className="section-label">{copy.modulesEyebrow}</p>
        <div className="section-title-with-info">
          <h3 className="section-title">{copy.modulesTitle}</h3>
          <MaterialInfoTooltip>{copy.modulesDetail}</MaterialInfoTooltip>
        </div>
      </div>

      <div className="api-gateway-module-preferences__surface-grid">
        {SURFACES.map((surface) => {
          const preferences = value[surface];
          const surfaceLabel = settingsCopy.progressItems.surfaceLabels[surface];
          const visibleCount = preferences.filter(({ visible }) => visible).length;

          return (
            <section
              className="provider-progress-surface"
              key={surface}
            >
              <div className="provider-progress-surface__header">
                <p className="provider-progress-surface__title">{surfaceLabel}</p>
                <span className="meta-chip">
                  {settingsCopy.progressItems.visibleCount(
                    visibleCount,
                    preferences.length,
                  )}
                </span>
              </div>
              <ol className="provider-progress-list">
                {preferences.map((preference, index) => {
                  const label = copy.moduleLabels[preference.id];
                  const isFirst = index === 0;
                  const isLast = index === preferences.length - 1;

                  return (
                    <li
                      className="provider-progress-list__item"
                      data-api-gateway-module-row={preference.id}
                      draggable
                      key={preference.id}
                      tabIndex={0}
                      aria-label={settingsCopy.progressItems.rowAria(
                        label,
                        index + 1,
                        preferences.length,
                        surfaceLabel,
                      )}
                      onDragStart={() =>
                        setDraggedModule({ surface, moduleId: preference.id })
                      }
                      onDragOver={(event) => event.preventDefault()}
                      onDragEnd={() => setDraggedModule(null)}
                      onDrop={(event) =>
                        handleDrop(surface, preference.id, event)
                      }
                      onKeyDown={(event) =>
                        handleKeyDown(surface, preference.id, event)
                      }
                    >
                      <span
                        className="provider-progress-list__handle"
                        aria-hidden="true"
                      >
                        ::
                      </span>
                      <label className="provider-progress-list__visibility">
                        <input
                          type="checkbox"
                          checked={preference.visible}
                          aria-label={settingsCopy.progressItems.visibilityAction(
                            preference.visible ? "hide" : "show",
                            label,
                            surfaceLabel,
                          )}
                          onChange={(event) =>
                            onChange(
                              setApiGatewayMeteringModuleVisibility(
                                value,
                                surface,
                                preference.id,
                                event.currentTarget.checked,
                              ),
                            )
                          }
                        />
                        <span>{preference.visible ? copy.shown : copy.hidden}</span>
                      </label>
                      <span className="provider-progress-list__main">
                        <span className="provider-progress-list__label">{label}</span>
                      </span>
                      <span className="provider-progress-list__actions">
                        <button
                          className="text-button provider-progress-list__action provider-progress-list__action--icon"
                          type="button"
                          disabled={isFirst}
                          aria-label={settingsCopy.progressItems.moveUpAction(
                            label,
                            surfaceLabel,
                          )}
                          onClick={() =>
                            onChange(
                              moveApiGatewayMeteringModulePreference(
                                value,
                                surface,
                                preference.id,
                                "up",
                              ),
                            )
                          }
                        >
                          <MaterialIcon name="keyboard-arrow-up" />
                        </button>
                        <button
                          className="text-button provider-progress-list__action provider-progress-list__action--icon"
                          type="button"
                          disabled={isLast}
                          aria-label={settingsCopy.progressItems.moveDownAction(
                            label,
                            surfaceLabel,
                          )}
                          onClick={() =>
                            onChange(
                              moveApiGatewayMeteringModulePreference(
                                value,
                                surface,
                                preference.id,
                                "down",
                              ),
                            )
                          }
                        >
                          <MaterialIcon name="keyboard-arrow-down" />
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
