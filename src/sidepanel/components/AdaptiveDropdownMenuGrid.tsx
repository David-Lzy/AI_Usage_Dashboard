import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

const DEFAULT_ADAPTIVE_DROPDOWN_MENU_MIN_WIDTH_PX = 92;

type AdaptiveDropdownMenuGridStyle = CSSProperties & {
  "--adaptive-dropdown-menu-choice-min": string;
  "--adaptive-dropdown-menu-choice-width": string;
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

  return Math.max(1, Math.min(itemCount, columnCount));
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
  const [minWidthPx, setMinWidthPx] = useState(fallbackWidth);
  const [choiceWidthPx, setChoiceWidthPx] = useState(fallbackWidth);

  useEffect(() => {
    let cancelled = false;

    function measureText() {
      const measurer = measurerRef.current;

      if (!measurer) {
        setMinWidthPx(fallbackWidth);
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

      if (!cancelled) {
        setMinWidthPx(nextMinWidth);
      }
    }

    measureText();

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measureText);

    if (measurerRef.current) {
      resizeObserver?.observe(measurerRef.current);
    }

    if (typeof window !== "undefined") {
      window.addEventListener("resize", measureText);
    }

    if (typeof document !== "undefined") {
      void document.fonts?.ready.then(() => {
        if (!cancelled) {
          measureText();
        }
      });
    }

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();

      if (typeof window !== "undefined") {
        window.removeEventListener("resize", measureText);
      }
    };
  }, [fallbackWidth, layoutSignal, measurementKey]);

  useEffect(() => {
    let cancelled = false;

    function measureGrid() {
      const grid = gridRef.current;

      if (!grid) {
        setChoiceWidthPx(minWidthPx);
        return;
      }

      if (typeof window === "undefined") {
        setChoiceWidthPx(minWidthPx);
        return;
      }

      const computedStyle = window.getComputedStyle(grid);
      const columnGapPx = Number.parseFloat(computedStyle.columnGap) || 0;
      const resolvedItemCount =
        typeof itemCount === "number" && Number.isFinite(itemCount)
          ? itemCount
          : measurementLabels.length;
      const columnCount = resolveAdaptiveDropdownMenuColumnCount({
        availableWidthPx: grid.clientWidth,
        columnGapPx,
        itemCount: resolvedItemCount,
        minWidthPx,
      });

      if (!columnCount) {
        setChoiceWidthPx(minWidthPx);
        return;
      }

      const nextChoiceWidth = resolveAdaptiveDropdownMenuChoiceWidth({
        availableWidthPx: grid.clientWidth,
        columnCount,
        columnGapPx,
      });

      if (!cancelled) {
        setChoiceWidthPx(Math.max(minWidthPx, nextChoiceWidth ?? minWidthPx));
      }
    }

    measureGrid();

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measureGrid);

    if (gridRef.current) {
      resizeObserver?.observe(gridRef.current);
    }

    if (typeof window !== "undefined") {
      window.addEventListener("resize", measureGrid);
    }

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();

      if (typeof window !== "undefined") {
        window.removeEventListener("resize", measureGrid);
      }
    };
  }, [itemCount, layoutSignal, measurementLabels.length, minWidthPx]);

  const style = useMemo<AdaptiveDropdownMenuGridStyle>(
    () => ({
      "--adaptive-dropdown-menu-choice-min": `${minWidthPx}px`,
      "--adaptive-dropdown-menu-choice-width": `${choiceWidthPx}px`,
    }),
    [choiceWidthPx, minWidthPx],
  );

  return {
    gridRef,
    labelsToMeasure,
    measurerRef,
    choiceWidthPx,
    minWidthPx,
    style,
  };
}
