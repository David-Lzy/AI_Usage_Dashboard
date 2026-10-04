export function markNativePopupHost(
  element: HTMLElement,
  host: Window,
  getPopupViews: (() => Window[]) | undefined,
): void {
  if (getPopupViews?.().includes(host)) {
    element.dataset.popupHost = "native";
  } else {
    delete element.dataset.popupHost;
  }
}
