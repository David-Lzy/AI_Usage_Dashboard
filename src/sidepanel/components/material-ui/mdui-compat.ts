import type { Select } from "mdui/components/select.js";

export type FusionFieldElement = HTMLElement & {
  value: string;
  updateComplete: Promise<unknown>;
  setCustomValidity: (message: string) => void;
};

// MDUI 2.1.5 does not expose its select menu or forward input ARIA. Keep the
// version-bound access here, covered by the production browser compatibility gate.
export async function getFieldInput(
  element: HTMLElement & { updateComplete: Promise<unknown> },
) {
  await element.updateComplete;
  const field = element.shadowRoot?.querySelector("mdui-text-field");
  if (field) await field.updateComplete;
  return (
    (field?.shadowRoot ?? element.shadowRoot)?.querySelector<HTMLInputElement>(
      "input:not(.hidden-input),textarea",
    ) ?? null
  );
}

export function getSelectDropdown(element: Select) {
  return element.shadowRoot?.querySelector("mdui-dropdown") ?? null;
}

export function installSelectTopLayer(
  dropdown: NonNullable<ReturnType<typeof getSelectDropdown>>,
) {
  const panel =
    dropdown.shadowRoot?.querySelector<HTMLElement>('[part="panel"]');
  if (!panel || typeof panel.showPopover !== "function") return () => {};
  // MDUI positions its fixed panel in viewport coordinates. Container queries
  // establish a different containing block, so keep the slot in the top layer.
  panel.popover = "manual";
  Object.assign(panel.style, {
    margin: "0",
    padding: "0",
    border: "0",
    background: "transparent",
    overflow: "visible",
  });
  const open = () => {
    if (!panel.isConnected) return;
    panel.hidden = false;
    panel.inert = false;
    panel.removeAttribute("aria-hidden");
    if (!panel.matches(":popover-open")) panel.showPopover();
  };
  const close = () => {
    panel.inert = true;
    panel.setAttribute("aria-hidden", "true");
  };
  const closed = () => {
    // A previous close animation can finish after a new open and hide the slot.
    if (dropdown.open) open();
    else if (panel.matches(":popover-open")) panel.hidePopover();
  };
  dropdown.addEventListener("open", open);
  dropdown.addEventListener("close", close);
  dropdown.addEventListener("closed", closed);
  if (dropdown.open) open();
  return () => {
    dropdown.removeEventListener("open", open);
    dropdown.removeEventListener("close", close);
    dropdown.removeEventListener("closed", closed);
    if (panel.matches(":popover-open")) panel.hidePopover();
  };
}

export function setSelectPanelVisibility(element: Select, visible: boolean) {
  const dropdown = getSelectDropdown(element);
  const menu = element.shadowRoot?.querySelector("mdui-menu");
  if (menu) {
    menu.inert = !visible;
    if (visible) menu.removeAttribute("aria-hidden");
    else menu.setAttribute("aria-hidden", "true");
  }
  if (!visible && dropdown) dropdown.open = false;
}

export function setControlledSelectValue(element: Select, value: string): void {
  element.value = value;
  // Lit can skip its child-property assignment when a refused user selection
  // returns to the previous rendered value within the same update cycle.
  const menu = element.shadowRoot?.querySelector("mdui-menu");
  if (menu && menu.value !== value) menu.value = value;
}

export function adjacentTabStop(
  element: HTMLElement,
  backwards: boolean,
): HTMLElement | null {
  const candidates = [
    ...document.querySelectorAll<HTMLElement>(
      "button,a[href],input,textarea,select,[tabindex],mdui-select,mdui-text-field,mdui-checkbox,mdui-button",
    ),
  ].filter((candidate) => {
    if (
      candidate.closest("[hidden],[inert],mdui-menu-item") ||
      candidate.matches(":disabled,[disabled]") ||
      !candidate.getClientRects().length ||
      getComputedStyle(candidate).visibility === "hidden"
    )
      return false;
    return candidate.tabIndex >= 0;
  });
  const index = candidates.indexOf(element);
  return index < 0 ? null : (candidates[index + (backwards ? -1 : 1)] ?? null);
}

export async function labelFieldInput(
  element: HTMLElement & { updateComplete: Promise<unknown> },
  label: string,
  description: string,
  invalid: boolean,
) {
  const input = await getFieldInput(element);
  if (!element.isConnected || !input) return;
  input.setAttribute("aria-label", label);
  input.setAttribute("aria-invalid", String(invalid));
  // References across shadow roots do not resolve; provide the same description
  // directly to assistive technology, without duplicating visible helper text.
  if (description) input.setAttribute("aria-description", description);
  else input.removeAttribute("aria-description");
}

export async function labelSelectMenu(
  element: Select,
  label: string,
  valueLabel: string,
) {
  const input = await getFieldInput(element);
  const menu = element.shadowRoot?.querySelector("mdui-menu");
  if (!element.isConnected || !input || !menu) return;
  // MDUI moves DOM focus into its menu. Use the menu-button pattern rather
  // than claiming combobox semantics without an active-descendant model.
  input.type = "button";
  input.style.textAlign = "start";
  input.style.minWidth = "0";
  input.style.textOverflow = "ellipsis";
  // The library's flex wrapper otherwise keeps a long button's intrinsic width.
  if (input.parentElement) input.parentElement.style.minWidth = "0";
  input.setAttribute("role", "button");
  input.setAttribute("aria-label", `${label}: ${valueLabel}`);
  input.setAttribute("aria-haspopup", "menu");
  menu.setAttribute("role", "menu");
  menu.setAttribute("aria-label", label);
  if ("ariaControlsElements" in input) input.ariaControlsElements = [menu];
}

export function restoreRequiredSelectValue<T extends string>(
  proposed: unknown,
  current: T,
  options: ReadonlyArray<{ value: T }>,
): T {
  return options.find((option) => option.value === proposed)?.value ?? current;
}
