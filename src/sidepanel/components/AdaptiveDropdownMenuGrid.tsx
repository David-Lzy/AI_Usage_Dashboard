import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

const DEFAULT_ADAPTIVE_DROPDOWN_MENU_MIN_WIDTH_PX = 92;

type AdaptiveDropdownMenuGridStyle = CSSProperties & {
  "--adaptive-dropdown-menu-column-count": string;
  "--adaptive-dropdown-menu-choice-min": string;
};

export function resolveAdaptiveDropdownMenuColumnCount({
  availableWidthPx,
  columnGapPx = 0,
  itemCount,
  minWidthPx,
}: {
  availableWidthPx: number;
  columnGapPx?: number;
  itemCount: number;
  minWidthPx: number;
}): number | null {
  if (
    itemCount <= 0 ||
    !Number.isFinite(availableWidthPx) ||
    availableWidthPx <= 0 ||
    !Number.isFinite(minWidthPx) ||
    minWidthPx <= 0
  ) {
    return null;
  }

  const resolvedGapPx =
    Number.isFinite(columnGapPx) && columnGapPx > 0 ? columnGapPx : 0;
  const columnCount = Math.floor(
    (availableWidthPx + resolvedGapPx) / (minWidthPx + resolvedGapPx),
  );

  const clampedColumnCount = Math.max(1, Math.min(itemCount, columnCount));
  const rowCount = Math.ceil(itemCount / clampedColumnCount);
  const lastRowCount = itemCount % clampedColumnCount || clampedColumnCount;

  if (rowCount <= 1 || lastRowCount === clampedColumnCount) {
    return clampedColumnCount;
  }

  let balancedColumnCount = clampedColumnCount;

  for (
    let pulledPerFullRow = 1;
    pulledPerFullRow < clampedColumnCount;
    pulledPerFullRow += 1
  ) {
    const candidateColumnCount = clampedColumnCount - pulledPerFullRow;
    const candidateLastRowCount =
      lastRowCount + pulledPerFullRow * (rowCount - 1);

    if (candidateLastRowCount > candidateColumnCount) {
      break;
    }

    balancedColumnCount = candidateColumnCount;
  }

  return balancedColumnCount;
}

export function resolveAdaptiveDropdownMenuChoiceWidth({
  availableWidthPx,
  columnCount,
  columnGapPx = 0,
}: {
  availableWidthPx: number;
  columnCount: number;
  columnGapPx?: number;
}): number | null {
  if (
    columnCount <= 0 ||
    !Number.isFinite(availableWidthPx) ||
    availableWidthPx <= 0
  ) {
    return null;
  }

  const resolvedGapPx =
    Number.isFinite(columnGapPx) && columnGapPx > 0 ? columnGapPx : 0;

  return Math.max(
    1,
    (availableWidthPx - resolvedGapPx * (columnCount - 1)) / columnCount,
  );
}

function normalizeMeasurementLabels(labels: readonly string[]): string[] {
  const normalizedLabels: string[] = [];
  const seenLabels = new Set<string>();

  for (const label of labels) {
    const normalizedLabel = label.trim();

    if (!normalizedLabel || seenLabels.has(normalizedLabel)) {
      continue;
    }

    normalizedLabels.push(normalizedLabel);
    seenLabels.add(normalizedLabel);
  }

  return normalizedLabels;
}

export function resolveAdaptiveDropdownMenuMinWidth(
  measuredWidths: readonly number[],
  minFallbackPx = DEFAULT_ADAPTIVE_DROPDOWN_MENU_MIN_WIDTH_PX,
): number {
  const fallbackWidth = Math.max(1, Math.ceil(minFallbackPx));
  const measuredWidth = Math.max(
    0,
    ...measuredWidths
      .filter((width) => Number.isFinite(width))
      .map((width) => Math.ceil(width)),
  );

  return Math.max(fallbackWidth, measuredWidth);
}

