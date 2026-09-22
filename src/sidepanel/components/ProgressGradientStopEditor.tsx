import {
  useMemo,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";

import type { ProgressGradientStop } from "../../providers/types";
import { RECOMMENDED_COLOR_CHOICES } from "../../shared/color-choices";
import type { buildSettingsLocalizedCopy } from "../../shared/settings-localized-copy";
import type { SettingsActivePopoverSessionState } from "../../shared/surface-session-state";
import { resolveProgressGradientColorForRemainingPercent } from "../../shared/progress-appearance";
import { ColorChoiceDropdown } from "./ColorChoiceDropdown";
import {
  buildGradientTrackBackground,
  createGradientStopId,
  findAvailableGradientStopPosition,
  isGradientEndpointStop,
  normalizeColorDraft,
  resolveGradientStopDragPosition,
  shouldSkipGradientStopCreation,
} from "./progress-appearance-editor-helpers";

type ProgressGradientStopEditorProps = {
  active: boolean;
  stops: readonly ProgressGradientStop[];
  selectedStopId: string | null;
  errorMessage?: string | null;
  colorChoiceCopy: ReturnType<typeof buildSettingsLocalizedCopy>["colorChoices"];
  copy: ReturnType<typeof buildSettingsLocalizedCopy>["progressAppearance"]["gradient"];
  activePopover?: SettingsActivePopoverSessionState | null;
  onActivePopoverChange?: (
    nextPopover: SettingsActivePopoverSessionState | null,
  ) => void;
  onStopsChange: (
    stops: readonly ProgressGradientStop[],
    selectedStopId?: string | null,
  ) => void;
  onSelectedStopChange: (stopId: string | null) => void;
};

export function ProgressGradientStopEditor({
  active,
  stops,
  selectedStopId,
  errorMessage,
  colorChoiceCopy,
  copy,
  activePopover,
  onActivePopoverChange,
  onStopsChange,
  onSelectedStopChange,
}: ProgressGradientStopEditorProps) {
  const selectedStop =
    stops.find((stop) => stop.id === selectedStopId) ?? stops[0] ?? null;
  const gradientTrackStyle = useMemo(
    () =>
      ({
        "--progress-gradient-track": buildGradientTrackBackground(stops),
      }) as CSSProperties & { "--progress-gradient-track": string },
    [stops],
  );

  function updateStopPosition(stopId: string, nextPosition: number) {
    const targetStop = stops.find((stop) => stop.id === stopId);

    if (!targetStop || isGradientEndpointStop(targetStop)) {
      return;
    }

    onSelectedStopChange(stopId);
    onStopsChange(
      stops.map((stop) =>
        stop.id === stopId
          ? {
              ...stop,
              positionPercent: findAvailableGradientStopPosition(
                nextPosition,
                stops,
                stopId,
              ),
            }
          : stop,
      ),
      stopId,
    );
  }

  function updateStopColor(stopId: string, nextColorHex: string) {
    onSelectedStopChange(stopId);
    onStopsChange(
      stops.map((stop) =>
        stop.id === stopId
          ? { ...stop, colorHex: normalizeColorDraft(nextColorHex) }
          : stop,
      ),
      stopId,
    );
  }

  function addStop(event: ReactMouseEvent<HTMLDivElement>) {
    const target = event.target;

    if (
      target instanceof Element &&
      target.closest("[data-progress-gradient-stop-handle]")
    ) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();

    if (rect.width <= 0) {
      return;
    }

    const boundedPosition = Math.min(
      100,
      Math.max(0, ((event.clientX - rect.left) / rect.width) * 100),
    );

    if (
      shouldSkipGradientStopCreation({
        positionPercent: boundedPosition,
        stops,
        trackWidthPx: rect.width,
      })
    ) {
      return;
    }

    const positionPercent = findAvailableGradientStopPosition(boundedPosition, stops);
    const nextStop: ProgressGradientStop = {
      id: createGradientStopId(stops),
      positionPercent,
      colorHex:
        resolveProgressGradientColorForRemainingPercent(positionPercent, stops) ??
        selectedStop?.colorHex ??
        "#146C2E",
    };

    onSelectedStopChange(nextStop.id);
    onStopsChange([...stops, nextStop], nextStop.id);
  }

  function removeSelectedStop() {
    if (
      !selectedStop ||
      isGradientEndpointStop(selectedStop) ||
      stops.length <= 2
    ) {
      return;
    }

    const selectedIndex = stops.findIndex((stop) => stop.id === selectedStop.id);
    const nextStops = stops.filter((stop) => stop.id !== selectedStop.id);

    onSelectedStopChange(
      nextStops[Math.max(0, selectedIndex - 1)]?.id ?? nextStops[0]?.id ?? null,
    );
    onStopsChange(
      nextStops,
      nextStops[Math.max(0, selectedIndex - 1)]?.id ?? nextStops[0]?.id ?? null,
    );
  }

  function handleStopKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    stop: ProgressGradientStop,
  ) {
    if (isGradientEndpointStop(stop)) {
      return;
    }

    const smallStep = event.shiftKey ? 5 : 1;
    const keyPositions: Record<string, number> = {
      ArrowLeft: stop.positionPercent - smallStep,
      ArrowDown: stop.positionPercent - smallStep,
      ArrowRight: stop.positionPercent + smallStep,
      ArrowUp: stop.positionPercent + smallStep,
      PageDown: stop.positionPercent - 5,
      PageUp: stop.positionPercent + 5,
      Home: 0.01,
      End: 99.99,
    };
    const nextPosition = keyPositions[event.key];

    if (nextPosition === undefined) {
      return;
    }

    event.preventDefault();
    updateStopPosition(stop.id, nextPosition);
  }

  function handleStopMouseDown(
    event: ReactMouseEvent<HTMLButtonElement>,
    stop: ProgressGradientStop,
  ) {
    event.stopPropagation();
    onSelectedStopChange(stop.id);

    if (event.button !== 0 || isGradientEndpointStop(stop)) {
      return;
    }

    const rail = event.currentTarget.closest("[data-progress-gradient-rail]");

    if (!(rail instanceof HTMLElement)) {
      return;
    }

    const railElement = rail;
    event.preventDefault();
    const initialClientX = event.clientX;
    const initialPositionPercent = stop.positionPercent;

    function handleMouseMove(mouseEvent: MouseEvent) {
      mouseEvent.preventDefault();
      const rect = railElement.getBoundingClientRect();

      if (rect.width <= 0) {
        return;
      }

      updateStopPosition(
        stop.id,
        resolveGradientStopDragPosition({
          currentClientX: mouseEvent.clientX,
          initialClientX,
          initialPositionPercent,
          trackWidthPx: rect.width,
        }),
      );
    }

    function cleanup() {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", cleanup);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", cleanup);
  }

  if (!active) {
    return null;
  }

  return (
    <div className="progress-gradient-editor" data-progress-gradient-editor="">
      {errorMessage ? (
        <p className="supporting-copy progress-gradient-scheme-dropdown__error">
          {errorMessage}
        </p>
      ) : null}
      <div
        className="progress-gradient-editor__track"
        role="presentation"
        title={copy.trackHelp}
      >
        <div
          className="progress-gradient-editor__rail"
          style={gradientTrackStyle}
          data-progress-gradient-rail=""
          onClick={addStop}
        >
          <div className="progress-gradient-editor__ticks" aria-hidden="true">
            {[0, 25, 50, 75, 100].map((tick) => (
              <span
                key={tick}
                className="progress-gradient-editor__tick"
                style={{ left: `${tick}%` }}
              />
            ))}
          </div>
          {stops.map((stop, index) => {
            const isSelected = selectedStop?.id === stop.id;

            return (
              <button
                key={stop.id}
                className="progress-gradient-editor__stop"
                type="button"
                role="slider"
                aria-label={copy.stopAriaLabel(index + 1, stop.positionPercent)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={stop.positionPercent}
                aria-valuetext={`${stop.positionPercent}%`}
                data-progress-gradient-stop-handle=""
                data-selected={isSelected ? "true" : "false"}
                data-endpoint={isGradientEndpointStop(stop) ? "true" : "false"}
                data-draggable={isGradientEndpointStop(stop) ? "false" : "true"}
                title={copy.stopHelp}
                style={{
                  left: `${stop.positionPercent}%`,
                  "--progress-gradient-stop-color": stop.colorHex,
                } as CSSProperties & { "--progress-gradient-stop-color": string }}
                onClick={(event) => {
                  event.stopPropagation();
                  onSelectedStopChange(stop.id);
                }}
                onMouseDown={(event) => handleStopMouseDown(event, stop)}
                onKeyDown={(event) => handleStopKeyDown(event, stop)}
              />
            );
          })}
        </div>
      </div>

      {selectedStop ? (
        <div className="progress-gradient-editor__selected">
          <label className="form-field">
            <span className="form-field__label">{copy.positionLabel}</span>
            <input
              className="form-field__control"
              type="number"
              min={0}
              max={100}
              step={0.01}
              inputMode="decimal"
              value={selectedStop.positionPercent}
              disabled={isGradientEndpointStop(selectedStop)}
              aria-describedby={
                isGradientEndpointStop(selectedStop)
                  ? "progress-gradient-endpoint-help"
                  : undefined
              }
              onChange={(event) =>
                updateStopPosition(selectedStop.id, Number(event.target.value))
              }
            />
          </label>
          <ColorChoiceDropdown
            label={copy.colorLabel}
            valueHex={selectedStop.colorHex}
            fieldIdPrefix={`progress-gradient-stop-${selectedStop.id}`}
            menuDensity="compact"
            sessionPopoverId={`progress-gradient-stop:${selectedStop.id}:color`}
            activePopover={activePopover}
            onActivePopoverChange={onActivePopoverChange}
            copy={colorChoiceCopy}
            sections={[
              {
                id: "recommended-colors",
                label: colorChoiceCopy.recommendedColorsLabel,
                choices: RECOMMENDED_COLOR_CHOICES.map((choice) => ({
                  id: choice.id,
                  hex: choice.hex,
                  label: colorChoiceCopy.colorNames[choice.id],
                })),
              },
            ]}
            onChange={(nextColorHex) =>
              updateStopColor(selectedStop.id, nextColorHex)
            }
          />
          <button
            className="text-button progress-gradient-editor__delete"
            type="button"
            disabled={stops.length <= 2 || isGradientEndpointStop(selectedStop)}
            title={
              isGradientEndpointStop(selectedStop)
                ? copy.endpointLocked
                : copy.minimumStopHelp
            }
            onClick={removeSelectedStop}
          >
            {copy.deleteStop}
          </button>
        </div>
      ) : null}
      <p
        id="progress-gradient-endpoint-help"
        className="supporting-copy progress-gradient-editor__help"
      >
        {copy.endpointLocked}
      </p>
    </div>
  );
}
