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
  measurementLabels,
  minFallbackPx = DEFAULT_ADAPTIVE_DROPDOWN_MENU_MIN_WIDTH_PX,
}: {
  measurementLabels: readonly string[];
  minFallbackPx?: number;
}) {
  const measurerRef = useRef<HTMLDivElement | null>(null);
  const labelsToMeasure = useMemo(
    () => normalizeMeasurementLabels(measurementLabels),
    [measurementLabels],
  );
  const measurementKey = labelsToMeasure.join("\u0000");
  const fallbackWidth = resolveAdaptiveDropdownMenuMinWidth([], minFallbackPx);
  const [minWidthPx, setMinWidthPx] = useState(fallbackWidth);

  useEffect(() => {
    let cancelled = false;

    function measure() {
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

    measure();

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measure);

    if (measurerRef.current) {
      resizeObserver?.observe(measurerRef.current);
    }

    if (typeof window !== "undefined") {
      window.addEventListener("resize", measure);
    }

    if (typeof document !== "undefined") {
      void document.fonts?.ready.then(() => {
        if (!cancelled) {
          measure();
        }
      });
    }

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();

      if (typeof window !== "undefined") {
        window.removeEventListener("resize", measure);
      }
    };
  }, [fallbackWidth, measurementKey]);

  const style = useMemo<AdaptiveDropdownMenuGridStyle>(
    () => ({
      "--adaptive-dropdown-menu-choice-min": `${minWidthPx}px`,
    }),
    [minWidthPx],
  );

  return {
    labelsToMeasure,
    measurerRef,
    minWidthPx,
    style,
  };
}
