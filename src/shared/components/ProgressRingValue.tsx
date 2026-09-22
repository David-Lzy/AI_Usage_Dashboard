import { useLayoutEffect, useRef } from "react";

/** Keep localized words inside the ring without resizing the quota layout. */
export function ProgressRingValue({ value, className, inset }: {
  value: string;
  className: string;
  inset: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const element = ref.current;
    const parent = element?.parentElement;
    if (!element || !parent) return;
    function fit() {
      if (!element || !parent) return;
      element.style.fontSize = "";
      const fontSize = Number.parseFloat(getComputedStyle(element).fontSize);
      const available = Math.max(1, parent.clientWidth - inset * 2);
      const natural = element.scrollWidth;
      if (natural > available) element.style.fontSize = `${fontSize * available / natural}px`;
    }
    fit();
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(fit) : null;
    observer?.observe(parent);
    document.fonts?.addEventListener("loadingdone", fit);
    return () => {
      observer?.disconnect();
      document.fonts?.removeEventListener("loadingdone", fit);
    };
  }, [inset, value]);

  return <span ref={ref} className={className} title={value} dir="auto"
    style={{ maxInlineSize: `calc(100% - ${inset * 2}px)`, whiteSpace: "nowrap" }}>{value}</span>;
}
