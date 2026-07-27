# AI Usage Dashboard Design Contract

Date: 2026-07-28

This document defines the maintained visual and interaction contract for the
extension. It is intentionally specific to AI Usage Dashboard: a compact,
work-focused browser tool for repeatedly scanning quota, cost, history, setup,
and sync health across providers.

## Authority And Scope

Use this order when design considerations conflict:

1. Correct product behavior, provider truth, privacy, and security boundaries.
2. Accessibility and browser-extension platform constraints.
3. Existing shared components, tokens, and established interaction behavior.
4. Material 3 interaction and semantic color guidance.
5. Visual polish documented here.

This contract applies to Popup, Sidebar, Dashboard, Provider detail, Settings,
and shared menus or dialogs. It guides changes; it does not authorize changes
to provider data meaning, storage, permissions, or user-visible behavior.

## Product Character

The interface should feel quiet, precise, and operational. Users open it to
answer concrete questions quickly: what remains, what reset is next, what is
costing money, what needs access, and where to act.

- Prefer compact information hierarchy over marketing composition.
- Let real provider state and usable controls carry the interface.
- Keep status, quota, cost, and history visually distinct without making every
  block a separate decorative card.
- Use restrained surfaces, borders, and elevation. Avoid decorative gradients,
  oversized hero text, floating color blobs, and novelty effects.
- Preserve familiar behavior between surfaces even when density changes.

## Design Tokens

[Theme tokens](src/sidepanel/theme/tokens.css) are the source of truth for
semantic colors, typography, shape, control height, elevation, motion, spacing,
focus, and popup sizing. Theme resolution lives in
[material-theme.css](src/sidepanel/theme/material-theme.css).

- Consume semantic roles such as primary, surface, outline, success, warning,
  and error. Do not introduce literal colors in components when an appropriate
  role exists.
- Keep light and dark roles paired. A new role is incomplete until both themes
  remain readable and its state layers are defined.
- Status color communicates meaning; it is not decoration. Pair color with
  text, iconography, or structure.
- Add a token only when it removes meaningful repetition or represents a stable
  cross-component role.

## Typography And Localization

[Typography styles](src/sidepanel/theme/typography.css) and the type scale in
the token file define the hierarchy. Display-scale type is reserved for true
page headings; compact panels use title, body, and label roles.

- Keep letter spacing neutral and do not scale font size with viewport width.
- Use locale-aware formatting helpers for dates, durations, numbers, currency,
  and reset labels. Do not assemble language-specific date order in CSS or JSX.
- Treat translated text length as a layout input. Use intrinsic sizing,
  `minmax()`, wrapping at semantic boundaries, and responsive grids instead of
  locale-specific widths.
- Keep commands and short labels intact when space allows. When wrapping is
  necessary, wrap between meaningful text blocks rather than inside a date,
  value, or icon-label pair.
- Truncation is allowed only where the product contract explicitly caps a
  volatile label. It must have an accessible full-name path such as a tooltip.
- Use logical properties so right-to-left locales inherit correct direction.

## Surfaces And Elevation

[Surface primitives](src/sidepanel/theme/surfaces.css) define cards, supporting
insets, dialogs, and status treatment. Elevation is functional: it distinguishes
sticky or floating controls from content, not one content section from another.

- Use one framed surface per coherent object, such as one Provider card or one
  dialog. Do not nest decorative cards inside cards.
- Use unframed sections, dividers, and supporting insets for structure within a
  Provider or Settings surface.
- Sticky controls must remain visibly separate from scrolled content and must
  not cover focus targets or section anchors.
- Preserve consistent border, corner, and shadow roles across light and dark
  themes. Avoid heavy shadows and multiple competing elevations.

## Components And Controls

[Button styles](src/sidepanel/theme/buttons.css),
[form controls](src/sidepanel/theme/form-controls.css), and
[layout primitives](src/sidepanel/theme/layout-primitives.css) define the shared
control language.

- Reuse existing buttons, selects, tooltips, segmented controls, adaptive grids,
  and collapse handles before creating a variant.
- Use the shared compact, medium, and large control-height tokens. Content must
  be centered with flex or grid alignment, not tuned with one-off vertical
  padding.
- Use Lucide or the existing local Material-symbol implementation for familiar
  actions. Icon-only buttons require an accessible name and visible focus.
- Use segmented controls for a small mutually exclusive mode set, switches or
  checkboxes for binary state, selects for option sets, and buttons for commands.
- Dropdown triggers and their anchored menus must stay within the viewport.
  Menu items use the shared equal-width adaptive grid where appropriate.
- Collapse or browse handles belong to the content they control, sit on its
  leading edge in reading order, and must not create artificial gaps between
  neighboring cards.

