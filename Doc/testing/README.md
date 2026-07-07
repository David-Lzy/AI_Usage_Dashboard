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
npm run docs:check
npm run i18n:check
npm run typecheck
npm run test
npm run build
```

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
