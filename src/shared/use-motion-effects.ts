import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import { animateEntrance, animateMotion, readMotion, type MotionElement } from "./motion-runtime";

const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function useMotionMenu(ref: RefObject<HTMLElement | null>, open: boolean) {
  useBrowserLayoutEffect(() => {
    const node = ref.current;
    if (!open || !node) return;
    node.dataset.motionOwned = "";
    const expressive = readMotion(node).profile === "expressive";
    node.style.transformOrigin = node.dataset.placement === "above" ? "bottom center" : "top center";
    return animateMotion(node, [
      { opacity: 0, scale: expressive ? "0.96" : "0.98", translate: expressive ? "0 -4px" : "0 0" },
      { opacity: 1, scale: "1", translate: "0 0" },
    ], { channel: "menu", speed: "fast" }) ?? undefined;
  }, [ref, open]);
}

export function useMotionEntrance(ref: RefObject<MotionElement | null>, key: unknown, skipInitial = false) {
  const initial = useRef(true);
  useBrowserLayoutEffect(() => {
    const skip = initial.current && skipInitial;
    initial.current = false;
    const element = ref.current;
    if (!skip && element?.checkVisibility() && !element.closest("[inert]")) {
      return animateMotion(element, [{ opacity: 0.35 }, { opacity: 1 }]) ?? undefined;
    }
  }, [ref, key, skipInitial]);
}

export function useSurfaceMotion(ref: RefObject<HTMLElement | null>, key: unknown) {
  useMotionInteractions(ref);
  useBrowserLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const motion = readMotion(root);
    if (motion.profile === "reduced") return;
    const candidates = [...root.querySelectorAll<HTMLElement>("h1, .dashboard-summary, [data-motion-group]")]
      .filter((node) => {
        const box = node.getBoundingClientRect();
        return node.checkVisibility() && !node.closest("[inert]") && box.bottom > 0 && box.top < root.ownerDocument.defaultView!.innerHeight;
      });
    const targets = candidates.slice(0, motion.profile === "expressive" ? 4 : 2);
    const cancels = targets.map((node, index) => animateEntrance(node, index));
    return () => { for (const cancel of cancels) cancel?.(); };
  }, [ref, key]);
}

export function useMotionLayout(ref: RefObject<HTMLElement | null>, order: string) {
  const previous = useRef(new Map<string, { left: number; top: number }>());
  const running = useRef(new Map<string, { node: HTMLElement; cancel: () => void }>());
  useBrowserLayoutEffect(() => {
    const root = ref.current;
    // React has committed the new order already. Recover an interrupted item's
    // visual position from the prior layout plus its in-flight translation.
    const oldPoints = new Map(previous.current);
    for (const [id, entry] of [...running.current]) {
      const old = oldPoints.get(id);
      const transform = getComputedStyle(entry.node).transform;
      if (old && transform !== "none" && entry.node.dataset.motionActive === "reorder") {
        const matrix = new DOMMatrixReadOnly(transform);
        oldPoints.set(id, { left: old.left + matrix.m41, top: old.top + matrix.m42 });
      }
      entry.cancel();
    }
    running.current.clear();
    if (!root || !root.checkVisibility() || root.closest("[inert]")) {
      previous.current.clear();
      return;
    }
    const origin = root.getBoundingClientRect();
    const next = new Map<string, { left: number; top: number }>();
    for (const node of root.querySelectorAll<HTMLElement>("[data-motion-key]")) {
      const id = node.dataset.motionKey!;
      const box = node.getBoundingClientRect();
      const point = { left: box.left - origin.left, top: box.top - origin.top };
      next.set(id, point);
      const old = oldPoints.get(id);
      if (!old || !node.checkVisibility()) continue;
      const x = old.left - point.left;
      const y = old.top - point.top;
      if (Math.abs(x) + Math.abs(y) < 1) continue;
      let cancel: (() => void) | null = null;
      cancel = animateMotion(node, [
        { transform: `translate(${x}px, ${y}px)` }, { transform: "none" },
      ], { channel: "reorder", speed: "slow", easing: readMotion(node).profile === "expressive" ? "cubic-bezier(0.16, 1, 0.3, 1)" : undefined,
        onFinish: () => { if (running.current.get(id)?.cancel === cancel) running.current.delete(id); } });
      if (cancel) running.current.set(id, { node, cancel });
    }
    previous.current = next;
  }, [ref, order]);
  useEffect(() => () => {
    for (const entry of running.current.values()) entry.cancel();
    running.current.clear();
  }, []);
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