export function useAdaptiveDropdownMenuGrid({
  itemCount,
  layoutSignal,
  measurementLabels,
  minFallbackPx = DEFAULT_ADAPTIVE_DROPDOWN_MENU_MIN_WIDTH_PX,
}: {
  itemCount?: number;
  layoutSignal?: unknown;
  measurementLabels: readonly string[];
  minFallbackPx?: number;
}) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const measurerRef = useRef<HTMLDivElement | null>(null);
  const labelsToMeasure = useMemo(
    () => normalizeMeasurementLabels(measurementLabels),
    [measurementLabels],
  );
  const measurementKey = labelsToMeasure.join("\u0000");
  const fallbackWidth = resolveAdaptiveDropdownMenuMinWidth([], minFallbackPx);
  const [columnCount, setColumnCount] = useState(1);
  const [minWidthPx, setMinWidthPx] = useState(fallbackWidth);

  useEffect(() => {
    let cancelled = false;
    let animationFrameId: number | null = null;

    function updateMinWidth(nextMinWidth: number) {
      if (cancelled) {
        return;
      }

      setMinWidthPx((currentMinWidth) =>
        currentMinWidth === nextMinWidth ? currentMinWidth : nextMinWidth,
      );
    }

    function measureTextNow() {
      const measurer = measurerRef.current;

      if (!measurer) {
        updateMinWidth(fallbackWidth);
        return;
      }

      const measurementNodes = Array.from(
        measurer.querySelectorAll<HTMLElement>(
          "[data-adaptive-dropdown-menu-measure-choice]",
        ),
      );
      const measuredWidths = measurementNodes.map((node) => {
        const rectWidth = node.getBoundingClientRect().width;

        return Math.max(rectWidth, node.scrollWidth, node.offsetWidth);
      });
      const nextMinWidth = resolveAdaptiveDropdownMenuMinWidth(
        measuredWidths,
        fallbackWidth,
      );

      updateMinWidth(nextMinWidth);
    }

    function scheduleMeasureText() {
      if (cancelled) {
        return;
      }

      if (
        typeof window === "undefined" ||
        typeof window.requestAnimationFrame !== "function"
      ) {
        measureTextNow();
        return;
      }

      if (animationFrameId !== null) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(() => {
        animationFrameId = null;
        measureTextNow();
      });
    }

    measureTextNow();

    if (typeof window !== "undefined") {
      window.addEventListener("resize", scheduleMeasureText);
    }

    if (typeof document !== "undefined") {
      void document.fonts?.ready.then(() => {
        scheduleMeasureText();
      });
    }

    function handleVisibilityChange() {
      if (document.visibilityState !== "hidden") {
        scheduleMeasureText();
      }
    }

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    return () => {
      cancelled = true;

      if (
        animationFrameId !== null &&
        typeof window !== "undefined" &&
        typeof window.cancelAnimationFrame === "function"
      ) {
        window.cancelAnimationFrame(animationFrameId);
      }

      if (typeof window !== "undefined") {
        window.removeEventListener("resize", scheduleMeasureText);
      }

      if (typeof document !== "undefined") {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange,
        );
      }
    };
  }, [fallbackWidth, layoutSignal, measurementKey]);

  useEffect(() => {
    let cancelled = false;
    let animationFrameId: number | null = null;

    function updateGridMeasurements({
      nextColumnCount,
    }: {
      nextColumnCount: number;
    }) {
      if (cancelled) {
        return;
      }

      setColumnCount((currentColumnCount) =>
        currentColumnCount === nextColumnCount
          ? currentColumnCount
          : nextColumnCount,
      );
    }

    function measureGridNow() {
      const grid = gridRef.current;

      if (!grid) {
        updateGridMeasurements({
          nextColumnCount: 1,
        });
        return;
      }

      if (typeof window === "undefined") {
        updateGridMeasurements({
          nextColumnCount: 1,
        });
        return;
      }

      const computedStyle = window.getComputedStyle(grid);
      const columnGapPx = Number.parseFloat(computedStyle.columnGap) || 0;
      const resolvedItemCount =
        typeof itemCount === "number" && Number.isFinite(itemCount)
          ? itemCount
          : measurementLabels.length;
      const nextColumnCount = resolveAdaptiveDropdownMenuColumnCount({
        availableWidthPx: grid.clientWidth,
        columnGapPx,
        itemCount: resolvedItemCount,
        minWidthPx,
      });

      if (!nextColumnCount) {
        updateGridMeasurements({
          nextColumnCount: 1,
        });
        return;
      }

      updateGridMeasurements({
        nextColumnCount,
      });
    }

    function scheduleMeasureGrid() {
      if (cancelled) {
        return;
      }

      if (
        typeof window === "undefined" ||
        typeof window.requestAnimationFrame !== "function"
      ) {
        measureGridNow();
        return;
      }

      if (animationFrameId !== null) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(() => {
        animationFrameId = null;
        measureGridNow();
      });
    }

    measureGridNow();

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(scheduleMeasureGrid);

    if (gridRef.current) {
      resizeObserver?.observe(gridRef.current);
    }

    if (typeof window !== "undefined") {
      window.addEventListener("resize", scheduleMeasureGrid);
    }

    return () => {
      cancelled = true;

      if (
        animationFrameId !== null &&
        typeof window !== "undefined" &&
        typeof window.cancelAnimationFrame === "function"
      ) {
        window.cancelAnimationFrame(animationFrameId);
      }

      resizeObserver?.disconnect();

      if (typeof window !== "undefined") {
        window.removeEventListener("resize", scheduleMeasureGrid);
      }
    };
  }, [itemCount, layoutSignal, measurementLabels.length, minWidthPx]);

  const style = useMemo<AdaptiveDropdownMenuGridStyle>(
    () => ({
      "--adaptive-dropdown-menu-column-count": `${columnCount}`,
      "--adaptive-dropdown-menu-choice-min": `${minWidthPx}px`,
    }),
    [columnCount, minWidthPx],
  );

  return {
    gridRef,
    labelsToMeasure,
    measurerRef,
    columnCount,
    minWidthPx,
    style,
  };
}
