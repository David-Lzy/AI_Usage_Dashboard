import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { normalizeThemeCustomSeedHex } from "../../shared/theme";
import { clampHsvColor, hexToHsv, hsvToHex } from "../color-picker-model";

type MaterialColorPickerProps = {
  label: string;
  valueHex: string;
  onChange: (hex: string) => void;
};

export function MaterialColorPicker({
  label,
  valueHex,
  onChange,
}: MaterialColorPickerProps) {
  const pickerPlaneRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const normalizedValueHex = normalizeThemeCustomSeedHex(valueHex) ?? "#4F46E5";
  const hsv = hexToHsv(normalizedValueHex);

  function changeFromHsv(nextHsv: {
    hue?: number;
    saturation?: number;
    value?: number;
  }) {
    onChange(
      hsvToHex(
        clampHsvColor({
          hue: nextHsv.hue ?? hsv.hue,
          saturation: nextHsv.saturation ?? hsv.saturation,
          value: nextHsv.value ?? hsv.value,
        }),
      ),
    );
  }

  function updateFromPointer(event: ReactPointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const saturation = ((event.clientX - bounds.left) / bounds.width) * 100;
    const value = (1 - (event.clientY - bounds.top) / bounds.height) * 100;

    changeFromHsv({
      saturation,
      value,
    });
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
    updateFromPointer(event);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!isDragging) {
      return;
    }

    updateFromPointer(event);
  }

  function handlePointerEnd(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setIsDragging(false);
  }

  function handlePickerPlaneKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 10 : 2;

    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        changeFromHsv({ saturation: hsv.saturation - step });
        break;
      case "ArrowRight":
        event.preventDefault();
        changeFromHsv({ saturation: hsv.saturation + step });
        break;
      case "ArrowDown":
        event.preventDefault();
        changeFromHsv({ value: hsv.value - step });
        break;
      case "ArrowUp":
        event.preventDefault();
        changeFromHsv({ value: hsv.value + step });
        break;
      default:
        break;
    }
  }

  return (
    <div
      className="color-choice-dropdown__material-picker"
      style={
        {
          "--color-choice-picker-hue": `${Math.round(hsv.hue)}`,
          "--color-choice-picker-color": normalizedValueHex,
        } as CSSProperties
      }
    >
      <div
        ref={pickerPlaneRef}
        className="color-choice-dropdown__picker-plane"
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuetext={normalizedValueHex}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(hsv.value)}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onKeyDown={handlePickerPlaneKeyDown}
      >
        <span
          className="color-choice-dropdown__picker-thumb"
          style={{
            left: `${hsv.saturation}%`,
            top: `${100 - hsv.value}%`,
            backgroundColor: normalizedValueHex,
          }}
        />
      </div>
      <label className="color-choice-dropdown__hue-control">
        <span
          className="color-choice-dropdown__picker-preview-swatch"
          style={{ backgroundColor: normalizedValueHex }}
          aria-hidden="true"
        />
        <span className="sr-only">{label}</span>
        <input
          className="color-choice-dropdown__hue-range"
          type="range"
          min={0}
          max={360}
          value={Math.round(hsv.hue)}
          aria-label={label}
          onChange={(event) =>
            changeFromHsv({
              hue: Number(event.target.value),
            })
          }
        />
      </label>
    </div>
  );
}
