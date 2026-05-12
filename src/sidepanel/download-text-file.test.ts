import { afterEach, describe, expect, it, vi } from "vitest";

import { downloadTextFile } from "./download-text-file";

describe("downloadTextFile", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns false outside browser-like download environments", () => {
    vi.stubGlobal("window", undefined);
    vi.stubGlobal("document", undefined);

    expect(downloadTextFile("export.txt", "body", "text/plain")).toBe(false);
  });

  it("creates, clicks, and revokes a temporary download link", () => {
    const anchor = {
      click: vi.fn(),
      download: "",
      href: "",
      rel: "",
      remove: vi.fn(),
      style: {
        display: "",
      },
    } as unknown as HTMLAnchorElement;
    const append = vi.fn();
    const createElement = vi.fn(() => anchor);
    const createObjectURL = vi.fn(() => "blob:export");
    const revokeObjectURL = vi.fn();
    const setTimeout = vi.fn((callback: () => void) => {
      callback();
      return 1;
    });

    vi.stubGlobal("document", {
      body: {
        append,
      },
      createElement,
    });
    vi.stubGlobal("URL", {
      createObjectURL,
      revokeObjectURL,
    });
    vi.stubGlobal("window", {
      setTimeout,
    });

    expect(downloadTextFile("export.md", "# Export", "text/markdown")).toBe(
      true,
    );
    expect(createElement).toHaveBeenCalledWith("a");
    expect(anchor.href).toBe("blob:export");
    expect(anchor.download).toBe("export.md");
    expect(anchor.rel).toBe("noopener");
    expect(anchor.style.display).toBe("none");
    expect(append).toHaveBeenCalledWith(anchor);
    expect(anchor.click).toHaveBeenCalledTimes(1);
    expect(anchor.remove).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:export");
  });
});
