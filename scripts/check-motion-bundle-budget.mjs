import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { build } from "esbuild";

const modules = [
  "src/shared/motion-preferences.ts",
  "src/shared/motion-runtime.ts",
  "src/shared/use-disclosure-motion.ts",
  "src/shared/use-motion-effects.ts",
  "src/shared/progress-motion.ts",
  "src/shared/use-progress-motion.ts",
  "src/shared/control-visibility.tsx",
  "src/shared/components/MotionDetails.tsx",
  "src/sidepanel/components/material-ui/fusion-theme.ts",
];
const result = await build({
  stdin: { contents: modules.map((file) => `export * from "./${file}";`).join("\n"), resolveDir: process.cwd() },
  bundle: true, write: false, minify: true, metafile: true, format: "esm", target: "es2022",
  jsx: "automatic", external: ["react", "react/*"],
});
const bytes = result.outputFiles[0].contents;
const report = {
  generatedAt: new Date().toISOString(), modules, inputs: Object.keys(result.metafile.inputs),
  rawBytes: bytes.byteLength, gzipBytes: gzipSync(bytes).byteLength, limitBytes: 8 * 1024,
  definition: "Conservative bound: the entire minified shared motion implementation and lazy MDUI theme adapter, including pre-existing helpers, with React/JSX runtime external. Not an extension package size delta.",
};
const output = path.resolve(process.argv.find((value) => value.startsWith("--output="))?.slice(9) ?? "tmp/output/motion-bundle-budget.json");
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ ...report, output }, null, 2));
assert(report.gzipBytes <= report.limitBytes, "Shared motion bundle exceeds the 8KiB budget");
