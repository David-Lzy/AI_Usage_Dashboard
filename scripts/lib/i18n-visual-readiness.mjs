export const MAX_VISUAL_CAPTURE_ATTEMPTS = 2;

const RETRYABLE_CAPTURE_CODES = new Set([
  "capture_nearly_blank",
  "capture_unexpectedly_faded",
  "render_not_ready",
]);

function finiteNumber(value, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

export function assessRenderReadiness(snapshot, expected) {
  const reasons = [];

  if (snapshot.documentReadyState !== "complete") {
    reasons.push(`document:${snapshot.documentReadyState || "unknown"}`);
  }

  if (snapshot.fontsStatus !== "loaded") {
    reasons.push(`fonts:${snapshot.fontsStatus || "unknown"}`);
  }

  if (snapshot.datasetLocale !== expected.locale) {
    reasons.push(
      `locale:${snapshot.datasetLocale || "missing"}!=${expected.locale}`,
    );
  }

  if (snapshot.datasetDirection !== expected.direction) {
    reasons.push(
      `direction:${snapshot.datasetDirection || "missing"}!=${expected.direction}`,
    );
  }

  if (finiteNumber(snapshot.localeFallbackCount) > 0) {
    reasons.push(`locale-fallbacks:${snapshot.localeFallbackCount}`);
  }

  if (finiteNumber(snapshot.visibleReadyRootCount) < 1) {
    reasons.push("ready-root:hidden");
  }

  if (finiteNumber(snapshot.paintedContentCount) < 1) {
    reasons.push("content:not-painted");
  }

  if (finiteNumber(snapshot.activeFiniteAnimationCount) > 0) {
    reasons.push(`animations:${snapshot.activeFiniteAnimationCount}`);
  }

  if ((snapshot.fadedContent ?? []).length > 0) {
    reasons.push(`faded:${snapshot.fadedContent.length}`);
  }

  return {
    ready: reasons.length === 0,
    reasons,
  };
}

export function classifyVisualCapture({
  readiness,
  screenshotByteLength,
}) {
  const issues = [];
  const readinessAssessment = assessRenderReadiness(readiness, {
    locale: readiness.expectedLocale,
    direction: readiness.expectedDirection,
  });
  const contentWidth = Math.max(1, finiteNumber(readiness.contentBounds?.width, 1));
  const contentHeight = Math.max(1, finiteNumber(readiness.contentBounds?.height, 1));
  const bytesPerContentPixel =
    finiteNumber(screenshotByteLength) / (contentWidth * contentHeight);

  if (readiness.timedOut || !readinessAssessment.ready) {
    issues.push({
      code: "render_not_ready",
      cause: "render-readiness",
      message: `Render readiness did not settle: ${readinessAssessment.reasons.join(", ") || "timeout"}.`,
    });
  }

  if ((readiness.fadedContent ?? []).length > 0) {
    issues.push({
      code: "capture_unexpectedly_faded",
      cause: readiness.fadedContent.slice(0, 4).join(", "),
      message: `${readiness.fadedContent.length} expected content regions remained faded at capture time.`,
    });
  }

  const noPaintedContent = finiteNumber(readiness.paintedContentCount) < 1;
  const noVisibleCopy = finiteNumber(readiness.visibleTextLength) < 1;
  const extremelyLowImageSignal = bytesPerContentPixel < 0.025;

  if (noPaintedContent || noVisibleCopy || extremelyLowImageSignal) {
    issues.push({
      code: "capture_nearly_blank",
      cause: "capture-content-signal",
      message: [
        "Screenshot content signal is nearly blank",
        `painted=${finiteNumber(readiness.paintedContentCount)}`,
        `text=${finiteNumber(readiness.visibleTextLength)}`,
        `bytes-per-content-pixel=${bytesPerContentPixel.toFixed(4)}`,
      ].join("; "),
    });
  }

  return {
    bytesPerContentPixel,
    issues,
    readinessAssessment,
  };
}

export function shouldRetryVisualCapture(attempt, issues) {
  return (
    attempt < MAX_VISUAL_CAPTURE_ATTEMPTS &&
    issues.some((issue) => RETRYABLE_CAPTURE_CODES.has(issue.code))
  );
}

export function groupVisualIssues(issueEntries) {
  const groups = new Map();

  for (const issue of issueEntries) {
    const cause = issue.cause || issue.code;
    const key = `${issue.code}::${cause}`;
    const existing = groups.get(key) ?? {
      code: issue.code,
      cause,
      count: 0,
      routes: new Set(),
      locales: new Set(),
      widths: new Set(),
    };

    existing.count += 1;
    existing.routes.add(issue.route);
    existing.locales.add(issue.locale);
    existing.widths.add(issue.width);
    groups.set(key, existing);
  }

  return [...groups.values()]
    .map((group) => ({
      code: group.code,
      cause: group.cause,
      count: group.count,
      routes: [...group.routes].sort(),
      locales: [...group.locales].sort(),
      widths: [...group.widths].sort((left, right) => left - right),
    }))
    .sort(
      (left, right) =>
        right.count - left.count ||
        left.code.localeCompare(right.code) ||
        left.cause.localeCompare(right.cause),
    );
}
