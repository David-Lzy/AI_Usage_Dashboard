import { useEffect, useMemo, useState, type ChangeEvent } from "react";

import type {
  ProgressColorAppearance,
  ProgressColorBand,
  ProgressGradientStop,
} from "../../providers/types";
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
  createDefaultProgressColorBands,
  createDefaultProgressGradientStops,
  createProgressGradientPresetStops,
  findProgressGradientPresetIdForStops,
  normalizeProgressColorAppearance,
  normalizeProgressGradientStops,
  normalizeProgressColorBands,
  progressThicknessPxToSliderValue,
  progressThicknessSliderValueToPx,
  splitProgressColorBand,
} from "../../shared/progress-appearance";
import { MaterialInfoTooltip } from "./MaterialInfoTooltip";
import { ProgressColorBandEditor } from "./ProgressColorBandEditor";
import { ProgressGradientSchemeDropdown } from "./ProgressGradientSchemeDropdown";
import { ProgressGradientStopEditor } from "./ProgressGradientStopEditor";
import {
  formatThicknessDraft,
  hasValidThicknessDraftShape,
  parseCompleteThicknessDraft,
} from "./progress-appearance-editor-helpers";

type ProgressAppearancePreferenceControlsProps = {
  colorAppearance: ProgressColorAppearance;
  colorBands: ProgressColorBand[];
  colorChoiceCopy: ReturnType<typeof buildSettingsLocalizedCopy>["colorChoices"];
  copy: ReturnType<typeof buildSettingsLocalizedCopy>["progressAppearance"];
  thicknessPx: number;
  activePopover?: SettingsActivePopoverSessionState | null;
  onActivePopoverChange?: (nextPopover: SettingsActivePopoverSessionState | null) => void;
  onColorAppearanceChange: (colorAppearance: ProgressColorAppearance) => void;
  onColorBandsChange: (colorBands: ProgressColorBand[]) => void;
  onThicknessPxChange: (thicknessPx: number) => void;
};

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
  const [thicknessDraft, setThicknessDraft] = useState(() => formatThicknessDraft(thicknessPx));
  const [imageImportError, setImageImportError] = useState<string | null>(null);
  const [isImageImporting, setIsImageImporting] = useState(false);
  const [gradientSchemeSource, setGradientSchemeSource] = useState<"image" | null>(null);
  const [selectedGradientStopId, setSelectedGradientStopId] = useState<
    string | null
  >(null);
  const normalizedColorAppearance = useMemo(
    () => normalizeProgressColorAppearance(colorAppearance, colorBands),
    [colorAppearance, colorBands],
  );
  const activeColorMode = normalizedColorAppearance.mode;
  const gradientStops = normalizedColorAppearance.mode === "gradient"
    ? normalizedColorAppearance.stops
    : createDefaultProgressGradientStops();
  const matchedGradientPresetId = activeColorMode === "gradient"
    ? findProgressGradientPresetIdForStops(gradientStops)
    : null;
  const selectedGradientSchemeLabel = matchedGradientPresetId
    ? copy.gradient.presetNames[matchedGradientPresetId]
    : gradientSchemeSource === "image"
      ? copy.gradient.imageGeneratedSchemeLabel
      : copy.gradient.presetNames.warning;

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

    onColorAppearanceChange({ mode: "gradient", stops: normalizedStops });
    setSelectedGradientStopId(
      normalizedStops.some((stop) => stop.id === nextSelectedStopId)
        ? nextSelectedStopId
        : (normalizedStops[0]?.id ?? null),
    );
    setGradientSchemeSource(nextGradientSchemeSource);
  }

  function switchColorMode(nextMode: ProgressColorAppearance["mode"]) {
    if (nextMode === activeColorMode) return;
    if (nextMode === "traditional") {
      onColorAppearanceChange({ mode: "traditional", bands: normalizeProgressColorBands(colorBands) });
      return;
    }
    const stops = normalizedColorAppearance.mode === "gradient"
      ? normalizedColorAppearance.stops
      : createDefaultProgressGradientStops();
    setGradientSchemeSource(null);
    setSelectedGradientStopId(stops[0]?.id ?? null);
    onColorAppearanceChange({ mode: "gradient", stops });
  }

  function handleThicknessNumberChange(event: ChangeEvent<HTMLInputElement>) {
    const nextDraft = event.target.value;
    if (!hasValidThicknessDraftShape(nextDraft)) return;
    setThicknessDraft(nextDraft);
    const parsedThickness = parseCompleteThicknessDraft(nextDraft);
    if (parsedThickness !== null) onThicknessPxChange(parsedThickness);
  }

  function applyGradientPreset(presetId: (typeof PROGRESS_GRADIENT_PRESETS)[number]["id"]) {
    const presetStops = createProgressGradientPresetStops(presetId);
    if (!presetStops) return;
    commitGradientStops(presetStops, presetStops[0]?.id ?? null);
    setImageImportError(null);
  }

  function getImageImportErrorMessage(error: unknown): string {
    if (error instanceof ProgressGradientImageImportError) {
      switch (error.code) {
        case "unsupported_type": return copy.gradient.imageImportUnsupported;
        case "file_too_large": return copy.gradient.imageImportTooLarge;
        case "canvas_unavailable": return copy.gradient.imageImportCanvasUnavailable;
        case "decode_failed": default: return copy.gradient.imageImportDecodeFailed;
      }
    }
    return copy.gradient.imageImportDecodeFailed;
  }

  async function handleGradientImageImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!file) return;
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

  function handleThicknessRangeChange(event: ChangeEvent<HTMLInputElement>) {
    onThicknessPxChange(progressThicknessSliderValueToPx(event.target.value));
  }

  function addBand() {
    onColorBandsChange(splitProgressColorBand(colorBands));
  }

  function resetGradientStops() {
    const defaultStops = createDefaultProgressGradientStops();
    commitGradientStops(defaultStops, defaultStops[0]?.id ?? null);
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
            <div className="section-title-with-info progress-appearance-bands__title">
              <p className="progress-appearance-card__title">
                {copy.colorBands.label}
              </p>
              <MaterialInfoTooltip>{copy.colorBands.detail}</MaterialInfoTooltip>
            </div>
            {activeColorMode === "gradient" ? (
              <>
                <div className="section-title-with-info progress-gradient-editor__summary">
                  <p className="progress-appearance-card__title">
                    {copy.gradient.label}
                  </p>
                  <MaterialInfoTooltip>{copy.gradient.detail}</MaterialInfoTooltip>
                </div>
                <div className="progress-gradient-editor__scheme">
                  <ProgressGradientSchemeDropdown
                    label={copy.gradient.presetsLabel}
                    helperText={copy.gradient.presetsHelp}
                    layout="inline"
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
                </div>
              </>
            ) : null}
            <div className="progress-appearance-bands__header-actions">
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
          </div>

          <ProgressColorBandEditor
            active={activeColorMode === "traditional"}
            colorBands={colorBands}
            colorChoiceCopy={colorChoiceCopy}
            copy={copy.colorBands}
            activePopover={activePopover}
            onActivePopoverChange={onActivePopoverChange}
            onColorBandsChange={onColorBandsChange}
          />
          <ProgressGradientStopEditor
            active={activeColorMode === "gradient"}
            stops={gradientStops}
            selectedStopId={selectedGradientStopId}
            errorMessage={imageImportError}
            colorChoiceCopy={colorChoiceCopy}
            copy={copy.gradient}
            activePopover={activePopover}
            onActivePopoverChange={onActivePopoverChange}
            onStopsChange={commitGradientStops}
            onSelectedStopChange={setSelectedGradientStopId}
          />
        </div>
      </div>
    </section>
  );
}

export {
  PROGRESS_GRADIENT_STOP_CREATION_MIN_DISTANCE_PERCENT,
  PROGRESS_GRADIENT_STOP_CREATION_MIN_DISTANCE_PX,
  resolveGradientStopDragPosition,
  shouldSkipGradientStopCreation,
} from "./progress-appearance-editor-helpers";
