# Phase 470 - Surface Switch Navigation

Status: completed

## Goal

Make popup Settings actions open the full-page Settings tab, and let the sidebar and full-page tab switch between each other from the top bar.

## Scope

- Route popup Settings actions through the existing full-page tab surface while preserving focused Settings deep links.
- Best-effort close the extension side panel after opening a full-page tab when `chrome.sidePanel.close` is available.
- Add a full-page-to-sidebar switch action that opens the current route in the side panel and closes the full-page extension tab after the side panel opens.
- Add localized top-bar copy for the sidebar switch action across all 14 runtime locales.

## Preserved Boundaries

- Do not change provider source truth, quota parsing, provider visibility/order settings, permissions, credentials, or release packaging.
- Keep RC13 as the submitted Chrome Web Store review boundary and RC21 as the latest packaged follow-up candidate.
- Treat side-panel closing as best-effort because `chrome.sidePanel.close` is only available on newer Chrome versions.

## Acceptance

- Popup Settings actions open `src/sidepanel/index.html?surface=full-page#settings...` and keep the existing Settings focus hash.
- Opening a full-page tab from popup or sidebar calls `chrome.sidePanel.close` when available and still succeeds when it is unavailable or rejects.
- Full-page dashboard, Settings, and provider-detail surfaces show a `Sidebar` top-bar action that opens the same route in the side panel.
- Full-page-to-sidebar switching opens the side panel at window scope before closing the full-page extension tab.
- New top-bar labels pass runtime i18n completeness checks.

## Planned Verification

- `npm run test -- src/popup/popup-route-actions.test.ts src/sidepanel/app-browser-controls.test.ts src/sidepanel/components/TopBar.test.tsx src/sidepanel/routes/DashboardPage.test.tsx --run`
- `npm run i18n:check`
- `npm run typecheck`
- `npm run docs:check`
- `npm run build`
- `git diff --check`

## Completed

- Updated popup Settings navigation to open a full-page Settings tab with preserved focused hashes.
- Added shared side-panel close helpers and used them from both popup and sidebar full-page navigation paths.
- Added sidepanel browser control support for full-page-to-sidebar route switching.
- Made standard dashboard, Settings, and provider-detail top bars pass a surface-switch label/title so full-page tabs show `Sidebar` instead of hiding the switch.
- Added 14-locale runtime copy for `Sidebar` and `Open sidebar`.
- Added focused route, browser-control, and top-bar tests.

## Verification Notes

- `npm run test -- src/popup/popup-route-actions.test.ts src/sidepanel/app-browser-controls.test.ts src/sidepanel/components/TopBar.test.tsx src/sidepanel/routes/DashboardPage.test.tsx --run`
- `npm run test`
- `npm run i18n:check`
- `npm run typecheck`
- `npm run docs:check`
- `npm run build`
- `git diff --check`

## Follow-Up

- Before packaging this source boundary, run an extension-mode Chrome pass on a Chrome build with `chrome.sidePanel.close` support to confirm the side panel visually closes after the tab opens.
