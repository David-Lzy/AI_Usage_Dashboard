import { readFileSync } from "node:fs";

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  PROVIDER_CAROUSEL_INTERACTIVE_SELECTOR,
  ProviderCarousel,
  clampProviderCarouselIndex,
  getNextProviderCarouselIndex,
  getProviderCarouselDragMove,
  getProviderCarouselKeyboardMove,
  getProviderCarouselSlidePosition,
  isProviderCarouselInteractiveTarget,
} from "./ProviderCarousel";

const sampleItems = [
  {
    id: "cursor-personal-page",
    label: "Cursor",
    content: <article data-provider-card="cursor-personal-page">Cursor card</article>,
  },
  {
    id: "claude-code-team-page",
    label: "Claude Code",
    content: <article data-provider-card="claude-code-team-page">Claude card</article>,
  },
  {
    id: "codex-personal-page",
    label: "Codex",
    content: <article data-provider-card="codex-personal-page">Codex card</article>,
  },
];

const providerCarouselCss = readFileSync(
  new URL("../theme/provider-carousel.css", import.meta.url),
  "utf8",
);
const providerCarouselSource = readFileSync(
  new URL("./ProviderCarousel.tsx", import.meta.url),
  "utf8",
);

describe("ProviderCarousel", () => {
  it("renders arbitrary provider cards with controls, status, and dots", () => {
    const html = renderToStaticMarkup(
      <ProviderCarousel
        ariaLabel="Quick setup providers"
        items={sampleItems}
        initialIndex={1}
      />,
    );

    expect(html).toContain('data-provider-carousel=""');
    expect(html).toContain('aria-roledescription="carousel"');
    expect(html).toContain('data-provider-carousel-count="3"');
    expect(html).toContain('data-provider-carousel-active-id="claude-code-team-page"');
    expect(html).toContain('data-provider-carousel-action="previous"');
    expect(html).toContain('data-provider-carousel-action="next"');
    expect(html).toContain('data-material-icon="keyboard-arrow-left"');
    expect(html).toContain('data-material-icon="keyboard-arrow-right"');
    expect(html).toContain('tabindex="0"');
    expect(html).toContain("2 / 3 · Claude Code");
    expect(html).toContain('data-provider-carousel-slide="cursor-personal-page"');
    expect(html).toContain(
      'data-provider-carousel-slide-position="previous"',
    );
    expect(html).toContain('data-provider-carousel-slide-active="false"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("inert=");
    expect(html).toContain('data-provider-carousel-dot="codex-personal-page"');
    expect(html).toContain('aria-current="true"');
  });

  it("renders an empty state without inactive controls", () => {
    const html = renderToStaticMarkup(
      <ProviderCarousel
        ariaLabel="Empty providers"
        items={[]}
        emptyState={<p>No providers</p>}
      />,
    );

    expect(html).toContain('data-provider-carousel-count="0"');
    expect(html).toContain("No providers");
    expect(html).not.toContain("Previous provider");
    expect(html).not.toContain("Next provider");
  });

  it("wraps button movement while clamping invalid initial indexes", () => {
    expect(clampProviderCarouselIndex(8, 3)).toBe(2);
    expect(clampProviderCarouselIndex(-2, 3)).toBe(0);
    expect(getNextProviderCarouselIndex(0, "previous", 3)).toBe(2);
    expect(getNextProviderCarouselIndex(2, "next", 3)).toBe(0);
    expect(getNextProviderCarouselIndex(0, "next", 1)).toBe(0);
  });

  it("maps keyboard arrows for LTR and RTL surfaces", () => {
    expect(getProviderCarouselKeyboardMove("ArrowRight", "ltr")).toBe("next");
    expect(getProviderCarouselKeyboardMove("ArrowLeft", "ltr")).toBe(
      "previous",
    );
    expect(getProviderCarouselKeyboardMove("ArrowRight", "rtl")).toBe(
      "previous",
    );
    expect(getProviderCarouselKeyboardMove("ArrowLeft", "rtl")).toBe("next");
    expect(getProviderCarouselKeyboardMove("Home", "ltr")).toBeNull();
  });

  it("uses the drag threshold before changing slides", () => {
    expect(getProviderCarouselDragMove(-43, "ltr")).toBeNull();
    expect(getProviderCarouselDragMove(-44, "ltr")).toBe("next");
    expect(getProviderCarouselDragMove(44, "ltr")).toBe("previous");
    expect(getProviderCarouselDragMove(-44, "rtl")).toBe("previous");
    expect(getProviderCarouselDragMove(44, "rtl")).toBe("next");
  });

  it("does not start drag gestures from interactive card controls", () => {
    const closest = vi.fn((selector: string) =>
      selector === PROVIDER_CAROUSEL_INTERACTIVE_SELECTOR ? {} : null,
    );

    expect(
      isProviderCarouselInteractiveTarget({
        closest,
      } as unknown as EventTarget),
    ).toBe(true);
    expect(closest).toHaveBeenCalledWith(
      PROVIDER_CAROUSEL_INTERACTIVE_SELECTOR,
    );
    expect(
      isProviderCarouselInteractiveTarget({
        parentElement: { closest },
      } as unknown as EventTarget),
    ).toBe(true);
    expect(isProviderCarouselInteractiveTarget(null)).toBe(false);
    expect(isProviderCarouselInteractiveTarget({} as EventTarget)).toBe(false);
  });

  it("marks only the active and neighboring slides as visible layers", () => {
    expect(getProviderCarouselSlidePosition(2, 2, 5)).toBe("active");
    expect(getProviderCarouselSlidePosition(1, 2, 5)).toBe("previous");
    expect(getProviderCarouselSlidePosition(3, 2, 5)).toBe("next");
    expect(getProviderCarouselSlidePosition(0, 2, 5)).toBe("hidden");
    expect(getProviderCarouselSlidePosition(4, 0, 5)).toBe("previous");
    expect(getProviderCarouselSlidePosition(1, 0, 5)).toBe("next");
    expect(getProviderCarouselSlidePosition(1, 0, 2)).toBe("next");
  });

  it("uses capped local motion tokens and preserves reduced-motion escape", () => {
    expect(providerCarouselCss).toContain(
      "--provider-carousel-motion-duration: 560ms;",
    );
    expect(providerCarouselCss).toContain(
      "--provider-carousel-depth-offset: clamp(44px, 5vw, 96px);",
    );
    expect(providerCarouselCss).toContain(
      "--provider-carousel-depth-offset: clamp(28px, 8vw, 44px);",
    );
    expect(providerCarouselCss).toContain(".provider-carousel__button .material-icon");
    expect(providerCarouselCss).toContain(
      "@media (prefers-reduced-motion: reduce)",
    );
    expect(providerCarouselCss).toContain("transition: none;");
  });

  it("keeps the active item effect keyed by stable identity", () => {
    expect(providerCarouselSource).toContain(
      "const activeItemId = activeItem?.id ?? null;",
    );
    expect(providerCarouselSource).toContain(
      "}, [activeIndex, activeItemId, onActiveItemChange]);",
    );
    expect(providerCarouselSource).not.toContain(
      "}, [activeIndex, activeItem, onActiveItemChange]);",
    );
  });
});
