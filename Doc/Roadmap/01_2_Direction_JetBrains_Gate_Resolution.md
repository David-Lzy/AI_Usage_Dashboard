# Direction 01.2 - JetBrains Gate Resolution

Date: 2026-04-23

Status: completed

Completion note:

- `Branch B` was selected and applied to the packaged narrowed RC on `2026-04-23`

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Parent direction:

- [Direction 01 - Release Truthfulness And Closeout](./01_Direction_Release_Truthfulness_And_Closeout.md)

## Why This Exists

`Phase 41.2` no longer has a broad runtime-parity problem.

The release gate is now blocked by one narrow question:

- can the current RC be verified against a real JetBrains organization `Users and licensing` session, or
- should the next RC narrow scope to the providers that are already real-Chrome verified in the current operator environment

## Current Truth

As of `2026-04-23`:

- `Codex` personal session-page capture passes in real Chrome
- `Cursor` personal session-page capture also passes in real Chrome, including the real `cursor.com` host-permission prompt
- JetBrains official docs still point at the logged-in Console on `account.jetbrains.com`
- the current operator profile only exposes `https://account.jetbrains.com/organization/ai/users-and-licensing`, and that route currently resolves to `Error 400: Bad Request`
- the runtime now distinguishes:
  - page not open
  - logged-out session
  - organization access unavailable
- selected branch for the current RC:
  - `Branch B. Narrow The RC Scope`
- `Phase 42` has completed with that narrowed scope and packaged `0.1.0-rc.2`

## Decision Branches

### Branch A. Keep JetBrains In Scope

Use this branch if a real org-visible JetBrains Console session can be supplied on the current workstation.

Effect:

- `Phase 41.2` remains blocked until the JetBrains slice is verified end-to-end
- `Phase 42` stays blocked behind that verification

### Branch B. Narrow The RC Scope

Use this branch if the next RC should ship only what is already verified in the current operator environment.

Effect:

- JetBrains is removed from the active RC support promise
- docs, sample state, release notes, and any visible support matrix must stop implying that JetBrains is part of the verified shipped surface for that RC
- the JetBrains implementation stays in the repository, but the release story becomes intentionally narrower
- selected on `2026-04-23` for the current RC closeout

## Success Criteria

- one branch is chosen explicitly
- the support matrix, verification report, and release packaging story all tell the same truth
- `Phase 42` is blocked only by facts that still matter after that decision

## Child TODO

- [01_2_Direction_JetBrains_Gate_Resolution_TODOs.md](./01_2_Direction_JetBrains_Gate_Resolution_TODOs.md)
