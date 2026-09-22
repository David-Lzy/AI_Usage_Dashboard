import { useEffect, useState } from "react";

import type { ProgressColorBand } from "../../providers/types";
import { RECOMMENDED_COLOR_CHOICES } from "../../shared/color-choices";
import type { buildSettingsLocalizedCopy } from "../../shared/settings-localized-copy";
import type { SettingsActivePopoverSessionState } from "../../shared/surface-session-state";
import {
  areProgressColorBandsValid,
  moveProgressColorBand,
  normalizeProgressColorBands,
  removeProgressColorBand,
} from "../../shared/progress-appearance";
import { ColorChoiceDropdown } from "./ColorChoiceDropdown";
import {
  isValidColorInput,
  normalizeColorDraft,
  parseDraftBands,
  toDraftBands,
  type ProgressColorBandDraft,
} from "./progress-appearance-editor-helpers";

type ProgressColorBandEditorProps = {
  active: boolean;
  colorBands: ProgressColorBand[];
  colorChoiceCopy: ReturnType<typeof buildSettingsLocalizedCopy>["colorChoices"];
  copy: ReturnType<typeof buildSettingsLocalizedCopy>["progressAppearance"]["colorBands"];
  activePopover?: SettingsActivePopoverSessionState | null;
  onActivePopoverChange?: (
    nextPopover: SettingsActivePopoverSessionState | null,
  ) => void;
  onColorBandsChange: (colorBands: ProgressColorBand[]) => void;
};

export function ProgressColorBandEditor({
  active,
  colorBands,
  colorChoiceCopy,
  copy,
  activePopover,
  onActivePopoverChange,
  onColorBandsChange,
}: ProgressColorBandEditorProps) {
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
        band.id === bandId ? { ...band, ...nextValues } : band,
      ),
    );
  }

  if (!active) {
    return null;
  }

  return (
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
            ? copy.rangeLabel(parsedMinimumPercent, parsedMaximumPercent)
            : copy.validationError;

          return (
            <li
              key={band.id}
              className="progress-appearance-band"
              data-progress-color-band={band.id}
            >
              <div className="progress-appearance-band__fields">
                <label className="form-field">
                  <span className="form-field__label">{copy.fromLabel}</span>
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
                  <span className="form-field__label">{copy.toLabel}</span>
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
                  label={copy.colorLabel}
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
              <span
                className="meta-chip progress-appearance-band__range"
                data-invalid={hasValidRangeDraft ? "false" : "true"}
              >
                {rangeLabel}
              </span>
              <span className="progress-appearance-band__actions">
                <button
                  className="text-button progress-appearance-band__action"
                  type="button"
                  disabled={isFirst}
                  onClick={() =>
                    onColorBandsChange(moveProgressColorBand(colorBands, band.id, "up"))
                  }
                >
                  {copy.moveUp}
                </button>
                <button
                  className="text-button progress-appearance-band__action"
                  type="button"
                  disabled={isLast}
                  onClick={() =>
                    onColorBandsChange(
                      moveProgressColorBand(colorBands, band.id, "down"),
                    )
                  }
                >
                  {copy.moveDown}
                </button>
                <button
                  className="text-button progress-appearance-band__action"
                  type="button"
                  disabled={draftBands.length <= 1}
                  onClick={() =>
                    onColorBandsChange(removeProgressColorBand(colorBands, band.id))
                  }
                >
                  {copy.removeBand}
                </button>
              </span>
            </li>
          );
        })}
      </ol>

      {hasBandError ? (
        <p className="supporting-copy progress-appearance-bands__error">
          {copy.validationError}
        </p>
      ) : null}
    </>
  );
}
