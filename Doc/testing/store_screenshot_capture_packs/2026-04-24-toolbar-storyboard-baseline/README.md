# Store Screenshot Capture Pack - 2026-04-24 Toolbar Storyboard Baseline

Date: 2026-04-24

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

Document class:

- generated operational ledger

Freshness model:

- maintained current reference

Status note:

- this is the current generator-backed baseline pack for truthful extension-mode store screenshot capture
- refresh it through `npm run store:create-screenshot-capture-pack -- --pack-id ...` instead of hand-rewriting the workflow structure

## Capture Scope

- runtime source:
  - `RDP Chrome` unpacked extension
- extension state source:
  - current built `dist/`
- screenshot count:
  - `5`
- preferred size:
  - `1280x800`
- fallback size:
  - `640x400`

## Required Files

1. `01-toolbar-first-quick-glance.png`
2. `02-setup-guidance.png`
3. `03-honest-contract-or-policy-only.png`
4. `04-settings-and-setup-depth.png`
5. `05-provider-or-dashboard-depth.png`

## Workflow

1. Run `npm run build`
2. Reload the unpacked extension in `chrome://extensions`
3. Reopen popup and side-panel surfaces
4. Follow [capture-plan.json](./capture-plan.json) in order
5. Save the screenshots under [captures/](./captures/README.md)

## Truth Boundary

- this baseline pack defines the current truthful screenshot order
- it is not itself a completed store-submission pack
- if real runtime states no longer fit this order, update the storyboard and regenerate the pack
