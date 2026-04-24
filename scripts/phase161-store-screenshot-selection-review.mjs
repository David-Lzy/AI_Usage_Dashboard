import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function readUtf8(relativePath) {
  return readFile(path.join(projectRoot, relativePath), "utf8");
}

const selectionPack = await readUtf8("Doc/Store_Screenshot_Selection_Pack.md");
assert(
  selectionPack.includes("historical baseline") &&
    selectionPack.includes("native toolbar action-bubble popup capture") &&
    selectionPack.includes("full-page shell `Settings`") &&
    selectionPack.includes("full-page shell `Provider detail`"),
  "Selection pack does not record the expected popup/full-page stale-review decisions.",
);
const recaptureMarker = ["selection status:", "  - `recapture required`"].join("\n");
assert(
  selectionPack.split(recaptureMarker).length - 1 === 5,
  "Selection pack does not mark all five screenshot slots as recapture-required.",
);

const storyboard = await readUtf8("Doc/Store_Screenshot_Storyboard.md");
assert(
  storyboard.includes("native toolbar action bubble") &&
    storyboard.includes("Popup app-window smoke capture") &&
    storyboard.includes("full-page shell `Settings`") &&
    storyboard.includes("full-page shell `Provider detail`"),
  "Storyboard does not reflect the expected native-popup and full-page-shell store capture contract.",
);

const copyPack = await readUtf8("Doc/Store_Listing_Copy_Pack.md");
assert(
  copyPack.includes("pre-refresh English claim baseline") &&
    copyPack.includes("Store_Screenshot_Selection_Pack.md") &&
    copyPack.includes("no longer the final submission pack"),
  "Store listing copy pack does not reflect the expected pre-refresh baseline status.",
);

const localizationSourcePack = await readUtf8("Doc/Store_Listing_Localization_Source_Pack.md");
assert(
  localizationSourcePack.includes("pre-refresh localization baseline") &&
    localizationSourcePack.includes("Store_Screenshot_Selection_Pack.md") &&
    localizationSourcePack.includes("not the final submission-ready source set"),
  "Localization source pack does not reflect the expected pre-refresh baseline status.",
);

const todoDoc = await readUtf8("Doc/Roadmap/10_3_Store_Asset_Pack_And_Submission_TODOs.md");
assert(
  todoDoc.includes("first executable slice landed on `2026-04-24` through `Phase 161`") &&
    todoDoc.includes("screenshot selection and stale-archive review after new surfaces land - completed in `Phase 161`") &&
    todoDoc.includes("refreshed screenshot capture request for store-ready surfaces - next"),
  "Direction 10.3 TODO doc does not reflect the expected Phase 161 completion state.",
);

const phase160Results = JSON.parse(
  await readUtf8("tmp/phase160-rdp-runtime-surface-refresh-review/phase160-results.json"),
);
const keys = new Set((phase160Results.captureResults ?? []).map((item) => item.key));
for (const requiredKey of [
  "popup",
  "sidebar-settings",
  "full-page-dashboard",
  "full-page-settings",
  "full-page-provider-detail-codex",
]) {
  assert(keys.has(requiredKey), `Phase 160 runtime evidence is missing ${requiredKey}.`);
}

console.log("phase161: store screenshot selection and stale-review verified");
