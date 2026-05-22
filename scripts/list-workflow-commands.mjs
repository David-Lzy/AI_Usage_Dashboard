#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const packageJson = JSON.parse(
  await readFile(path.join(process.cwd(), "package.json"), "utf8"),
);

const scripts = packageJson.scripts ?? {};
const showAll = process.argv.includes("--all");

const groups = [
  {
    title: "Core",
    match: (name) => ["dev", "build", "preview:dist", "typecheck", "test"].includes(name),
  },
  {
    title: "Docs And I18n",
    match: (name) => name.startsWith("docs:") || name.startsWith("i18n:"),
  },
  {
    title: "Release",
    match: (name) => name === "release" || name.startsWith("release:"),
  },
  {
    title: "Firefox",
    match: (name) => name.startsWith("firefox:"),
  },
  {
    title: "Store",
    match: (name) => name.startsWith("store:"),
  },
  {
    title: "Interaction Audit",
    match: (name) => name.startsWith("interaction-audit:"),
  },
  {
    title: "Theme Recovery",
    match: (name) => name.startsWith("theme-recovery:"),
  },
  {
    title: "Historical Phase Review",
    match: (name) => /^phase\d+:(?:check|review)$/.test(name),
    collapse: true,
  },
];

const groupedNames = new Set();

console.log("Workflow command groups");
console.log("");

for (const group of groups) {
  const names = Object.keys(scripts)
    .filter((name) => group.match(name))
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));

  for (const name of names) {
    groupedNames.add(name);
  }

  if (names.length === 0) {
    continue;
  }

  console.log(`${group.title} (${names.length})`);
  const visibleNames = group.collapse && !showAll ? names.slice(0, 12) : names;
  for (const name of visibleNames) {
    console.log(`  npm run ${name}`);
  }
  if (visibleNames.length < names.length) {
    console.log(`  ... ${names.length - visibleNames.length} more; run npm run workflow:list -- --all`);
  }
  console.log("");
}

const otherNames = Object.keys(scripts)
  .filter((name) => name !== "workflow:list" && !groupedNames.has(name))
  .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));

if (otherNames.length > 0) {
  console.log(`Other (${otherNames.length})`);
  for (const name of otherNames) {
    console.log(`  npm run ${name}`);
  }
}
