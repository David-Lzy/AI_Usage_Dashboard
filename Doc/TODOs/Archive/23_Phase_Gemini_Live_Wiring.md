# Phase 23 - Gemini Live Wiring

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Goal:

- attempt a real Gemini live integration path and, if none is viable, formalize the static-policy fallback as the shipped behavior

Depends on:

- phase 22
- phase 14

File scope:

- `src/providers/gemini/`
- `src/providers/registry.ts`
- `Doc/provider_notes/Gemini.md`
- `fixtures/gemini/` if added

Tasks:

- verify whether a real live usage source exists for the supported Gemini account type
- implement the live path if it is stable and honest
- otherwise convert the current static-policy mode into an explicit release-ready fallback
- update provider notes with the final go or no-go decision
- add tests for whichever path becomes the shipped behavior

Done when:

- Gemini has either a real supported live path or an explicit release decision to stay static-only
- the adapter no longer reads like an open-ended placeholder
- documentation makes the live-data limitation unambiguous

Out of scope:

- undocumented scraping paths that cannot be defended for long-term maintenance

Completion date: 2026-04-21

Completion summary:

- re-ran the Gemini source decision against the latest official Google docs and kept the shipped behavior as an explicit `policy_only` fallback
- updated the Gemini provider implementation so the runtime state no longer reads like an unfinished placeholder; it now advertises a deliberate release decision with explicit rationale
- tightened the Gemini snapshot copy so users are told to treat the displayed values as documented policy and use Google Cloud Quotas for live project usage checks
- added a release-decision helper in the Gemini provider module and covered it with tests
- updated shared sample state and provider metadata so Gemini is consistently described as a documented-policy integration rather than an open-ended future live adapter

Verification:

- automated checks:
  - `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
  - `npx -y node@22 ./node_modules/vitest/vitest.mjs run`
  - `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- smoke checks:
  - Playwright preview smoke: dashboard -> settings -> credential cards render without regression
- external docs reviewed:
  - `https://docs.cloud.google.com/gemini/docs/quotas`
  - `https://developers.google.com/gemini-code-assist/resources/quotas`
  - `https://docs.cloud.google.com/docs/quotas/view-manage`

Preview:

- URL: `http://10.10.2.202:4173/src/sidepanel/index.html`
- local URL: `http://127.0.0.1:4173/src/sidepanel/index.html`
- command: `npx -y node@22 ./node_modules/vite/bin/vite.js --host 0.0.0.0 --port 4173 --strictPort`

Follow-up:

- move to `Phase 24` for Codex workspace live wiring
