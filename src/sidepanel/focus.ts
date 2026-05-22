export function focusWithoutScroll(element: HTMLElement | null): void {
  if (!element) {
    return;
  }

  try {
    element.focus({ preventScroll: true });
  } catch {
    element.focus();
  }
}
