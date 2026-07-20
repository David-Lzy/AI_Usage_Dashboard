function normalizeScrollY(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.round(value))
    : null;
}

function normalizeScrollProgress(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(1, Math.max(0, value))
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

function getSurfaceScrollHeight(): number | null {
  if (typeof document === "undefined") {
    return null;
  }

  const candidates = [
    document.scrollingElement?.scrollHeight,
    document.documentElement?.scrollHeight,
    document.body?.scrollHeight,
  ].filter((value): value is number =>
    typeof value === "number" && Number.isFinite(value),
  );

  return candidates.length > 0 ? Math.max(...candidates) : null;
}

function getSurfaceViewportHeight(): number | null {
  const candidates = [
    typeof window !== "undefined" ? window.innerHeight : undefined,
    typeof document !== "undefined" ? document.documentElement?.clientHeight : undefined,
    typeof document !== "undefined" ? document.body?.clientHeight : undefined,
  ].filter((value): value is number =>
    typeof value === "number" && Number.isFinite(value) && value > 0,
  );

  return candidates.length > 0 ? Math.max(...candidates) : null;
}

export function getSurfaceScrollProgress(): number | null {
  const scrollY = getSurfaceScrollY();
  const scrollHeight = getSurfaceScrollHeight();
  const viewportHeight = getSurfaceViewportHeight();

  if (scrollY === null || scrollHeight === null || viewportHeight === null) {
    return null;
  }

  const maxScrollY = scrollHeight - viewportHeight;

  if (maxScrollY <= 0) {
    return null;
  }

  return Math.min(1, Math.max(0, scrollY / maxScrollY));
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

function getScrollYFromProgress(scrollProgress: number): number | null {
  const normalizedProgress = normalizeScrollProgress(scrollProgress);
  const scrollHeight = getSurfaceScrollHeight();
  const viewportHeight = getSurfaceViewportHeight();

  if (
    normalizedProgress === null ||
    scrollHeight === null ||
    viewportHeight === null
  ) {
    return null;
  }

  const maxScrollY = scrollHeight - viewportHeight;

  if (maxScrollY <= 0) {
    return null;
  }

  return Math.round(maxScrollY * normalizedProgress);
}

function findSessionPopoverAnchor(popoverId: string): Element | null {
  if (typeof document === "undefined") {
    return null;
  }

  for (const element of document.querySelectorAll("[data-session-popover-id]")) {
    if (element.getAttribute("data-session-popover-id") === popoverId) {
      return element;
    }
  }

  return null;
}

function waitForLayoutFrame(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(() => resolve());
      return;
    }

    window.setTimeout(resolve, 0);
  });
}

function isAnchorInsideViewport(anchor: Element): boolean {
  if (
    typeof window === "undefined" ||
    typeof anchor.getBoundingClientRect !== "function"
  ) {
    return true;
  }

  const rect = anchor.getBoundingClientRect();

  return rect.bottom > 0 && rect.top < window.innerHeight;
}

export async function restoreSurfacePopoverAnchorAfterLayout(
  popoverId: string,
): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }

  await waitForLayoutFrame();
  await waitForLayoutFrame();

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const anchor = findSessionPopoverAnchor(popoverId);

    if (anchor && typeof anchor.scrollIntoView === "function") {
      anchor.scrollIntoView({
        block: "center",
        inline: "nearest",
        behavior: "auto",
      });
      await waitForLayoutFrame();

      if (isAnchorInsideViewport(anchor)) {
        return true;
      }
    }

    await waitForLayoutFrame();
  }

  return false;
}

export function restoreSurfaceScrollPositionAfterLayout({
  scrollProgress,
  scrollY,
}: {
  scrollProgress: number | null | undefined;
  scrollY: number | null | undefined;
}): Promise<void> {
  const normalizedProgress = normalizeScrollProgress(scrollProgress);

  if (normalizedProgress !== null) {
    const scrollYFromProgress = getScrollYFromProgress(normalizedProgress);

    if (scrollYFromProgress !== null) {
      return restoreSurfaceScrollYAfterLayout(scrollYFromProgress);
    }
  }

  return typeof scrollY === "number"
    ? restoreSurfaceScrollYAfterLayout(scrollY)
    : Promise.resolve();
}
