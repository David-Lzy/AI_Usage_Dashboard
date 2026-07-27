import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

const POPUP_PROVIDER_AUTO_GLIDE_MAX_VIEWPORT_PX = 360;
const POPUP_PROVIDER_AUTO_GLIDE_MIN_DURATION_MS = 8_000;
const POPUP_PROVIDER_AUTO_GLIDE_SPEED_PX_PER_SECOND = 24;
const POPUP_PROVIDER_AUTO_GLIDE_WHEEL_MAX_PX = 96;
const POPUP_PROVIDER_AUTO_GLIDE_MIN_VIEWPORT_PX = 96;
const WHEEL_DELTA_MODE_LINE = 1;
const WHEEL_DELTA_MODE_PAGE = 2;

const useBrowserLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

type PopupProviderAutoGlideRuntime = {
  animation: Animation;
  completed: boolean;
  durationMs: number;
  stepPx: number;
};

type PopupProviderAutoGlideResult<T extends string> = {
  isActive: boolean;
  orderedItemIds: readonly T[];
  trackRef: RefObject<HTMLDivElement | null>;
  viewportRef: RefObject<HTMLDivElement | null>;
};

type WheelDeltaLike = Pick<WheelEvent, "deltaMode" | "deltaY">;

export function rotateCircularItems<T>(
  items: readonly T[],
  direction: "next" | "previous",
): T[] {
  if (items.length < 2) {
    return [...items];
  }

  return direction === "next"
    ? [...items.slice(1), items[0]]
    : [items[items.length - 1], ...items.slice(0, -1)];
}

export function resolveCircularAutoGlideViewportHeight(
  totalTrackHeightPx: number,
  largestItemStepPx: number,
  maxViewportHeightPx = POPUP_PROVIDER_AUTO_GLIDE_MAX_VIEWPORT_PX,
): number {
  if (
    !Number.isFinite(totalTrackHeightPx) ||
    !Number.isFinite(largestItemStepPx) ||
    totalTrackHeightPx <= 0 ||
    largestItemStepPx <= 0
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(maxViewportHeightPx, totalTrackHeightPx - largestItemStepPx),
  );
}

export function normalizePopupProviderWheelDelta(
  event: WheelDeltaLike,
  viewportHeightPx: number,
): number {
  const lineHeightPx = 16;
  const modeMultiplier =
    event.deltaMode === WHEEL_DELTA_MODE_LINE
      ? lineHeightPx
      : event.deltaMode === WHEEL_DELTA_MODE_PAGE
        ? Math.max(1, viewportHeightPx)
        : 1;

  const deltaPx = event.deltaY * modeMultiplier;
  return Math.max(
    -POPUP_PROVIDER_AUTO_GLIDE_WHEEL_MAX_PX,
    Math.min(POPUP_PROVIDER_AUTO_GLIDE_WHEEL_MAX_PX, deltaPx),
  );
}

function readCurrentAnimationOffset(
  runtime: PopupProviderAutoGlideRuntime,
): number {
  const currentTime = Number(runtime.animation.currentTime ?? 0);
  if (!Number.isFinite(currentTime) || runtime.durationMs <= 0) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      runtime.stepPx,
      (currentTime / runtime.durationMs) * runtime.stepPx,
    ),
  );
}

function setCurrentAnimationOffset(
  runtime: PopupProviderAutoGlideRuntime,
  offsetPx: number,
): void {
  runtime.animation.currentTime =
    (Math.max(0, Math.min(runtime.stepPx, offsetPx)) / runtime.stepPx) *
    runtime.durationMs;
}

function readResolvedMotionReduction(): boolean {
  return (
    typeof document !== "undefined" &&
    document.documentElement.dataset.motionResolved === "reduced"
  );
}

function reconcileCircularOrder<T extends string>(
  current: readonly T[],
  available: readonly T[],
): T[] {
  const availableSet = new Set(available);
  const retained = current.filter((itemId) => availableSet.has(itemId));
  const retainedSet = new Set(retained);
  return [...retained, ...available.filter((itemId) => !retainedSet.has(itemId))];
}

