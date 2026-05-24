function normalizeScrollY(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.round(value))
    : null;
}

function getDocumentScrollCandidates(): number[] {
  if (typeof document === "undefined") {
    return [];
  }

  return [
    document.scrollingElement?.scrollTop,
    document.documentElement?.scrollTop,
    document.body?.scrollTop,
  ].flatMap((value) => {
    const normalized = normalizeScrollY(value);
    return normalized === null ? [] : [normalized];
  });
}

export function getSurfaceScrollY(): number | null {
  const candidates = [
    typeof window !== "undefined" ? window.scrollY : undefined,
    ...getDocumentScrollCandidates(),
  ].flatMap((value) => {
    const normalized = normalizeScrollY(value);
    return normalized === null ? [] : [normalized];
  });

  if (candidates.length === 0) {
    return null;
  }

  return Math.max(...candidates);
}

function setDocumentScrollY(scrollY: number): void {
  if (typeof document === "undefined") {
    return;
  }

  const scrollTargets = [
    document.scrollingElement,
    document.documentElement,
    document.body,
  ].filter(
    (target, index, targets): target is Element =>
      target !== null && target !== undefined && targets.indexOf(target) === index,
  );

  for (const target of scrollTargets) {
    target.scrollTop = scrollY;
  }
}

function applySurfaceScrollY(scrollY: number): void {
  if (typeof window !== "undefined") {
    window.scrollTo({
      top: scrollY,
      behavior: "auto",
    });
  }

  setDocumentScrollY(scrollY);
}

export function restoreSurfaceScrollYAfterLayout(
  scrollY: number,
): Promise<void> {
  const normalizedScrollY = normalizeScrollY(scrollY);

  if (normalizedScrollY === null || typeof window === "undefined") {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const scrollToPosition = () => {
      applySurfaceScrollY(normalizedScrollY);
      resolve();
    };

    if (typeof window.requestAnimationFrame !== "function") {
      window.setTimeout(scrollToPosition, 0);
      return;
    }

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(scrollToPosition);
    });
  });
}
