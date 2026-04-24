# Direction 10.1 - Toolbar Competitive Fit And Store Readiness TODOs

Date: 2026-04-24

Document class:

- living strategy

Status note:

- direction created on `2026-04-24`
- `Phase 141` completed the first executable slice on `2026-04-24` by shipping one explicit competitive-fit decision matrix plus one maintained screenshot storyboard pack for truthful extension-mode capture
- `Phase 142` completed the next executable slice on `2026-04-24` by shipping one maintained screenshot-capture runbook plus one generator-backed baseline capture pack for truthful extension-mode runtime capture
- `Phase 143` completed the next executable slice on `2026-04-24` by shipping one pending screenshot-capture request workflow for the first real RDP Chrome operator pass
- `Phase 144` completed the next executable slice on `2026-04-24` by shipping one completion plus archive workflow for future real screenshot sets while truthfully keeping the repo at `1 pending / 0 archived`
- `Phase 145` completed the next executable slice on `2026-04-24` by verifying real RDP Chrome runtime capture for popup and sidepanel windows, so extension-mode screenshot collection is now a proven path
- `Phase 146` completed the next executable slice on `2026-04-24` by adding request-bound capture notes plus archive-preserved truth-note metadata for the future first real screenshot set
- `Phase 147` completed the next executable slice on `2026-04-24` by shipping one request-bound screenshot seed plus runtime-lock workflow and one RDP capture runner for the future first real screenshot set
- `Phase 148` completed the next executable slice on `2026-04-24` by shipping one fast-fail timeout plus stale-probe cleanup path for failed RDP capture attempts
- `Phase 149` completed the next executable slice on `2026-04-24` by fulfilling and archiving the first real RDP Chrome screenshot set
- `Phase 150` completed the next executable slice on `2026-04-24` by shipping one maintained store-listing copy pack anchored to that first archived screenshot set
- `Phase 151` completed the next executable slice on `2026-04-24` by shipping one maintained store-listing localization source pack anchored to the manifest, maintained listing-copy pack, and first archived screenshot set
- `Phase 152` completed the next executable slice on `2026-04-24` by shipping one explicit popup host-width contract plus one repeatable width review for real Chrome action-popup rendering
- `Phase 153` completed the next executable slice on `2026-04-24` by moving popup width control into the static popup bootstrap and by routing repo-backed commands through one preferred local Node wrapper

Process rule:

- follow [Development_Guardrails.md](../Development_Guardrails.md)

Parent direction:

- [Direction 10 - Toolbar Competitive Fit And Store Readiness](./10_Direction_Toolbar_Competitive_Fit_And_Store_Readiness.md)

## Detailed TODOs

### A. Competitive Benchmark Refresh

- refresh the benchmark matrix against current live listings and docs
- classify competitor behavior into:
  - adopt
  - adapt
  - reject
- keep privacy and trust-boundary notes explicit for every adopted pattern
- `Phase 141` completed the first executable slice here by turning the older dated benchmark into one current decision matrix with explicit `adopt / adapt / reject` outcomes

### B. Popup Last-Mile Productization

- keep reducing overlap between:
  - header story
  - setup coverage
  - featured provider
  - surface roles
- identify the final popup information contract for:
  - no visible providers
  - mixed setup blockers
  - policy-only
  - healthy
- `Phase 152` completed the next executable slice here by turning the popup host width into one explicit runtime contract instead of leaving action-popup sizing to browser guesswork
- `Phase 153` completed the next executable slice here by moving that runtime contract into the popup HTML bootstrap itself, so action-popup sizing no longer waits for post-boot class mutation and no longer re-enters the narrow-screen fallback path at first paint

### C. RDP Chrome Extension-Mode Review

- use the RDP Chrome unpacked extension as the primary runtime for final popup review
- capture extension-mode screenshots for:
  - first run
  - mixed setup blockers
  - policy-only coverage
  - healthy state
- document the reload and screenshot workflow so store assets come from truthful runtime state
- `Phase 142` completed the first executable slice here by shipping one explicit screenshot-capture runbook and one generator-backed baseline capture pack
- `Phase 143` completed the next executable slice here by shipping one pending request package so the first real operator capture pass now has a durable repo-backed handoff target
- `Phase 144` completed the next executable slice here by shipping the completion and archive workflow that future real captures will use after the first operator pass finishes
- `Phase 145` completed the next executable slice here by proving that the current RDP Chrome profile can open and capture popup plus sidepanel runtime windows directly
- `Phase 146` completed the next executable slice here by making capture notes request-bound and archive-preserved, so future real captures can keep truthful omission, approximation, and fallback notes through completion
- `Phase 147` completed the next executable slice here by making screenshot seeds request-bound plus runtime-locked and by shipping one RDP capture runner that applies those seeds before each requested screenshot
- `Phase 148` completed the next executable slice here by making failed X11 capture probes fast-fail plus cleanable, so the next real screenshot pass can retry without leaving stale helper processes behind
- `Phase 149` completed the next executable slice here by using that request-bound runtime path to fulfill and archive the first real screenshot set, so the direction now has one durable archived proof instead of only pending workflow

### D. Store Readiness Pack

- define screenshot storyboard order
- define title, short summary, and long-description hierarchy
- define which screenshots prove:
  - toolbar-first value
  - setup guidance
  - side-panel depth
  - honesty around provider coverage
- `Phase 141` completed the first executable slice here by shipping one maintained screenshot storyboard pack; listing-copy hierarchy is still open
- `Phase 142` completed the next executable slice here by shipping one concrete capture-pack workflow that turns the storyboard into named runtime capture tasks
- `Phase 144` completed the next executable slice here by shipping one empty-but-truthful archive ledger plus one completion command, so completed screenshot sets now have a durable storage path
- `Phase 146` completed the next executable slice here by extending that future storage path with durable truth-note metadata, so archived screenshot sets can record exactly where a store-facing image used omission, approximation, or fallback
- `Phase 149` completed the next executable slice here by creating the first real archive package, so listing-copy and screenshot-pack follow-up can now build on archived extension-mode evidence instead of only storyboard intent
- `Phase 150` completed the next executable slice here by turning that archived extension-mode evidence into one maintained listing-copy pack, so future store updates and localization work now have one truthful source document

### E. Listing And Localization Coordination

- decide which listing claims are valid today
- plan listing localization separately from in-product localization
- ensure store screenshots and translated listings remain aligned with real product states
- `Phase 151` completed the first executable slice here by turning the current English listing copy into one stable localization source pack with string ids, truth anchors, and translation guardrails for future store-localization work

### F. Verification

- keep repeatable popup width reviews for competitive states
- add extension-mode screenshot review against RDP Chrome output
- add a checklist that compares shipped popup states to store-copy claims
- keep repo-backed tool commands on one supported Node runtime so build and popup verification do not drift between local shells and Codex runs

## Out Of Scope

- rebuilding popup architecture from scratch
- changing provider trust boundaries for marketing parity
- claiming store support for unsupported live providers
