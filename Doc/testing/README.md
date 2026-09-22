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

`qa:surface:browser` and `qa:surface:extension` are the maintained surface entrypoints
(556/565 aliases are retained). Focused commands are `qa:shared-ui:browser`,
`qa:sync-state:browser`, and `qa:production-state:browser`; the last requires an
explicit isolated `--extension` path. `workflow:audit` performs only static
inventory. Historical numbered commands need prerequisite review, not mass
execution. The aggregate `qa:surface:check` builds `dist/chrome`; do not run it
over an extension currently loaded in your browser.

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

`node scripts/check-ui-module-boundaries.mjs` exercises deployment selection,
keyboard focus, metering collapse/ranges, and progress-editor number/gradient
controls at 320px dark and 1280px light in English, German and Arabic. It uses
synthetic inputs and unique output directories. A refactor can pass
`--compare=/absolute/path/to/previous/run` to require pixel-identical captures
of the traditional editor, gradient editor and deployment menu. This focused
check supplements the full locale and Popup-mode matrix.

The production-state regression requires an explicitly selected isolated build
and creates a new offline browser profile. It checks blank provider data, no
sample quota badge, no granted optional host origins, and that the demo route
loads only when explicitly opened:

```sh
node scripts/check-production-state-browser.mjs --extension=/absolute/path/to/isolated/chrome
```

`PLAYWRIGHT_CHROMIUM_EXECUTABLE` can select an already installed compatible
Chromium. Results and screenshots use a unique run directory below
`tmp/output/playwright/production-state/`; no existing browser profile is used.

`node scripts/check-diagnostics-export.mjs` verifies the sanitized diagnostic
preview, keyboard focus and JSON download at 320px dark and 1280px light across
all 14 locales. It uses synthetic secret sentinels in a source-only browser;
the downloaded JSON must match the preview and exclude those sentinels. Reports
and screenshots are retained under `tmp/output/playwright/diagnostics-export/`.

`node scripts/check-quota-notifications.mjs` exercises the real notification
Settings component, message client, controller and persistence transitions across
14 locales at 320px dark / 1280px light. Only browser permission/OS transport is
mocked: explicit user activation, denial, enablement, threshold edits, scoped
switches, pause, test, threshold delivery and restart deduplication are checked.
Evidence is retained under `tmp/output/playwright/quota-notifications/`. Unit
tests separately cover OS API rejection and Firefox's permission-probe fallback;
these checks do not claim a visible notification in the user's desktop session.

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

## Performance Baseline

Use isolated outputs and the existing explicit synthetic screenshot preset:

```sh
export AI_USAGE_BUILD_ROOT="$(mktemp -d /tmp/ai-usage-perf-XXXXXX)"
npm run build
npm run release:package
npm run perf:popup:baseline -- --extension="$AI_USAGE_BUILD_ROOT/chrome" --archive="$AI_USAGE_BUILD_ROOT/release/ai-usage-dashboard-$(node -p 'require("./package.json").version').zip"
```

The default baseline measures ten first opens in separate profiles and ten warm
opens per scenario: English, German and Arabic; 320px compact and 392px balanced;
one and three cards. Readiness is navigation-to-cards, fonts and two paint frames,
not browser process startup or a flushed OS cache. Idle, glide, hover-paused and
reduced-motion CPU each get three 30-second windows. The harness verifies actual
motion/paused states and samples only its own extension renderers. Missing PIDs
fail measurement rather than becoming zero. CPU excludes browser/GPU processes.

Results, profile ownership, fixture hash, environment, screenshots, median/p95,
spread, largest chunks and archive bytes go into a unique directory below
`tmp/output/playwright/popup-performance/`. Profiles are retained for diagnosis.
`--smoke` is a harness check, not a valid baseline. Use
`--startup-only` or `--cpu-only` to repeat one subset without replacing earlier
evidence. Combine only compatible fixture/build hashes and record both reports.
`--locale=en`, `--locale=de`, or `--locale=ar` narrows a rerun. The report includes
host load and the build-content hash. Set
`PLAYWRIGHT_CHROMIUM_EXECUTABLE` to an existing extension-capable Chromium binary
when the Playwright-managed browser is unavailable; no browser is installed by
these commands. A single host run is not a user-facing speed claim or a CI budget.

The older `perf:extension:profile` remains available for broader surface or explicit
PID investigations, accepts `--extension`/`--output`, and now uses unique output
directories with retained profiles. Its default Chrome build follows
`AI_USAGE_BUILD_ROOT` when set. Do not use its all-current-renderers mode for
isolated baseline comparisons. Re-run identical fixtures on a quiet host before
attributing differences to code, and report run-to-run spread alongside medians.
Its old surface scenarios are exploratory and unseeded, not substitutes for
the controlled popup baseline. CPU sampling requires Linux `/proc` and verifies
both PID and process start time across every window.
