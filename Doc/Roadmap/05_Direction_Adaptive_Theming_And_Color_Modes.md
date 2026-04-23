# Direction 05 - Adaptive Theming And Color Modes

Date: 2026-04-23

Document class:

- living strategy

Status note:

- this file is a living roadmap direction and should be refreshed when direction state, priority, or completed slices change

Execution note:

- latest executable slice landed on `2026-04-23` through `Phase 117`

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Priority:

- `P4`

## Why This Direction Exists

The UI is already coherent, responsive, and materially more polished than the original RC shell.

Dark mode, preset accents, and the first validated custom-seed path are now shipped.

But there is still one visible gap between "Material-like" and "product-grade":

- theme personalization is now real, and provider-state-specific custom-seed QA now has one honest baseline
- there is still no arbitrary per-token editing, which remains the right call for this stage
- Material token coverage is broad, but the adaptive theme system still needs a few remaining review slices beyond the now-covered accent, toned, main non-accent, compact-width, provider-state-specific, and seeded recovered-state surfaces

This matters because the extension now has enough polish that users will start expecting:

- `System / Light / Dark`
- a small set of intentional preset themes
- optional personalization that does not break contrast or hierarchy

## Current Truth

As of 2026-04-23:

- the side panel uses Material-like CSS system tokens in `src/sidepanel/theme/tokens.css`
- the side panel, popup, and audit hub now share one persisted theme setting with:
  - `themeMode`
  - `themePreset`
  - optional `themeCustomSeedHex`
- shipped theme modes are `system`, `light`, and `dark`
- shipped preset accents are `default`, `meadow`, and `sunset`
- shipped custom accent mode is `custom`
- the current theme runtime resolves `system` from `prefers-color-scheme`
- the first dark-token override block is now shipped in `src/sidepanel/theme/tokens.css`
- the repo now also ships a repeatable `Phase 99` review pass that proves:
  - explicit `Light` still wins over a dark browser preference
  - explicit `Dark` still wins over a light browser preference
  - `System` follows browser color-scheme in both directions
  - side panel settings, dashboard, and popup all resolve the same theme state
- the repo now also ships a repeatable `Phase 100` review pass that proves dark-mode warning, error, progress, and supporting surfaces remain visually distinct and readable across dashboard, settings, and provider detail
- the repo now also ships a repeatable `Phase 101` review pass that proves the shipped preset accents propagate coherent role palettes across settings, dashboard, and popup in both light and dark modes
- the repo now also ships a repeatable `Phase 102` review pass that proves the audit hub hydrates the current shared theme and updates live when the embedded Settings frame changes theme mode or preset
- the repo now also ships a repeatable `Phase 103` review pass that proves one validated `#RRGGBB` custom seed propagates coherently across settings, dashboard, popup, and audit hub in both light and dark modes
- the repo now also ships a repeatable `Phase 104` review pass that proves popup-local labels plus action buttons and audit-hub-local labels plus hero-chip surfaces stay bound to the same saved custom seed in both light and dark modes
- the repo now also ships a repeatable `Phase 105` review pass that proves popup and audit-hub neutral, supporting, and warning surfaces stay stable while the saved custom seed only changes the intended accent roles
- the repo now also ships a repeatable `Phase 106` review pass that proves dashboard, Settings, and provider-detail neutral, supporting, and warning surfaces stay stable while the saved custom seed only changes the intended accent roles
- the repo now also ships a repeatable `Phase 107` review pass that proves dashboard, Settings, provider detail, and popup remain overflow-free at `360px` and `420px` while preserving the same saved custom-seed theme state
- the repo now also ships a repeatable `Phase 108` review pass that proves provider-state-specific custom-seed surfaces stay semantically truthful: Claude and Gemini warning or error surfaces remain state-colored, while Codex neutral status-chip plus progress-fill surfaces intentionally follow the active accent roles
- the repo now also ships a repeatable `Phase 109` review pass that proves seeded `host_access_missing -> ready` recovery for the shipped Cursor and Codex session-page paths returns warning surfaces to neutral healthy treatments without losing the saved custom-seed palette
- the repo now also ships a repeatable `Phase 110` review pass that proves the preview-mode Settings host-access controls can drive that same `host_access_missing -> ready` recovery path without direct localStorage seeding, while preserving the same saved custom-seed palette across Settings, dashboard, popup, and provider detail
- the repo now also ships a repeatable `Phase 111` review pass that proves the real unpacked MV3 runtime can carry that same custom-seed recovery path through `chrome.permissions`, `chrome.tabs`, `chrome.scripting`, `chrome.action`, and `chrome.storage.local` by using pre-granted optional host access plus synthetic vendor tabs
- the repo now also ships a dedicated `Phase 112` operator workspace plus runbook, so native-prompt or real-session follow-up now has one fixed route, one fixed summary format, and one fixed set of quick links instead of a loose manual note only
- the repo now also ships a `Phase 113` downloadable-export and archive workflow, so the current theme-recovery workspace can emit stable summary plus JSON artifacts and turn them into one durable repo-backed seeded archive under `Doc/testing/theme_recovery_reviews/`
- the repo now also ships a generated [Theme_Recovery_Review_Archive.md](../testing/Theme_Recovery_Review_Archive.md) index, and the current truthful state there is still:
  - one seeded internal baseline
  - no real operator theme-recovery sessions archived yet
