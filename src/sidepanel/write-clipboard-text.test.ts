import { afterEach, describe, expect, it, vi } from "vitest";

import { writeClipboardText } from "./write-clipboard-text";

describe("writeClipboardText", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reports unavailable when clipboard access is missing", async () => {
    vi.stubGlobal("navigator", {});

    await expect(writeClipboardText("export")).resolves.toBe("unavailable");
  });

  it("writes text through navigator.clipboard", async () => {
    const writeText = vi.fn(async () => undefined);

    vi.stubGlobal("navigator", {
      clipboard: {
        writeText,
      },
    });

    await expect(writeClipboardText("export")).resolves.toBe("success");
    expect(writeText).toHaveBeenCalledWith("export");
  });

  it("reports failed when clipboard write rejects", async () => {
    vi.stubGlobal("navigator", {
      clipboard: {
        writeText: vi.fn(async () => {
          throw new Error("denied");
        }),
      },
    });

    await expect(writeClipboardText("export")).resolves.toBe("failed");
  });
});
