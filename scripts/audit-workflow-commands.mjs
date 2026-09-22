import { readFileSync } from "node:fs";
import path from "node:path";
import { inventoryCommands } from "./lib/workflow-command-inventory.mjs";

const root = process.cwd();
const inventory = inventoryCommands(root, JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")));
const errors = inventory.flatMap((entry) => [
  ...entry.missingCalls.map((call) => `${entry.name}: missing npm command ${call}`),
  ...entry.files.filter((file) => !file.exists).map((file) => `${entry.name}: missing target ${file.path}`),
]);
const report = {
  mode: "read-only",
  note: "Static inventory only. References are not necessarily inputs; writes are syntax, not resolved targets. No command was executed and no file is a deletion candidate. External callers and active browser consumers require operator review.",
  errors, commands: inventory,
};
if (process.argv.includes("--json")) console.log(JSON.stringify(report, null, 2));
else {
  for (const kind of new Set(inventory.map((entry) => entry.classification))) {
    console.log(`${kind}: ${inventory.filter((entry) => entry.classification === kind).length}`);
  }
  console.log(report.note);
  console.log("Use --json for script sizes, timestamps, npm callers, references and write expressions.");
  for (const error of errors) console.error(error);
}
if (errors.length) process.exitCode = 1;
