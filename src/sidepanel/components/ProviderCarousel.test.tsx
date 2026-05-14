import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  ProviderCarousel,
  clampProviderCarouselIndex,
  getNextProviderCarouselIndex,
  getProviderCarouselDragMove,
  getProviderCarouselKeyboardMove,
  getProviderCarouselSlidePosition,
} from "./ProviderCarousel";

const sampleItems = [
  {
    id: "cursor",
    label: "Cursor",
    content: <article data-provider-card="cursor">Cursor card</article>,
  },
  {
    id: "claude-code",
    label: "Claude Code",
    content: <article data-provider-card="claude-code">Claude card</article>,
  },
  {
    id: "codex",
    label: "Codex",
    content: <article data-provider-card="codex">Codex card</article>,
  },
];

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
    expect(html).toContain('data-provider-carousel-active-id="claude-code"');
    expect(html).toContain('data-provider-carousel-action="previous"');
    expect(html).toContain('data-provider-carousel-action="next"');
    expect(html).toContain('tabindex="0"');
    expect(html).toContain("2 / 3 · Claude Code");
    expect(html).toContain('data-provider-carousel-slide="cursor"');
    expect(html).toContain(
      'data-provider-carousel-slide-position="previous"',
    );
    expect(html).toContain('data-provider-carousel-slide-active="false"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("inert=");
    expect(html).toContain('data-provider-carousel-dot="codex"');
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

  it("marks only the active and neighboring slides as visible layers", () => {
    expect(getProviderCarouselSlidePosition(2, 2, 5)).toBe("active");
    expect(getProviderCarouselSlidePosition(1, 2, 5)).toBe("previous");
    expect(getProviderCarouselSlidePosition(3, 2, 5)).toBe("next");
    expect(getProviderCarouselSlidePosition(0, 2, 5)).toBe("hidden");
    expect(getProviderCarouselSlidePosition(4, 0, 5)).toBe("previous");
    expect(getProviderCarouselSlidePosition(1, 0, 5)).toBe("next");
    expect(getProviderCarouselSlidePosition(1, 0, 2)).toBe("next");
  });
});
