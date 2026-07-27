import type { ComponentPropsWithoutRef } from "react";

import "./technical-text.css";

type TechnicalTextProps = Omit<ComponentPropsWithoutRef<"bdi">, "dir"> & {
  direction?: "auto" | "ltr";
};

export function TechnicalText({
  children,
  className,
  direction = "ltr",
  ...props
}: TechnicalTextProps) {
  return (
    <bdi
      {...props}
      className={["technical-text", className].filter(Boolean).join(" ")}
      data-technical-text={direction}
      dir={direction}
    >
      {children}
    </bdi>
  );
}
