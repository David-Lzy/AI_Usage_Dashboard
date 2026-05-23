import {
  useMemo,
  useState,
  type DragEvent,
  type KeyboardEvent,
} from "react";

import type {
  DisplaySurface,
  ProgressItemsBySurface,
  ProviderId,
  ProviderProgressItemPreference,
  ProviderSetting,
  ProviderSnapshot,
} from "../../providers/types";
import {
  DISPLAY_SURFACES,
  moveProgressItemPreference,
  reorderProgressItemPreferenceBefore,
  resolveProgressItemPreferences,
  setProgressItemVisibility,
} from "../../shared/display-preferences";
import {
  buildProviderProgressItems,
  type ProviderProgressItem,
} from "../../shared/provider-progress-items";
import type { buildSettingsLocalizedCopy } from "../../shared/settings-localized-copy";
import { MaterialInfoTooltip } from "./MaterialInfoTooltip";

type ProviderProgressItemPreferenceControlsProps = {
  copy: ReturnType<typeof buildSettingsLocalizedCopy>["progressItems"];
  detailsOpenByProvider?: Record<string, boolean>;
  progressItemsBySurface: ProgressItemsBySurface;
  providers: ProviderSetting[];
  snapshots: ProviderSnapshot[];
  onChange: (progressItemsBySurface: ProgressItemsBySurface) => void;
  onDetailsOpenByProviderChange?: (
    detailsOpenByProvider: Record<string, boolean>,
  ) => void;
};

type DraggedProgressItem = {
  surface: DisplaySurface;
  providerId: ProviderId;
  itemId: string;
};

function createProgressItemMap(
  items: readonly ProviderProgressItem[],
): Map<string, ProviderProgressItem> {
  return new Map(items.map((item) => [item.id, item]));
}

function getOrderedProgressItems(
  preferences: readonly ProviderProgressItemPreference[],
  progressItemMap: Map<string, ProviderProgressItem>,
): ProviderProgressItem[] {
  return preferences
    .map((preference) => progressItemMap.get(preference.id) ?? null)
    .filter((item): item is ProviderProgressItem => item !== null);
}