## Responsive Layout

The UI has three density contexts rather than one desktop breakpoint:

- Popup is a stable compact viewport whose width tokens are defined in
  [tokens.css](src/sidepanel/theme/tokens.css). It prioritizes current quota and
  immediate actions; detailed diagnostics belong elsewhere.
- Sidebar must tolerate narrow and tall browser layouts. Controls reduce column
  count before labels become unreadable, and repeated content may collapse or
  use an explicit Provider browsing mode.
- Dashboard, Provider detail, and Settings use available width for scanning but
  constrain line length and keep related controls together.

General rules:

- Prefer CSS grid with intrinsic minimums and automatic column reduction.
- Equal controls in one region share width and height. Choose the largest
  content-derived minimum, then distribute remaining row width evenly.
- Avoid orphaned final-row controls when a balanced row distribution is
  available without shrinking below the content minimum.
- Fixed-format elements such as charts, rings, toolbars, and counters need
  stable dimensions so loading, hover, and localized labels do not shift layout.
- Never solve a medium-width problem by hiding required content. Reflow,
  collapse optional detail, or move secondary controls to the next row.
- Check Popup, Sidebar, Dashboard, Provider detail, and Settings at compact,
  medium, and wide widths after shared CSS changes.

## Data Visualization

[Usage history charts](src/shared/components/usage-history-charts.css) and the
shared progress components define visualization behavior.

- Show the decision-relevant summary first, then history or breakdown detail.
- Label estimates, partial sources, stale snapshots, and unknown values. Never
  render missing data as zero.
- Use semantic progress colors for health and remaining quota; use a distinct,
  theme-safe series palette for model, surface, token, or cost breakdowns.
- Legends stay readable and preserve full series names. Compact single-line
  legends may glide only when overflow exists, must fade at the edges, and pause
  on hover or focus.
- Charts require an accessible name and textual summary. Tooltip values use
  locale-aware formatting and bounded precision.
- Avoid decorative chart effects, misleading smoothing, and animation that
  obscures the underlying values.

## Motion And Feedback

Motion tokens live in [tokens.css](src/sidepanel/theme/tokens.css). Motion
explains state changes; it does not decorate idle surfaces.

- Use short shared durations and easing for menus, collapse, route entry, and
  direct manipulation feedback.
- The global animation preference is authoritative: `On` enables supported
  product motion, `Reduced` removes nonessential motion, and `Follow system`
  follows the browser or operating-system preference.
- Continuous movement is limited to explicit browsing or overflow behavior.
  It pauses on hover and focus and remains manually operable.
- Loading feedback must not replace cached useful content with a full visual
  interstitial. Prefer stable shells and lightweight progress state.
- Hover, pressed, selected, disabled, loading, success, warning, and error states
  must remain distinguishable in both themes.

## Accessibility

- Keep keyboard focus visible and in logical reading order.
- Preserve native label behavior and form semantics. Expanded tooltip hit areas
  must not turn labels into fake buttons or add redundant tab stops.
- Maintain sufficient target size for pointer and touch use without forcing all
  compact text controls to the same visual width.
- Do not rely on hover for required information or on color as the only status
  signal.
- Use `aria-expanded`, `aria-controls`, accessible names, live regions, and
  reduced-motion behavior where the component contract requires them.
- Test right-to-left direction, high text expansion, keyboard operation, and
  light/dark contrast alongside the default locale.

## Do And Don't

Do:

- Reuse semantic tokens and established components.
- Keep common workflows close to the data they affect.
- Preserve useful stale data while clearly explaining freshness or failure.
- Let optional detail collapse without moving unrelated content.
- Validate long translations and narrow widths before release.

Don't:

- Add a landing-page hero, nested card stack, or decorative visual filler.
- Hide text silently, hard-code a locale width, or shrink controls below their
  content minimum.
- Use one-off colors, spacing, shadows, or motion when a shared role exists.
- Expose raw diagnostics, provider page text, credentials, or internal protocol
  details in the normal user hierarchy.
- Copy another product's visual identity or third-party design guideline text.

## Verification

Use the smallest proof that matches the change. Shared design or responsive
changes normally require:

```sh
npm run docs:check
npm run i18n:check
npm run typecheck
npm run test
npm run build
npm run i18n:visual-check -- --smoke
```

Release-level localization or layout work should run the full visual matrix with
issue failure enabled. See the [testing guide](Doc/testing/README.md) for the
current commands and ignored evidence paths.

This document is original project guidance. External design collections may be
used as audit inspiration, but Material behavior, this repository's source, and
verified browser output remain authoritative.

