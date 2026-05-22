import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();

const screenshotPlan = [
  {
    filename: "01-toolbar-first-quick-glance.png",
    surface: "popup",
    runtimeState: "healthy or near-healthy visible-provider state",
    claim: "one click gives a compact, readable AI usage snapshot",
  },
  {
    filename: "02-setup-guidance.png",
    surface: "popup",
    runtimeState: "mixed setup blockers",
    claim: "the product tells the user what to do next instead of only showing raw usage cards",
  },
  {
    filename: "03-honest-contract-or-policy-only.png",
    surface: "popup",
    runtimeState: "policy-only or contract-only provider mix",
    claim: "the extension is honest about provider coverage and does not fake live precision",
  },
  {
    filename: "04-settings-and-setup-depth.png",
    surface: "sidepanel-settings",
    runtimeState: "real setup-oriented state",
    claim: "setup ownership lives in Settings, not in a bloated popup",
  },
  {
    filename: "05-provider-or-dashboard-depth.png",
    surface: "sidepanel-dashboard-or-detail",
    runtimeState: "truthful detail-review state",
    claim: "the side panel owns deeper review, contract context, and provider detail",
  },
];

const parseArgs = (argv) => {
  const args = new Map();
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      continue;
    }
    const key = token.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      args.set(key, "true");
      continue;
    }
    args.set(key, value);
    index += 1;
  }
  return args;
};

const args = parseArgs(process.argv.slice(2));
const packId =
  args.get("pack-id") ?? `${new Date().toISOString().slice(0, 10)}-store-screenshot-capture-pack`;

const packRootRelative =
  args.get("output-dir") ??
  path.join("Doc", "testing", "store_screenshot_capture_packs", packId);
const packRoot = path.join(projectRoot, packRootRelative);
const capturesDir = path.join(packRoot, "captures");

const createReadme = (id) => `# Store Screenshot Capture Pack - ${id}

Date: ${new Date().toISOString().slice(0, 10)}

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

Document class:

- generated operational ledger

Freshness model:

- maintained current reference

Status note:

- this pack was generated through \`npm run store:create-screenshot-capture-pack\`
- refresh it through the generator instead of rewriting the workflow structure by hand

## Capture Scope

- runtime source:
  - \`RDP Chrome\` unpacked extension
- extension state source:
  - current built \`dist/chrome/\`
- screenshot count:
  - \`${screenshotPlan.length}\`
- preferred size:
  - \`1280x800\`
- fallback size:
  - \`640x400\`

## Required Files

${screenshotPlan.map((entry, index) => `${index + 1}. \`${entry.filename}\``).join("\n")}

## Workflow

1. Run \`npm run build\`
2. Reload the unpacked extension in \`chrome://extensions\`
3. Reopen popup and side-panel surfaces
4. Follow [capture-plan.json](./capture-plan.json) in order
5. Save the screenshots under [captures/](./captures/README.md)

## Truth Boundary

- this pack defines one screenshot workflow, not a completed store-submission artifact
- if runtime states no longer fit the current storyboard, update the storyboard and regenerate the pack
`;

const createCaptureReadme = () => `# Captures Directory

Date: ${new Date().toISOString().slice(0, 10)}

Process rule:

- follow [Development_Guardrails.md](../../../../Development_Guardrails.md)

Document class:

- generated operational ledger

Freshness model:

- maintained current reference

Status note:

- place runtime-captured screenshot files here using the exact filenames from \`../capture-plan.json\`
- do not rename files ad hoc; change the generator and regenerate the pack if the contract changes

## Expected Filenames

${screenshotPlan.map((entry) => `- \`${entry.filename}\``).join("\n")}
`;

await mkdir(capturesDir, { recursive: true });

await writeFile(path.join(packRoot, "README.md"), `${createReadme(packId)}\n`, "utf8");
await writeFile(
  path.join(packRoot, "capture-plan.json"),
  `${JSON.stringify(
    {
      packId,
      runtimeSource: "RDP Chrome unpacked extension",
      preferredSize: "1280x800",
      fallbackSize: "640x400",
      screenshots: screenshotPlan,
    },
    null,
    2,
  )}\n`,
  "utf8",
);
await writeFile(
  path.join(capturesDir, "README.md"),
  `${createCaptureReadme()}\n`,
  "utf8",
);

console.log(`store-screenshot: capture pack written to ${packRootRelative}`);
