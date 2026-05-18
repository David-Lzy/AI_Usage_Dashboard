# Gemini Provider Note

Date: 2026-04-22

Process rule:

- follow [CONTRIBUTING.md](../../CONTRIBUTING.md)

Document class:

- maintained reference

Freshness model:

- maintained current reference

Status note:

- this provider note should track the current policy-only support boundary and official-source basis for Gemini Code Assist
- refresh it whenever the chosen source path, active release promise, or relevant official docs change

## 1. Decision

Selected MVP source path:

- `A0`: documented static quota policy only

Selected MVP support scope:

- Gemini Code Assist quota policy display
- specifically the documented Standard and Enterprise business tiers
- implementation default in this phase:
  - `Enterprise (policy only)`

Deferred from MVP:

- live used / remaining quota sync
- page parsing from Google account or Cloud console pages
- per-user project discovery and live license detection

Reason:

- the official docs clearly publish quota policy values
- the reviewed docs do not publish a simple official endpoint for current used and remaining Gemini Code Assist quota
- static policy support is honest and still useful to users

## 2. Official Sources Reviewed

Reviewed on 2026-04-20 using official Google documentation:

- Quotas and limits:
  - https://developers.google.com/gemini-code-assist/resources/quotas
- Gemini for Google Cloud quotas and limits:
  - https://docs.cloud.google.com/gemini/docs/quotas
- Cloud Quotas view and manage guide:
  - https://docs.cloud.google.com/docs/quotas/view-manage
- FAQs:
  - https://developers.google.com/gemini-code-assist/resources/faqs
- Set up Standard and Enterprise:
  - https://docs.cloud.google.com/gemini/docs/codeassist/set-up-gemini
- Manage Standard and Enterprise licenses:
  - https://docs.cloud.google.com/gemini/docs/codeassist/manage-licenses
- Add or change subscriptions:
  - https://developers.google.com/gemini-code-assist/docs/admin

## 3. What The Official Docs Expose

Documented quota policy:

- local codebase awareness:
  - `1,000,000` token context window
- code customization repositories:
  - `20,000`
- requests per user per minute:
  - free: `60`
  - Google AI Pro: `120`
  - Google AI Ultra: `120`
  - Standard: `120`
  - Enterprise: `120`
- requests per user per day:
  - free: `1000`
  - Google AI Pro: `1500`
  - Google AI Ultra: `2000`
  - Standard: `1500`
  - Enterprise: `2000`

Important quota behavior:

- Gemini Code Assist agent mode and Gemini CLI share the same quotas
- one prompt can result in multiple model requests
- GitHub PR review quotas are separate from the general Gemini Code Assist quota

Business-tier setup facts:

- Standard and Enterprise require a Google Cloud project to manage API access, quota, and billing
- Standard and Enterprise usage is license-based for users in the organization

## 4. What The Official Docs Do Not Expose Clearly

Not clearly exposed in the reviewed sources:

- exact current used quota per user
- exact remaining quota per user
- a public official API for Gemini Code Assist current usage
- a stable official dashboard page dedicated to current remaining quota

Inference:

- static policy is well documented
- live remaining usage is not yet documented enough for the MVP adapter path
- the official Cloud Quotas documentation shows how to inspect current usage in the Google Cloud console, but the reviewed docs still do not provide a Gemini Code Assist specific, stable, per-user live usage API or page contract that cleanly matches the dashboard model

## 5. Normalized Mapping Proposal

Selected normalized strategy in this phase:

- `providerId`: `gemini`
- `providerLabel`: `Gemini Code Assist`
- `syncSource`: `official`
- `quotaUnit`: `requests`
- `quotaWindow`: `daily`

Mapping rules:

- `total`
  - use the documented requests-per-user-per-day quota for the selected plan
- `used`
  - `null`
- `remaining`
  - `null`
- `resetAt`
  - `Daily per-user quota window`
- `warningReason`
  - explain that the shown quota is static documented policy and that Gemini CLI plus agent mode share the same quota

## 6. Research Result

This phase selects:

- static quota policy support first

This phase does not select:

- live usage parsing
- invented remaining numbers

## 7. Implementation Status

Phase 23 implementation landed on 2026-04-21.

Final shipped decision:

- `policy_only`

Why this is the shipped behavior:

- the latest official docs still clearly publish Gemini Code Assist quota policy values
- the latest official docs also describe Cloud Quotas in the Google Cloud console, including current usage views, but this is a generic Google Cloud quotas surface rather than a documented Gemini Code Assist per-user usage API
- I did not find an official, stable, provider-specific live source for current used and remaining Gemini Code Assist quota that is defensible for long-term extension maintenance

Current implementation details:

- the extension surfaces the documented Enterprise policy for Gemini CLI and agent mode
- the dashboard explicitly tells the user that the shown quota is documented policy only
- the dashboard points users to Google Cloud Quotas for live project usage checks rather than inventing remaining values

Inference note:

- "not defensible for long-term maintenance" is an engineering judgment based on the reviewed official docs as of 2026-04-21, not a claim that no internal or future live source could exist

## 8. Phase 33 Project Metrics Spike

Phase 33 landed on 2026-04-22.

Live route examined from the current desktop Chrome session:

- `https://console.cloud.google.com/gemini-code-assist/metrics?project=sincere-office-460607-g9`

What local evidence proved:

- the route title in the current Chrome session was `Gemini Code Assist Metrics`
- the route is explicitly project-scoped because it includes `project=sincere-office-460607-g9`
- the same session also recorded the companion overview route:
  - `https://console.cloud.google.com/gemini-code-assist/overview?hl=zh-cn&pli=1&project=sincere-office-460607-g9`
- Chrome session metadata included repeated Google Cloud console frame markers:
  - `<!--dynamicFrame...-->`
  - `https://console.cloud.google.com/p/bscframe`
  - `https://console.cloud.google.com/pangolin/iframe.html?...`
  - `https://accounts.google.com/RotateCookiesPage?origin=https%3A%2F%2Fconsole.cloud.google.com...`

What the unauthenticated route probe proved:

- direct access to the route without the active browser session redirected to Google sign-in for `service=cloudconsole`

Extraction inference:

- `dom`
  - not yet proven as a stable contract
- `boot_data`
  - not proven
- `network_observer`
  - the most plausible future path if project metrics support is ever added

Why this matters:

- this is a Google Cloud console surface with project context and console-frame composition
- it is not the same class of page as the Codex or Cursor personal usage pages
- the route should not be sold as a personal remaining-quota source

Fixture recorded:

- `fixtures/gemini/project-metrics-route-evidence.fixture.json`

## 9. Phase 33 Decision

Decision for the current personal-user support track:

- keep Gemini personal support unsupported for now

Decision for the shipped extension:

- keep Gemini on `policy_only`

Decision for any later non-personal expansion:

- if the product explicitly adds project metrics support, the Google Cloud metrics route can be revisited as a bound-tab, project-scoped source
- even in that future track, it must stay labeled as `project metrics`, not personal quota

## 10. Updated Engineering Judgment

Updated judgment as of 2026-04-22:

- Gemini still does not have a defensible personal-user live usage source for this extension
- the observed Google Cloud metrics route is real, but it is project-scoped and structurally coupled to the Cloud console shell
- the honest next step is to finish hybrid-source UX for the providers that already have clearer personal-user paths, not to force Gemini into the same bucket
