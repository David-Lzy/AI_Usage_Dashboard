import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

const AUDITED_SOURCES = {
  "lit-html/lit-html.js": "b878e7f95dec8a9b6e9b217faca6b6a11bad82ebc44c0caa77419ed83edd81f2",
  "@mdui/jq/shared/dom.js": "5d3873cd9c3de2045a47fa94c1b36e82d84b3dd6d20e3bc672b0ee760c13cb06",
  "@mdui/shared/controllers/form.js": "c71db73dcd1062f28d9ae41d1c4bb6ea25fa9a4736ee2fe9c980d4a336dc6891",
  "mdui/components/ripple/index.js": "43080cd1706c494e8e38546ab48b7942ebc5369cf8cd3ffa3b50ecee8c7ab65b",
};

export async function verifyMaterialWarningSources(root) {
  for (const [file, expected] of Object.entries(AUDITED_SOURCES)) {
    const source = await readFile(path.join(root, "node_modules", file));
    if (createHash("sha256").update(source).digest("hex") !== expected) return false;
  }
  return true;
}

export function knownMaterialWarningKind(warning, bundle) {
  if (warning?.code !== "UNSAFE_VAR_ASSIGNMENT" ||
      warning?.file !== "assets/material-controls.js" ||
      warning?.message !== "Unsafe assignment to innerHTML" ||
      !Number.isInteger(warning.line) || !Number.isInteger(warning.column)) return null;
  const line = bundle.split(/\r?\n/)[warning.line - 1];
  const offset = warning.column - 1;
  if (!line || offset < 0 || !/^[$\w]+\.innerHTML=[$\w]+[,;]/.test(line.slice(offset))) return null;
  const before = line.slice(Math.max(0, offset - 150), offset);
  const after = line.slice(offset, offset + 100);
  if (/static createElement\([$\w]+,[$\w]+\)\{const [$\w]+=[$\w]+\.createElement\("template"\);return $/.test(before)) return "lit-static-template";
  if (/=\([$\w]+,[$\w]+\)=>\{const [$\w]+=[$\w]+\([$\w]+\);return $/.test(before) &&
      /^[$\w]+\.innerHTML=[$\w]+,\[\]\.slice\.call\([$\w]+\.childNodes\)\}/.test(after)) return "mdui-dom-factory";
  return null;
}
