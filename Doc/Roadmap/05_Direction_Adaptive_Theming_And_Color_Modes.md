# Direction 05 - Adaptive Theming And Color Modes

Date: 2026-04-23

Execution note:

- no executable slice has shipped yet

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Priority:

- `P4`

## Why This Direction Exists

The UI is already coherent, responsive, and materially more polished than the original RC shell.

But there is still one visible gap between "Material-like" and "product-grade":

- the shipped UI is still light-only
- theme state is not user-configurable
- there is no dark mode
- there is no user-selectable accent or seed color
- Material token coverage is broad, but not yet treated as a full adaptive theme system

This matters because the extension now has enough polish that users will start expecting:

- `System / Light / Dark`
- a small set of intentional preset themes
- optional personalization that does not break contrast or hierarchy

## Current Truth

As of 2026-04-23:

- the side panel uses Material-like CSS system tokens in `src/sidepanel/theme/tokens.css`
- the current root theme explicitly ships as `color-scheme: light`
- motion exists and `prefers-reduced-motion` is already honored
- Settings already adapts at compact widths, but there is no theme section for mode or palette controls
- the popup and side panel already share the same visual token language, which is the right foundation for one cross-surface theme state

External platform and design constraints:

- Material theming on the web is token-driven, and system tokens can be scoped through CSS custom properties
- Material color schemes map roles to both light and dark themes
- Material guidance supports generating color schemes from seed colors instead of hand-editing every token
- dark mode is an app decision, not something Material or the browser will apply correctly by magic

## Direction Goal

Turn the current token foundation into a real adaptive theme system that:

- supports `System`, `Light`, and `Dark`
- keeps the current default light theme stable
- allows a safe degree of user personalization
- remains accessible and coherent across side panel, popup, and audit surfaces

## Strategic Decisions

1. Ship mode selection before freeform theme editing.
   The first user-facing milestone should be `System / Light / Dark`, not a large customization panel.

2. Treat custom color as one validated seed input, not raw token-by-token editing.
   If user theming is added, the recommended first version is one `#RRGGBB` seed color plus generated role palettes.
   This is much easier to keep accessible than exposing dozens of independent RGB or hex fields.

3. Keep Material role integrity.
   User themes should still derive `primary`, `secondary`, `surface`, `outline`, and status roles in a structured way instead of collapsing into arbitrary branding colors.

4. Keep current truthfulness surfaces intact.
   Warning, error, progress, trust-boundary, and fidelity states should stay visually legible under every shipped theme mode.

5. Treat popup, side panel, and audit hub as one theme product.
   Theme state should not drift between entry surfaces.

## Success Criteria

- users can choose `System`, `Light`, or `Dark`
- the current light theme remains the safe default
- one optional accent or seed-color path can be added without breaking contrast
- side panel, popup, and audit hub render the same selected theme
- theme QA covers compact widths, reduced motion, and status surfaces

## Main Risks

- adding dark mode without re-auditing all toned warning and error surfaces
- exposing too much freeform color editing too early
- breaking contrast on compact chips, progress bars, and supporting surfaces
- creating a theme system that feels less Material, not more

## Recommendation

This direction is feasible and well-supported by the current architecture.

It should start with:

1. theme-mode infrastructure
2. dark theme token set
3. preset accents
4. only then one advanced seed-color input

It should not start with a wide-open per-token theme editor.

## References

- Material Web theming:
  https://material-web.dev/theming/material-theming/
- Material Web color:
  https://material-web.dev/theming/color/
- Material Web dark theme support note:
  https://material-web.dev/about/support/

## Child TODO

- [05_1_Direction_Adaptive_Theming_And_Color_Modes_TODOs.md](./05_1_Direction_Adaptive_Theming_And_Color_Modes_TODOs.md)
