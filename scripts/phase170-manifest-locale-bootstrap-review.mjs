import { access, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = process.cwd();

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function readJson(relativePath) {
  return JSON.parse(
    await readFile(path.join(projectRoot, relativePath), "utf8"),
  );
}

const packageJson = await readJson("package.json");
assert(packageJson.scripts["phase170:review"], "package.json is missing phase170:review.");

const manifest = await readJson("src/manifest.json");
assert(manifest.default_locale === "en", "manifest default_locale must be `en`.");
assert(manifest.name === "__MSG_manifest_ext_name__", "manifest name is not localized through __MSG_manifest_ext_name__.");
assert(
  manifest.description === "__MSG_manifest_ext_description__",
  "manifest description is not localized through __MSG_manifest_ext_description__.",
);
assert(
  manifest.action?.default_title === "__MSG_manifest_action_default_title__",
  "manifest action.default_title is not localized through __MSG_manifest_action_default_title__.",
);

const enMessages = await readJson("public/_locales/en/messages.json");
const zhMessages = await readJson("public/_locales/zh_CN/messages.json");
for (const [catalogName, catalog] of [["en", enMessages], ["zh_CN", zhMessages]]) {
  for (const key of [
    "manifest_ext_name",
    "manifest_ext_description",
    "manifest_action_default_title",
  ]) {
    assert(
      typeof catalog[key]?.message === "string" && catalog[key].message.trim().length > 0,
      `${catalogName} catalog is missing a non-empty message for ${key}.`,
    );
  }
}

await access(path.join(projectRoot, "Doc", "I18n_Message_ID_Contract.md"));
await access(path.join(projectRoot, "Doc", "I18n_String_Inventory_Baseline.md"));

const contractDoc = await readFile(
  path.join(projectRoot, "Doc", "I18n_Message_ID_Contract.md"),
  "utf8",
);
const inventoryDoc = await readFile(
  path.join(projectRoot, "Doc", "I18n_String_Inventory_Baseline.md"),
  "utf8",
);
assert(contractDoc.includes("manifest_ext_name"), "Message ID contract doc does not list manifest_ext_name.");
assert(inventoryDoc.includes("runtime app is still effectively English-only"), "String inventory doc does not preserve the current runtime truth boundary.");

console.log("phase170: manifest locale bootstrap verified default_locale=en locales=en+zh_CN ids=3");
