import { describe, expect, it, vi } from "vitest";

import { focusWithoutScroll } from "./focus";

describe("focusWithoutScroll", () => {
  it("requests focus without changing the scroll position", () => {
    const focus = vi.fn();

    focusWithoutScroll({ focus } as unknown as HTMLElement);

    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
  });

  it("falls back to plain focus when preventScroll is unsupported", () => {
    const focus = vi
      .fn()
      .mockImplementationOnce(() => {
        throw new TypeError("focus options unsupported");
      })
      .mockImplementationOnce(() => undefined);

    focusWithoutScroll({ focus } as unknown as HTMLElement);

    expect(focus).toHaveBeenNthCalledWith(1, { preventScroll: true });
    expect(focus).toHaveBeenNthCalledWith(2);
  });
});
