# Phase 49 - Action Badge Attention Count

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

Goal:

- add the first shipped action-badge semantic using one stable meaning: the number of visible providers that currently need attention

Depends on:

- phase 48
- [Direction 03 - Toolbar Popup And Badge Entry](../../../Roadmap/03_Direction_Toolbar_Popup_And_Badge_Entry.md)

File scope:

- `src/background/`
- `README.md`
- `Doc/`

Tasks:

- define one badge model and reject more ambiguous alternatives
- update the Chrome action badge from shared app state after bootstrap, refresh, and alarm-driven sync
- document the badge meaning in one sentence

Done when:

- the action badge updates from the shared app state
- the badge shows a count of visible providers needing attention
- tests and build checks pass
- preview remains available on the latest build

Out of scope:

- badge animation
- per-provider badge content
- replacing the popup with badge-only behavior

Completion date: 2026-04-23

Completion summary:

- added a shared action-badge model whose single meaning is the number of visible providers currently needing attention
- wired badge updates into background bootstrap, alarm-driven sync, and successful app-message state updates
- documented the badge meaning so popup, badge, and side panel stay aligned on one health model

Verification:

- type check: `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
- targeted tests: `npx -y node@22 ./node_modules/vitest/vitest.mjs run src/background/action-badge.test.ts src/popup/view-models.test.ts src/sidepanel/view-models.test.ts`
- unit tests: `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
- build: `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- preview closeout: restart `python3 -m http.server 4173 --bind 0.0.0.0 --directory dist` and confirm the popup and side-panel preview URLs still respond

Follow-up:

- decide whether the next `Direction 03` slice should add richer badge titles, store-submission wording, or stop at the current count-based badge
