# Phase 97 - Strategic Roadmap Expansion For Theming, Benchmark, And i18n

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Goal:

- assess three newly requested product directions at the roadmap level, decide whether they are feasible, define their recommended priority, and land them as first-class roadmap documents with child TODO files instead of leaving them as ad-hoc notes

Depends on:

- phase 96
- [Direction 04 - Material, Motion, And Responsive Hardening](../../../../Roadmap/04_Direction_Material_Motion_And_Responsive_Hardening.md)

File scope:

- `Doc/Roadmap/`
- `Doc/TODOs/`
- `Doc/`

Tasks:

- assess current repo truth for Material fidelity, motion, responsiveness, theme support, popup support, and localization readiness
- verify external platform constraints and current market signals from official Chrome and Material docs plus one explicitly referenced competitor listing
- create new strategic directions for:
  - adaptive theming and color modes
  - toolbar product benchmark and discoverability
  - internationalization and localization
- create one child TODO file for each new strategic direction
- update roadmap and TODO indexes so the new directions are discoverable from the main planning docs

Done when:

- the three requested directions exist as first-class roadmap files
- each direction has a child TODO file with concrete execution tracks
- the strategic index links the new directions and records their priority order
- the phase index records this documentation-only slice as completed

Out of scope:

- implementing dark mode, custom themes, or localization in code
- changing popup behavior beyond documentation and strategy
- claiming that ten-language support is already shipped

Completion date: 2026-04-23

Completion summary:

- added `Direction 05` for adaptive theming, dark mode, and safe user color personalization, with a recommendation to start from mode selection and generated seed-color schemes instead of raw freeform token editing
- added `Direction 06` for toolbar product benchmark and discoverability, with the popup framed as an optimization and market-fit track rather than a first-popup architecture track
- added `Direction 07` for staged internationalization and localization, with a recommendation to build manifest plus runtime plumbing first and treat ten-language support as a tiered rollout instead of one immediate pass
- updated the strategic roadmap index, the top-level TODO summary, and the phase index so the new planning directions are discoverable and the documentation-only slice is explicitly archived

Verification:

- local repo audit:
  - confirm the shipped theme system is light-only and token-based
  - confirm motion and responsive work already exist
  - confirm the popup is already shipped
  - confirm the manifest and app surfaces do not yet ship `_locales/` or `default_locale`
- external source review:
  - Chrome `action` API
  - Chrome extension i18n docs
  - Chrome Web Store discovery and listing guidance
  - Chrome Web Store metrics guidance
  - Material Web theming and color docs
  - `Ai Usage 100%` Chrome Web Store listing
- documentation validation:
  - verify the new direction files and child TODO files are linked from the strategic directions index
  - verify the phase index now points at this archived phase as the latest completed slice

Follow-up:

- decide whether the next executable planning slice should start from `Direction 05`, `Direction 06`, or `Direction 07`
- keep the first real non-seeded operator review track separate from these new strategic directions so product-polish and market-expansion work do not silently rewrite audit truth
