import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

export const compatibilityQaNames = new Set([
  "phase556:browser-qa",
  "phase565:extension-qa",
]);

export function inspectScriptSource(source) {
  const file = ts.createSourceFile("script.mjs", source, ts.ScriptTarget.Latest, true);
  const references = new Set();
  const expectedVersions = {};
  const writes = new Set();
  function visit(node) {
    if (ts.isStringLiteralLike(node) && /^(?:Doc|src|scripts|dist|release|tmp)\//.test(node.text)) {
      references.add(node.text);
    }
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) &&
        /^expected(?:Package|Manifest)Version$/.test(node.name.text) &&
        node.initializer && ts.isStringLiteralLike(node.initializer)) {
      expectedVersions[node.name.text] = node.initializer.text;
    }
    if (ts.isCallExpression(node) && /^(?:writeFile|mkdir|rm|unlink|rename)$/.test(node.expression.getText(file))) {
      writes.add(node.getText(file));
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  return { expectedVersions, references: [...references].sort(), writes: [...writes] };
}

export function inventoryCommands(root, packageJson) {
  const scripts = packageJson.scripts ?? {};
  const manifest = JSON.parse(readFileSync(path.join(root, "src/manifest.json"), "utf8"));
  return Object.entries(scripts).map(([name, command]) => {
    const targets = [...command.matchAll(/(?:^|\s)(?:\.\/)?(scripts\/[\w./-]+\.(?:mjs|sh|ts))(?=\s|$)/g)]
      .map((match) => match[1]);
    const calls = [...command.matchAll(/\bnpm run ([\w:-]+)/g)].map((match) => match[1]);
    const files = [...new Set(targets)].map((target) => {
      const absolute = path.join(root, target);
      if (!existsSync(absolute)) return { path: target, exists: false };
      const stats = statSync(absolute);
      const analysis = target.endsWith(".mjs") ? inspectScriptSource(readFileSync(absolute, "utf8")) : null;
      return { path: target, exists: true, bytes: stats.size, modifiedAt: stats.mtime.toISOString(),
        ...analysis, references: analysis?.references.map((reference) => ({ path: reference, exists: existsSync(path.join(root, reference)) })) ?? [] };
    });
    const versionMismatch = files.some((file) =>
      (file.expectedVersions?.expectedPackageVersion && file.expectedVersions.expectedPackageVersion !== packageJson.version) ||
      (file.expectedVersions?.expectedManifestVersion && file.expectedVersions.expectedManifestVersion !== manifest.version));
    return {
      name, command,
      classification: compatibilityQaNames.has(name) ? "compatibility-alias" : /^phase\d+:/.test(name)
        ? versionMismatch ? "historical-version-mismatch" : "historical-review-required" : "maintained",
      callers: Object.entries(scripts).filter(([, value]) => [...value.matchAll(/\bnpm run ([\w:-]+)/g)]
        .some((match) => match[1] === name)).map(([caller]) => caller),
      calls, missingCalls: calls.filter((call) => !Object.hasOwn(scripts, call)), files,
    };
  });
}
