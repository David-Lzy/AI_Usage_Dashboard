import { useLayoutEffect, type RefObject } from "react";

const COLOR_ROLES = [
  "primary", "on-primary", "primary-container", "on-primary-container",
  "secondary", "on-secondary", "secondary-container", "on-secondary-container",
  "tertiary", "on-tertiary", "tertiary-container", "on-tertiary-container",
  "surface", "surface-dim", "surface-bright", "surface-container-lowest",
  "surface-container-low", "surface-container", "surface-container-high",
  "surface-container-highest", "on-surface", "on-surface-variant", "outline",
  "outline-variant",
] as const;

export function readColorChannels(
  context: CanvasRenderingContext2D,
  color: string,
): string | null {
  if (!color || !CSS.supports("color", color)) return null;
  // Let the browser resolve CSS colors, including rgb(), color-mix and short hex.
  context.clearRect(0, 0, 1, 1);
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
  return `${red}, ${green}, ${blue}`;
}

export function syncFusionThemeTokens(scope: HTMLElement): void {
  const mode = document.documentElement.dataset.motionMode ?? "full";
  const profile = document.documentElement.dataset.motionProfile ?? "standard";
  const resolved = document.visibilityState === "hidden" || document.documentElement.dataset.motionSuspended === "true"
    ? "reduced" : document.documentElement.dataset.motionResolved ?? "full";
  const changed = scope.dataset.fusionMotionProfile && (scope.dataset.fusionMotionProfile !== profile ||
    scope.dataset.fusionMotion !== resolved || scope.dataset.fusionMotionMode !== mode);
  scope.dataset.fusionMotion = resolved;
  scope.dataset.fusionMotionProfile = profile;
  scope.dataset.fusionMotionMode = mode;
  if (changed) {
    const settle = (root: HTMLElement | ShadowRoot) => {
      for (const animation of root.getAnimations({ subtree: true })) {
        if (Number.isFinite(animation.effect?.getComputedTiming().endTime)) {
          try { animation.finish(); } catch { animation.cancel(); }
        }
      }
      for (const element of root.querySelectorAll("*")) if (element.shadowRoot) settle(element.shadowRoot);
    };
    settle(scope);
  }
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return;
  const style = getComputedStyle(scope);
  for (const role of COLOR_ROLES) {
    const channels = readColorChannels(context, style.getPropertyValue(`--md-sys-color-${role}`).trim());
    if (channels) scope.style.setProperty(`--mdui-color-${role}`, channels);
  }
  for (const [role, token] of Object.entries({
    error: "--app-color-error",
    "error-container": "--app-color-error-container",
    "on-error": "--md-sys-color-on-primary",
    "on-error-container": "--app-surface-error-on",
    "inverse-surface": "--md-sys-color-on-surface",
    "inverse-on-surface": "--md-sys-color-surface",
  })) {
    const channels = readColorChannels(context, style.getPropertyValue(token).trim());
    if (channels) scope.style.setProperty(`--mdui-color-${role}`, channels);
  }
  scope.style.colorScheme = document.documentElement.dataset.themeResolved ?? "light";
}

export function useFusionTheme(scope: RefObject<HTMLElement | null>): void {
  useLayoutEffect(() => {
    const element = scope.current;
    if (!element) return;
    const watched = new WeakSet<ShadowRoot>();
    const detach: (() => void)[] = [];
    const isReduced = () => element.dataset.fusionMotion === "reduced";
    const stopFixedMotion = (event: Event) => {
      if (!isReduced() || !(event.target instanceof Element)) return;
      // MDUI's ripple has hard-coded durations and no exported CSS Part.
      // Settle it through the browser API without editing vendor internals.
      for (const animation of event.target.getAnimations()) {
        if (Number.isFinite(animation.effect?.getComputedTiming().endTime)) {
          animation.effect?.updateTiming({ duration: 0, delay: 0, endDelay: 0 });
          try { animation.finish(); } catch { animation.cancel(); }
        } else animation.cancel();
      }
    };
    const watchShadows = (root: HTMLElement | ShadowRoot) => {
      for (const node of root.querySelectorAll("*")) {
        const shadow = node.shadowRoot;
        if (!shadow) continue;
        if (!watched.has(shadow)) {
          watched.add(shadow);
          shadow.addEventListener("transitionrun", stopFixedMotion, true);
          shadow.addEventListener("animationstart", stopFixedMotion, true);
          detach.push(() => {
            shadow.removeEventListener("transitionrun", stopFixedMotion, true);
            shadow.removeEventListener("animationstart", stopFixedMotion, true);
          });
        }
        watchShadows(shadow);
      }
    };
    const prepareInteraction = () => { if (isReduced()) watchShadows(element); };
    const events = ["pointerover", "pointerdown", "focusin", "keydown"];
    for (const event of events) element.addEventListener(event, prepareInteraction, true);
    const sync = () => syncFusionThemeTokens(element);
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: [
      "style", "data-theme-resolved", "data-theme-preset", "data-theme-custom-seed-hex",
      "data-ui-font-family", "data-motion-mode", "data-motion-resolved", "data-motion-profile", "data-motion-suspended",
    ] });
    return () => {
      observer.disconnect();
      for (const event of events) element.removeEventListener(event, prepareInteraction, true);
      for (const remove of detach) remove();
    };
  }, [scope]);
}
