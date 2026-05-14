# Phase 466 UI Polish Visual QA Docs Closeout

Date: 2026-05-15

Document class:

- closed evidence

Freshness model:

- historical verification record

Status note:

- this file records the representative visual QA and packaging decision for the Phase 458-465 UI polish queue
- screenshots were kept under `tmp/phase466-ui-qa/` during the run and are not committed as maintained evidence

## Scope

- Popup quick-glance route after header action, circular layout, soft-ring, and font preference polish.
- Sidepanel-width Settings route after tooltip, color-band, UI font, and responsive control polish.
- Full-page Settings route after Quick Setup carousel, progress appearance, and UI font polish.
- Arabic RTL Settings route after localized UI font copy.
- Hindi Settings route to smoke the new font-family preference with a Devanagari locale.

## Playwright Preview Checks

The DOM visual checks ran through the built `dist/` preview with Playwright:

| Scenario | Route | Viewport | Result |
| --- | --- | --- | --- |
| `en` popup quick glance | `/src/popup/index.html?app-locale=en` | `420x720` | Rendered; `overflowX=0`; popup provider cards, header action row, and refresh button present. |
| `zh-CN` sidepanel Settings | `/src/sidepanel/index.html?app-locale=zh-CN#settings` | `420x980` | Rendered; `overflowX=0`; UI font control and progress appearance controls present; Quick Setup carousel next action changed the active slide. |
| `de` full-page Settings | `/src/sidepanel/index.html?surface=full-page&app-locale=de#settings` | `1280x900` | Rendered; `overflowX=0`; provider carousel and progress appearance controls present; Quick Setup carousel next action changed the active slide. |
| `ar` full-page Settings | `/src/sidepanel/index.html?surface=full-page&app-locale=ar#settings` | `1280x900` | Rendered; `dir=rtl`; `overflowX=0`; provider carousel and UI font control present; Quick Setup carousel next action changed the active slide. |
| `hi` full-page Settings | `/src/sidepanel/index.html?surface=full-page&app-locale=hi#settings` | `1280x900` | Rendered; `overflowX=0`; UI font control and progress appearance controls present; Quick Setup carousel next action changed the active slide. |

## RDP Chrome Checks

The RDP Chrome extension-window helper was run sequentially after one parallel attempt caused window-close contention. The retry produced nonblank captures for the representative routes below:

| Route | Locale | Output | Result |
| --- | --- | --- | --- |
| `full-page-settings` | `en` | `tmp/phase466-ui-qa/rdp-full-page-settings-en.png` | Nonblank `1262x1383`, ImageMagick mean `62022.6`. |
| `popup` | `en` | `tmp/phase466-ui-qa/rdp-popup-en.png` | Nonblank `801x501`, ImageMagick mean `62308.2`. |
| `settings-quick-setup-cursor` | `zh-CN` | `tmp/phase466-ui-qa/rdp-settings-quick-setup-zh-cn.png` | Nonblank `1601x1001`, ImageMagick mean `63025.1`. |
| `full-page-settings` | `ar` | `tmp/phase466-ui-qa/rdp-full-page-settings-ar.png` | Nonblank `1601x1001`, ImageMagick mean `62804.9`. |

The failed parallel attempt is treated as an operator workflow limitation, not a UI regression: it produced a transient `xkill` close-window error and one title-location failure while multiple captures contended for the same RDP browser session. Sequential reruns succeeded.

## Packaging Decision

The source is now ahead of `0.1.0-rc.19` through `Phase 466`. This phase did not package or version-bump the extension. Because the UI polish queue is now closed and the unattended instruction asks for project closeout/versioning when no TODO remains, the next phase should be a dedicated release-packaging slice for `0.1.0-rc.20` instead of mutating this QA phase.

## Verification Commands

- `npm run test -- src/shared/storage.test.ts src/shared/theme.test.ts src/shared/ui-font-family.test.ts src/sidepanel/settings-preference-options.test.ts src/sidepanel/components/SettingsPreferencesSection.test.tsx src/sidepanel/routes/SettingsPage.test.tsx --run`
- `npm run i18n:check`
- `npm run typecheck`
- `npm run build`
- Playwright built-preview checks for `en`, `zh-CN`, `de`, `ar`, and `hi`
- RDP Chrome extension-window captures for `popup`, `full-page-settings`, and `settings-quick-setup-cursor`
- `npm run docs:check`
- `git diff --check`
