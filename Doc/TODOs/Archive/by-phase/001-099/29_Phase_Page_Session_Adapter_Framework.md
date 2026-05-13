# Phase 29 - Page Session Adapter Framework

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Goal:

- add the smallest shared framework needed for providers that sync from already-open logged-in usage pages instead of direct Admin APIs

Depends on:

- phase 28

File scope:

- `src/background/`
- `src/shared/`
- `src/providers/`
- `src/sidepanel/`
- `Doc/testing/`

Tasks:

- define a shared page-source adapter contract
- add tab discovery and tab-binding state
- add content-script or injected-script message plumbing for page extraction
- support three extraction modes when needed:
  - DOM read
  - bootstrapped page data read
  - observed same-origin network response extraction from page context
- add test scaffolding and fixture conventions for page-sourced adapters

Done when:

- one provider can be implemented on top of the framework without inventing new cross-cutting primitives
- the framework keeps page-session state explicit and testable
- the extraction path avoids raw cookie persistence

Out of scope:

- finishing any provider-specific page parser

Completion date: 2026-04-21

Completion summary:

- added a shared page-session framework in [src/providers/page-session.ts](/nfs/server1/disk1/Project/personal_project/AI_Usage_Dashboard/src/providers/page-session.ts:1) for page-backed providers
- the framework now covers:
  - tab discovery
  - optional bound-tab targeting
  - DOM extraction
  - boot-data extraction from script tags and main-world window keys
  - main-world network-observer installation with a DOM bridge for later reads
- refactored JetBrains live capture to use the shared framework instead of bespoke tab-query and script-execution logic [src/providers/jetbrains/official.ts](/nfs/server1/disk1/Project/personal_project/AI_Usage_Dashboard/src/providers/jetbrains/official.ts:1)
- added focused framework tests in [page-session.test.ts](/nfs/server1/disk1/Project/personal_project/AI_Usage_Dashboard/src/providers/page-session.test.ts:1) covering:
  - auto-discovered DOM capture
  - bound-tab capture
  - boot-data capture
  - network-observer bridge capture
- documented fixture and redaction rules for page-backed providers in [Page_Session_Fixture_Conventions.md](/nfs/server1/disk1/Project/personal_project/AI_Usage_Dashboard/Doc/testing/Page_Session_Fixture_Conventions.md:1)

Verification:

- automated checks:
  - `npm run typecheck`
  - `npm run test`
  - `npm run build`
- focused regression checks:
  - JetBrains page-capture tests still pass on top of the shared framework
  - the new page-session framework tests pass for DOM, boot-data, and network-observer modes

Follow-up:

- move to `Phase 30` for the Codex personal usage page spike
