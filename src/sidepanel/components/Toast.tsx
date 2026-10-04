import type { RuntimeI18n } from "../../shared/i18n";
import { buildNavigationLocalizedCopy } from "../../shared/navigation-localized-copy";
import { createDefaultOperatorRuntimeI18n } from "../operator-runtime-i18n";
import { useRef } from "react";
import { useMotionEntrance } from "../../shared/use-motion-effects";

type ToastProps = {
  i18n?: RuntimeI18n;
  tone: "success" | "error";
  title: string;
  message: string;
  onDismiss: () => void;
};

export function Toast({
  i18n = createDefaultOperatorRuntimeI18n(),
  tone,
  title,
  message,
  onDismiss,
}: ToastProps) {
  const copy = buildNavigationLocalizedCopy(i18n);
  const ref = useRef<HTMLElement | null>(null);
  useMotionEntrance(ref, `${tone}:${title}:${message}`);

  return (
    <section ref={ref} data-motion-owned="" className={`toast toast--${tone}`} role="status" aria-live="polite">
      <div className="toast__content">
        <p className="toast__title">{title}</p>
        <p className="supporting-copy">{message}</p>
      </div>
      <button className="text-button" type="button" onClick={onDismiss}>
        {copy.dismiss}
      </button>
    </section>
  );
}
