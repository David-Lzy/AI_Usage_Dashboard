# Testing Documentation

Date: 2026-05-18

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this public testing page lists repository verification commands
- generated operator evidence, screenshot requests, local browser/RDP notes, and account-specific QA history live in ignored `.local/` history

## Public Verification

Use the smallest command set that proves the change:

```sh
npm run design:check
npm run docs:check
npm run i18n:check
npm run i18n:audit
npm run typecheck
npm run test
npm run build
```

`npm run design:check` verifies the required sections and implementation links
in the public [Design Contract](../../DESIGN.md). It also prevents that document
from becoming a second color-token source. `npm run docs:check` includes this
gate automatically.

PRs targeting `main` run the same validation job as main/tag builds, including
`docs:check` and `provider:quality`. Its token is read-only and checkout does not
persist credentials. Release and store jobs have explicit event guards that
exclude PRs. `npm run release:workflow:check` parses the workflow YAML and uses
GitHub's expression evaluator to test fork/ordinary PR, main/tag push and manual
dispatch fixtures. These local guards do not stand in for a remote Actions run.

The background state-merge browser regression uses a fresh headless Chrome
profile, synthetic data and a plain Vite server without CRX build output. It
holds a custom-source response while editing the actual Settings threshold,
then checks that both the edit and the response are saved. It does not open a
user profile or overwrite `dist/chrome/`:

```sh
./scripts/with-preferred-node.sh node scripts/check-sync-state-browser.mjs
```

Chrome must already be installed (`PLAYWRIGHT_CHANNEL` can select another
installed Playwright channel). Evidence is written to
`tmp/output/playwright/sync-state-merge/`.

The shared UI keyboard regression runs in the same isolated source mode. It
checks menu entry, arrow/Home/End navigation, selection, Escape focus return,
Tab/Shift+Tab dismissal and viewport bounds across all 14 locales, RTL, light
and dark themes, and 320/430px widths:

```sh
./scripts/with-preferred-node.sh node scripts/check-shared-ui-browser.mjs
```

Evidence lives in `tmp/output/playwright/shared-ui/keyboard/`. The visual matrix
also accepts `--source` for checks without touching a loaded extension build.
Source-mode checks do not replace final extension-mode validation.

Localization or responsive UI changes that can vary by language length should
also run the visual locale matrix against `dist/chrome/`:

```sh
npm run build
npm run i18n:visual-check -- --smoke
```

The visual checker covers Popup, Sidebar, full-page Dashboard, Provider detail,
and Settings. Settings captures include the open application-language menu.
Use `--themes light,dark` for changes that affect theme tokens or contrast; the
default run intentionally uses the light theme to keep routine QA bounded.

Before release-oriented localization or layout changes, run the full matrix and
fail on detected layout issues:

```sh
npm run i18n:visual-check -- --fail-on-issues
```

The visual matrix writes screenshots and JSON reports under ignored
`.local/visual-checks/i18n/` paths.

Surface browser QA that writes local JSON artifacts should use the aggregate
command so privacy scanning runs immediately after capture:

```sh
npm run qa:surface:check
```

Release candidates should pass:

```sh
npm run release:version:check
npm run release:workflow:check
npm run release:check
npm run release:package
```

Firefox local beta checks should pass when a change touches browser packaging,
manifest conversion, popup/sidepanel browser compatibility, or Firefox-specific
release notes:

```sh
npm run firefox:build
npm run firefox:lint
npm run firefox:lint:baseline
npm run firefox:package
```

Extension CPU profiling uses an ignored local artifact directory:

```sh
npm run build
npm run perf:extension:profile
```

When Chrome Task Manager already shows a hot extension renderer, sample the
reported process directly:

```sh
npm run perf:extension:profile -- --pid=<chrome-task-manager-process-id>
```

Do not commit screenshots, local browser profile paths, account data, cookies,
raw auth headers, or personal provider evidence.