export function usePopupProviderAutoGlide<T extends string>(
  itemIds: readonly T[],
  enabled: boolean,
): PopupProviderAutoGlideResult<T> {
  const itemIdsKey = itemIds.join("\u0000");
  const [orderedItemIds, setOrderedItemIds] = useState<T[]>(() => [
    ...itemIds,
  ]);
  const [isActive, setIsActive] = useState(false);
  const [isMotionReduced, setIsMotionReduced] = useState(
    readResolvedMotionReduction,
  );
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const runtimeRef = useRef<PopupProviderAutoGlideRuntime | null>(null);
  const pointerInsideRef = useRef(false);
  const focusInsideRef = useRef(false);
  const manualCarryPxRef = useRef<number | null>(null);

  useBrowserLayoutEffect(() => {
    setOrderedItemIds((current) => {
      const next = reconcileCircularOrder(current, itemIds);
      return next.length === current.length &&
        next.every((itemId, index) => itemId === current[index])
        ? current
        : next;
    });
  }, [itemIdsKey]);

  useEffect(() => {
    if (typeof document === "undefined" || typeof MutationObserver === "undefined") {
      return;
    }

    const root = document.documentElement;
    const updateResolvedMotion = () => {
      setIsMotionReduced(root.dataset.motionResolved === "reduced");
    };
    const observer = new MutationObserver(updateResolvedMotion);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-motion-resolved"],
    });
    updateResolvedMotion();

    return () => observer.disconnect();
  }, []);

  const orderedItemIdsKey = orderedItemIds.join("\u0000");

  useBrowserLayoutEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (
      !enabled ||
      isMotionReduced ||
      orderedItemIds.length < 2 ||
      !viewport ||
      !track ||
      typeof track.animate !== "function"
    ) {
      runtimeRef.current?.animation.cancel();
      runtimeRef.current = null;
      viewport?.style.removeProperty("block-size");
      setIsActive(false);
      return;
    }

    let disposed = false;
    let scheduledFrame: number | null = null;

    const configureAnimation = () => {
      scheduledFrame = null;
      const previousRuntime = runtimeRef.current;
      const preservedOffsetPx = previousRuntime
        ? previousRuntime.completed
          ? null
          : readCurrentAnimationOffset(previousRuntime)
        : null;
      if (previousRuntime) {
        previousRuntime.animation.onfinish = null;
        previousRuntime.animation.cancel();
        runtimeRef.current = null;
      }

      const itemElements = Array.from(track.children).filter(
        (child): child is HTMLElement => child instanceof HTMLElement,
      );
      const computedTrackStyle = window.getComputedStyle(track);
      const rowGapPx = Number.parseFloat(computedTrackStyle.rowGap) || 0;
      const itemStepsPx = itemElements.map(
        (itemElement) => itemElement.getBoundingClientRect().height + rowGapPx,
      );
      const firstItemStepPx = itemStepsPx[0] ?? 0;
      const largestItemStepPx = Math.max(0, ...itemStepsPx);
      const viewportHeightPx = resolveCircularAutoGlideViewportHeight(
        track.scrollHeight,
        largestItemStepPx,
      );

      if (
        firstItemStepPx <= 1 ||
        viewportHeightPx < POPUP_PROVIDER_AUTO_GLIDE_MIN_VIEWPORT_PX
      ) {
        viewport.style.removeProperty("block-size");
        setIsActive(false);
        return;
      }

      viewport.style.blockSize = `${Math.floor(viewportHeightPx)}px`;
      const durationMs = Math.max(
        POPUP_PROVIDER_AUTO_GLIDE_MIN_DURATION_MS,
        (firstItemStepPx / POPUP_PROVIDER_AUTO_GLIDE_SPEED_PX_PER_SECOND) *
          1_000,
      );
      const animation = track.animate(
        [
          { transform: "translate3d(0, 0, 0)" },
          {
            transform: `translate3d(0, -${firstItemStepPx}px, 0)`,
          },
        ],
        {
          duration: durationMs,
          easing: "linear",
          fill: "forwards",
        },
      );
      const runtime = {
        animation,
        completed: false,
        durationMs,
        stepPx: firstItemStepPx,
      };
      runtimeRef.current = runtime;

      const manualCarryPx = manualCarryPxRef.current;
      manualCarryPxRef.current = null;
      const initialOffsetPx =
        manualCarryPx === null
          ? preservedOffsetPx ?? 0
          : manualCarryPx >= 0
            ? Math.min(firstItemStepPx - 0.5, manualCarryPx)
            : Math.max(0, firstItemStepPx + manualCarryPx);
      setCurrentAnimationOffset(runtime, initialOffsetPx);

      animation.onfinish = () => {
        if (disposed || runtimeRef.current?.animation !== animation) {
          return;
        }
        animation.onfinish = null;
        runtime.completed = true;
        manualCarryPxRef.current = 0;
        setOrderedItemIds((current) =>
          rotateCircularItems(current, "next"),
        );
      };

      if (pointerInsideRef.current || focusInsideRef.current) {
        animation.pause();
      } else {
        animation.play();
      }
      setIsActive(true);
    };

    const scheduleConfigureAnimation = () => {
      if (scheduledFrame !== null) {
        window.cancelAnimationFrame(scheduledFrame);
      }
      scheduledFrame = window.requestAnimationFrame(configureAnimation);
    };

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(scheduleConfigureAnimation);
    resizeObserver?.observe(track);
    for (const child of track.children) {
      resizeObserver?.observe(child);
    }
    window.addEventListener("resize", scheduleConfigureAnimation);
    configureAnimation();

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      window.removeEventListener("resize", scheduleConfigureAnimation);
      if (scheduledFrame !== null) {
        window.cancelAnimationFrame(scheduledFrame);
      }
      const runtime = runtimeRef.current;
      if (runtime) {
        runtime.animation.onfinish = null;
        runtime.animation.cancel();
        runtimeRef.current = null;
      }
    };
  }, [enabled, isMotionReduced, orderedItemIdsKey]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!enabled || orderedItemIds.length < 2 || !viewport) {
      return;
    }

    const pause = () => runtimeRef.current?.animation.pause();
    const resume = () => {
      if (!pointerInsideRef.current && !focusInsideRef.current) {
        runtimeRef.current?.animation.play();
      }
    };
    const handlePointerEnter = () => {
      pointerInsideRef.current = true;
      pause();
    };
    const handlePointerLeave = () => {
      pointerInsideRef.current = false;
      resume();
    };
    const handleFocusIn = () => {
      focusInsideRef.current = true;
      pause();
    };
    const handleFocusOut = () => {
      focusInsideRef.current = viewport.contains(document.activeElement);
      resume();
    };
    const handleWheel = (event: WheelEvent) => {
      const runtime = runtimeRef.current;
      if (!runtime || runtime.completed || event.deltaY === 0) {
        return;
      }

      const deltaPx = normalizePopupProviderWheelDelta(
        event,
        viewport.clientHeight,
      );
      if (deltaPx === 0) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      runtime.animation.pause();
      const currentOffsetPx = readCurrentAnimationOffset(runtime);
      const boundedDeltaPx = Math.max(
        -runtime.stepPx * 0.8,
        Math.min(runtime.stepPx * 0.8, deltaPx),
      );
      const targetOffsetPx = currentOffsetPx + boundedDeltaPx;

      if (targetOffsetPx >= 0 && targetOffsetPx < runtime.stepPx) {
        setCurrentAnimationOffset(runtime, targetOffsetPx);
        return;
      }

      runtime.animation.onfinish = null;
      runtime.completed = true;
      if (targetOffsetPx >= runtime.stepPx) {
        setCurrentAnimationOffset(runtime, runtime.stepPx);
        manualCarryPxRef.current = targetOffsetPx - runtime.stepPx;
        setOrderedItemIds((current) =>
          rotateCircularItems(current, "next"),
        );
      } else {
        setCurrentAnimationOffset(runtime, 0);
        manualCarryPxRef.current = targetOffsetPx;
        setOrderedItemIds((current) =>
          rotateCircularItems(current, "previous"),
        );
      }
    };

    viewport.addEventListener("pointerenter", handlePointerEnter);
    viewport.addEventListener("pointerleave", handlePointerLeave);
    viewport.addEventListener("focusin", handleFocusIn);
    viewport.addEventListener("focusout", handleFocusOut);
    viewport.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      viewport.removeEventListener("pointerenter", handlePointerEnter);
      viewport.removeEventListener("pointerleave", handlePointerLeave);
      viewport.removeEventListener("focusin", handleFocusIn);
      viewport.removeEventListener("focusout", handleFocusOut);
      viewport.removeEventListener("wheel", handleWheel);
    };
  }, [enabled, orderedItemIds.length]);

  return {
    isActive,
    orderedItemIds,
    trackRef,
    viewportRef,
  };
}
