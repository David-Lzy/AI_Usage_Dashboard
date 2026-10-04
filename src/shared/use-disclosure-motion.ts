import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { animateMotion, readMotion } from "./motion-runtime";

const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function returnFocus(element: HTMLElement) {
  if (!element.contains(element.ownerDocument.activeElement)) return;
  const controls = element.ownerDocument.querySelectorAll<HTMLElement>("[aria-controls]");
  let trigger = [...controls].find((candidate) =>
    candidate !== element && !element.contains(candidate) &&
    candidate.getAttribute("aria-controls")?.split(/\s+/).includes(element.id));
  if (!trigger && element.dataset.motionFocusTarget) trigger = element.ownerDocument.querySelector<HTMLElement>(element.dataset.motionFocusTarget) ?? undefined;
  while (trigger?.shadowRoot) {
    const target = trigger.shadowRoot.querySelector<HTMLElement>("mdui-text-field, input:not([type=hidden]), button");
    if (!target) break;
    trigger = target;
  }
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
    const motion = readMotion(element);
    if (!enabled || !parentVisible || !motion.medium) {
      cancel.current?.();
      cancel.current = null;
      reset();
      setPresent(!hidden);
      return;
    }
    if (wasHidden === hidden) return;
    const fromHeight = cancel.current || !wasHidden
      ? element.getBoundingClientRect().height : 0;
    const fromStyle = getComputedStyle(element);
    const fromOpacity = cancel.current || !wasHidden ? Number(fromStyle.opacity) : 0;
    const spacing = ["paddingTop", "paddingBottom", "borderTopWidth", "borderBottomWidth", "minHeight"] as const;
    const fromSpacing = Object.fromEntries(spacing.map((key) => [key, cancel.current || !wasHidden ? fromStyle[key] : "0px"]));
    cancel.current?.();
    cancel.current = null;
    setPresent(true);
    reset();
    const targetHeight = hidden ? 0 : element.getBoundingClientRect().height;
    if (!targetHeight && !fromHeight) {
      setPresent(!hidden);
      return;
    }
    const deadline = performance.now() + motion.medium;
    let observer: MutationObserver | null = null;
    let stopAnimation: (() => void) | null = null;
    const finish = () => {
      if (revision.current !== sequence) return;
      observer?.disconnect();
      cancel.current = null;
      reset();
      setPresent(!hidden);
    };
    const start = (height: number, opacity: number, padding: Record<string, string>, transform: string) => {
      stopAnimation?.();
      reset();
      const style = getComputedStyle(element);
      const end = Object.fromEntries(spacing.map((key) => [key, hidden ? "0px" : style[key]]));
      const target = hidden ? 0 : element.getBoundingClientRect().height;
      element.style.overflow = "clip";
      stopAnimation = animateMotion(element, [
        { ...padding, height: `${height}px`, opacity, transform },
        { ...end, height: `${target}px`, opacity: hidden ? 0 : 1, transform: "none" },
      ], { channel: "disclosure", duration: deadline - performance.now(), onFinish: finish });
    };
    cancel.current = () => { observer?.disconnect(); stopAnimation?.(); };
    start(fromHeight, fromOpacity, fromSpacing, motion.profile === "expressive" && wasHidden ? "translateY(8px)" : "none");
    if (stopAnimation && !hidden) {
      // Only observe content while entering. New async content retargets within
      // the original deadline instead of extending the animation or polling.
      observer = new MutationObserver(() => {
        const style = getComputedStyle(element);
        start(element.getBoundingClientRect().height, Number(style.opacity), Object.fromEntries(spacing.map((key) => [key, style[key]])), style.transform);
      });
      observer.observe(element, { childList: true, characterData: true, subtree: true });
    }
  }, [hidden, enabled, parentVisible, ref]);
  useEffect(() => () => {
    revision.current++;
    cancel.current?.();
  }, []);
  return enabled && parentVisible ? hidden && !present : hidden;
}
