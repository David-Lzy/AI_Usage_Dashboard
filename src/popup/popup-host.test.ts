import { describe, expect, it } from "vitest";
import { markNativePopupHost } from "./popup-host";

describe("native Popup sizing boundary", () => {
  it("marks only the actual extension action view", () => {
    const element = { dataset: {} } as HTMLElement;
    const host = {} as Window;
    markNativePopupHost(element, host, () => [host]);
    expect(element.dataset.popupHost).toBe("native");
    markNativePopupHost(element, host, () => [{} as Window]);
    expect(element.dataset.popupHost).toBeUndefined();
  });

  it("keeps responsive previews when extension views are unavailable", () => {
    const element = { dataset: {} } as HTMLElement;
    markNativePopupHost(element, {} as Window, undefined);
    expect(element.dataset.popupHost).toBeUndefined();
  });
});
