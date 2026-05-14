# Phase 448 - RC19 Post-RC18 UI Polish Closeout Packaging QA

Date: 2026-05-14

## Summary

Phase 448 packaged the post-`rc.18` UI polish source boundary through `Phase 447` as `0.1.0-rc.19`.

## Checks

- `package.json` and `package-lock.json` now use `0.1.0-rc.19`.
- `src/manifest.json` now uses Chrome manifest version `0.1.0.19` and `version_name` `0.1.0-rc.19`.
- `npm run release:check` rebuilt `dist/` and verified the built manifest version alignment before packaging.
- `npm run release:package` generated `release/ai-usage-dashboard-0.1.0-rc.19.zip`.
- SHA256 for the generated local package is `2b3237e4acf0d855de394fdbc2c87b8a0ac4475e2cdf2ae46dabfab9256ee0a1`.

## Preserved Boundaries

- RC13 remains the submitted Chrome Web Store review boundary.
- RC19 is a packaged follow-up candidate only; this phase does not claim it has been submitted.
- No provider support promise, host permission, locale set, store listing copy, screenshot archive, or runtime feature behavior changed.

## Verification

- `npm run release:check`
- `npm run release:package`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.19.zip`
- `npm run docs:check`
- `git diff --check`

## Notes

The production build still emits the known sidepanel chunk-size warning. Vitest still emits the existing `--localstorage-file` warning in affected test workers. The release zip is ignored by git under the existing `release/` ignore rule.
