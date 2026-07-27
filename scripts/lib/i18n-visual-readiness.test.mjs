import { describe, expect, it } from "vitest";

import {
  MAX_VISUAL_CAPTURE_ATTEMPTS,
  assessRenderReadiness,
  classifyVisualCapture,
  groupVisualIssues,
  shouldRetryVisualCapture,
} from "./i18n-visual-readiness.mjs";

function readySnapshot(overrides = {}) {
  return {
    documentReadyState: "complete",
    fontsStatus: "loaded",
    datasetLocale: "de",
    datasetDirection: "ltr",
    localeFallbackCount: 0,
    visibleReadyRootCount: 1,
    paintedContentCount: 4,
    activeFiniteAnimationCount: 0,
    fadedContent: [],
    visibleTextLength: 180,
    contentBounds: { width: 360, height: 900 },
    expectedLocale: "de",
    expectedDirection: "ltr",
    timedOut: false,
    ...overrides,
  };
}

describe("i18n visual readiness", () => {
  it("accepts a stable localized render", () => {
    expect(
      assessRenderReadiness(readySnapshot(), {
        locale: "de",
        direction: "ltr",
      }),
    ).toEqual({ ready: true, reasons: [] });
  });

  it("reports readiness timeout and unexpectedly faded content", () => {
    const result = classifyVisualCapture({
      readiness: readySnapshot({
        timedOut: true,
        activeFiniteAnimationCount: 1,
        fadedContent: ["section.provider-card"],
      }),
      screenshotByteLength: 60_000,
    });

    expect(result.issues.map((issue) => issue.code)).toEqual([
      "render_not_ready",
      "capture_unexpectedly_faded",
    ]);
  });

  it("detects a nearly blank frame even when dimensions are valid", () => {
    const result = classifyVisualCapture({
      readiness: readySnapshot({
        paintedContentCount: 0,
        visibleTextLength: 0,
      }),
      screenshotByteLength: 2_000,
    });

    expect(result.issues.some((issue) => issue.code === "capture_nearly_blank")).toBe(
      true,
    );
  });

  it("bounds retry to one additional capture", () => {
    const issues = [{ code: "render_not_ready" }];

    expect(MAX_VISUAL_CAPTURE_ATTEMPTS).toBe(2);
    expect(shouldRetryVisualCapture(1, issues)).toBe(true);
    expect(shouldRetryVisualCapture(2, issues)).toBe(false);
  });

  it("groups repeated failures by semantic cause", () => {
    expect(
      groupVisualIssues([
        {
          route: "settings",
          locale: "de",
          width: 360,
          code: "clipped_control_text",
          cause: "button.settings-nav-chip",
        },
        {
          route: "settings",
          locale: "ru",
          width: 430,
          code: "clipped_control_text",
          cause: "button.settings-nav-chip",
        },
      ]),
    ).toEqual([
      {
        code: "clipped_control_text",
        cause: "button.settings-nav-chip",
        count: 2,
        routes: ["settings"],
        locales: ["de", "ru"],
        widths: [360, 430],
      },
    ]);
  });
});
