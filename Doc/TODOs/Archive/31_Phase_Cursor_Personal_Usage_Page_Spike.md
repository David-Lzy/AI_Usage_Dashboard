# Phase 31 - Cursor Personal Usage Page Spike

Status: completed

Process rule:

- follow [Development_Guardrails.md](../../Development_Guardrails.md)

Goal:

- determine whether Cursor's personal dashboard usage page can support a stable individual-user source path

Depends on:

- phase 29
- phase 08
- phase 20

File scope:

- `src/manifest.json`
- `src/providers/cursor/`
- `src/sidepanel/routes/`
- `src/sidepanel/App.tsx`
- `src/shared/constants.ts`
- `Doc/provider_notes/Cursor.md`
- `Doc/TODOs/00_Phase_Index.md`
- `Doc/AI_Usage_Dashboard_TODOs.md`
- `fixtures/cursor/`

Tasks:

- inspect `https://cursor.com/cn/dashboard/usage`
- determine whether the page is DOM-driven, boot-data-driven, or network-response-driven
- avoid locale-bound assumptions if the route can render in multiple languages
- capture redacted fixtures for the most stable source
- define whether Cursor personal support can expose:
  - exact used and remaining values
  - current billing-period usage only
  - or only plan metadata plus warning states

Done when:

- Cursor has a clear personal-user extraction plan or an explicit no-go decision
- the provider note distinguishes team Admin API support from personal page support
- the route and extraction assumptions are concrete enough to implement safely

Out of scope:

- changing the existing team Admin API implementation

Completion date: 2026-04-21

Completion summary:

- added a Cursor personal live-tab capture helper, tests, and a hidden debug route for future page-session fixture capture work
- verified from the live logged-in page that `https://cursor.com/cn/dashboard/usage` exposes current billing-period usage, plan metadata, on-demand usage state, and CSV export controls
- verified from `view-source` that the route is backed by repeated `self.__next_f.push(...)` flight payloads instead of classic `__NEXT_DATA__`
- documented the honesty boundary: Cursor personal support can start from current billing-period usage views, but it should not claim an exact remaining included-request counter
- recorded a redacted live evidence fixture derived from the live page and view-source inspection

Verification:

- `npm run typecheck`
- `npm run test`
- `npm run build`
- manual Chrome GUI check: inspected the live logged-in route `https://cursor.com/cn/dashboard/usage`
- manual browser-source check: inspected `view-source:https://cursor.com/cn/dashboard/usage` and confirmed `self.__next_f.push(...)` markers
- headless extension check: confirmed `chrome.runtime.getManifest().optional_host_permissions` includes `https://cursor.com/*` and `chrome.permissions.contains()` accepts that origin

Follow-up:

- [32_Phase_Claude_Personal_Usage_Page_Spike.md](../32_Phase_Claude_Personal_Usage_Page_Spike.md)
