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

Do not commit screenshots, local browser profile paths, account data, cookies,
raw auth headers, or personal provider evidence.
