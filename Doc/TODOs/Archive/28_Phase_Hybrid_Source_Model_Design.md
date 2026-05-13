# Phase 28 - Hybrid Source Model Design

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Goal:

- define the post-release-candidate provider-source model so personal logged-in usage pages can coexist with the already shipped Admin API and analytics paths

Depends on:

- phase 27.1

File scope:

- `Doc/`
- `src/providers/types.ts`
- `src/shared/constants.ts`
- `README.md` if product support text changes materially

Tasks:

- define source kinds for v2 provider support:
  - `official_api`
  - `session_page`
  - `policy_only`
- define source-priority and fallback rules per provider
- define the security posture:
  - no raw cookie persistence
  - no manual cookie copy flow
  - page-context extraction only inside logged-in tabs with granted host access
- define which normalized fields are mandatory vs optional for personal-user page sources
- define the personal-user support matrix for Codex, Cursor, Claude, and Gemini

Done when:

- the hybrid-source product model is explicit enough that implementation work does not need to rediscover core assumptions
- personal-page support boundaries are written honestly
- the next framework phase has a clear contract to implement

Out of scope:

- implementing content scripts or provider parsers

Completion date: 2026-04-21

Completion summary:

- defined the post-RC hybrid provider-source model around `official_api`, `session_page`, and `policy_only`
- formalized the security posture for personal-user support:
  - no raw cookie persistence
  - no manual cookie import flow
  - page-context extraction only inside already logged-in tabs with granted host access
- added static source-blueprint types in [src/providers/types.ts](/nfs/server1/disk1/Project/personal_project/AI_Usage_Dashboard/src/providers/types.ts:1) so later phases have a shared contract for source priority, connection mode, and field fidelity
- added provider-by-provider hybrid-source blueprints in [src/shared/constants.ts](/nfs/server1/disk1/Project/personal_project/AI_Usage_Dashboard/src/shared/constants.ts:1) covering shipped and planned paths for Codex, Cursor, Claude, Gemini, and JetBrains
- updated the main design and product docs so the personal-user expansion track is explicit in:
  - [AI_Usage_Dashboard_MVP_Design.md](/nfs/server1/disk1/Project/personal_project/AI_Usage_Dashboard/Doc/Archive/baselines/AI_Usage_Dashboard_MVP_Design.md:1)
  - [AI_Usage_Dashboard_TODOs.md](/nfs/server1/disk1/Project/personal_project/AI_Usage_Dashboard/Doc/AI_Usage_Dashboard_TODOs.md:1)
  - [README.md](/nfs/server1/disk1/Project/personal_project/AI_Usage_Dashboard/README.md:1)

Verification:

- automated checks:
  - `npm run typecheck`
- documentation checks:
  - verified the phase queue now starts at `Phase 29`
  - verified the new hybrid-source phase files are linked from the phase index
  - verified the README and design docs state the no-cookie-persistence rule consistently

Follow-up:

- move to `Phase 29` for the page-session adapter framework
