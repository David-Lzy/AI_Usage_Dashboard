import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";

import type {
  ProgressColorAppearance,
  ProgressColorBand,
  ProgressGradientStop,
} from "../../providers/types";
import { RECOMMENDED_COLOR_CHOICES } from "../../shared/color-choices";
import type { buildSettingsLocalizedCopy } from "../../shared/settings-localized-copy";
import type { SettingsActivePopoverSessionState } from "../../shared/surface-session-state";
import {
  PROGRESS_GRADIENT_IMAGE_ACCEPT,
  ProgressGradientImageImportError,
  createProgressGradientStopsFromImageFile,
} from "../../shared/progress-gradient-image-import";
import {
  PROGRESS_THICKNESS_MAX_PX,
  PROGRESS_THICKNESS_MIN_PX,
  PROGRESS_THICKNESS_SLIDER_MAX,
  PROGRESS_THICKNESS_SLIDER_MIN,
  PROGRESS_GRADIENT_PRESETS,
  areProgressColorBandsValid,
  createDefaultProgressColorBands,
  createDefaultProgressGradientStops,
  createProgressGradientPresetStops,
  findProgressGradientPresetIdForStops,
  moveProgressColorBand,
  normalizeProgressColorAppearance,
  normalizeProgressColorBands,
  normalizeProgressGradientStops,
  normalizeProgressThicknessPx,
  progressThicknessPxToSliderValue,
  progressThicknessSliderValueToPx,
  removeProgressColorBand,
  resolveProgressGradientColorForRemainingPercent,
  splitProgressColorBand,
} from "../../shared/progress-appearance";
import { ColorChoiceDropdown } from "./ColorChoiceDropdown";
import { MaterialInfoTooltip } from "./MaterialInfoTooltip";
import { ProgressGradientSchemeDropdown } from "./ProgressGradientSchemeDropdown";

type ProgressAppearancePreferenceControlsProps = {
  colorAppearance: ProgressColorAppearance;
  colorBands: ProgressColorBand[];
  colorChoiceCopy: ReturnType<typeof buildSettingsLocalizedCopy>["colorChoices"];
  copy: ReturnType<typeof buildSettingsLocalizedCopy>["progressAppearance"];
  thicknessPx: number;
  activePopover?: SettingsActivePopoverSessionState | null;
  onActivePopoverChange?: (
    nextPopover: SettingsActivePopoverSessionState | null,
  ) => void;
  onColorAppearanceChange: (colorAppearance: ProgressColorAppearance) => void;
  onColorBandsChange: (colorBands: ProgressColorBand[]) => void;
  onThicknessPxChange: (thicknessPx: number) => void;
};

type ProgressColorBandDraft = {
  id: string;
  minimumPercent: string;
  maximumPercent: string;
  colorHex: string;
};

function formatThicknessDraft(thicknessPx: number): string {
  return String(normalizeProgressThicknessPx(thicknessPx));
}

function hasValidThicknessDraftShape(value: string): boolean {
  return /^\d*(?:\.\d{0,2})?$/.test(value);
}

function parseCompleteThicknessDraft(value: string): number | null {
  if (
    value.length === 0 ||
    value.endsWith(".") ||
    !/^\d+(?:\.\d{1,2})?$/.test(value)
  ) {
    return null;
  }

  const parsedValue = Number(value);

  if (
    !Number.isFinite(parsedValue) ||
    parsedValue < PROGRESS_THICKNESS_MIN_PX ||
    parsedValue > PROGRESS_THICKNESS_MAX_PX
  ) {
    return null;
  }

  return normalizeProgressThicknessPx(parsedValue);
}

function toDraftBands(
  colorBands: readonly ProgressColorBand[],
): ProgressColorBandDraft[] {
  return colorBands.map((band) => ({
    id: band.id,
    minimumPercent: String(band.minimumPercent),
    maximumPercent: String(band.maximumPercent),
    colorHex: band.colorHex,
  }));
}

