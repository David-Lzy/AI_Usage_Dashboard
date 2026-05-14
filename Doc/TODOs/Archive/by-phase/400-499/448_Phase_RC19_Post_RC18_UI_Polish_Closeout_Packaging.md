# Phase 448 - RC19 Post-RC18 UI Polish Closeout Packaging

Status: completed on 2026-05-14

## Goal

Package the completed post-`rc.18` UI polish source boundary through `Phase 447` as a new follow-up release candidate.

## Scope

- Bump package and Chrome manifest versions from `0.1.0-rc.18` / `0.1.0.18` to `0.1.0-rc.19` / `0.1.0.19`.
- Run the full release gate from the completed post-`rc.18` source.
- Generate the release zip and record SHA256.
- Add a milestone describing the source boundary, included UI fixes, verification commands, and promotion rule.
- Update maintained current docs so `rc.19` becomes the packaged follow-up candidate while RC13 remains the submitted Chrome Web Store review boundary until a human resubmission replaces it.

## Preserved Boundaries

- Do not mutate the submitted RC13 Chrome Web Store review milestone.
- Do not claim the new RC has been submitted.
- Do not change provider support claims, host permissions, locale set, store listing copy, or screenshot archives.
- Do not add new runtime behavior beyond the already completed `Phase 441` through `Phase 447` source boundary.

## Acceptance

- Package and manifest versions align at `0.1.0-rc.19` / `0.1.0.19`.
- A release zip exists locally and its SHA256 is recorded in a new milestone.
- The release gate passes from the updated source.
- README, top-level TODOs, Roadmap, Product docs, and phase index describe the new package boundary truthfully.

## Planned Verification

- `npm run release:check`
- `npm run release:package`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.19.zip`
- `npm run docs:check`
- `git diff --check`
- `npm run docs:check`
- `git diff --check`
- post-push `npm run build`

## Follow-Up

- If a human decides to replace the pending RC13 Chrome Web Store submission, create a separate submitted-store milestone from the RC19 package boundary.

## Completion Notes

- Bumped package and Chrome manifest versions to `0.1.0-rc.19` / `0.1.0.19`.
- Ran the full release gate from the post-`rc.18` UI polish source.
- Generated `release/ai-usage-dashboard-0.1.0-rc.19.zip`.
- Recorded SHA256 `2b3237e4acf0d855de394fdbc2c87b8a0ac4475e2cdf2ae46dabfab9256ee0a1`.
- Added the RC19 follow-up milestone while preserving RC13 as the submitted Chrome Web Store review boundary.

## Verification

- `npm run release:check`
- `npm run release:package`
- `sha256sum release/ai-usage-dashboard-0.1.0-rc.19.zip`
