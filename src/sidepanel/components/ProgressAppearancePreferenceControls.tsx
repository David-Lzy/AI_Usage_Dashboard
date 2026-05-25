import { useEffect, useState, type ChangeEvent } from "react";

import type { ProgressColorBand } from "../../providers/types";
import { RECOMMENDED_COLOR_CHOICES } from "../../shared/color-choices";
import type { buildSettingsLocalizedCopy } from "../../shared/settings-localized-copy";
import type { SettingsActivePopoverSessionState } from "../../shared/surface-session-state";
import {
  PROGRESS_THICKNESS_MAX_PX,
  PROGRESS_THICKNESS_MIN_PX,
  PROGRESS_THICKNESS_SLIDER_MAX,
  PROGRESS_THICKNESS_SLIDER_MIN,
  areProgressColorBandsValid,
  createDefaultProgressColorBands,
  moveProgressColorBand,
  normalizeProgressColorBands,
  normalizeProgressThicknessPx,
  progressThicknessPxToSliderValue,
  progressThicknessSliderValueToPx,
  removeProgressColorBand,
  splitProgressColorBand,
} from "../../shared/progress-appearance";
import { ColorChoiceDropdown } from "./ColorChoiceDropdown";
import { MaterialInfoTooltip } from "./MaterialInfoTooltip";

type ProgressAppearancePreferenceControlsProps = {
  colorBands: ProgressColorBand[];
  colorChoiceCopy: ReturnType<typeof buildSettingsLocalizedCopy>["colorChoices"];
  copy: ReturnType<typeof buildSettingsLocalizedCopy>["progressAppearance"];
  thicknessPx: number;
  activePopover?: SettingsActivePopoverSessionState | null;
  onActivePopoverChange?: (
    nextPopover: SettingsActivePopoverSessionState | null,
  ) => void;
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

export function ProgressAppearancePreferenceControls({
  colorBands,
  colorChoiceCopy,
  copy,
  thicknessPx,
  activePopover,
  onActivePopoverChange,
  onColorBandsChange,
  onThicknessPxChange,
}: ProgressAppearancePreferenceControlsProps) {
  const [draftBands, setDraftBands] = useState(() => toDraftBands(colorBands));
  const [thicknessDraft, setThicknessDraft] = useState(() =>
    formatThicknessDraft(thicknessPx),
  );
  const [hasBandError, setHasBandError] = useState(false);

  useEffect(() => {
    setDraftBands(toDraftBands(colorBands));
    setHasBandError(false);
  }, [colorBands]);

  useEffect(() => {
    setThicknessDraft(formatThicknessDraft(thicknessPx));
  }, [thicknessPx]);

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
              <button className="text-button" type="button" onClick={addBand}>
                {copy.colorBands.addBand}
              </button>
              <button
                className="text-button"
                type="button"
                onClick={() => onColorBandsChange(createDefaultProgressColorBands())}
              >
                {copy.colorBands.resetToDefault}
              </button>
            </div>
          </div>

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
                          choices: RECOMMENDED_COLOR_CHOICES.map((choice) => ({
                            id: choice.id,
                            hex: choice.hex,
                            label: colorChoiceCopy.colorNames[choice.id],
                          })),
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
        </div>
      </div>
    </section>
  );
}
