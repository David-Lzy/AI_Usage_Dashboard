export type AuditFrameReadinessCode =
  | "frame_not_ready"
  | "ready"
  | "waiting_dashboard_provider_actions"
  | "waiting_settings_source_controls"
  | "waiting_provider_detail_notes"
  | "waiting_popup_actions";

export type AuditPresetResultCode =
  | "frame_not_ready"
  | "focused_first_provider_action"
  | "missing_first_provider_action"
  | "opened_first_source_diagnostics"
  | "missing_source_diagnostics_disclosure"
  | "focused_source_preference"
  | "missing_source_preference_select"
  | "scrolled_first_detail_note"
  | "missing_detail_note"
  | "focused_popup_dashboard_action"
  | "missing_popup_dashboard_action"
  | "focused_featured_provider_detail_action"
  | "missing_featured_provider_detail_action"
  | "unsupported_audit_preset";

export type AuditFrameReadiness = {
  ready: boolean;
  code: AuditFrameReadinessCode;
  message: string;
  rawMessage?: string;
};

export type AuditPresetResult = {
  ok: boolean;
  code: AuditPresetResultCode;
  message: string;
  rawMessage?: string;
};

function frameReadiness(
  code: AuditFrameReadinessCode,
  ready: boolean,
  message: string,
  rawMessage?: string,
): AuditFrameReadiness {
  return {
    ready,
    code,
    message,
    ...(rawMessage ? { rawMessage } : {}),
  };
}

function presetResult(
  code: AuditPresetResultCode,
  ok: boolean,
  message: string,
  rawMessage?: string,
): AuditPresetResult {
  return {
    ok,
    code,
    message,
    ...(rawMessage ? { rawMessage } : {}),
  };
}

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
    return frameReadiness("frame_not_ready", false, "Frame not ready yet.");
  }

  const { document } = frameContext;

  switch (surfaceId) {
    case "dashboard-360":
      return document.querySelector(".provider-card .text-button")
        ? frameReadiness(
            "ready",
            true,
            "Frame loaded and ready for audit presets.",
          )
        : frameReadiness(
            "waiting_dashboard_provider_actions",
            false,
            "Frame loaded. Waiting for dashboard provider actions.",
            "Missing selector .provider-card .text-button for dashboard-360 readiness.",
          );
    case "settings-420":
      return document.querySelector(".source-card__details-toggle") &&
        document.querySelector(
          '#settings-sources .source-card [data-settings-material-select^="source-preference"] .material-select__button',
        )
        ? frameReadiness(
            "ready",
            true,
            "Frame loaded and ready for audit presets.",
          )
        : frameReadiness(
            "waiting_settings_source_controls",
            false,
            "Frame loaded. Waiting for Settings source controls.",
            "Missing Settings source disclosure or source-preference material select for settings-420 readiness.",
          );
    case "cursor-detail-360":
    case "codex-detail-420":
      return document.querySelector(".detail-note")
        ? frameReadiness(
            "ready",
            true,
            "Frame loaded and ready for audit presets.",
          )
        : frameReadiness(
            "waiting_provider_detail_notes",
            false,
            "Frame loaded. Waiting for provider detail notes.",
            `Missing selector .detail-note for ${surfaceId} readiness.`,
          );
    case "popup-360":
      return document.querySelector(".popup-actions .text-button") &&
        document.querySelector(".popup-provider-card .text-button")
        ? frameReadiness(
            "ready",
            true,
            "Frame loaded and ready for audit presets.",
          )
        : frameReadiness(
            "waiting_popup_actions",
            false,
            "Frame loaded. Waiting for popup actions.",
            "Missing popup action or featured-provider detail button for popup-360 readiness.",
          );
    default:
      return frameReadiness(
        "ready",
        true,
        "Frame loaded and ready for audit presets.",
      );
  }
}

export function runAuditPreset(
  surfaceId: string,
  actionId: string,
  frame: HTMLIFrameElement | null,
): AuditPresetResult {
  const frameContext = getFrameContext(frame);

  if (!frameContext) {
    return presetResult("frame_not_ready", false, "Frame not ready yet.");
  }

  const { document, window } = frameContext;

  switch (`${surfaceId}:${actionId}`) {
    case "dashboard-360:focus-first-provider-open": {
      const openButton = focusFrameElement(frame, ".provider-card .text-button");

      if (!openButton) {
        return presetResult(
          "missing_first_provider_action",
          false,
          "Could not find the first provider action.",
          "Missing selector .provider-card .text-button for dashboard-360:focus-first-provider-open.",
        );
      }

      return presetResult(
        "focused_first_provider_action",
        true,
        "Focused the first provider action button.",
      );
    }
    case "settings-420:open-first-diagnostics": {
      document.getElementById("settings-sources")?.scrollIntoView({
        block: "start",
      });

      const details = document.querySelector(".source-card__details");

      if (!isHtmlDetailsElementLike(details)) {
        return presetResult(
          "missing_source_diagnostics_disclosure",
          false,
          "Could not find a source diagnostics disclosure.",
          "Missing selector .source-card__details for settings-420:open-first-diagnostics.",
        );
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

      return presetResult(
        "opened_first_source_diagnostics",
        true,
        "Opened the first source diagnostics disclosure.",
      );
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
        return presetResult(
          "missing_source_preference_select",
          false,
          "Could not find a source-preference material select.",
          "Missing selector #settings-sources .source-card [data-settings-material-select^=\"source-preference\"] .material-select__button for settings-420:focus-first-source-preference.",
        );
      }

      return presetResult(
        "focused_source_preference",
        true,
        "Focused the first source-preference material select.",
      );
    }
    case "cursor-detail-360:jump-first-note":
    case "codex-detail-420:jump-first-note": {
      const firstNote = document.querySelector(".detail-note");

      if (!isHtmlElementLike(firstNote)) {
        return presetResult(
          "missing_detail_note",
          false,
          "Could not find a detail note block.",
          `Missing selector .detail-note for ${surfaceId}:jump-first-note.`,
        );
      }

      firstNote.scrollIntoView({
        block: "center",
        inline: "nearest",
      });
      window.scrollBy({
        top: -24,
      });

      return presetResult(
        "scrolled_first_detail_note",
        true,
        "Scrolled the detail frame to the first note block.",
      );
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
        return presetResult(
          "missing_popup_dashboard_action",
          false,
          "Could not find the popup dashboard action.",
          "Missing localized dashboard action text inside .popup-actions .text-button for popup-360:focus-open-dashboard.",
        );
      }

      dashboardButton.scrollIntoView({
        block: "center",
        inline: "nearest",
      });
      dashboardButton.focus();

      return presetResult(
        "focused_popup_dashboard_action",
        true,
        "Focused the popup dashboard action.",
      );
    }
    case "popup-360:focus-first-detail": {
      const detailButton = focusFrameElement(
        frame,
        ".popup-provider-card .text-button",
      );

      if (!detailButton) {
        return presetResult(
          "missing_featured_provider_detail_action",
          false,
          "Could not find the featured-provider detail action.",
          "Missing selector .popup-provider-card .text-button for popup-360:focus-first-detail.",
        );
      }

      return presetResult(
        "focused_featured_provider_detail_action",
        true,
        "Focused the first featured-provider detail action.",
      );
    }
    default:
      return presetResult(
        "unsupported_audit_preset",
        false,
        "Unsupported audit preset.",
        `Unsupported audit preset ${surfaceId}:${actionId}.`,
      );
  }
}
