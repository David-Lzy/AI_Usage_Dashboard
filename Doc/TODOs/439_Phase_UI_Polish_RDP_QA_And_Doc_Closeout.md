# Phase 439 - UI Polish RDP QA And Doc Closeout

Status: queued

## Goal

Close out the focused UI polish queue with representative visual QA and maintained documentation alignment.

## Scope

- Verify the carousel depth layout, circular ring polish, disclosure chevrons, Chrome extension error fix, and quota-item localization together after `Phase 434` through `Phase 438`.
- Capture or run representative visual checks for popup, sidebar dashboard, full-page dashboard, Settings carousel sections, and localized Settings quota controls.
- Include at least `en`, `zh-CN`, `de`, and `ar` for high-risk layout and RTL checks.
- Update README, top-level TODOs, Roadmap, Product/I18n docs, and phase index with current truth after the UI polish queue lands.
- Fix only closeout-level overflow, overlap, or documentation drift found during QA.

## Preserved Boundaries

- Do not introduce new feature work during closeout.
- Do not package a new release candidate in this phase unless the next packaging phase is intentionally started.
- Do not mutate RC13 submitted-store history or RC17 package evidence.
- Do not broaden provider capability claims.

## Acceptance

- Representative popup, dashboard, and Settings surfaces show no obvious overlap, clipped card bottoms, wrong chevron state, or ring center text collisions.
- Arabic Settings and carousel surfaces remain usable with coherent RTL direction and no major text overlap.
- Maintained docs describe the completed UI polish queue without claiming a packaged RC beyond the current package boundary.
- Any remaining visual limitation is recorded as a follow-up TODO with a narrow reproduction.

## Planned Verification

- `npm run docs:check`
- `npm run i18n:check`
- Focused UI tests touched by `Phase 434` through `Phase 438`
- `npm run typecheck`
- `npm run build`
- RDP/Playwright visual checks for popup, sidebar dashboard, full-page dashboard, Settings carousel, and Arabic Settings.
- `git diff --check`

## Follow-Up

- If the closeout proves the fixes are release-worthy, continue to `Phase 440` to package the follow-up candidate.