export function ProviderProgressItemPreferenceControls({
  copy,
  detailsOpenByProvider = {},
  progressItemsBySurface,
  providers,
  snapshots,
  onChange,
  onDetailsOpenByProviderChange,
}: ProviderProgressItemPreferenceControlsProps) {
  const [draggedProgressItem, setDraggedProgressItem] =
    useState<DraggedProgressItem | null>(null);
  const progressItemsByProvider = useMemo(() => {
    const snapshotMap = new Map(
      snapshots.map((snapshot) => [snapshot.providerId, snapshot] as const),
    );

    return new Map(
      providers.map((provider) => {
        const snapshot = snapshotMap.get(provider.id);
        return [
          provider.id,
          snapshot ? buildProviderProgressItems(snapshot) : [],
        ] as const;
      }),
    );
  }, [providers, snapshots]);

  function updateSurfaceProviderPreferences(
    surface: DisplaySurface,
    providerId: ProviderId,
    preferences: ProviderProgressItemPreference[],
  ) {
    onChange({
      ...progressItemsBySurface,
      [surface]: {
        ...progressItemsBySurface[surface],
        [providerId]: preferences,
      },
    });
  }

  function resolveSurfaceProviderPreferences(
    surface: DisplaySurface,
    providerId: ProviderId,
    itemIds: readonly string[],
  ): ProviderProgressItemPreference[] {
    return resolveProgressItemPreferences(
      progressItemsBySurface[surface][providerId],
      itemIds,
    );
  }

  function setItemVisibility(
    surface: DisplaySurface,
    providerId: ProviderId,
    itemIds: readonly string[],
    itemId: string,
    visible: boolean,
  ) {
    updateSurfaceProviderPreferences(
      surface,
      providerId,
      setProgressItemVisibility(
        progressItemsBySurface[surface][providerId],
        itemIds,
        itemId,
        visible,
      ),
    );
  }

  function moveItem(
    surface: DisplaySurface,
    providerId: ProviderId,
    itemIds: readonly string[],
    itemId: string,
    direction: "up" | "down",
  ) {
    updateSurfaceProviderPreferences(
      surface,
      providerId,
      moveProgressItemPreference(
        progressItemsBySurface[surface][providerId],
        itemIds,
        itemId,
        direction,
      ),
    );
  }

  function handleDrop(
    surface: DisplaySurface,
    providerId: ProviderId,
    itemIds: readonly string[],
    targetItemId: string,
    event: DragEvent<HTMLLIElement>,
  ) {
    event.preventDefault();

    if (
      !draggedProgressItem ||
      draggedProgressItem.surface !== surface ||
      draggedProgressItem.providerId !== providerId
    ) {
      return;
    }

    updateSurfaceProviderPreferences(
      surface,
      providerId,
      reorderProgressItemPreferenceBefore(
        progressItemsBySurface[surface][providerId],
        itemIds,
        draggedProgressItem.itemId,
        targetItemId,
      ),
    );
    setDraggedProgressItem(null);
  }

  function handleKeyDown(
    surface: DisplaySurface,
    providerId: ProviderId,
    itemIds: readonly string[],
    itemId: string,
    event: KeyboardEvent<HTMLLIElement>,
  ) {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveItem(surface, providerId, itemIds, itemId, "up");
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveItem(surface, providerId, itemIds, itemId, "down");
    }
  }

  return (
    <section
      className="provider-progress-preferences"
      data-provider-progress-preferences=""
    >
      <div className="provider-progress-preferences__header">
        <div>
          <p className="section-label">{copy.sectionLabel}</p>
          <div className="section-title-with-info">
            <h3 className="section-title provider-progress-preferences__title">
              {copy.title}
            </h3>
            <MaterialInfoTooltip>{copy.detail}</MaterialInfoTooltip>
          </div>
        </div>
      </div>

      <div className="provider-progress-preferences__providers">
        {providers.map((provider) => {
          const progressItems = progressItemsByProvider.get(provider.id) ?? [];
          const progressItemIds = progressItems.map((item) => item.id);
          const progressItemMap = createProgressItemMap(progressItems);

          return (
            <details
              key={provider.id}
              className="provider-progress-provider"
              data-provider-progress-preference-provider={provider.id}
              open={detailsOpenByProvider[provider.id] === true}
              onToggle={(event) => {
                onDetailsOpenByProviderChange?.({
                  ...detailsOpenByProvider,
                  [provider.id]: (event.currentTarget as HTMLDetailsElement).open,
                });
              }}
            >
              <summary
                className="provider-progress-provider__summary"
                data-provider-progress-preference-provider-summary={provider.id}
              >
                <span className="provider-progress-provider__summary-copy">
                  <span className="provider-progress-provider__title">
                    {provider.label}
                  </span>
                  <span className="supporting-copy provider-progress-provider__detail">
                    {progressItems.length > 0
                      ? copy.provider.count(progressItems.length)
                      : copy.provider.emptyDetail}
                  </span>
                </span>
              </summary>

              <div className="provider-progress-provider__body">
                {progressItems.length === 0 ? (
                  <p className="supporting-copy provider-progress-provider__empty">
                    {copy.provider.emptyBody}
                  </p>
                ) : (
                  <div className="provider-progress-surfaces">
                    {DISPLAY_SURFACES.map((surface) => {
                      const preferences = resolveSurfaceProviderPreferences(
                        surface,
                        provider.id,
                        progressItemIds,
                      );
                      const orderedProgressItems = getOrderedProgressItems(
                        preferences,
                        progressItemMap,
                      );
                      const visibleCount = preferences.filter(
                        (preference) => preference.visible,
                      ).length;
                      const surfaceLabel = copy.surfaceLabels[surface];

                      return (
                        <section
                          key={surface}
                          className="provider-progress-surface"
                          data-provider-progress-surface={surface}
                        >
                          <div className="provider-progress-surface__header">
                            <p className="provider-progress-surface__title">
                              {surfaceLabel}
                            </p>
                            <span className="meta-chip">
                              {copy.visibleCount(
                                visibleCount,
                                preferences.length,
                              )}
                            </span>
                          </div>

                          <ol className="provider-progress-list">
                            {orderedProgressItems.map(
                              (progressItem, index) => {
                                const preference = preferences.find(
                                  (candidate) =>
                                    candidate.id === progressItem.id,
                                );
                                const isFirst = index === 0;
                                const isLast =
                                  index === orderedProgressItems.length - 1;
                                const isVisible = preference?.visible ?? true;

                                return (
                                  <li
                                    key={progressItem.id}
                                    className="provider-progress-list__item"
                                    data-provider-progress-item-row={
                                      progressItem.id
                                    }
                                    draggable
                                    tabIndex={0}
                                    aria-label={copy.rowAria(
                                      progressItem.label,
                                      index + 1,
                                      orderedProgressItems.length,
                                      surfaceLabel,
                                    )}
                                    onDragStart={() =>
                                      setDraggedProgressItem({
                                        surface,
                                        providerId: provider.id,
                                        itemId: progressItem.id,
                                      })
                                    }
                                    onDragOver={(event) =>
                                      event.preventDefault()
                                    }
                                    onDragEnd={() =>
                                      setDraggedProgressItem(null)
                                    }
                                    onDrop={(event) =>
                                      handleDrop(
                                        surface,
                                        provider.id,
                                        progressItemIds,
                                        progressItem.id,
                                        event,
                                      )
                                    }
                                    onKeyDown={(event) =>
                                      handleKeyDown(
                                        surface,
                                        provider.id,
                                        progressItemIds,
                                        progressItem.id,
                                        event,
                                      )
                                    }
                                  >
                                    <label className="provider-progress-list__visibility">
                                      <input
                                        type="checkbox"
                                        checked={isVisible}
                                        aria-label={copy.visibilityAction(
                                          isVisible ? "hide" : "show",
                                          progressItem.label,
                                          surfaceLabel,
                                        )}
                                        onChange={(event) =>
                                          setItemVisibility(
                                            surface,
                                            provider.id,
                                            progressItemIds,
                                            progressItem.id,
                                            event.currentTarget.checked,
                                          )
                                        }
                                      />
                                      <span>
                                        {isVisible ? copy.shown : copy.hidden}
                                      </span>
                                    </label>
                                    <span className="provider-progress-list__main">
                                      <span className="provider-progress-list__label">
                                        {progressItem.label}
                                      </span>
                                      <span className="provider-progress-list__meta">
                                        {copy.kindLabels[progressItem.kind]}
                                        {" · "}
                                        {
                                          copy.availabilityLabels[
                                            progressItem.availability
                                          ]
                                        }
                                      </span>
                                    </span>
                                    <span className="provider-progress-list__actions">
                                      <button
                                        className="text-button provider-progress-list__action"
                                        type="button"
                                        disabled={isFirst}
                                        aria-label={copy.moveUpAction(
                                          progressItem.label,
                                          surfaceLabel,
                                        )}
                                        onClick={() =>
                                          moveItem(
                                            surface,
                                            provider.id,
                                            progressItemIds,
                                            progressItem.id,
                                            "up",
                                          )
                                        }
                                      >
                                        {copy.up}
                                      </button>
                                      <button
                                        className="text-button provider-progress-list__action"
                                        type="button"
                                        disabled={isLast}
                                        aria-label={copy.moveDownAction(
                                          progressItem.label,
                                          surfaceLabel,
                                        )}
                                        onClick={() =>
                                          moveItem(
                                            surface,
                                            provider.id,
                                            progressItemIds,
                                            progressItem.id,
                                            "down",
                                          )
                                        }
                                      >
                                        {copy.down}
                                      </button>
                                    </span>
                                  </li>
                                );
                              },
                            )}
                          </ol>

                          {visibleCount === 0 ? (
                            <p className="supporting-copy provider-progress-surface__fallback">
                              {copy.allHidden}
                            </p>
                          ) : null}
                        </section>
                      );
                    })}
                  </div>
                )}
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}
