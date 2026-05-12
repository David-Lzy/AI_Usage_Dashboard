type AuditFrameReadiness = {
  ready: boolean;
  message: string;
};

type AuditPresetResult = {
  ok: boolean;
  message: string;
};

function isHtmlElementLike(value: unknown): value is HTMLElement {
  return Boolean(
    value &&
      typeof value === "object" &&
      "nodeType" in value &&
      value.nodeType === 1 &&
      "scrollIntoView" in value &&
      typeof value.scrollIntoView === "function" &&
      "focus" in value &&
      typeof value.focus === "function",
  );
}

function isHtmlDetailsElementLike(value: unknown): value is HTMLDetailsElement {
  return (
    isHtmlElementLike(value) &&
    "tagName" in value &&
    String(value.tagName).toUpperCase() === "DETAILS" &&
    "open" in value
  );
}

function getFrameContext(frame: HTMLIFrameElement | null): {
  document: Document;
  window: Window;
} | null {
  const frameWindow = frame?.contentWindow;
  const frameDocument = frameWindow?.document;

  if (!frameWindow || !frameDocument || frameDocument.readyState !== "complete") {
    return null;
  }

  return {
    document: frameDocument,
    window: frameWindow,
  };
}

function focusFrameElement(
  frame: HTMLIFrameElement | null,
  selector: string,
): HTMLElement | null {
  const frameContext = getFrameContext(frame);

  if (!frameContext) {
    return null;
  }

  const element = frameContext.document.querySelector(selector);

  if (!isHtmlElementLike(element)) {
    return null;
  }

  frameContext.document
    .querySelectorAll("[data-audit-preset-target='true']")
    .forEach((current) => {
      current.removeAttribute("data-audit-preset-target");
    });
  element.setAttribute("data-audit-preset-target", "true");

  window.setTimeout(() => {
    frame?.focus();
    frameContext.window.focus();
    element.scrollIntoView({
      block: "center",
      inline: "nearest",
    });
    element.focus();
  }, 0);

  return element;
}

export function getAuditSurfaceReadiness(
  surfaceId: string,
  frame: HTMLIFrameElement | null,
): AuditFrameReadiness {
  const frameContext = getFrameContext(frame);

  if (!frameContext) {
    return {
      ready: false,
      message: "Frame not ready yet.",
    };
  }

  const { document } = frameContext;

  switch (surfaceId) {
    case "dashboard-360":
      return document.querySelector(".provider-card .text-button")
        ? {
            ready: true,
            message: "Frame loaded and ready for audit presets.",
          }
        : {
            ready: false,
            message: "Frame loaded. Waiting for dashboard provider actions.",
          };
    case "settings-420":
      return document.querySelector(".source-card__details-toggle") &&
        document.querySelector(
          '#settings-sources .source-card [data-settings-material-select^="source-preference"] .material-select__button',
        )
        ? {
            ready: true,
            message: "Frame loaded and ready for audit presets.",
          }
        : {
            ready: false,
            message: "Frame loaded. Waiting for Settings source controls.",
          };
    case "cursor-detail-360":
    case "codex-detail-420":
      return document.querySelector(".detail-note")
        ? {
            ready: true,
            message: "Frame loaded and ready for audit presets.",
          }
        : {
            ready: false,
            message: "Frame loaded. Waiting for provider detail notes.",
          };
    case "popup-360":
      return document.querySelector(".popup-actions .text-button") &&
        document.querySelector(".popup-provider-card .text-button")
        ? {
            ready: true,
            message: "Frame loaded and ready for audit presets.",
          }
        : {
            ready: false,
            message: "Frame loaded. Waiting for popup actions.",
          };
    default:
      return {
        ready: true,
        message: "Frame loaded and ready for audit presets.",
      };
  }
}

export function runAuditPreset(
  surfaceId: string,
  actionId: string,
  frame: HTMLIFrameElement | null,
): AuditPresetResult {
  const frameContext = getFrameContext(frame);

  if (!frameContext) {
    return {
      ok: false,
      message: "Frame not ready yet.",
    };
  }

  const { document, window } = frameContext;

  switch (`${surfaceId}:${actionId}`) {
    case "dashboard-360:focus-first-provider-open": {
      const openButton = focusFrameElement(frame, ".provider-card .text-button");

      if (!openButton) {
        return {
          ok: false,
          message: "Could not find the first provider action.",
        };
      }

      return {
        ok: true,
        message: "Focused the first provider action button.",
      };
    }
    case "settings-420:open-first-diagnostics": {
      document.getElementById("settings-sources")?.scrollIntoView({
        block: "start",
      });

      const details = document.querySelector(".source-card__details");

      if (!isHtmlDetailsElementLike(details)) {
        return {
          ok: false,
          message: "Could not find a source diagnostics disclosure.",
        };
      }

      details.open = true;

      const toggle = details.querySelector(".source-card__details-toggle");

      if (isHtmlElementLike(toggle)) {
        document
          .querySelectorAll("[data-audit-preset-target='true']")
          .forEach((current) => {
            current.removeAttribute("data-audit-preset-target");
          });
        toggle.setAttribute("data-audit-preset-target", "true");
        window.setTimeout(() => {
          frame?.focus();
          frameContext.window.focus();
          toggle.focus();
        }, 0);
      }

      return {
        ok: true,
        message: "Opened the first source diagnostics disclosure.",
      };
    }
    case "settings-420:focus-first-source-preference": {
      document.getElementById("settings-sources")?.scrollIntoView({
        block: "start",
      });

      const select = focusFrameElement(
        frame,
        '#settings-sources .source-card [data-settings-material-select^="source-preference"] .material-select__button',
      );

      if (!select) {
        return {
          ok: false,
          message: "Could not find a source-preference material select.",
        };
      }

      return {
        ok: true,
        message: "Focused the first source-preference material select.",
      };
    }
    case "cursor-detail-360:jump-first-note":
    case "codex-detail-420:jump-first-note": {
      const firstNote = document.querySelector(".detail-note");

      if (!isHtmlElementLike(firstNote)) {
        return {
          ok: false,
          message: "Could not find a detail note block.",
        };
      }

      firstNote.scrollIntoView({
        block: "center",
        inline: "nearest",
      });
      window.scrollBy({
        top: -24,
      });

      return {
        ok: true,
        message: "Scrolled the detail frame to the first note block.",
      };
    }
    case "popup-360:focus-open-dashboard": {
      const quickActions = Array.from(
        document.querySelectorAll(".popup-actions .text-button"),
      );
      const dashboardButton = quickActions.find((button) => {
        const text = button.textContent ?? "";

        return text.includes("Open dashboard") || text.includes("打开 dashboard");
      });

      if (!isHtmlElementLike(dashboardButton)) {
        return {
          ok: false,
          message: "Could not find the popup dashboard action.",
        };
      }

      dashboardButton.scrollIntoView({
        block: "center",
        inline: "nearest",
      });
      dashboardButton.focus();

      return {
        ok: true,
        message: "Focused the popup dashboard action.",
      };
    }
    case "popup-360:focus-first-detail": {
      const detailButton = focusFrameElement(
        frame,
        ".popup-provider-card .text-button",
      );

      if (!detailButton) {
        return {
          ok: false,
          message: "Could not find the featured-provider detail action.",
        };
      }

      return {
        ok: true,
        message: "Focused the first featured-provider detail action.",
      };
    }
    default:
      return {
        ok: false,
        message: "Unsupported audit preset.",
      };
  }
}
