import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";
import type {} from "mdui/jsx.en";
import "mdui/components/select.js";
import "mdui/components/menu-item.js";
import "mdui/components/text-field.js";
import "mdui/components/button.js";
import "mdui/components/checkbox.js";
import "mdui/mdui.css";
import "./fusion-controls.css";
import type { MaterialSelectProps } from "../MaterialSelect";
import { MaterialActionIcon } from "../../../shared/components/MaterialActionIcon";
import { FormFieldLabel } from "../FormFieldLabel";
import { useControlVisibility } from "../../../shared/control-visibility";
import { shouldPreservePopoverForSurfaceSwitch } from "../../surface-switch-intent";
import {
  adjacentTabStop,
  getFieldInput,
  getSelectDropdown,
  labelFieldInput,
  restoreRequiredSelectValue,
  setControlledSelectValue,
  type FusionFieldElement,
} from "./mdui-compat";

export function FusionSelect<T extends string>(props: MaterialSelectProps<T>) {
  const panelVisible = useControlVisibility();
  const {
    label,
    value,
    options,
    fieldIdPrefix,
    disabled,
    labelAccessory,
    labelHidden,
  } = props;
  const id = `${fieldIdPrefix}-${useId()}`;
  const ref = useRef<HTMLElementTagNameMap["mdui-select"]>(null);
  const current = useRef(props);
  current.current = props;
  useLayoutEffect(() => {
    if (ref.current) setControlledSelectValue(ref.current, value);
  });
  useEffect(() => {
    if (ref.current) void labelFieldInput(ref.current, label, "", false);
  }, [label]);
  useEffect(() => {
    const element = ref.current!;
    let cancelled = false;
    void element.updateComplete.then(() => {
      const dropdown = getSelectDropdown(element);
      if (!cancelled && dropdown && !panelVisible) {
        dropdown.open = false;
        return;
      }
      if (
        !cancelled &&
        dropdown &&
        props.sessionPopoverId &&
        props.activePopover
      ) {
        dropdown.open = props.activePopover.id === props.sessionPopoverId;
      }
    });
    return () => {
      cancelled = true;
    };
  }, [props.activePopover?.id, props.sessionPopoverId, panelVisible]);
  useEffect(() => {
    const element = ref.current!;
    let stopped = false;
    let detach = () => {};
    let preservePopover = false;
    const pointer = (event: PointerEvent) => {
      preservePopover = shouldPreservePopoverForSurfaceSwitch(event.target);
    };
    document.addEventListener("pointerdown", pointer, true);
    void element.updateComplete.then(async () => {
      const dropdown = getSelectDropdown(element);
      const input = await getFieldInput(element);
      if (stopped || !dropdown || !input) return;
      input.setAttribute("aria-haspopup", "menu");
      input.setAttribute("aria-expanded", String(dropdown.open));
      const open = () => {
        input.setAttribute("aria-expanded", "true");
        const { sessionPopoverId, onActivePopoverChange } = current.current;
        if (sessionPopoverId) onActivePopoverChange?.({ id: sessionPopoverId });
      };
      const close = () => {
        input.setAttribute("aria-expanded", "false");
        const { sessionPopoverId, activePopover, onActivePopoverChange } =
          current.current;
        if (!preservePopover && activePopover?.id === sessionPopoverId)
          onActivePopoverChange?.(null);
        preservePopover = false;
      };
      dropdown.addEventListener("open", open);
      dropdown.addEventListener("close", close);
      detach = () => {
        dropdown.removeEventListener("open", open);
        dropdown.removeEventListener("close", close);
      };
    });
    const activate = (event: MouseEvent) => {
      const item = event
        .composedPath()
        .find(
          (target): target is HTMLElementTagNameMap["mdui-menu-item"] =>
            target instanceof HTMLElement &&
            target.tagName === "MDUI-MENU-ITEM",
        );
      if (!item || !element.contains(item)) return;
      // Handle activation before MDUI toggles its uncontrolled menu selection.
      // This keeps denied/async values controlled and permission requests inside
      // the original pointer or keyboard user gesture.
      event.preventDefault();
      event.stopPropagation();
      const latest = current.current;
      const next = restoreRequiredSelectValue(
        item.value,
        latest.value,
        latest.options,
      );
      const dropdown = getSelectDropdown(element);
      if (dropdown) dropdown.open = false;
      if (!latest.disabled && next !== latest.value) latest.onChange(next);
      // Controlled values also roll back when a permission request is rejected
      // without a parent render, or when the selected item is clicked again.
      queueMicrotask(() => {
        if (element.isConnected)
          setControlledSelectValue(element, current.current.value);
      });
    };
    const keydown = (event: KeyboardEvent) => {
      if (current.current.disabled) return;
      const dropdown = getSelectDropdown(element);
      if (event.key === "Tab" && dropdown?.open) {
        // Keep native tab order instead of MDUI's default extra stop on trigger.
        const next = adjacentTabStop(element, event.shiftKey);
        if (next) event.preventDefault();
        event.stopPropagation();
        dropdown.open = false;
        (next ?? element).focus();
        return;
      }
      const target = event.composedPath()[0];
      if (!dropdown || !(target instanceof HTMLInputElement)) return;
      if (["ArrowDown", "ArrowUp", " "].includes(event.key)) {
        event.preventDefault();
        dropdown.open = true;
      }
    };
    element.addEventListener("click", activate, true);
    element.addEventListener("keydown", keydown);
    return () => {
      stopped = true;
      detach();
      document.removeEventListener("pointerdown", pointer, true);
      element.removeEventListener("click", activate, true);
      element.removeEventListener("keydown", keydown);
    };
  }, []);
  return (
    <div
      className="form-field fusion-field"
      data-fusion-field={fieldIdPrefix}
      data-settings-material-select={fieldIdPrefix}
      data-session-popover-id={props.sessionPopoverId}
      onClick={(event) => {
        if (event.target instanceof HTMLLabelElement) ref.current?.focus();
      }}
    >
      <FormFieldLabel
        label={label}
        id={`${id}-label`}
        htmlFor={id}
        className={`form-field__label${labelHidden ? " sr-only" : ""}`}
        accessory={labelAccessory}
      />
      <mdui-select
        ref={ref}
        id={id}
        variant="outlined"
        value={value}
        disabled={disabled}
        aria-label={label}
        required
        placement="auto"
      >
        <span slot="end-icon">
          <MaterialActionIcon name="keyboard-arrow-down" />
        </span>
        {options.map((option) => (
          <mdui-menu-item key={option.value} value={option.value}>
            {option.label}
          </mdui-menu-item>
        ))}
      </mdui-select>
    </div>
  );
}

type FusionTextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "password" | "number" | "url";
  disabled?: boolean;
  required?: boolean;
  helper?: string;
  error?: string;
  min?: number;
  max?: number;
  step?: number;
  direction?: "ltr" | "rtl";
};

export function FusionTextField(props: FusionTextFieldProps) {
  const {
    id,
    label,
    value,
    onChange,
    helper = "",
    error = "",
    disabled,
    required,
    type = "text",
    min,
    max,
    step,
    direction,
  } = props;
  const ref = useRef<FusionFieldElement>(null);
  const current = useRef(props);
  current.current = props;
  useLayoutEffect(() => {
    if (ref.current) ref.current.value = value;
  });
  useEffect(() => {
    const element = ref.current!;
    void labelFieldInput(element, label, error || helper, Boolean(error));
    void element.updateComplete.then(() => {
      if (element.isConnected) element.setCustomValidity(error);
    });
  }, [label, helper, error]);
  useEffect(() => {
    const element = ref.current!;
    const input = () => {
      if (!current.current.disabled) current.current.onChange(element.value);
      queueMicrotask(() => {
        if (element.isConnected) element.value = current.current.value;
      });
    };
    element.addEventListener("input", input);
    return () => element.removeEventListener("input", input);
  }, [onChange]);
  return (
    <div
      className="form-field fusion-field"
      data-fusion-field={id}
      onClick={(event) => {
        if (event.target instanceof HTMLLabelElement) ref.current?.focus();
      }}
    >
      <FormFieldLabel label={label} htmlFor={id} />
      <mdui-text-field
        ref={ref}
        id={id}
        variant="outlined"
        type={type}
        value={value}
        disabled={disabled}
        required={required}
        min={min}
        max={max}
        step={step}
        dir={direction}
        aria-label={label}
        autocomplete="off"
      />
      {(error || helper) && (
        <span
          className={`fusion-field__helper${error ? " fusion-field__helper--error" : ""}`}
          role={error ? "alert" : undefined}
        >
          {error || helper}
        </span>
      )}
    </div>
  );
}

export function FusionCheckbox({
  checked,
  onChange,
  disabled,
  children,
  id,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  children: ReactNode;
  id?: string;
}) {
  const ref = useRef<HTMLElementTagNameMap["mdui-checkbox"]>(null);
  const current = useRef({ checked, onChange, disabled });
  current.current = { checked, onChange, disabled };
  useLayoutEffect(() => {
    if (ref.current) ref.current.checked = checked;
  });
  useEffect(() => {
    const element = ref.current!;
    const change = () => {
      if (!current.current.disabled) current.current.onChange(element.checked);
      queueMicrotask(() => {
        if (element.isConnected) element.checked = current.current.checked;
      });
    };
    element.addEventListener("change", change);
    return () => element.removeEventListener("change", change);
  }, []);
  return (
    <mdui-checkbox ref={ref} id={id} checked={checked} disabled={disabled}>
      {children}
    </mdui-checkbox>
  );
}

export function FusionButton({
  children,
  onClick,
  disabled,
  primary,
  compact,
  icon,
  title,
  id,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  compact?: boolean;
  icon?: ReactNode;
  title?: string;
  id?: string;
}) {
  return (
    <mdui-button
      id={id}
      variant={primary ? "filled" : "outlined"}
      disabled={disabled}
      className={compact ? "fusion-button--compact" : undefined}
      title={title}
      onClick={() => {
        if (!disabled) onClick();
      }}
    >
      {icon && <span slot="icon">{icon}</span>}
      {children}
    </mdui-button>
  );
}
