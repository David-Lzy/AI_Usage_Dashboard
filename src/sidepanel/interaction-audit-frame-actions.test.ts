import { describe, expect, it, vi } from "vitest";

import {
  getAuditSurfaceReadiness,
  runAuditPreset,
} from "./interaction-audit-frame-actions";

function createElement(textContent = "") {
  return {
    nodeType: 1,
    textContent,
    focus: vi.fn(),
    removeAttribute: vi.fn(),
    scrollIntoView: vi.fn(),
    setAttribute: vi.fn(),
  } as unknown as HTMLElement;
}

function createFrame({
  allSelectors = {},
  readyState = "complete",
  selectors = {},
}: {
  allSelectors?: Record<string, unknown[]>;
  readyState?: string;
  selectors?: Record<string, unknown>;
} = {}) {
  const document = {
    readyState,
    getElementById: (selector: string) => selectors[`#${selector}`] ?? null,
    querySelector: (selector: string) => selectors[selector] ?? null,
    querySelectorAll: (selector: string) => allSelectors[selector] ?? [],
  };
  const frameWindow = {
    document,
    focus: vi.fn(),
    scrollBy: vi.fn(),
    setTimeout: vi.fn((callback: () => void) => {
      callback();
      return 1;
    }),
  };

  return {
    contentWindow: frameWindow,
    focus: vi.fn(),
  } as unknown as HTMLIFrameElement;
}

describe("interaction audit frame actions", () => {
  it("reports not-ready frames before inspecting audit surface selectors", () => {
    expect(getAuditSurfaceReadiness("dashboard-360", null)).toEqual({
      ready: false,
      message: "Frame not ready yet.",
    });
    expect(
      getAuditSurfaceReadiness(
        "dashboard-360",
        createFrame({ readyState: "loading" }),
      ),
    ).toEqual({
      ready: false,
      message: "Frame not ready yet.",
    });
  });

  it("checks each audit surface using the same selector contract as the page", () => {
    const action = createElement();

    expect(
      getAuditSurfaceReadiness(
        "dashboard-360",
        createFrame({
          selectors: {
            ".provider-card .text-button": action,
          },
        }),
      ),
    ).toEqual({
      ready: true,
      message: "Frame loaded and ready for audit presets.",
    });

    expect(
      getAuditSurfaceReadiness(
        "settings-420",
        createFrame({
          selectors: {
            ".source-card__details-toggle": action,
            '#settings-sources .source-card [data-settings-material-select^="source-preference"] .material-select__button':
              action,
          },
        }),
      ),
    ).toEqual({
      ready: true,
      message: "Frame loaded and ready for audit presets.",
    });
  });

  it("keeps unsupported preset actions non-mutating and explicit", () => {
    expect(
      runAuditPreset(
        "dashboard-360",
        "missing-action",
        createFrame({
          selectors: {
            ".provider-card .text-button": createElement(),
          },
        }),
      ),
    ).toEqual({
      ok: false,
      message: "Unsupported audit preset.",
    });
  });

  it("finds the popup dashboard action by localized button text", () => {
    const refreshButton = createElement("Refresh");
    const dashboardButton = createElement("打开 dashboard");

    expect(
      runAuditPreset(
        "popup-360",
        "focus-open-dashboard",
        createFrame({
          allSelectors: {
            ".popup-actions .text-button": [refreshButton, dashboardButton],
          },
        }),
      ),
    ).toEqual({
      ok: true,
      message: "Focused the popup dashboard action.",
    });
    expect(refreshButton.focus).not.toHaveBeenCalled();
    expect(dashboardButton.focus).toHaveBeenCalledTimes(1);
  });
});