function parseDraftBands(
  draftBands: readonly ProgressColorBandDraft[],
): ProgressColorBand[] | null {
  const parsedBands = draftBands.map((band) => {
    const minimumDraft = band.minimumPercent.trim();
    const maximumDraft = band.maximumPercent.trim();

    if (minimumDraft.length === 0 || maximumDraft.length === 0) {
      return null;
    }

    const minimumPercent = Number(minimumDraft);
    const maximumPercent = Number(maximumDraft);

    if (!Number.isInteger(minimumPercent) || !Number.isInteger(maximumPercent)) {
      return null;
    }

    return {
      id: band.id,
      minimumPercent,
      maximumPercent,
      colorHex: band.colorHex.trim(),
    };
  });

  if (parsedBands.some((band) => band === null)) {
    return null;
  }

  return parsedBands as ProgressColorBand[];
}

function normalizeColorDraft(value: string): string {
  return value.trim().toUpperCase();
}

function isValidColorInput(value: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

function roundGradientStopPosition(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function clampGradientStopPosition(value: number): number {
  return Math.min(99.99, Math.max(0.01, roundGradientStopPosition(value)));
}

function isGradientEndpointStop(stop: ProgressGradientStop): boolean {
  return stop.positionPercent === 0 || stop.positionPercent === 100;
}

function findAvailableGradientStopPosition(
  positionPercent: number,
  stops: readonly ProgressGradientStop[],
  ignoredStopId?: string,
): number {
  const usedPositions = new Set(
    stops
      .filter((stop) => stop.id !== ignoredStopId)
      .map((stop) => stop.positionPercent),
  );
  const preferredPosition = clampGradientStopPosition(positionPercent);

  if (!usedPositions.has(preferredPosition)) {
    return preferredPosition;
  }

  for (let offset = 1; offset <= 9999; offset += 1) {
    const forwardPosition = roundGradientStopPosition(
      preferredPosition + offset / 100,
    );

    if (forwardPosition <= 99.99 && !usedPositions.has(forwardPosition)) {
      return forwardPosition;
    }

    const backwardPosition = roundGradientStopPosition(
      preferredPosition - offset / 100,
    );

    if (backwardPosition >= 0.01 && !usedPositions.has(backwardPosition)) {
      return backwardPosition;
    }
  }

  return preferredPosition;
}

function createGradientStopId(stops: readonly ProgressGradientStop[]): string {
  const existingIds = new Set(stops.map((stop) => stop.id));
  let customIndex = stops.length + 1;

  while (existingIds.has(`stop-${customIndex}`)) {
    customIndex += 1;
  }

  return `stop-${customIndex}`;
}

function buildGradientTrackBackground(
  stops: readonly ProgressGradientStop[],
): string {
  return `linear-gradient(90deg, ${stops
    .map((stop) => `${stop.colorHex} ${stop.positionPercent}%`)
    .join(", ")})`;
}

export const PROGRESS_GRADIENT_STOP_CREATION_MIN_DISTANCE_PERCENT = 5;
export const PROGRESS_GRADIENT_STOP_CREATION_MIN_DISTANCE_PX = 16;

export function shouldSkipGradientStopCreation({
  positionPercent,
  stops,
  trackWidthPx,
}: {
  positionPercent: number;
  stops: readonly ProgressGradientStop[];
  trackWidthPx: number;
}): boolean {
  const pixelThresholdPercent =
    trackWidthPx > 0
      ? (PROGRESS_GRADIENT_STOP_CREATION_MIN_DISTANCE_PX / trackWidthPx) * 100
      : 0;
  const thresholdPercent = Math.max(
    PROGRESS_GRADIENT_STOP_CREATION_MIN_DISTANCE_PERCENT,
    pixelThresholdPercent,
  );

  return stops.some(
    (stop) =>
      Math.abs(stop.positionPercent - positionPercent) < thresholdPercent,
  );
}

export function ProgressAppearancePreferenceControls({
  colorAppearance,
  colorBands,
  colorChoiceCopy,
  copy,
  thicknessPx,
  activePopover,
  onActivePopoverChange,
  onColorAppearanceChange,
  onColorBandsChange,
  onThicknessPxChange,
}: ProgressAppearancePreferenceControlsProps) {
  const [draftBands, setDraftBands] = useState(() => toDraftBands(colorBands));
  const [thicknessDraft, setThicknessDraft] = useState(() =>
    formatThicknessDraft(thicknessPx),
  );
  const [hasBandError, setHasBandError] = useState(false);
  const [selectedGradientStopId, setSelectedGradientStopId] = useState<
    string | null
  >(null);
  const [imageImportError, setImageImportError] = useState<string | null>(null);
  const [isImageImporting, setIsImageImporting] = useState(false);
  const [gradientSchemeSource, setGradientSchemeSource] = useState<
    "image" | null
  >(null);
  const normalizedColorAppearance = useMemo(
    () => normalizeProgressColorAppearance(colorAppearance, colorBands),
    [colorAppearance, colorBands],
  );
  const activeColorMode = normalizedColorAppearance.mode;
  const gradientStops =
    normalizedColorAppearance.mode === "gradient"
      ? normalizedColorAppearance.stops
      : createDefaultProgressGradientStops();
  const selectedGradientStop =
    gradientStops.find((stop) => stop.id === selectedGradientStopId) ??
    gradientStops[0] ??
    null;
  const matchedGradientPresetId =
    activeColorMode === "gradient"
      ? findProgressGradientPresetIdForStops(gradientStops)
      : null;
  const selectedGradientSchemeLabel = matchedGradientPresetId
    ? copy.gradient.presetNames[matchedGradientPresetId]
    : gradientSchemeSource === "image"
      ? copy.gradient.imageGeneratedSchemeLabel
      : copy.gradient.customSchemeLabel;
  const gradientTrackStyle = {
    "--progress-gradient-track": buildGradientTrackBackground(gradientStops),
  } as CSSProperties & {
    "--progress-gradient-track": string;
  };

  useEffect(() => {
    setDraftBands(toDraftBands(colorBands));
    setHasBandError(false);
  }, [colorBands]);

  useEffect(() => {
    setThicknessDraft(formatThicknessDraft(thicknessPx));
  }, [thicknessPx]);

  useEffect(() => {
    if (activeColorMode !== "gradient") {
      return;
    }

    if (
      selectedGradientStopId &&
      gradientStops.some((stop) => stop.id === selectedGradientStopId)
    ) {
      return;
    }

    setSelectedGradientStopId(gradientStops[0]?.id ?? null);
  }, [activeColorMode, gradientStops, selectedGradientStopId]);

  function commitGradientStops(
    nextStops: readonly ProgressGradientStop[],
    nextSelectedStopId = selectedGradientStopId,
    nextGradientSchemeSource: "image" | null = null,
  ) {
    const normalizedStops = normalizeProgressGradientStops(nextStops);

    onColorAppearanceChange({
      mode: "gradient",
      stops: normalizedStops,
    });
    setSelectedGradientStopId(
      normalizedStops.some((stop) => stop.id === nextSelectedStopId)
        ? nextSelectedStopId
        : (normalizedStops[0]?.id ?? null),
    );
    setGradientSchemeSource(nextGradientSchemeSource);
  }

  function switchColorMode(nextMode: ProgressColorAppearance["mode"]) {
    if (nextMode === activeColorMode) {
      return;
    }

    if (nextMode === "traditional") {
      onColorAppearanceChange({
        mode: "traditional",
        bands: normalizeProgressColorBands(colorBands),
      });
      return;
    }

    const stops =
      normalizedColorAppearance.mode === "gradient"
        ? normalizedColorAppearance.stops
        : createDefaultProgressGradientStops();

    setSelectedGradientStopId(stops[0]?.id ?? null);
    setGradientSchemeSource(null);
    onColorAppearanceChange({
      mode: "gradient",
      stops,
    });
  }

  function commitDraftBands(nextDraftBands: ProgressColorBandDraft[]) {
    setDraftBands(nextDraftBands);

    const parsedBands = parseDraftBands(nextDraftBands);

    if (parsedBands === null || !areProgressColorBandsValid(parsedBands)) {
      setHasBandError(true);
      return;
    }

    setHasBandError(false);
    onColorBandsChange(normalizeProgressColorBands(parsedBands));
  }

  function updateDraftBand(
    bandId: string,
    nextValues: Partial<Omit<ProgressColorBandDraft, "id">>,
  ) {
    commitDraftBands(
      draftBands.map((band) =>
        band.id === bandId
          ? {
              ...band,
              ...nextValues,
            }
          : band,
      ),
    );
  }

  function handleThicknessNumberChange(event: ChangeEvent<HTMLInputElement>) {
    const nextDraft = event.target.value;

    if (!hasValidThicknessDraftShape(nextDraft)) {
      return;
    }

    setThicknessDraft(nextDraft);

    const parsedThickness = parseCompleteThicknessDraft(nextDraft);

    if (parsedThickness !== null) {
      onThicknessPxChange(parsedThickness);
    }
  }

  function handleThicknessRangeChange(event: ChangeEvent<HTMLInputElement>) {
    onThicknessPxChange(progressThicknessSliderValueToPx(event.target.value));
  }

  function addBand() {
    onColorBandsChange(splitProgressColorBand(colorBands));
  }

  function removeBand(bandId: string) {
    onColorBandsChange(removeProgressColorBand(colorBands, bandId));
  }

  function moveBand(bandId: string, direction: "up" | "down") {
    onColorBandsChange(moveProgressColorBand(colorBands, bandId, direction));
  }

  function resetGradientStops() {
    const defaultStops = createDefaultProgressGradientStops();

    commitGradientStops(defaultStops, defaultStops[0]?.id ?? null);
  }

  function applyGradientPreset(
    presetId: (typeof PROGRESS_GRADIENT_PRESETS)[number]["id"],
  ) {
    const presetStops = createProgressGradientPresetStops(presetId);

    if (!presetStops) {
      return;
    }

    commitGradientStops(presetStops, presetStops[0]?.id ?? null);
    setImageImportError(null);
  }

  function getImageImportErrorMessage(error: unknown): string {
    if (error instanceof ProgressGradientImageImportError) {
      switch (error.code) {
        case "unsupported_type":
          return copy.gradient.imageImportUnsupported;
        case "file_too_large":
          return copy.gradient.imageImportTooLarge;
        case "canvas_unavailable":
          return copy.gradient.imageImportCanvasUnavailable;
        case "decode_failed":
        default:
          return copy.gradient.imageImportDecodeFailed;
      }
    }

    return copy.gradient.imageImportDecodeFailed;
  }

  async function handleGradientImageImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    event.target.value = "";

    if (!file) {
      return;
    }

    setIsImageImporting(true);
    setImageImportError(null);

    try {
      const stops = await createProgressGradientStopsFromImageFile(file);
      commitGradientStops(stops, stops[0]?.id ?? null, "image");
    } catch (error) {
      setImageImportError(getImageImportErrorMessage(error));
    } finally {
      setIsImageImporting(false);
    }
  }

  function updateGradientStopPosition(stopId: string, nextPosition: number) {
    const targetStop = gradientStops.find((stop) => stop.id === stopId);

    if (!targetStop || isGradientEndpointStop(targetStop)) {
      return;
    }

    const positionPercent = findAvailableGradientStopPosition(
      nextPosition,
      gradientStops,
      stopId,
    );

    commitGradientStops(
      gradientStops.map((stop) =>
        stop.id === stopId
          ? {
              ...stop,
              positionPercent,
            }
          : stop,
      ),
      stopId,
    );
  }

  function updateGradientStopColor(stopId: string, nextColorHex: string) {
    commitGradientStops(
      gradientStops.map((stop) =>
        stop.id === stopId
          ? {
              ...stop,
              colorHex: normalizeColorDraft(nextColorHex),
            }
          : stop,
      ),
      stopId,
    );
  }

  function addGradientStop(event: MouseEvent<HTMLDivElement>) {
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

    const rawPosition = ((event.clientX - rect.left) / rect.width) * 100;
    const boundedPosition = Math.min(100, Math.max(0, rawPosition));

    if (
      shouldSkipGradientStopCreation({
        positionPercent: boundedPosition,
        stops: gradientStops,
        trackWidthPx: rect.width,
      })
    ) {
      return;
    }

    const positionPercent = findAvailableGradientStopPosition(
      boundedPosition,
      gradientStops,
    );
    const colorHex =
      resolveProgressGradientColorForRemainingPercent(
        positionPercent,
        gradientStops,
      ) ??
      selectedGradientStop?.colorHex ??
      "#146C2E";
    const nextStop: ProgressGradientStop = {
      id: createGradientStopId(gradientStops),
      positionPercent,
      colorHex,
    };

    commitGradientStops([...gradientStops, nextStop], nextStop.id);
  }

  function removeSelectedGradientStop() {
    if (
      !selectedGradientStop ||
      isGradientEndpointStop(selectedGradientStop) ||
      gradientStops.length <= 2
    ) {
      return;
    }

    const selectedIndex = gradientStops.findIndex(
      (stop) => stop.id === selectedGradientStop.id,
    );
    const nextStops = gradientStops.filter(
      (stop) => stop.id !== selectedGradientStop.id,
    );
    const nextSelectedStopId =
      nextStops[Math.max(0, selectedIndex - 1)]?.id ?? nextStops[0]?.id ?? null;

    commitGradientStops(nextStops, nextSelectedStopId);
  }

  function handleGradientStopKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    stop: ProgressGradientStop,
  ) {
    if (isGradientEndpointStop(stop)) {
      return;
    }

    const smallStep = event.shiftKey ? 5 : 1;

    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      updateGradientStopPosition(stop.id, stop.positionPercent - smallStep);
      return;
    }

    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      updateGradientStopPosition(stop.id, stop.positionPercent + smallStep);
      return;
    }

    if (event.key === "PageDown") {
      event.preventDefault();
      updateGradientStopPosition(stop.id, stop.positionPercent - 5);
      return;
    }

    if (event.key === "PageUp") {
      event.preventDefault();
      updateGradientStopPosition(stop.id, stop.positionPercent + 5);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      updateGradientStopPosition(stop.id, 0.01);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      updateGradientStopPosition(stop.id, 99.99);
    }
  }

  return (
    <section
      className="progress-appearance-preferences"
      data-progress-appearance-preferences=""
    >
      <div className="progress-appearance-preferences__header">
        <div>
          <p className="section-label">{copy.sectionLabel}</p>
          <div className="section-title-with-info">
            <h3 className="section-title progress-appearance-preferences__title">
              {copy.title}
            </h3>
            <MaterialInfoTooltip>{copy.detail}</MaterialInfoTooltip>
          </div>
        </div>
      </div>

      <div className="progress-appearance-preferences__body">
        <div className="progress-appearance-card progress-appearance-thickness">
          <div className="field-label-with-info">
            <label
              className="form-field__label progress-appearance-card__title"
              htmlFor="progress-thickness-input"
            >
              {copy.thickness.label}
            </label>
            <MaterialInfoTooltip>{copy.thickness.help}</MaterialInfoTooltip>
          </div>
          <div className="progress-appearance-thickness__control">
            <input
              id="progress-thickness-input"
              className="form-field__control progress-appearance-thickness__number"
              type="number"
              min={PROGRESS_THICKNESS_MIN_PX}
              max={PROGRESS_THICKNESS_MAX_PX}
              step="0.01"
              inputMode="decimal"
              value={thicknessDraft}
              onBlur={() => setThicknessDraft(formatThicknessDraft(thicknessPx))}
              onChange={handleThicknessNumberChange}
            />
            <input
              className="progress-appearance-thickness__range"
              type="range"
              min={PROGRESS_THICKNESS_SLIDER_MIN}
              max={PROGRESS_THICKNESS_SLIDER_MAX}
              step="1"
              value={progressThicknessPxToSliderValue(thicknessPx)}
              aria-label={copy.thickness.label}
              aria-valuetext={`${thicknessPx} ${copy.thickness.unit}`}
              onChange={handleThicknessRangeChange}
            />
            <span className="meta-chip">{copy.thickness.unit}</span>
          </div>
        </div>

        <div className="progress-appearance-card progress-appearance-bands">
          <div className="progress-appearance-bands__header">
            <div className="section-title-with-info">
              <p className="progress-appearance-card__title">
                {copy.colorBands.label}
              </p>
              <MaterialInfoTooltip>{copy.colorBands.detail}</MaterialInfoTooltip>
            </div>
            <div className="progress-appearance-bands__header-actions">
              <span
                className="progress-appearance-mode-switch"
                role="group"
                aria-label={copy.mode.label}
              >
                <button
                  className="progress-appearance-mode-switch__button"
                  type="button"
                  aria-pressed={activeColorMode === "traditional"}
                  data-selected={
                    activeColorMode === "traditional" ? "true" : "false"
                  }
                  onClick={() => switchColorMode("traditional")}
                >
                  {copy.mode.traditional}
                </button>
                <button
                  className="progress-appearance-mode-switch__button"
                  type="button"
                  aria-pressed={activeColorMode === "gradient"}
                  data-selected={activeColorMode === "gradient" ? "true" : "false"}
                  onClick={() => switchColorMode("gradient")}
                >
                  {copy.mode.gradient}
                </button>
              </span>
              {activeColorMode === "traditional" ? (
                <>
                  <button className="text-button" type="button" onClick={addBand}>
                    {copy.colorBands.addBand}
                  </button>
                  <button
                    className="text-button"
                    type="button"
                    onClick={() =>
                      onColorBandsChange(createDefaultProgressColorBands())
                    }
                  >
                    {copy.colorBands.resetToDefault}
                  </button>
                </>
              ) : (
                <button
                  className="text-button"
                  type="button"
                  onClick={resetGradientStops}
                >
                  {copy.gradient.resetToDefault}
                </button>
              )}
            </div>
          </div>

          {activeColorMode === "traditional" ? (
            <>
              <ol className="progress-appearance-band-list">
                {draftBands.map((band, index) => {
              const colorInputValue = isValidColorInput(band.colorHex)
                ? band.colorHex
                : "#000000";
              const isFirst = index === 0;
              const isLast = index === draftBands.length - 1;
              const parsedMinimumPercent = Number(band.minimumPercent);
              const parsedMaximumPercent = Number(band.maximumPercent);
              const hasValidRangeDraft =
                band.minimumPercent.trim().length > 0 &&
                band.maximumPercent.trim().length > 0 &&
                Number.isFinite(parsedMinimumPercent) &&
                Number.isFinite(parsedMaximumPercent);
              const rangeLabel = hasValidRangeDraft
                ? copy.colorBands.rangeLabel(
                    parsedMinimumPercent,
                    parsedMaximumPercent,
                  )
                : copy.colorBands.validationError;

                  return (
                    <li
                      key={band.id}
                      className="progress-appearance-band"
                      data-progress-color-band={band.id}
                    >
                      <div className="progress-appearance-band__fields">
                        <label className="form-field">
                          <span className="form-field__label">
                            {copy.colorBands.fromLabel}
                          </span>
                          <input
                            className="form-field__control"
                            type="number"
                            min={0}
                            max={100}
                            value={band.minimumPercent}
                            onChange={(event) =>
                              updateDraftBand(band.id, {
                                minimumPercent: event.target.value,
                              })
                            }
                          />
                        </label>
                        <label className="form-field">
                          <span className="form-field__label">
                            {copy.colorBands.toLabel}
                          </span>
                          <input
                            className="form-field__control"
                            type="number"
                            min={0}
                            max={100}
                            value={band.maximumPercent}
                            onChange={(event) =>
                              updateDraftBand(band.id, {
                                maximumPercent: event.target.value,
                              })
                            }
                          />
                        </label>
                        <ColorChoiceDropdown
                          label={copy.colorBands.colorLabel}
                          valueHex={colorInputValue}
                          fieldIdPrefix={`progress-color-band-${band.id}`}
                          menuDensity="compact"
                          sessionPopoverId={`progress-color-band:${band.id}:color`}
                          activePopover={activePopover}
                          onActivePopoverChange={onActivePopoverChange}
                          copy={colorChoiceCopy}
                          sections={[
                            {
                              id: "recommended-colors",
                              label: colorChoiceCopy.recommendedColorsLabel,
                              choices: RECOMMENDED_COLOR_CHOICES.map(
                                (choice) => ({
                                  id: choice.id,
                                  hex: choice.hex,
                                  label: colorChoiceCopy.colorNames[choice.id],
                                }),
                              ),
                            },
                          ]}
                          onChange={(nextColorHex) =>
                            updateDraftBand(band.id, {
                              colorHex: normalizeColorDraft(nextColorHex),
                            })
                          }
                        />
                      </div>
                      <span className="meta-chip progress-appearance-band__range">
                        {rangeLabel}
                      </span>
                      <span className="progress-appearance-band__actions">
                        <button
                          className="text-button progress-appearance-band__action"
                          type="button"
                          disabled={isFirst}
                          onClick={() => moveBand(band.id, "up")}
                        >
                          {copy.colorBands.moveUp}
                        </button>
                        <button
                          className="text-button progress-appearance-band__action"
                          type="button"
                          disabled={isLast}
                          onClick={() => moveBand(band.id, "down")}
                        >
                          {copy.colorBands.moveDown}
                        </button>
                        <button
                          className="text-button progress-appearance-band__action"
                          type="button"
                          disabled={draftBands.length <= 1}
                          onClick={() => removeBand(band.id)}
                        >
                          {copy.colorBands.removeBand}
                        </button>
                      </span>
                    </li>
                  );
                })}
              </ol>

              {hasBandError ? (
                <p className="supporting-copy progress-appearance-bands__error">
                  {copy.colorBands.validationError}
                </p>
              ) : null}
            </>
          ) : (
            <div
              className="progress-gradient-editor"
              data-progress-gradient-editor=""
            >
              <div className="section-title-with-info">
                <p className="progress-appearance-card__title">
                  {copy.gradient.label}
                </p>
                <MaterialInfoTooltip>{copy.gradient.detail}</MaterialInfoTooltip>
              </div>
              <ProgressGradientSchemeDropdown
                label={copy.gradient.presetsLabel}
                helperText={copy.gradient.presetsHelp}
                valueLabel={selectedGradientSchemeLabel}
                valueStops={gradientStops}
                options={PROGRESS_GRADIENT_PRESETS.map((preset) => ({
                  id: preset.id,
                  label: copy.gradient.presetNames[preset.id],
                  stops: preset.stops,
                }))}
                imageImportAction={copy.gradient.imageImportAction}
                imageImportBusy={copy.gradient.imageImportBusy}
                imageImportHelp={copy.gradient.imageImportHelp}
                imageImportAccept={PROGRESS_GRADIENT_IMAGE_ACCEPT}
                isImageImporting={isImageImporting}
                sessionPopoverId="progress-gradient-scheme"
                activePopover={activePopover}
                onActivePopoverChange={onActivePopoverChange}
                onSchemeSelect={applyGradientPreset}
                onImageImport={handleGradientImageImport}
              />
              {imageImportError ? (
                <p className="supporting-copy progress-gradient-scheme-dropdown__error">
                  {imageImportError}
                </p>
              ) : null}
              <div
                className="progress-gradient-editor__track"
                role="presentation"
                title={copy.gradient.trackHelp}
              >
                <div
                  className="progress-gradient-editor__rail"
                  style={gradientTrackStyle}
                  onClick={addGradientStop}
                >
                  <div
                    className="progress-gradient-editor__ticks"
                    aria-hidden="true"
                  >
                    {[0, 25, 50, 75, 100].map((tick) => (
                      <span
                        key={tick}
                        className="progress-gradient-editor__tick"
                        style={{ left: `${tick}%` }}
                      />
                    ))}
                  </div>
                  {gradientStops.map((stop, index) => {
                    const isSelected = selectedGradientStop?.id === stop.id;

                    return (
                      <button
                        key={stop.id}
                        className="progress-gradient-editor__stop"
                        type="button"
                        role="slider"
                        aria-label={copy.gradient.stopAriaLabel(
                          index + 1,
                          stop.positionPercent,
                        )}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={stop.positionPercent}
                        aria-valuetext={`${stop.positionPercent}%`}
                        data-progress-gradient-stop-handle=""
                        data-selected={isSelected ? "true" : "false"}
                        data-endpoint={
                          isGradientEndpointStop(stop) ? "true" : "false"
                        }
                        title={copy.gradient.stopHelp}
                        style={{
                          left: `${stop.positionPercent}%`,
                          "--progress-gradient-stop-color": stop.colorHex,
                        } as CSSProperties & {
                          "--progress-gradient-stop-color": string;
                        }}
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedGradientStopId(stop.id);
                        }}
                        onKeyDown={(event) =>
                          handleGradientStopKeyDown(event, stop)
                        }
                      />
                    );
                  })}
                </div>
              </div>

              {selectedGradientStop ? (
                <div className="progress-gradient-editor__selected">
                  <label className="form-field">
                    <span className="form-field__label">
                      {copy.gradient.positionLabel}
                    </span>
                    <input
                      className="form-field__control"
                      type="number"
                      min={0}
                      max={100}
                      step={0.01}
                      inputMode="decimal"
                      value={selectedGradientStop.positionPercent}
                      disabled={isGradientEndpointStop(selectedGradientStop)}
                      aria-describedby={
                        isGradientEndpointStop(selectedGradientStop)
                          ? "progress-gradient-endpoint-help"
                          : undefined
                      }
                      onChange={(event) =>
                        updateGradientStopPosition(
                          selectedGradientStop.id,
                          Number(event.target.value),
                        )
                      }
                    />
                  </label>
                  <ColorChoiceDropdown
                    label={copy.gradient.colorLabel}
                    valueHex={selectedGradientStop.colorHex}
                    fieldIdPrefix={`progress-gradient-stop-${selectedGradientStop.id}`}
                    menuDensity="compact"
                    sessionPopoverId={`progress-gradient-stop:${selectedGradientStop.id}:color`}
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
                      updateGradientStopColor(
                        selectedGradientStop.id,
                        nextColorHex,
                      )
                    }
                  />
                  <button
                    className="text-button progress-gradient-editor__delete"
                    type="button"
                    disabled={
                      gradientStops.length <= 2 ||
                      isGradientEndpointStop(selectedGradientStop)
                    }
                    title={
                      isGradientEndpointStop(selectedGradientStop)
                        ? copy.gradient.endpointLocked
                        : copy.gradient.minimumStopHelp
                    }
                    onClick={removeSelectedGradientStop}
                  >
                    {copy.gradient.deleteStop}
                  </button>
                </div>
              ) : null}
              <p
                id="progress-gradient-endpoint-help"
                className="supporting-copy progress-gradient-editor__help"
              >
                {copy.gradient.endpointLocked}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
