import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import { animateEntrance, animateMotion, readMotion } from "./motion-runtime";

const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function useMotionEntrance(ref: RefObject<HTMLElement | null>, key: unknown, skipInitial = false) {
  const initial = useRef(true);
  useBrowserLayoutEffect(() => {
    const skip = initial.current && skipInitial;
    initial.current = false;
    if (!skip && ref.current?.checkVisibility()) return animateEntrance(ref.current) ?? undefined;
  }, [ref, key, skipInitial]);
}

export function useMotionSelection(
  ref: RefObject<HTMLElement | null>,
  indicatorRef: RefObject<HTMLElement | null>,
  value: unknown,
) {
  const previous = useRef<{ top: number; height: number } | null>(null);
  useBrowserLayoutEffect(() => {
    const rail = ref.current;
    const indicator = indicatorRef.current;
    if (!rail || !indicator) return;
    let cancel: (() => void) | null = null;
    const measure = (animate: boolean) => {
      const item = rail.querySelector<HTMLElement>('[aria-current="page"], [aria-pressed="true"]');
      if (!item || !rail.checkVisibility()) return;
      const next = { top: item.offsetTop, height: item.offsetHeight };
      if (!animate && next.top === previous.current?.top && next.height === previous.current?.height) return;
      cancel?.();
      indicator.style.top = `${next.top}px`;
      indicator.style.height = `${next.height}px`;
      rail.dataset.motionSelection = "ready";
      const old = previous.current;
      previous.current = next;
      if (animate && old && (old.top !== next.top || old.height !== next.height)) {
        cancel = animateMotion(indicator, [
          { transform: `translateY(${old.top - next.top}px)`, height: `${old.height}px` },
          { transform: "none", height: `${next.height}px` },
        ], { channel: "selection", easing: readMotion(rail).profile === "expressive" ? "cubic-bezier(0.16, 1, 0.3, 1)" : undefined });
      }
    };
    measure(true);
    const observer = new ResizeObserver(() => measure(false));
    observer.observe(rail);
    return () => {
      if (cancel) previous.current = { top: indicator.getBoundingClientRect().top - rail.getBoundingClientRect().top, height: indicator.getBoundingClientRect().height };
      cancel?.(); observer.disconnect();
    };
  }, [ref, indicatorRef, value]);
}

export function useMotionInteractions(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const active = new Set<() => void>();
    const ripple = (event: PointerEvent | KeyboardEvent) => {
      if (readMotion(root).profile !== "expressive") return;
      if (event instanceof KeyboardEvent && (event.repeat || !["Enter", " "].includes(event.key))) return;
      const button = event.target instanceof Element ? event.target.closest<HTMLElement>("button") : null;
      if (!button || !root.contains(button) || button.matches(":disabled, [aria-disabled=true]") || button.closest("[inert]")) return;
      const box = button.getBoundingClientRect();
      const size = Math.hypot(box.width, box.height) * 2;
      const x = event instanceof PointerEvent ? event.clientX - box.left : box.width / 2;
      const y = event instanceof PointerEvent ? event.clientY - box.top : box.height / 2;
      const ink = root.ownerDocument.createElement("span");
      ink.className = "app-motion-ripple";
      ink.setAttribute("aria-hidden", "true");
      ink.style.cssText = `width:${size}px;height:${size}px;left:${x - size / 2}px;top:${y - size / 2}px`;
      button.classList.add("app-motion-ripple-host");
      if (getComputedStyle(button).position === "static") { button.style.position = "relative"; button.dataset.motionRelative = ""; }
      button.append(ink);
      let cancel: (() => void) | null = null;
      const cleanup = () => {
        ink.remove(); active.delete(stop);
        if (!button.querySelector(".app-motion-ripple")) {
          button.classList.remove("app-motion-ripple-host");
          if (button.dataset.motionRelative !== undefined) { button.style.removeProperty("position"); delete button.dataset.motionRelative; }
        }
      };
      const stop = () => { cancel?.(); cleanup(); };
      active.add(stop);
      cancel = animateMotion(ink, [
        { transform: "scale(0)", opacity: 0.18 },
        { transform: "scale(0.7)", opacity: 0.12, offset: 0.65 },
        { transform: "scale(1)", opacity: 0 },
      ], { channel: "ripple", speed: "slow", onFinish: cleanup });
    };
    root.addEventListener("pointerdown", ripple);
    root.addEventListener("keydown", ripple);
    const checked = (event: Event) => {
      if (readMotion(root).profile !== "expressive" || !(event.target instanceof HTMLInputElement) || event.target.type !== "checkbox") return;
      let cancel: (() => void) | null = null;
      cancel = animateMotion(event.target, [{ transform: "scale(0.9)" }, { transform: "scale(1.12)", offset: 0.6 }, { transform: "none" }], { channel: "check", speed: "fast", onFinish: () => { if (cancel) active.delete(cancel); } });
      if (cancel) active.add(cancel);
    };
    root.addEventListener("change", checked);
    return () => { root.removeEventListener("pointerdown", ripple); root.removeEventListener("keydown", ripple); root.removeEventListener("change", checked); for (const stop of active) stop(); };
  }, [ref]);
}
