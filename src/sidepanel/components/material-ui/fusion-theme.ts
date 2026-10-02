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
  scope.dataset.fusionMotion = document.documentElement.dataset.motionResolved ?? "full";
  scope.style.colorScheme = document.documentElement.dataset.themeResolved ?? "light";
}

export function useFusionTheme(scope: RefObject<HTMLElement | null>): void {
  useLayoutEffect(() => {
    const element = scope.current;
    if (!element) return;
    const sync = () => syncFusionThemeTokens(element);
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: [
      "style", "data-theme-resolved", "data-theme-preset", "data-theme-custom-seed-hex",
      "data-ui-font-family", "data-motion-resolved",
    ] });
    return () => observer.disconnect();
  }, [scope]);
}
