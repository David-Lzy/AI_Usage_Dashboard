const SURFACE_SWITCH_INTENT_WINDOW_MS = 1_500;

let surfaceSwitchIntentExpiresAt = 0;

export function markSurfaceSwitchIntent(now = Date.now()): void {
  surfaceSwitchIntentExpiresAt = now + SURFACE_SWITCH_INTENT_WINDOW_MS;
}

export function hasRecentSurfaceSwitchIntent(now = Date.now()): boolean {
  return surfaceSwitchIntentExpiresAt > now;
}

export function isSurfaceSwitchTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    Boolean(target.closest('[data-topbar-switch-surface="true"]'))
  );
}

export function shouldPreservePopoverForSurfaceSwitch(
  target: EventTarget | null,
): boolean {
  return isSurfaceSwitchTarget(target) || hasRecentSurfaceSwitchIntent();
}