- the repo now also ships a `Phase 114` review-request workflow, so the first real operator theme-recovery pass now has one repo-backed pending request package plus one generated [Theme_Recovery_Review_Requests.md](../testing/Theme_Recovery_Review_Requests.md) index instead of only a runbook
- the repo now also ships a `Phase 115` completion workflow, so a future real operator export can now turn that pending request into one fulfilled archive-linked receipt without manual README edits or a detached ad-hoc archive
- the repo now also ships a `Phase 116` request-bound export workflow, so the bound workspace route, summary draft, JSON export, downloaded filenames, and completion gate now all preserve one explicit `requestId + requestCreatedAt` identity instead of treating similar pending requests as interchangeable
- the repo now also ships a `Phase 117` preflight workflow, so a future real operator export can now be eligibility-checked against that pending request without mutating request or archive state first
- motion exists and `prefers-reduced-motion` is already honored
- Settings already adapts at compact widths and now exposes:
  - `Theme mode`
  - `Accent preset`
  - one validated `#RRGGBB` custom-seed input with preview plus reset-to-default actions
- the popup, side panel, and audit hub now share the same visual token language, which is the right foundation for one cross-surface theme state
- arbitrary per-token color editing, dual light-dark seed personalization, and real fulfilled operator or native-prompt recovery archives are still not shipped

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
- shipped preset accents stay coherent without breaking contrast
- one validated seed-color path works without breaking contrast
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
5. expand review coverage only after that seed-color path is real

`Phase 98` completed step `1` and the first shippable foundation of `2`.
`Phase 99` then added the first repeatable cross-surface QA baseline for that runtime.
`Phase 100` then added the first dark-surface-specific QA baseline for the toned and supporting surfaces that are most likely to regress.
`Phase 101` then completed step `3` by shipping the first preset accent system plus a repeatable preset-theme review baseline.
`Phase 102` then aligned the audit hub to that same persisted theme runtime and added a repeatable review baseline for initial hydration plus live theme updates from the embedded Settings frame.
`Phase 103` then completed step `4` by shipping the first validated custom-seed input with preview and reset actions, plus a repeatable cross-surface review baseline for custom-seed propagation.
`Phase 104` then extended that custom-seed QA to popup-local and audit-hub-local accent surfaces, and it also normalized themed text-button rendering so those local surfaces no longer fall back to the default blue link treatment.
`Phase 105` then extended that QA into popup and audit-hub non-accent surfaces, proving the custom seed changes the intended accent roles without perturbing neutral, supporting, or warning surface treatments.
`Phase 106` then extended that stability proof into dashboard, Settings, and provider detail, so the shipped custom-seed contract now covers the main product surfaces instead of only popup and audit-hub shells.
`Phase 107` then added a compact-width custom-seed review baseline for dashboard, Settings, provider detail, and popup, so the shipped theme contract now also has an explicit narrow-width regression guard.
`Phase 108` then extended that QA into provider-state-specific surfaces, so the shipped custom-seed contract now explicitly distinguishes state-colored warning or error treatments from neutral accent-bound treatments.
`Phase 109` then added one seeded recovered-state review baseline for the shipped session-page providers, so the theme contract now also proves a real warning-to-healthy transition under the saved custom seed instead of only proving static states in isolation.
`Phase 110` then proved that same recovery path through the shipped Settings preview interaction itself, so the current custom-seed contract now covers both deterministic seeded recovery and preview-mode control-driven recovery before any live extension-mode recovery claim is made.
`Phase 111` then extended that same recovery proof into the real unpacked MV3 runtime by exercising pre-granted host permissions, real extension pages, real action-badge updates, and synthetic vendor tabs, so the remaining gap is now native-prompt or operator real-session recovery rather than generic extension-mode uncertainty.
`Phase 112` then turned that remaining gap into one concrete operator workspace plus runbook, so the next missing piece is real human evidence collection rather than missing recovery-review tooling.
`Phase 113` then added direct downloadable exports plus one durable seeded archive workflow and generated archive index, so the next missing piece is no longer repo-backed artifact plumbing but one real operator recovery record.
`Phase 114` then added one repo-backed review-request workflow plus generated request index.
`Phase 115` then added the matching completion workflow plus archive-request traceability, so the next missing piece is no longer lifecycle plumbing but one real fulfilled operator recovery archive linked to the existing pending request.
`Phase 116` then bound that lifecycle into the workspace export itself, so the next missing piece is no longer request identity or export fungibility but one real operator archive produced through the now request-bound route.
`Phase 117` then added the missing no-mutation preflight gate, so the next missing piece is no longer lifecycle safety but the first real operator archive itself.

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
