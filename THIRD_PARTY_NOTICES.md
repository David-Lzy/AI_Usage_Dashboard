# Third-Party Notices

AI Usage Dashboard is licensed under AGPL-3.0-only. This file records bounded
third-party source adoption that requires preserved attribution in distributed
source code or packages.

## Current Provider Source Adoption

No Provider parser, normalizer, fixture, or bridge implementation currently
contains copied or translated/derived third-party source code.

CodexBar was used as a protocol discovery lead for official service-status
endpoint candidates. The endpoints were independently verified against the
official vendor domains, and no CodexBar source or fixture code was copied.
Its Provider descriptor and fetch-plan architecture was also reviewed as a
concept-only reference; the local browser-extension contracts were implemented
independently. The pinned records are maintained in
`config/provider-upstream-provenance.json`.

## Maintenance Rule

Any future `copied` or `translated/derived` Provider adoption must add a notice
section with a stable notice ID, upstream copyright and license text, source
file and pinned commit, local destination, and modification summary. The same
notice ID must be present in the provenance ledger and in applicable copied or
derived source headers. `npm run provider:quality` rejects incomplete records.
