# Direction 01.2 - JetBrains Gate Resolution TODOs

Date: 2026-04-23

Document class:

- living strategy

Status note:

- `Branch B` was completed for the current narrowed RC on `2026-04-23`

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Parent direction:

- [Direction 01.2 - JetBrains Gate Resolution](./01_2_Direction_JetBrains_Gate_Resolution.md)

## Branch A - Verify JetBrains

- supply a real JetBrains organization account in the current Chrome profile with AI visibility
- open the real `Users and licensing` page and verify that the new debug route can capture it:
  - `chrome-extension://<extension-id>/src/sidepanel/index.html#debug-capture-jetbrains`
- rerun the JetBrains slice of `Phase 41.2`
- update the final mixed-source report so `Phase 42` can proceed without narrowing support scope

## Branch B - Narrow RC Scope

- choose the provider set that remains part of the actively promised RC surface
- update all top-level truth sources:
  - `README.md`
  - `Doc/AI_Usage_Dashboard_TODOs.md`
  - `Doc/TODOs/00_Phase_Index.md`
  - release and testing docs
- update the visible product behavior if the RC should no longer present JetBrains as an enabled shipped provider by default
- make sure the release package and verification report describe the same narrowed support contract

## Required Guardrails

- do not leave JetBrains in a half-promised state where the UI still presents it as fully shipped while the release docs quietly exclude it
- do not clear `Phase 42` while the support matrix and verification record disagree
- do not infer that the JetBrains implementation is broken just because the current operator profile lacks org visibility
