import type { Select } from "mdui/components/select.js";

export type FusionFieldElement = HTMLElement & {
  value: string;
  updateComplete: Promise<unknown>;
  setCustomValidity: (message: string) => void;
};

// MDUI 2.1.5 does not expose its select menu or forward input ARIA. Keep the
// version-bound access here, covered by the production browser compatibility gate.
export async function getFieldInput(element: HTMLElement & { updateComplete: Promise<unknown> }) {
  await element.updateComplete;
  const field = element.shadowRoot?.querySelector("mdui-text-field");
  if (field) await field.updateComplete;
  return (field?.shadowRoot ?? element.shadowRoot)?.querySelector<HTMLInputElement>("input:not(.hidden-input),textarea") ?? null;
}

export function getSelectDropdown(element: Select) {
  return element.shadowRoot?.querySelector("mdui-dropdown") ?? null;
}

export function adjacentTabStop(element: HTMLElement, backwards: boolean): HTMLElement | null {
  const candidates = [...document.querySelectorAll<HTMLElement>(
    'button,a[href],input,textarea,select,[tabindex],mdui-select,mdui-text-field,mdui-checkbox,mdui-button',
  )].filter((candidate) => {
    if (candidate.closest("[hidden],[inert],mdui-menu-item") ||
        candidate.matches(":disabled,[disabled]") || !candidate.getClientRects().length ||
        getComputedStyle(candidate).visibility === "hidden") return false;
    return candidate.tabIndex >= 0;
  });
  const index = candidates.indexOf(element);
  return index < 0 ? null : candidates[index + (backwards ? -1 : 1)] ?? null;
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

export function restoreRequiredSelectValue<T extends string>(
  proposed: unknown,
  current: T,
  options: ReadonlyArray<{ value: T }>,
): T {
  return options.find((option) => option.value === proposed)?.value ?? current;
}
