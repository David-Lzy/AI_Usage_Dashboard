import type { KeyboardEvent, PointerEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import type { ResolvedTextDirection } from "../../shared/i18n";

export type ProviderCarouselItem = {
  id: string;
  label: string;
  content: ReactNode;
};

type ProviderCarouselMove = "previous" | "next";

type ProviderCarouselProps = {
  ariaLabel: string;
  items: ProviderCarouselItem[];
  emptyState?: ReactNode;
  initialIndex?: number;
  textDirection?: ResolvedTextDirection;
  onActiveItemChange?: (item: ProviderCarouselItem, index: number) => void;
};

export const PROVIDER_CAROUSEL_DRAG_THRESHOLD_PX = 44;

export function clampProviderCarouselIndex(
  index: number,
  itemCount: number,
): number {
  if (itemCount <= 0) {
    return 0;
  }

  return Math.min(Math.max(index, 0), itemCount - 1);
}

export function getNextProviderCarouselIndex(
  currentIndex: number,
  move: ProviderCarouselMove,
  itemCount: number,
): number {
  if (itemCount <= 1) {
    return 0;
  }

  const directionOffset = move === "next" ? 1 : -1;
  return (currentIndex + directionOffset + itemCount) % itemCount;
}

export function getProviderCarouselKeyboardMove(
  key: string,
  textDirection: ResolvedTextDirection = "ltr",
): ProviderCarouselMove | null {
  if (key !== "ArrowLeft" && key !== "ArrowRight") {
    return null;
  }

  if (textDirection === "rtl") {
    return key === "ArrowLeft" ? "next" : "previous";
  }

  return key === "ArrowRight" ? "next" : "previous";
}

export function getProviderCarouselDragMove(
  deltaX: number,
  textDirection: ResolvedTextDirection = "ltr",
  thresholdPx: number = PROVIDER_CAROUSEL_DRAG_THRESHOLD_PX,
): ProviderCarouselMove | null {
  if (Math.abs(deltaX) < thresholdPx) {
    return null;
  }

  const draggedTowardInlineEnd =
    textDirection === "rtl" ? deltaX < 0 : deltaX > 0;
  return draggedTowardInlineEnd ? "previous" : "next";
}

export function ProviderCarousel({
  ariaLabel,
  emptyState = null,
  initialIndex = 0,
  items,
  textDirection = "ltr",
  onActiveItemChange,
}: ProviderCarouselProps) {
  const itemCount = items.length;
  const [activeIndex, setActiveIndex] = useState(() =>
    clampProviderCarouselIndex(initialIndex, itemCount),
  );
  const pointerStartXRef = useRef<number | null>(null);
  const activeItem = items[activeIndex] ?? null;
  const hasMultipleItems = itemCount > 1;

  useEffect(() => {
    setActiveIndex(clampProviderCarouselIndex(initialIndex, itemCount));
  }, [initialIndex, itemCount]);

  useEffect(() => {
    if (activeItem) {
      onActiveItemChange?.(activeItem, activeIndex);
    }
  }, [activeIndex, activeItem, onActiveItemChange]);

  function moveCarousel(move: ProviderCarouselMove) {
    setActiveIndex((currentIndex) =>
      getNextProviderCarouselIndex(currentIndex, move, itemCount),
    );
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) {
      return;
    }

    const move = getProviderCarouselKeyboardMove(event.key, textDirection);

    if (!move || !hasMultipleItems) {
      return;
    }

    event.preventDefault();
    moveCarousel(move);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!hasMultipleItems) {
      return;
    }

    pointerStartXRef.current = event.clientX;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (pointerStartXRef.current === null) {
      return;
    }

    const move = getProviderCarouselDragMove(
      event.clientX - pointerStartXRef.current,
      textDirection,
    );
    pointerStartXRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);

    if (move) {
      moveCarousel(move);
    }
  }

  function handlePointerCancel(event: PointerEvent<HTMLDivElement>) {
    pointerStartXRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }

  if (itemCount === 0) {
    return (
      <div
        className="provider-carousel provider-carousel--empty"
        role="region"
        aria-label={ariaLabel}
        aria-roledescription="carousel"
        data-provider-carousel=""
        data-provider-carousel-count="0"
      >
        {emptyState}
      </div>
    );
  }

  return (
    <div
      className="provider-carousel"
      role="region"
      aria-label={ariaLabel}
      aria-roledescription="carousel"
      data-provider-carousel=""
      data-provider-carousel-count={itemCount}
      data-provider-carousel-direction={textDirection}
      data-provider-carousel-active-id={activeItem?.id}
    >
      <div className="provider-carousel__header">
        {hasMultipleItems ? (
          <div className="provider-carousel__controls">
            <button
              className="provider-carousel__button"
              type="button"
              aria-label="Previous provider"
              data-provider-carousel-action="previous"
              onClick={() => moveCarousel("previous")}
            >
              <span aria-hidden="true">‹</span>
            </button>
            <button
              className="provider-carousel__button"
              type="button"
              aria-label="Next provider"
              data-provider-carousel-action="next"
              onClick={() => moveCarousel("next")}
            >
              <span aria-hidden="true">›</span>
            </button>
          </div>
        ) : null}
        <p className="provider-carousel__status" aria-live="polite" dir="auto">
          {`${activeIndex + 1} / ${itemCount} · ${activeItem?.label ?? ""}`}
        </p>
      </div>

      <div
        className="provider-carousel__viewport"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <div
          className="provider-carousel__track"
          style={{
            transform: `translateX(${activeIndex * (textDirection === "rtl" ? 86 : -86)}%)`,
          }}
        >
          {items.map((item, index) => (
            <div
              key={item.id}
              className="provider-carousel__slide"
              role="group"
              aria-label={`${index + 1} of ${itemCount}: ${item.label}`}
              aria-roledescription="slide"
              data-provider-carousel-slide={item.id}
              data-provider-carousel-slide-active={
                index === activeIndex ? "true" : "false"
              }
            >
              {item.content}
            </div>
          ))}
        </div>
      </div>

      {hasMultipleItems ? (
        <div className="provider-carousel__dots" aria-label="Provider slides">
          {items.map((item, index) => (
            <button
              key={item.id}
              className="provider-carousel__dot"
              type="button"
              aria-label={`Show ${item.label}`}
              aria-current={index === activeIndex ? "true" : undefined}
              data-provider-carousel-dot={item.id}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
