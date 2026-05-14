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
  type ProviderProgressItemAvailability,
  type ProviderProgressItemKind,
} from "../../shared/provider-progress-items";

type ProviderProgressItemPreferenceControlsProps = {
  progressItemsBySurface: ProgressItemsBySurface;
  providers: ProviderSetting[];
  snapshots: ProviderSnapshot[];
  onChange: (progressItemsBySurface: ProgressItemsBySurface) => void;
};

type DraggedProgressItem = {
  surface: DisplaySurface;
  providerId: ProviderId;
  itemId: string;
};

const SURFACE_LABELS: Record<DisplaySurface, string> = {
  popup: "Popup",
  sidebar: "Sidebar",
  fullPage: "Full-page tab",
};

const PROGRESS_ITEM_KIND_LABELS: Record<ProviderProgressItemKind, string> = {
  primary_quota: "Primary quota",
  usage_window: "Usage window",
  usage_balance: "Balance",
};

const PROGRESS_ITEM_AVAILABILITY_LABELS: Record<
  ProviderProgressItemAvailability,
  string
> = {
  progress: "Progress",
  value_only: "Value only",
  unavailable: "Unavailable",
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
  progressItemsBySurface,
  providers,
  snapshots,
  onChange,
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
          <p className="section-label">Quota items</p>
          <h3 className="section-title provider-progress-preferences__title">
            Choose visible progress per surface
          </h3>
        </div>
        <p className="supporting-copy">
          Hide, show, and reorder quota progress items independently for popup,
          sidebar, and full-page tab. Usage facts and raw diagnostics stay out
          of this progress list.
        </p>
      </div>

      <div className="provider-progress-preferences__providers">
        {providers.map((provider) => {
          const progressItems = progressItemsByProvider.get(provider.id) ?? [];
          const progressItemIds = progressItems.map((item) => item.id);
          const progressItemMap = createProgressItemMap(progressItems);

          return (
            <article
              key={provider.id}
              className="provider-progress-provider"
              data-provider-progress-preference-provider={provider.id}
            >
              <div className="provider-progress-provider__header">
                <div>
                  <p className="provider-progress-provider__title">
                    {provider.label}
                  </p>
                  <p className="supporting-copy provider-progress-provider__detail">
                    {progressItems.length > 0
                      ? `${progressItems.length} configurable quota items`
                      : "No configurable quota progress items yet"}
                  </p>
                </div>
              </div>

              {progressItems.length === 0 ? (
                <p className="supporting-copy provider-progress-provider__empty">
                  This provider currently exposes facts, policy text, or raw
                  evidence rather than renderable progress items.
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
                    const surfaceLabel = SURFACE_LABELS[surface];

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
                            {visibleCount}/{preferences.length} shown
                          </span>
                        </div>

                        <ol className="provider-progress-list">
                          {orderedProgressItems.map((progressItem, index) => {
                            const preference = preferences.find(
                              (candidate) => candidate.id === progressItem.id,
                            );
                            const isFirst = index === 0;
                            const isLast =
                              index === orderedProgressItems.length - 1;
                            const isVisible = preference?.visible ?? true;

                            return (
                              <li
                                key={progressItem.id}
                                className="provider-progress-list__item"
                                data-provider-progress-item-row={progressItem.id}
                                draggable
                                tabIndex={0}
                                aria-label={`${progressItem.label}, ${index + 1} of ${orderedProgressItems.length} on ${surfaceLabel}`}
                                onDragStart={() =>
                                  setDraggedProgressItem({
                                    surface,
                                    providerId: provider.id,
                                    itemId: progressItem.id,
                                  })
                                }
                                onDragOver={(event) => event.preventDefault()}
                                onDragEnd={() => setDraggedProgressItem(null)}
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
                                    aria-label={`${isVisible ? "Hide" : "Show"} ${progressItem.label} on ${surfaceLabel}`}
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
                                  <span>{isVisible ? "Shown" : "Hidden"}</span>
                                </label>
                                <span className="provider-progress-list__main">
                                  <span className="provider-progress-list__label">
                                    {progressItem.label}
                                  </span>
                                  <span className="provider-progress-list__meta">
                                    {PROGRESS_ITEM_KIND_LABELS[progressItem.kind]}
                                    {" · "}
                                    {
                                      PROGRESS_ITEM_AVAILABILITY_LABELS[
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
                                    aria-label={`Move ${progressItem.label} up on ${surfaceLabel}`}
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
                                    Up
                                  </button>
                                  <button
                                    className="text-button provider-progress-list__action"
                                    type="button"
                                    disabled={isLast}
                                    aria-label={`Move ${progressItem.label} down on ${surfaceLabel}`}
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
                                    Down
                                  </button>
                                </span>
                              </li>
                            );
                          })}
                        </ol>

                        {visibleCount === 0 ? (
                          <p className="supporting-copy provider-progress-surface__fallback">
                            All progress items are hidden on this surface; later
                            rendering can fall back to provider metadata instead
                            of an empty card.
                          </p>
                        ) : null}
                      </section>
                    );
                  })}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
