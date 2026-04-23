# Direction 05.1 - Adaptive Theming And Color Modes TODOs

Date: 2026-04-23

Document class:

- living strategy

Status note:

- direction created on `2026-04-23`
- `Phase 98` completed the first executable slice on `2026-04-23` by shipping shared `themeMode` persistence, `System / Light / Dark`, a Settings control, and the first dark-token foundation
- `Phase 99` completed the next executable slice on `2026-04-23` by shipping a repeatable theme review baseline for explicit-mode override and `System` follow behavior across settings, dashboard, and popup
- `Phase 100` completed the next executable slice on `2026-04-23` by shipping a repeatable dark-surface review baseline for warning, error, progress, and supporting surfaces
- `Phase 101` completed the next executable slice on `2026-04-23` by shipping the first preset accent system with `Default Blue`, `Meadow`, and `Sunset`, plus a repeatable preset-theme review baseline across settings, dashboard, and popup
- `Phase 102` completed the next executable slice on `2026-04-23` by aligning the audit hub to the same persisted theme runtime and adding a repeatable review baseline for initial hydration plus live theme updates from the embedded Settings frame
- `Phase 103` completed the next executable slice on `2026-04-23` by shipping the first validated custom-seed input with preview plus reset actions and a repeatable cross-surface review baseline for custom-seed propagation
- `Phase 104` completed the next executable slice on `2026-04-23` by adding a repeatable local-surface review baseline for popup-only and audit-hub-local custom-seed accents, while also normalizing themed text-button rendering
- `Phase 105` completed the next executable slice on `2026-04-23` by adding a repeatable surface-stability review baseline for popup and audit-hub non-accent surfaces under custom-seed mode
- `Phase 106` completed the next executable slice on `2026-04-23` by adding a repeatable surface-stability review baseline for dashboard, Settings, and provider-detail non-accent surfaces under custom-seed mode
- `Phase 107` completed the next executable slice on `2026-04-23` by adding a repeatable compact-width review baseline for dashboard, Settings, provider detail, and popup under custom-seed mode
- `Phase 108` completed the next executable slice on `2026-04-23` by adding a repeatable provider-state-specific custom-seed review baseline that keeps warning or error surfaces state-colored while letting neutral accent-bound surfaces follow the active seed
- `Phase 109` completed the next executable slice on `2026-04-23` by adding a repeatable seeded recovered-state review baseline that proves Cursor and Codex session-page surfaces recover from `host_access_missing` warning states back to neutral healthy treatments under the same saved custom seed
- `Phase 110` completed the next executable slice on `2026-04-23` by adding a repeatable preview-interaction recovered-state review baseline that drives the same Cursor and Codex recovery path through shipped Settings host-access controls instead of direct localStorage seeding
- `Phase 111` completed the next executable slice on `2026-04-23` by adding a repeatable extension-mode recovered-state review baseline that proves the real unpacked MV3 runtime can carry the same Cursor and Codex recovery path with pre-granted host access plus synthetic vendor tabs
- `Phase 112` completed the next executable slice on `2026-04-23` by adding one dedicated theme-recovery operator workspace plus runbook so the next native-prompt or real-session pass has a fixed route, fixed summary, and fixed quick links
- `Phase 113` completed the next executable slice on `2026-04-23` by adding downloadable summary plus JSON exports and one durable seeded archive workflow plus generated archive index for the theme-recovery workspace
- `Phase 114` completed the next executable slice on `2026-04-23` by adding one repo-backed theme-recovery review-request workflow plus generated request index for the first real operator pass
- `Phase 115` completed the next executable slice on `2026-04-23` by adding one repo-backed theme-recovery request-completion workflow plus archive traceability for future real operator exports
- `Phase 116` completed the next executable slice on `2026-04-23` by binding theme-recovery workspace exports to one explicit request identity plus mismatch rejection, so future real operator exports can no longer fulfill the wrong pending request
- `Phase 117` completed the next executable slice on `2026-04-23` by adding one no-mutation theme-recovery preflight workflow, so future real operator exports can now be checked for eligibility before any request or archive mutation happens

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Parent direction:

- [Direction 05 - Adaptive Theming And Color Modes](./05_Direction_Adaptive_Theming_And_Color_Modes.md)

## Detailed TODOs

### Completed Foundation

