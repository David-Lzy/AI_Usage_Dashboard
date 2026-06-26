export type FloatingMenuPlacement = "above" | "below";

export type FloatingMenuAnchorRect = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
};

export type FloatingMenuViewport = {
  width: number;
  height: number;
};

export type FloatingMenuPosition = {
  left: number;
  top: number;
  width: number;
  maxHeight: number;
  placement: FloatingMenuPlacement;
};

type FloatingMenuPositionOptions = {
  align?: "start" | "end";
  margin?: number;
  minHeight?: number;
  preferredMaxHeight?: number;
  preferredWidth?: number;
  spacing?: number;
};

const DEFAULT_MARGIN_PX = 16;
const DEFAULT_MIN_HEIGHT_PX = 160;
const DEFAULT_MAX_HEIGHT_PX = 360;
const DEFAULT_SPACING_PX = 6;
const FLOATING_MENU_POSITION_EPSILON_PX = 0.5;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function arePixelValuesClose(left: number, right: number): boolean {
  return Math.abs(left - right) <= FLOATING_MENU_POSITION_EPSILON_PX;
}

export function areFloatingMenuPositionsEqual(
  left: FloatingMenuPosition | null,
  right: FloatingMenuPosition | null,
): boolean {
  if (left === right) {
    return true;
  }

  if (!left || !right || left.placement !== right.placement) {
    return false;
  }

  return (
    arePixelValuesClose(left.left, right.left) &&
    arePixelValuesClose(left.top, right.top) &&
    arePixelValuesClose(left.width, right.width) &&
    arePixelValuesClose(left.maxHeight, right.maxHeight)
  );
}

export function resolveFloatingMenuPosition(
  anchorRect: FloatingMenuAnchorRect,
  viewport: FloatingMenuViewport,
  options: FloatingMenuPositionOptions = {},
): FloatingMenuPosition {
  const margin = options.margin ?? DEFAULT_MARGIN_PX;
  const spacing = options.spacing ?? DEFAULT_SPACING_PX;
  const preferredMaxHeight =
    options.preferredMaxHeight ?? DEFAULT_MAX_HEIGHT_PX;
  const minHeight = options.minHeight ?? DEFAULT_MIN_HEIGHT_PX;
  const maxViewportWidth = Math.max(0, viewport.width - margin * 2);
  const targetWidth = Math.max(
    anchorRect.width,
    options.preferredWidth ?? anchorRect.width,
  );
  const width = Math.min(targetWidth, maxViewportWidth);
  const leftBeforeClamp =
    options.align === "end" ? anchorRect.right - width : anchorRect.left;
  const maxLeft = Math.max(margin, viewport.width - width - margin);
  const left = clamp(leftBeforeClamp, margin, maxLeft);

  const availableBelow =
    viewport.height - anchorRect.bottom - spacing - margin;
  const availableAbove = anchorRect.top - spacing - margin;
  const placement: FloatingMenuPlacement =
    availableBelow >= Math.min(minHeight, preferredMaxHeight) ||
    availableBelow >= availableAbove
      ? "below"
      : "above";
  const availableForPlacement =
    placement === "below" ? availableBelow : availableAbove;
  const maxPossibleHeight = Math.max(0, viewport.height - margin * 2);
  const maxHeight = Math.min(
    preferredMaxHeight,
    Math.max(minHeight, availableForPlacement),
    maxPossibleHeight,
  );
  const topBeforeClamp =
    placement === "below"
      ? anchorRect.bottom + spacing
      : anchorRect.top - spacing - maxHeight;
  const maxTop = Math.max(margin, viewport.height - maxHeight - margin);
  const top = clamp(topBeforeClamp, margin, maxTop);

  return {
    left,
    top,
    width,
    maxHeight,
    placement,
  };
}
