# Phase 33 - Gemini Project Metrics Page Spike

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Goal:

- determine whether the Google Cloud Gemini Code Assist metrics page should be treated as a real supported source and, if so, how it should be labeled

Depends on:

- phase 29
- phase 14
- phase 23

File scope:

- `src/providers/gemini/`
- `Doc/provider_notes/Gemini.md`
- `fixtures/gemini/`

Tasks:

- inspect `https://console.cloud.google.com/gemini-code-assist/metrics?project=sincere-office-460607-g9`
- determine whether the surface is project-scoped, org-scoped, or user-scoped
- determine whether metrics can be extracted stably from DOM, boot data, or network responses
- define product labeling so project metrics are not misrepresented as personal quota
- capture redacted fixtures if a viable source exists

Done when:

- Gemini has a clear post-policy decision:
  - remain `policy_only`
  - become `project_metrics`
  - or stay unsupported for this user-support track
- the product model is explicit about scope and fidelity

Out of scope:

- pretending Cloud project metrics are a direct per-user remaining-quota source

Completion date: 2026-04-22

Completion summary:

- confirmed from the current Chrome desktop session that the live route title is `Gemini Code Assist Metrics`
- confirmed that the route is project-scoped because it hangs off `metrics?project=...` and has a matching `overview?project=...` companion route
- recorded console-shell evidence from Chrome session metadata including repeated `dynamicFrame` markers plus `p/bscframe` and `pangolin/iframe.html`
- recorded a redacted fixture that captures the route, scope, and shell markers without storing raw cookies or copied auth state
- kept the shipped extension on `policy_only` and explicitly deferred Gemini from the current personal-user support track

Verification:

- `strings -el ~/.config/google-chrome/Default/Sessions/Session_13421252277309105 | rg "Gemini Code Assist Metrics|gemini-code-assist/(metrics|overview)|pangolin/iframe|dynamicFrame|console.cloud.google.com"`
- `curl -I -L "https://console.cloud.google.com/gemini-code-assist/metrics?project=sincere-office-460607-g9"`
- `npm run typecheck`
- `npm run test`
- `npm run build`

Follow-up:

- [34_Phase_Hybrid_Source_UX_And_QA.md](./34_Phase_Hybrid_Source_UX_And_QA.md)
