import { useEffect, useState, type ChangeEvent } from "react";

import type { ProgressColorBand } from "../../providers/types";
import type { buildSettingsLocalizedCopy } from "../../shared/localized-copy";
import {
  PROGRESS_THICKNESS_MAX_PX,
  PROGRESS_THICKNESS_MIN_PX,
  areProgressColorBandsValid,
  createDefaultProgressColorBands,
  moveProgressColorBand,
  normalizeProgressColorBands,
  normalizeProgressThicknessPx,
  removeProgressColorBand,
  splitProgressColorBand,
} from "../../shared/progress-appearance";

type ProgressAppearancePreferenceControlsProps = {
  colorBands: ProgressColorBand[];
  copy: ReturnType<typeof buildSettingsLocalizedCopy>["progressAppearance"];
  thicknessPx: number;
  onColorBandsChange: (colorBands: ProgressColorBand[]) => void;
  onThicknessPxChange: (thicknessPx: number) => void;
};

type ProgressColorBandDraft = {
  id: string;
  minimumPercent: string;
  maximumPercent: string;
  colorHex: string;
};

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
  copy,
  thicknessPx,
  onColorBandsChange,
  onThicknessPxChange,
}: ProgressAppearancePreferenceControlsProps) {
  const [draftBands, setDraftBands] = useState(() => toDraftBands(colorBands));
  const [hasBandError, setHasBandError] = useState(false);

  useEffect(() => {
    setDraftBands(toDraftBands(colorBands));
    setHasBandError(false);
  }, [colorBands]);

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

  function handleThicknessChange(event: ChangeEvent<HTMLInputElement>) {
    onThicknessPxChange(normalizeProgressThicknessPx(event.target.value));
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
          <h3 className="section-title progress-appearance-preferences__title">
            {copy.title}
          </h3>
        </div>
        <p className="supporting-copy">{copy.detail}</p>
      </div>

      <div className="progress-appearance-preferences__body">
        <div className="progress-appearance-thickness">
          <label className="form-field" htmlFor="progress-thickness-input">
            <span className="form-field__label">{copy.thickness.label}</span>
            <span className="progress-appearance-thickness__control">
              <input
                id="progress-thickness-input"
                className="form-field__control progress-appearance-thickness__number"
                type="number"
                min={PROGRESS_THICKNESS_MIN_PX}
                max={PROGRESS_THICKNESS_MAX_PX}
                value={thicknessPx}
                onChange={handleThicknessChange}
              />
              <input
                className="progress-appearance-thickness__range"
                type="range"
                min={PROGRESS_THICKNESS_MIN_PX}
                max={PROGRESS_THICKNESS_MAX_PX}
                value={thicknessPx}
                aria-label={copy.thickness.label}
                onChange={handleThicknessChange}
              />
              <span className="meta-chip">{copy.thickness.unit}</span>
            </span>
          </label>
          <p className="supporting-copy progress-appearance-thickness__help">
            {copy.thickness.help}
          </p>
        </div>

        <div className="progress-appearance-bands">
          <div className="progress-appearance-bands__header">
            <div>
              <p className="provider-progress-provider__title">
                {copy.colorBands.label}
              </p>
              <p className="supporting-copy progress-appearance-bands__detail">
                {copy.colorBands.detail}
              </p>
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
                  <span
                    className="progress-appearance-band__swatch"
                    style={{ backgroundColor: colorInputValue }}
                    aria-hidden="true"
                  />
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
                    <label className="form-field">
                      <span className="form-field__label">
                        {copy.colorBands.colorLabel}
                      </span>
                      <span className="progress-appearance-band__color-controls">
                        <input
                          className="progress-appearance-band__native-color"
                          type="color"
                          value={colorInputValue}
                          aria-label={copy.colorBands.colorLabel}
                          onChange={(event) =>
                            updateDraftBand(band.id, {
                              colorHex: normalizeColorDraft(event.target.value),
                            })
                          }
                        />
                        <input
                          className="form-field__control"
                          type="text"
                          value={band.colorHex}
                          inputMode="text"
                          pattern="#[0-9A-Fa-f]{6}"
                          onChange={(event) =>
                            updateDraftBand(band.id, {
                              colorHex: normalizeColorDraft(event.target.value),
                            })
                          }
                        />
                      </span>
                    </label>
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
