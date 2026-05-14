# Phase 433 - RC17 Display Preference Follow-Up Packaging

Status: completed

## Goal

Promote the post-`rc.16` provider display-preference and Settings carousel source boundary through `Phase 432` into a new packaged follow-up release candidate.

## Scope

- Bump package and Chrome manifest versions from `0.1.0-rc.16` / `0.1.0.16` to `0.1.0-rc.17` / `0.1.0.17`.
- Run the release gate from the updated source.
- Generate `release/ai-usage-dashboard-0.1.0-rc.17.zip`.
- Record the SHA256 and milestone snapshot.
- Update maintained current docs to point to `rc.17` as the packaged follow-up candidate.

## Preserved Boundaries

- Do not mutate the submitted RC13 Chrome Web Store review milestone.
- Do not claim that RC17 has been submitted.
- Do not change provider support claims, host permissions, locale coverage, store listing copy, or screenshot archives.
- Do not force-add ignored release artifacts into git unless the project convention changes.

## Acceptance

- `package.json`, `package-lock.json`, `src/manifest.json`, and built `dist/manifest.json` are version-aligned.
- `release/ai-usage-dashboard-0.1.0-rc.17.zip` exists locally after packaging.
- A new RC17 milestone records the package path, SHA256, source boundary, included changes, and promotion rule.
- Phase index and maintained current docs describe `Phase 433` as the latest completed slice.

## Planned Verification

- `npm run release:check`
- `npm run release:package`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.17.zip`
- `npm run docs:check`
- `git diff --check`
- post-push `npm run build`

## Follow-Up

- If a human decides to replace the pending RC13 Chrome Web Store submission, create a separate submission milestone from the RC17 package boundary.

## Completion Summary

- Bumped `package.json` and `package-lock.json` to `0.1.0-rc.17`.
- Bumped `src/manifest.json` to Chrome numeric version `0.1.0.17` and display `version_name` `0.1.0-rc.17`.
- Ran the release gate from the updated source and generated `release/ai-usage-dashboard-0.1.0-rc.17.zip`.
- Recorded SHA256 `effa7fd1cb61a5573f7c882275042b8245256d52507747bf507faa982d04e9b7` in the RC17 milestone.
- Updated maintained current docs so RC17 is the packaged follow-up candidate while RC13 remains the submitted Chrome Web Store review boundary.

## Verification

- `npm run release:check`
- `npm run release:package`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.17.zip`
- `npm run docs:check`
- `git diff --check`
