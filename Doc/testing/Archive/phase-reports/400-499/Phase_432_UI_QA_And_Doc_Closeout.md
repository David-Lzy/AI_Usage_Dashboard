# Phase 432 UI QA And Doc Closeout

Date: 2026-05-14

Document class:

- closed evidence

Freshness model:

- historical design baseline

Status note:

- this file records the representative visual QA evidence and capture boundary for the provider display-preference closeout
- screenshots were kept under `tmp/` during the run and are not committed as maintained evidence

## Scope

- Popup quick-glance route after per-surface provider and progress preferences.
- Sidebar-sized dashboard route after per-surface provider order and quota item rendering.
- Full-page dashboard route after the same rendering path.
- Settings provider carousel route in Arabic RTL.

## RDP Chrome Capture Boundary

RDP Chrome extension-window capture was attempted for representative routes, including Arabic Settings carousel, English popup, Chinese sidepanel-sized dashboard, and German full-page dashboard.

The current RDP/ImageMagick capture path opened windows but produced blank or near-blank image files in `tmp/phase432-ui-qa/`. One parallel capture attempt also hit X11 window contention, so the affected scenarios were rerun sequentially. The rerun still produced invalid dark captures.

Because these outputs did not show the extension UI, they were not counted as passing visual evidence. The limitation is specific to the capture path used during this phase, not a product rendering failure observed in DOM preview.

## Playwright Preview Checks

The representative DOM visual checks ran through Vite preview with Playwright:

| Scenario | Route | Viewport | Result |
| --- | --- | --- | --- |
| `en` popup | `/src/popup/index.html?app-locale=en` | `640x520` | Rendered; `overflowX=0`; popup provider cards visible. |
| `zh-CN` sidebar dashboard | `/src/sidepanel/index.html?app-locale=zh-CN#dashboard` | `420x900` | Rendered; `overflowX=0`; provider cards visible in narrow sidepanel-sized layout. |
| `de` full-page dashboard | `/src/sidepanel/index.html?surface=full-page&app-locale=de#dashboard` | `1280x800` | Rendered; `overflowX=0`; German long labels did not create obvious overlap. |
| `ar` Settings carousel | `/src/sidepanel/index.html?surface=full-page&app-locale=ar#settings` | `1280x900` | Rendered; `dir=rtl`; one provider carousel present; `overflowX=0`. |

## Finding And Fix

Arabic Settings preview exposed an awkward carousel status reading order from the original English phrase pattern, which rendered as `of 4: Cursor 1` in the RTL context.

The carousel status now uses a neutral numeric separator format, `1 / 4 · Cursor`, with `dir="auto"` and `unicode-bidi: plaintext` on the status element so mixed Latin provider names and numeric counters keep a stable reading order inside RTL pages.

## Verification Commands

- `npm run test -- src/shared/display-preferences.test.ts src/shared/storage.test.ts src/shared/provider-progress-items.test.ts src/shared/provider-progress-item-selection.test.ts src/shared/progress-display.test.ts src/sidepanel/components/ProviderOrderPreferenceControls.test.tsx src/sidepanel/components/ProviderProgressItemPreferenceControls.test.tsx src/sidepanel/components/ProviderCard.test.tsx src/popup/PopupProviderProgress.test.tsx src/sidepanel/settings-preference-options.test.ts src/sidepanel/components/PopupAppearancePreview.test.tsx src/sidepanel/components/ProviderCarousel.test.tsx src/sidepanel/routes/SettingsPage.test.tsx src/sidepanel/components/SettingsSections.test.tsx src/sidepanel/components/SettingsCredentialsSection.test.tsx src/sidepanel/components/SettingsSourceSection.test.tsx`
- Playwright/Vite preview checks for `en`, `zh-CN`, `de`, and `ar`
- `npm run i18n:check`
- `npm run docs:check`
- `npm run typecheck`
- `npm run build`
- `git diff --check`
