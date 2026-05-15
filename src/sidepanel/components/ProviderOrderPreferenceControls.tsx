import {
  useMemo,
  useState,
  type DragEvent,
  type KeyboardEvent,
} from "react";

import type {
  DisplaySurface,
  ProviderId,
  ProviderOrderBySurface,
  ProviderSetting,
} from "../../providers/types";
import {
  DISPLAY_SURFACES,
  moveProviderInOrder,
  reorderProviderBefore,
  resolveProviderOrder,
} from "../../shared/display-preferences";
import type { buildSettingsLocalizedCopy } from "../../shared/settings-localized-copy";
import { MaterialInfoTooltip } from "./MaterialInfoTooltip";

type ProviderOrderPreferenceControlsProps = {
  copy: ReturnType<typeof buildSettingsLocalizedCopy>["providerOrder"];
  providerOrderBySurface: ProviderOrderBySurface;
  providers: ProviderSetting[];
  onChange: (providerOrderBySurface: ProviderOrderBySurface) => void;
};

function getProviderLabel(
  providerLabels: Map<ProviderId, string>,
  providerId: ProviderId,
): string {
  return providerLabels.get(providerId) ?? providerId;
}

export function ProviderOrderPreferenceControls({
  copy,
  providerOrderBySurface,
  providers,
  onChange,
}: ProviderOrderPreferenceControlsProps) {
  const [draggedProvider, setDraggedProvider] = useState<{
    surface: DisplaySurface;
    providerId: ProviderId;
  } | null>(null);
  const providerIds = useMemo(
    () => providers.map((provider) => provider.id),
    [providers],
  );
  const providerLabels = useMemo(
    () =>
      new Map(
        providers.map((provider) => [provider.id, provider.label] as const),
      ),
    [providers],
  );

  function updateSurfaceOrder(surface: DisplaySurface, providerIds: ProviderId[]) {
    onChange({
      ...providerOrderBySurface,
      [surface]: providerIds,
    });
  }

  function moveProvider(
    surface: DisplaySurface,
    providerId: ProviderId,
    direction: "up" | "down",
  ) {
    updateSurfaceOrder(
      surface,
      moveProviderInOrder(
        providerOrderBySurface[surface],
        providerIds,
        providerId,
        direction,
      ),
    );
  }

  function handleDrop(
    surface: DisplaySurface,
    targetProviderId: ProviderId,
    event: DragEvent<HTMLLIElement>,
  ) {
    event.preventDefault();

    if (!draggedProvider || draggedProvider.surface !== surface) {
      return;
    }

    updateSurfaceOrder(
      surface,
      reorderProviderBefore(
        providerOrderBySurface[surface],
        providerIds,
        draggedProvider.providerId,
        targetProviderId,
      ),
    );
    setDraggedProvider(null);
  }

  function handleKeyDown(
    surface: DisplaySurface,
    providerId: ProviderId,
    event: KeyboardEvent<HTMLLIElement>,
  ) {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveProvider(surface, providerId, "up");
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveProvider(surface, providerId, "down");
    }
  }

  return (
    <section
      className="provider-order-preferences"
      data-provider-order-preferences=""
    >
      <div className="provider-order-preferences__header">
        <div>
          <p className="section-label">{copy.sectionLabel}</p>
          <div className="section-title-with-info">
            <h3 className="section-title provider-order-preferences__title">
              {copy.title}
            </h3>
            <MaterialInfoTooltip>{copy.detail}</MaterialInfoTooltip>
          </div>
        </div>
      </div>

      <div className="provider-order-preferences__surfaces">
        {DISPLAY_SURFACES.map((surface) => {
          const orderedProviderIds = resolveProviderOrder(
            providerOrderBySurface[surface],
            providerIds,
          );
          const surfaceLabel = copy.surfaceLabels[surface];

          return (
            <section
              key={surface}
              className="provider-order-surface"
              data-provider-order-surface={surface}
            >
              <div className="provider-order-surface__header">
                <p className="provider-order-surface__title">{surfaceLabel}</p>
                <span className="meta-chip">
                  {copy.providerCount(orderedProviderIds.length)}
                </span>
              </div>

              <ol className="provider-order-list">
                {orderedProviderIds.map((providerId, index) => {
                  const providerLabel = getProviderLabel(providerLabels, providerId);
                  const isFirst = index === 0;
                  const isLast = index === orderedProviderIds.length - 1;

                  return (
                    <li
                      key={providerId}
                      className="provider-order-list__item"
                      data-provider-order-row={providerId}
                      draggable
                      tabIndex={0}
                      aria-label={copy.rowAria(
                        providerLabel,
                        index + 1,
                        orderedProviderIds.length,
                        surfaceLabel,
                      )}
                      onDragStart={() =>
                        setDraggedProvider({ surface, providerId })
                      }
                      onDragOver={(event) => event.preventDefault()}
                      onDragEnd={() => setDraggedProvider(null)}
                      onDrop={(event) => handleDrop(surface, providerId, event)}
                      onKeyDown={(event) =>
                        handleKeyDown(surface, providerId, event)
                      }
                    >
                      <span className="provider-order-list__handle" aria-hidden="true">
                        ::
                      </span>
                      <span className="provider-order-list__name">
                        {providerLabel}
                      </span>
                      <span className="provider-order-list__position">
                        {index + 1}
                      </span>
                      <span className="provider-order-list__actions">
                        <button
                          className="text-button provider-order-list__action"
                          type="button"
                          disabled={isFirst}
                          aria-label={copy.moveUpAction(
                            providerLabel,
                            surfaceLabel,
                          )}
                          onClick={() => moveProvider(surface, providerId, "up")}
                        >
                          {copy.up}
                        </button>
                        <button
                          className="text-button provider-order-list__action"
                          type="button"
                          disabled={isLast}
                          aria-label={copy.moveDownAction(
                            providerLabel,
                            surfaceLabel,
                          )}
                          onClick={() =>
                            moveProvider(surface, providerId, "down")
                          }
                        >
                          {copy.down}
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