- persist `themeMode` in shared app settings
- apply one shared runtime theme resolver across side panel and popup
- ship `System`, `Light`, and `Dark` as the first user-facing theme modes
- add the first dark-token override block without opening arbitrary token editing yet
- add a repeatable dark-light-system review pass with contrast checks and screenshot artifacts
- add a repeatable dark-surface review pass for toned cards, detail notes, supporting surfaces, and progress tracks
- persist one shared preset accent choice across side panel and popup
- ship the first three preset accents without opening freeform hex editing yet
- add a repeatable preset-theme review pass for the shipped accent presets in both light and dark modes
- align the audit hub to the same persisted `themeMode` and `themePreset` runtime already used by the side panel and popup
- add a repeatable review pass that proves the audit hub both hydrates the shared theme correctly and updates live when the embedded Settings frame changes theme mode or preset
- ship one validated `#RRGGBB` custom-seed input with preview plus reset actions instead of opening arbitrary token editing
- add a repeatable review pass that proves the custom seed propagates across settings, dashboard, popup, and audit hub in both light and dark modes
- add a repeatable review pass that proves popup-local and audit-hub-local accent surfaces still follow the active custom seed instead of falling back to the default link or chip styling
- add a repeatable review pass that proves popup and audit-hub neutral, supporting, and warning surfaces remain stable when the active custom seed changes
- add a repeatable review pass that proves dashboard, Settings, and provider-detail neutral, supporting, and warning surfaces remain stable when the active custom seed changes
- add a repeatable review pass that proves the saved custom seed remains overflow-safe and state-coherent across dashboard, Settings, provider detail, and popup at compact widths
- add a repeatable review pass that proves the shipped Settings host-access controls can drive preview-mode recovered-state transitions under the same saved custom seed without breaking cross-surface theme coherence
- add a repeatable review pass that proves the real unpacked MV3 runtime can carry the same recovered-state transition under the same saved custom seed without theme drift across settings, dashboard, popup, provider detail, and action badge
- add one dedicated operator workspace that makes a future native-prompt or real-session pass concrete without falsely claiming that pass has already happened
- add one durable archive workflow that can turn exported theme-recovery workspace JSON into one clearly labeled seeded baseline or future operator record instead of leaving recovery evidence only in `tmp/`
- add one repo-backed request workflow so the first real operator pass can start from a durable pending request package instead of only a runbook and ad-hoc local files
- add one repo-backed completion workflow so that pending theme-recovery request can later be fulfilled into one archive-linked receipt without manual manifest edits
- add one request-bound workspace export path so downloaded summary and JSON artifacts preserve `requestId + requestCreatedAt` and the completion flow can reject mismatched requests
- add one no-mutation preflight workflow so the operator can verify request binding and theme contract before the archive-linked completion step

### A. Theme Architecture

- define persistent theme settings:
  - `system`
  - `light`
  - `dark`
- define where theme state lives in storage and how it is hydrated on startup
- keep theme state exposed in Settings first; decide later whether popup also needs a direct control

### B. Material Fidelity Audit

- audit current token coverage against Material system roles:
  - color
  - typography
  - shape
  - elevation
  - interaction
- identify where current styling is still Material-like but not fully role-based
- decide which remaining one-off colors or blends should be normalized before dark mode ships

### C. Dark Mode

- add a dark token set that preserves current hierarchy:
  - surfaces
  - supporting surfaces
  - chips
  - progress
  - warning and error surfaces
  - provider-detail note tiers
- define whether `system` follows `prefers-color-scheme`
- verify the popup remains readable at narrow widths in dark mode

### D. Preset Themes And User Seed Color

- decide whether the first advanced version supports one shared seed or separate light and dark seeds
- reject arbitrary per-token editing in the first release of personalization

### E. QA And Accessibility

- add contrast verification for text, chips, and status surfaces
- add repeatable screenshot review for light, dark, and custom-seed themes beyond the currently shipped main accent surfaces, popup plus audit local accent surfaces, popup plus audit non-accent stability surfaces, dashboard plus Settings plus provider-detail non-accent stability surfaces, and dashboard plus Settings plus provider-detail plus popup compact-width custom-seed surfaces
- add repeatable screenshot review for light, dark, and custom-seed themes beyond the currently shipped main accent surfaces, popup plus audit local accent surfaces, popup plus audit non-accent stability surfaces, dashboard plus Settings plus provider-detail non-accent stability surfaces, and dashboard plus Settings plus provider-detail plus popup compact-width custom-seed surfaces
- verify reduced-motion behavior remains intact under every theme mode
- verify theme changes do not break live provider-state transitions, synthetic extension-mode recovered-state semantics, or one future native or operator extension-mode recovery path

### F. Remaining Cross-Surface Theme Coverage

- decide whether the first real operator theme-recovery archive should now be collected using the shipped workspace, downloads, seeded archive workflow, and pending request package before richer seed-color work starts
- decide whether one future review slice should cover separate light and dark seed behavior now that the current one-seed provider-state path is covered

## Out Of Scope

- syncing custom themes across browsers or user accounts
- importing full third-party theme packs
- exposing raw editing for every Material token
