import {
  Children,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

const DEFAULT_ADAPTIVE_CONTROL_MIN_WIDTH_PX = 168;

type AdaptiveControlGridStyle = CSSProperties & {
  "--adaptive-control-min": string;
  "--adaptive-control-columns"?: string;
};

type UseAdaptiveControlMinWidthOptions = {
  measurementLabels: readonly string[];
  measurementCapLabel?: string;
  minFallbackPx?: number;
};

type AdaptiveControlGridProps = UseAdaptiveControlMinWidthOptions & {
  className?: string;
  children: ReactNode;
};

export function getAdaptiveControlMeasurementLabels({
  measurementLabels,
  measurementCapLabel,
}: Pick<
  UseAdaptiveControlMinWidthOptions,
  "measurementLabels" | "measurementCapLabel"
>): string[] {
  const sourceLabels = measurementCapLabel
    ? [measurementCapLabel]
    : measurementLabels;
  const labels: string[] = [];
  const seenLabels = new Set<string>();

  for (const label of sourceLabels) {
    const normalizedLabel = label.trim();

    if (!normalizedLabel || seenLabels.has(normalizedLabel)) {
      continue;
    }

    labels.push(normalizedLabel);
    seenLabels.add(normalizedLabel);
  }

  return labels;
}

export function resolveAdaptiveControlMinWidth(
  measuredWidths: readonly number[],
  minFallbackPx = DEFAULT_ADAPTIVE_CONTROL_MIN_WIDTH_PX,
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

export function resolveAdaptiveControlBaseColumnCount({
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
  const maxColumnsByWidth = Math.floor(
    (availableWidthPx + resolvedGapPx) / (minWidthPx + resolvedGapPx),
  );

  return Math.max(1, Math.min(itemCount, maxColumnsByWidth));
}

export function rebalanceAdaptiveControlColumnCount(
  baseColumnCount: number,
  itemCount: number,
): number {
  if (baseColumnCount <= 1 || itemCount <= baseColumnCount) {
    return Math.max(1, baseColumnCount);
  }

  const rowCount = Math.ceil(itemCount / baseColumnCount);
  const lastRowCount = itemCount % baseColumnCount || baseColumnCount;

  if (rowCount <= 1 || lastRowCount >= baseColumnCount) {
    return baseColumnCount;
  }

  let bestTransferCount = 0;

  for (
    let transferCount = 1;
    transferCount < baseColumnCount;
    transferCount += 1
  ) {
    const nextLeadingRowCount = baseColumnCount - transferCount;
    const nextLastRowCount =
      lastRowCount + transferCount * (rowCount - 1);

    if (nextLastRowCount <= nextLeadingRowCount) {
      bestTransferCount = transferCount;
    }
  }

  return Math.max(1, baseColumnCount - bestTransferCount);
}

export function resolveAdaptiveControlColumnCount({
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
  const baseColumnCount = resolveAdaptiveControlBaseColumnCount({
    availableWidthPx,
    columnGapPx,
    itemCount,
    minWidthPx,
  });

  return baseColumnCount === null
    ? null
    : rebalanceAdaptiveControlColumnCount(baseColumnCount, itemCount);
}

export function resolveAdaptiveControlLayoutSignature({
  availableWidthPx,
  columnGapPx = 0,
  itemCount,
  minWidthPx,
}: {
  availableWidthPx: number;
  columnGapPx?: number;
  itemCount: number;
  minWidthPx: number;
}): string | null {
  if (
    itemCount <= 0 ||
    !Number.isFinite(availableWidthPx) ||
    availableWidthPx <= 0 ||
    !Number.isFinite(minWidthPx) ||
    minWidthPx <= 0
  ) {
    return null;
  }

  const roundedWidthPx = Math.max(1, Math.round(availableWidthPx));
  const roundedGapPx =
    Number.isFinite(columnGapPx) && columnGapPx > 0
      ? Math.round(columnGapPx)
      : 0;
  const roundedMinWidthPx = Math.max(1, Math.ceil(minWidthPx));

  return [
    roundedWidthPx,
    roundedGapPx,
    Math.max(1, itemCount),
    roundedMinWidthPx,
  ].join(":");
}

function parseCssPixelValue(value: string): number {
  const parsedValue = Number.parseFloat(value);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

export function useAdaptiveControlMinWidth({
  measurementLabels,
  measurementCapLabel,
  minFallbackPx = DEFAULT_ADAPTIVE_CONTROL_MIN_WIDTH_PX,
}: UseAdaptiveControlMinWidthOptions) {
  const measurerRef = useRef<HTMLDivElement | null>(null);
  const labelsToMeasure = useMemo(
    () =>
      getAdaptiveControlMeasurementLabels({
        measurementLabels,
        measurementCapLabel,
      }),
    [measurementCapLabel, measurementLabels],
  );
  const measurementKey = labelsToMeasure.join("\u0000");
  const fallbackWidth = resolveAdaptiveControlMinWidth([], minFallbackPx);
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

    function measureNow() {
      const measurer = measurerRef.current;

      if (!measurer) {
        updateMinWidth(fallbackWidth);
        return;
      }

      const measurementNodes = Array.from(
        measurer.querySelectorAll<HTMLElement>(
          "[data-adaptive-control-measure-label]",
        ),
      );
      const measuredWidths = measurementNodes.map((node) => {
        const rectWidth = node.getBoundingClientRect().width;

        return Math.max(rectWidth, node.scrollWidth, node.offsetWidth);
      });
      const nextMinWidth = resolveAdaptiveControlMinWidth(
        measuredWidths,
        fallbackWidth,
      );

      updateMinWidth(nextMinWidth);
    }

    function scheduleMeasure() {
      if (cancelled) {
        return;
      }

      if (
        typeof window === "undefined" ||
        typeof window.requestAnimationFrame !== "function"
      ) {
        measureNow();
        return;
      }

      if (animationFrameId !== null) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(() => {
        animationFrameId = null;
        measureNow();
      });
    }

    measureNow();

    if (typeof window !== "undefined") {
      window.addEventListener("resize", scheduleMeasure);
    }

    if (typeof document !== "undefined") {
      void document.fonts?.ready.then(() => {
        scheduleMeasure();
      });
    }

    function handleVisibilityChange() {
      if (document.visibilityState !== "hidden") {
        scheduleMeasure();
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
        window.removeEventListener("resize", scheduleMeasure);
      }

      if (typeof document !== "undefined") {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange,
        );
      }
    };
  }, [fallbackWidth, measurementKey]);

  const style = useMemo<AdaptiveControlGridStyle>(
    () => ({
      "--adaptive-control-min": `${minWidthPx}px`,
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

function useAdaptiveControlColumnCount({
  itemCount,
  minWidthPx,
}: {
  itemCount: number;
  minWidthPx: number;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const lastColumnMeasurementKeyRef = useRef<string | null>(null);
  const [columnCount, setColumnCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    let animationFrameId: number | null = null;
    lastColumnMeasurementKeyRef.current = null;

    function updateColumnCount(nextColumnCount: number | null) {
      if (cancelled) {
        return;
      }

      setColumnCount((currentColumnCount) =>
        currentColumnCount === nextColumnCount
          ? currentColumnCount
          : nextColumnCount,
      );
    }

    function measureNow() {
      const root = rootRef.current;

      if (!root) {
        updateColumnCount(null);
        return;
      }

      const computedStyle = getComputedStyle(root);
      const columnGapPx = parseCssPixelValue(
        computedStyle.columnGap || computedStyle.gap,
      );
      const renderedItemCount = Array.from(root.children).filter(
        (child) => !child.classList.contains("adaptive-control-grid__measurer"),
      ).length;
      const resolvedItemCount = renderedItemCount || itemCount;
      const availableWidthPx = root.getBoundingClientRect().width;
      const nextMeasurementKey = resolveAdaptiveControlLayoutSignature({
        availableWidthPx,
        columnGapPx,
        itemCount: resolvedItemCount,
        minWidthPx,
      });

      if (
        nextMeasurementKey !== null &&
        lastColumnMeasurementKeyRef.current === nextMeasurementKey
      ) {
        return;
      }

      lastColumnMeasurementKeyRef.current = nextMeasurementKey;

      const nextColumnCount = resolveAdaptiveControlColumnCount({
        availableWidthPx,
        columnGapPx,
        itemCount: resolvedItemCount,
        minWidthPx,
      });

      updateColumnCount(nextColumnCount);
    }

    function scheduleMeasure() {
      if (cancelled) {
        return;
      }

      if (
        typeof window === "undefined" ||
        typeof window.requestAnimationFrame !== "function"
      ) {
        measureNow();
        return;
      }

      if (animationFrameId !== null) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(() => {
        animationFrameId = null;
        measureNow();
      });
    }

    measureNow();

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(scheduleMeasure);

    if (rootRef.current) {
      resizeObserver?.observe(rootRef.current);
    }

    if (typeof window !== "undefined") {
      window.addEventListener("resize", scheduleMeasure);
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
        window.removeEventListener("resize", scheduleMeasure);
      }
    };
  }, [itemCount, minWidthPx]);

  return {
    columnCount,
    rootRef,
  };
}

export function AdaptiveControlGrid({
  measurementLabels,
  measurementCapLabel,
  minFallbackPx,
  className,
  children,
}: AdaptiveControlGridProps) {
  const { labelsToMeasure, measurerRef, minWidthPx } =
    useAdaptiveControlMinWidth({
      measurementLabels,
      measurementCapLabel,
      minFallbackPx,
    });
  const itemCount = Children.toArray(children).length;
  const { columnCount, rootRef } = useAdaptiveControlColumnCount({
    itemCount,
    minWidthPx,
  });
  const style = useMemo<AdaptiveControlGridStyle>(
    () => ({
      "--adaptive-control-min": `${minWidthPx}px`,
      ...(columnCount
        ? {
            "--adaptive-control-columns": String(columnCount),
            gridTemplateColumns: `repeat(${columnCount}, minmax(min(100%, var(--adaptive-control-min)), 1fr))`,
          }
        : {}),
    }),
    [columnCount, minWidthPx],
  );
  const rootClassName = className
    ? `adaptive-control-grid ${className}`
    : "adaptive-control-grid";

  return (
    <div
      ref={rootRef}
      className={rootClassName}
      data-adaptive-control-grid=""
      data-adaptive-control-columns={columnCount ?? undefined}
      style={style}
    >
      <div
        ref={measurerRef}
        className="adaptive-control-grid__measurer"
        aria-hidden="true"
      >
        {labelsToMeasure.map((label) => (
          <span
            key={label}
            className="adaptive-control-grid__measure-button"
            data-adaptive-control-measure-label=""
          >
            <span className="adaptive-control-grid__measure-value">
              {label}
            </span>
            <span
              className="adaptive-control-grid__measure-icon"
              aria-hidden="true"
            />
          </span>
        ))}
      </div>
      {children}
    </div>
  );
}
