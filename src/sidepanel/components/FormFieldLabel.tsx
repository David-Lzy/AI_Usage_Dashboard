import type { ReactNode } from "react";

type FormFieldLabelProps = {
  label: string;
  id?: string;
  htmlFor?: string;
  className?: string;
  accessory?: ReactNode;
};

export function FormFieldLabel({
  label,
  id,
  htmlFor,
  className = "form-field__label",
  accessory,
}: FormFieldLabelProps) {
  const labelNode = htmlFor ? (
    <label id={id} className={className} htmlFor={htmlFor}>
      {label}
    </label>
  ) : (
    <span id={id} className={className}>
      {label}
    </span>
  );

  if (!accessory) {
    return labelNode;
  }

  return (
    <span className="form-field__label-row">
      {labelNode}
      {accessory}
    </span>
  );
}
