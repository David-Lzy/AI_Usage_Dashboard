import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { animateMotion, readMotion } from "./motion-runtime";

const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function returnFocus(element: HTMLElement) {
  if (!element.contains(element.ownerDocument.activeElement)) return;
  const controls = element.ownerDocument.querySelectorAll<HTMLElement>("[aria-controls]");
  const trigger = [...controls].find((candidate) =>
    candidate !== element && !element.contains(candidate) &&
    candidate.getAttribute("aria-controls")?.split(/\s+/).includes(element.id));
  if (trigger) trigger.focus({ preventScroll: true });
}

export function useDisclosureMotion(
  ref: RefObject<HTMLElement | null>,
  hidden: boolean,
  enabled: boolean,
  parentVisible: boolean,
) {
  const [present, setPresent] = useState(!hidden);
  const previous = useRef(hidden);
  const cancel = useRef<(() => void) | null>(null);
  const revision = useRef(0);
  useBrowserLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const wasHidden = previous.current;
    previous.current = hidden;
    if (hidden && !wasHidden) returnFocus(element);
    const sequence = ++revision.current;
    const reset = () => {
      element.style.removeProperty("height");
      element.style.removeProperty("overflow");
    };
    if (!enabled || !parentVisible || !readMotion(element).medium) {
      cancel.current?.();
      cancel.current = null;
      reset();
      setPresent(!hidden);
      return;
    }
    if (wasHidden === hidden) return;
    const fromHeight = cancel.current || !wasHidden
      ? element.getBoundingClientRect().height : 0;
    const fromOpacity = cancel.current || !wasHidden
      ? Number(getComputedStyle(element).opacity) : 0;
    cancel.current?.();
    cancel.current = null;
    setPresent(true);
    reset();
    const targetHeight = hidden ? 0 : element.getBoundingClientRect().height;
    if (!targetHeight && !fromHeight) {
      setPresent(!hidden);
      return;
    }
    element.style.overflow = "clip";
    cancel.current = animateMotion(element, [
      { height: `${fromHeight}px`, opacity: fromOpacity },
      { height: `${targetHeight}px`, opacity: hidden ? 0 : 1 },
    ], { channel: "disclosure", speed: "medium", onFinish: () => {
      if (revision.current !== sequence) return;
      cancel.current = null;
      reset();
      setPresent(!hidden);
    } });
  }, [hidden, enabled, parentVisible, ref]);
  useEffect(() => () => {
    revision.current++;
    cancel.current?.();
  }, []);
  return enabled && parentVisible ? hidden && !present : hidden;
}
