# Phase 05 - Settings And Permission UX

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Goal:

- add the settings page and the user-facing permission flow UI

Depends on:

- phase 04

File scope:

- `src/sidepanel/routes/SettingsPage.tsx`
- `src/sidepanel/components/PermissionPrompt.tsx`
- `src/sidepanel/components/Toast.tsx`

Tasks:

- build the settings page layout
- add global sync interval controls
- add warning threshold controls
- add provider enable or disable controls
- add host permission request and status UI
- add success and error toast feedback

Done when:

- the user can see where provider permissions will be managed
- settings controls render correctly with fake state
- permission prompts have a clear Material-styled UX

Out of scope:

- actual `chrome.permissions` calls
- storage persistence

Completion date: 2026-04-20

Completion summary:

- added a dedicated `SettingsPage` with fake sync interval and warning-threshold controls
- added provider visibility toggles using local fake state
- added `PermissionPrompt` cards to preview per-provider host permission requests
- added a `Toast` component for local success and error feedback
- connected the top app bar settings action so the dashboard can switch into the settings route

Verification:

- unit tests: none added in this phase because the work was settings and permission UX with fake local state
- automated checks:
  - `npx -y node@22 ./node_modules/typescript/bin/tsc --noEmit`
  - `npx -y node@22 ./node_modules/vite/bin/vite.js build`
- manual checks:
  - verified the dashboard can open the settings route through the top app bar action
  - verified fake permission state can toggle between missing and granted within the settings page

Follow-up:

- move into `Phase 06` for storage, sample state, and message bus wiring
