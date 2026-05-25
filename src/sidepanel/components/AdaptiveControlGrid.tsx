import {
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

    function measure() {
      const measurer = measurerRef.current;

      if (!measurer) {
        setMinWidthPx(fallbackWidth);
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

export function AdaptiveControlGrid({
  measurementLabels,
  measurementCapLabel,
  minFallbackPx,
  className,
  children,
}: AdaptiveControlGridProps) {
  const { labelsToMeasure, measurerRef, style } = useAdaptiveControlMinWidth({
    measurementLabels,
    measurementCapLabel,
    minFallbackPx,
  });
  const rootClassName = className
    ? `adaptive-control-grid ${className}`
    : "adaptive-control-grid";

  return (
    <div
      className={rootClassName}
      data-adaptive-control-grid=""
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
