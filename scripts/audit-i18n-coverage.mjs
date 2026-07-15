#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import ts from "typescript";

const projectRoot = process.cwd();

const runtimeOverrideFiles = [
  {
    relativePath: "src/shared/runtime-message-catalog-data/overrides-cjk.ts",
    variableName: "CJK_RUNTIME_MESSAGE_OVERRIDES",
  },
  {
    relativePath: "src/shared/runtime-message-catalog-data/overrides-latin.ts",
    variableName: "LATIN_RUNTIME_MESSAGE_OVERRIDES",
  },
  {
    relativePath: "src/shared/runtime-message-catalog-data/overrides-other.ts",
    variableName: "OTHER_RUNTIME_MESSAGE_OVERRIDES",
  },
  {
    relativePath: "src/shared/runtime-message-catalog-data/overrides-completion.ts",
    variableName: "COMPLETION_RUNTIME_MESSAGE_OVERRIDES",
  },
];

const structuredCopyTargets = [
  {
    surface: "popup",
    relativePath: "src/shared/popup-localized-copy.ts",
    constants: [
      "POPUP_FIRST_RUN_COPY",
      "POPUP_FEATURED_COPY",
      "POPUP_SURFACE_COPY",
    ],
    baseLocales: ["en", "zh-CN"],
  },
  {
    surface: "settings",
    relativePath: "src/shared/settings-core-localized-copy.ts",
    constants: ["SETTINGS_CORE_COPY"],
    baseLocales: ["en", "zh-CN"],
  },
  {
    surface: "settings",
    relativePath: "src/shared/settings-credentials-localized-copy.ts",
    constants: ["SETTINGS_CREDENTIALS_COPY"],
    baseLocales: ["en", "zh-CN"],
  },
  {
    surface: "settings",
    relativePath: "src/shared/settings-source-permissions-localized-copy.ts",
    constants: ["SETTINGS_SOURCE_PERMISSIONS_COPY"],
    baseLocales: ["en", "zh-CN"],
  },
  {
    surface: "settings",
    relativePath: "src/shared/settings-configuration-backup-localized-copy.ts",
    constants: ["SETTINGS_CONFIGURATION_BACKUP_COPY"],
    baseLocales: [],
  },
  {
    surface: "settings",
    relativePath: "src/shared/settings-color-choice-localized-copy.ts",
    constants: [
      "SETTINGS_COLOR_CHOICE_COPY",
      "SETTINGS_PREFERENCE_GROUPS_COPY",
    ],
    baseLocales: [],
  },
  {
    surface: "settings",
    relativePath: "src/shared/settings-progress-items-localized-copy.ts",
    constants: ["SETTINGS_PROGRESS_ITEMS_COPY"],
    baseLocales: [],
  },
  {
    surface: "settings",
    relativePath: "src/shared/settings-provider-order-localized-copy.ts",
    constants: ["SETTINGS_PROVIDER_ORDER_COPY"],
    baseLocales: [],
  },
  {
    surface: "progress appearance and gradient controls",
    relativePath: "src/shared/settings-progress-appearance-localized-copy.ts",
    constants: ["SETTINGS_PROGRESS_APPEARANCE_COPY"],
    baseLocales: [],
  },
  {
    surface: "provider cards and provider detail",
    relativePath: "src/shared/provider-detail-extended-localized-copy.ts",
    constants: ["PROVIDER_DETAIL_EXTENDED_COPY"],
    baseLocales: ["en", "zh-CN"],
  },
  {
    surface: "provider cards and provider detail",
    relativePath: "src/shared/provider-source-display-extended-localized-copy.ts",
    constants: ["PROVIDER_SOURCE_DISPLAY_EXTENDED_COPY"],
    baseLocales: ["en", "zh-CN"],
  },
  {
    surface: "provider cards and provider detail",
    relativePath: "src/shared/cursor-usage-localized-copy.ts",
    constants: ["CURSOR_USAGE_COPY"],
    baseLocales: [],
  },
  {
    surface: "provider cards and provider detail",
    relativePath: "src/shared/provider-diagnostic-warning-copy.ts",
    constants: ["WARNING_DIAGNOSTIC_COPY"],
    baseLocales: [],
  },
  {
    surface: "provider cards and provider detail",
    relativePath: "src/shared/provider-diagnostic-source-copy.ts",
    constants: ["SOURCE_DIAGNOSTIC_COPY"],
    baseLocales: [],
  },
  {
    surface: "provider cards and provider detail",
    relativePath: "src/shared/provider-diagnostic-adapter-error-copy.ts",
    constants: ["ADAPTER_ERROR_COPY"],
    baseLocales: [],
  },
  {
    surface: "custom JSON sources",
    relativePath: "src/shared/custom-source-card-localized-copy.ts",
    constants: ["CUSTOM_SOURCE_CARD_COPY"],
    baseLocales: [],
  },
];

const protectedRawEvidenceFields = [
  "ProviderSnapshot.warningReason",
  "ProviderSnapshot.sourceSelectionReason",
  "ProviderSnapshot.sourceFallbackReason",
  "non-parseable ProviderSnapshot.resetAt",
  "non-pattern ProviderSnapshot.resetLabel",
  "non-pattern ProviderSnapshot.lastSyncLabel",
  "ProviderSourcePlan.contractDetail",
  "ProviderSourcePlan.note",
  "ProviderSourcePlan.graduationGateLabel",
  "ProviderSourcePlan.graduationGateDetail",
  "ProviderSetting.description",
  "ProviderSetting.hostsLabel",
  "ProviderSetting.hostOrigins",
  "provider labels, provider ids, route hints, URLs, and API names",
  "archive/export payload text and generated private evidence",
];

const layoutStressLocales = [
  {
    locale: "de",
    reason: "compound nouns and long settings labels frequently expand controls",
  },
  {
    locale: "ru",
    reason: "long Cyrillic labels stress card, chip, and dropdown widths",
  },
  {
    locale: "hi",
    reason: "Devanagari text plus mixed English terms can increase line height and wrapping",
  },
  {
    locale: "ar",
    reason: "RTL direction must be checked with menu anchoring and logical spacing",
  },
  {
    locale: "pt-BR",
    reason: "Portuguese UI labels can be longer than English in settings controls",
  },
  {
    locale: "es-419",
    reason: "Spanish helper text tends to be longer than English",
  },
  {
    locale: "fr",
    reason: "French labels and helper text can expand compact controls",
  },
];

function parseArgs(argv) {
  const options = {
    jsonPath: "",
    markdownPath: "",
    format: "markdown",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--json") {
      options.jsonPath = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--markdown") {
      options.markdownPath = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--format") {
      options.format = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      console.log(`Usage: node scripts/audit-i18n-coverage.mjs [--format markdown|json] [--json path] [--markdown path]`);
      process.exit(0);
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!["markdown", "json"].includes(options.format)) {
    throw new Error("--format must be markdown or json.");
  }

  return options;
}

async function readProjectFile(relativePath) {
  return readFile(path.join(projectRoot, relativePath), "utf8");
}

async function readSourceFile(relativePath) {
  const sourceText = await readProjectFile(relativePath);

  return ts.createSourceFile(
    relativePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    relativePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
}

function unwrapExpression(node) {
  let current = node;

  while (
    ts.isAsExpression(current) ||
    ts.isSatisfiesExpression(current) ||
    ts.isParenthesizedExpression(current) ||
    ts.isTypeAssertionExpression(current)
  ) {
    current = current.expression;
  }

  return current;
}

function getPropertyNameText(name) {
  if (!name) {
    return null;
  }

  if (
    ts.isIdentifier(name) ||
    ts.isStringLiteral(name) ||
    ts.isNumericLiteral(name) ||
    ts.isNoSubstitutionTemplateLiteral(name)
  ) {
    return name.text;
  }

  return null;
}

function findVariableInitializer(sourceFile, variableName) {
  let initializer = null;

  function visit(node) {
    if (initializer) {
      return;
    }

    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
      if (node.name.text === variableName && node.initializer) {
        initializer = unwrapExpression(node.initializer);
        return;
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return initializer;
}

function assertObjectExpression(node, label) {
  const unwrapped = unwrapExpression(node);

  if (!ts.isObjectLiteralExpression(unwrapped)) {
    throw new Error(`${label} is not an object literal.`);
  }

  return unwrapped;
}

function extractObjectProperties(objectExpression) {
  const result = new Map();

  for (const property of objectExpression.properties) {
    if (!ts.isPropertyAssignment(property)) {
      continue;
    }

    const propertyName = getPropertyNameText(property.name);
    if (!propertyName) {
      continue;
    }

    result.set(propertyName, unwrapExpression(property.initializer));
  }

  return result;
}

function extractStringArray(sourceFile, variableName) {
  const initializer = findVariableInitializer(sourceFile, variableName);

  if (!initializer || !ts.isArrayLiteralExpression(unwrapExpression(initializer))) {
    throw new Error(`Could not read string array ${variableName}.`);
  }

  return unwrapExpression(initializer).elements
    .map((element) => unwrapExpression(element))
    .filter((element) => ts.isStringLiteral(element))
    .map((element) => element.text);
}

function extractFlatObjectKeys(sourceFile, variableName) {
  const initializer = findVariableInitializer(sourceFile, variableName);
  if (!initializer) {
    throw new Error(`Could not find ${variableName}.`);
  }

  return [...extractObjectProperties(assertObjectExpression(initializer, variableName)).keys()];
}

function countCopyAtoms(node) {
  const unwrapped = unwrapExpression(node);

  if (ts.isObjectLiteralExpression(unwrapped)) {
    return unwrapped.properties.reduce((total, property) => {
      if (ts.isPropertyAssignment(property)) {
        return total + countCopyAtoms(property.initializer);
      }

      if (ts.isShorthandPropertyAssignment(property) || ts.isSpreadAssignment(property)) {
        return total + 1;
      }

      if (ts.isMethodDeclaration(property)) {
        return total + 1;
      }

      return total;
    }, 0);
  }

  if (ts.isArrayLiteralExpression(unwrapped)) {
    return unwrapped.elements.length;
  }

  return 1;
}

function flattenCopyAtoms(node, prefix = "") {
  const unwrapped = unwrapExpression(node);

  if (ts.isObjectLiteralExpression(unwrapped)) {
    const atoms = new Map();

    for (const property of unwrapped.properties) {
      if (!ts.isPropertyAssignment(property)) {
        continue;
      }

      const propertyName = getPropertyNameText(property.name);
      if (!propertyName) {
        continue;
      }

      const nestedPrefix = prefix.length > 0 ? `${prefix}.${propertyName}` : propertyName;
      const nestedAtoms = flattenCopyAtoms(property.initializer, nestedPrefix);
      for (const [key, value] of nestedAtoms) {
        atoms.set(key, value);
      }
    }

    return atoms;
  }

  if (
    ts.isStringLiteral(unwrapped) ||
    ts.isNoSubstitutionTemplateLiteral(unwrapped)
  ) {
    return new Map([[prefix, unwrapped.text]]);
  }

  return new Map();
}

function classifyRuntimeSurface(messageId) {
  if (messageId.startsWith("popup.")) {
    return "popup";
  }

  if (messageId.startsWith("dashboard.")) {
    return "dashboard";
  }

  if (
    messageId.startsWith("settings.popup_appearance_preview.") ||
    messageId.includes("progress_style") ||
    messageId.includes("accent_preset") ||
    messageId.includes("theme_preset")
  ) {
    return "progress appearance and gradient controls";
  }

  if (
    messageId.startsWith("settings.sources.") ||
    messageId.startsWith("settings.permissions.") ||
    messageId.startsWith("settings.credentials.") ||
    messageId.startsWith("settings.visibility.")
  ) {
    return "provider cards and provider detail";
  }

  if (messageId.startsWith("settings.")) {
    return "settings";
  }

  return "app/common shell";
}

function makeEmptySurfaceCounter() {
  return {
    total: 0,
    explicit: 0,
    fallback: 0,
  };
}

function summarizeRuntimeCoverage(runtimeMessageIds, localeOverrides, locales) {
  const surfaceIds = new Map();

  for (const id of runtimeMessageIds) {
    const surface = classifyRuntimeSurface(id);
    if (!surfaceIds.has(surface)) {
      surfaceIds.set(surface, []);
    }
    surfaceIds.get(surface).push(id);
  }

  return locales.map((locale) => {
    const explicitIds = new Set(localeOverrides.get(locale) ?? []);
    const surfaceCoverage = {};
    const fallbackIds = [];

    for (const [surface, ids] of surfaceIds) {
      const counter = makeEmptySurfaceCounter();
      counter.total = ids.length;
      counter.explicit =
        locale === "en"
          ? ids.length
          : ids.filter((id) => explicitIds.has(id)).length;
      counter.fallback = counter.total - counter.explicit;
      surfaceCoverage[surface] = counter;
      if (locale !== "en") {
        fallbackIds.push(...ids.filter((id) => !explicitIds.has(id)));
      }
    }

    const explicit = locale === "en" ? runtimeMessageIds.length : explicitIds.size;

    return {
      locale,
      total: runtimeMessageIds.length,
      explicit,
      fallback: runtimeMessageIds.length - explicit,
      fallbackIds,
      percent: runtimeMessageIds.length > 0
        ? Number(((explicit / runtimeMessageIds.length) * 100).toFixed(1))
        : 100,
      surfaces: surfaceCoverage,
    };
  });
}

async function readRuntimeCoverage(locales) {
  const baseSource = await readSourceFile(
    "src/shared/runtime-message-catalog-data/base.ts",
  );
  const runtimeMessageIds = extractFlatObjectKeys(baseSource, "EN_RUNTIME_MESSAGES");

  const localeOverrides = new Map(locales.map((locale) => [locale, new Set()]));

  for (const overrideFile of runtimeOverrideFiles) {
    const sourceFile = await readSourceFile(overrideFile.relativePath);
    const initializer = findVariableInitializer(sourceFile, overrideFile.variableName);
    if (!initializer) {
      throw new Error(`Could not find ${overrideFile.variableName}.`);
    }

    const localeMap = extractObjectProperties(
      assertObjectExpression(initializer, overrideFile.variableName),
    );

    for (const [locale, localeNode] of localeMap) {
      if (!localeOverrides.has(locale)) {
        throw new Error(
          `${overrideFile.variableName} contains unsupported locale ${locale}.`,
        );
      }

      const copyKeys = extractObjectProperties(
        assertObjectExpression(localeNode, `${overrideFile.variableName}.${locale}`),
      ).keys();
      const mergedKeys = localeOverrides.get(locale) ?? new Set();

      for (const copyKey of copyKeys) {
        mergedKeys.add(copyKey);
      }

      localeOverrides.set(locale, mergedKeys);
    }
  }

  return {
    runtimeMessageIds,
    coverage: summarizeRuntimeCoverage(runtimeMessageIds, localeOverrides, locales),
  };
}

function summarizeStructuredConstant({
  sourceFile,
  target,
  constantName,
  locales,
}) {
  const initializer = findVariableInitializer(sourceFile, constantName);
  if (!initializer) {
    throw new Error(`Could not find ${constantName} in ${target.relativePath}.`);
  }

  const localeMap = extractObjectProperties(
    assertObjectExpression(initializer, constantName),
  );
  const explicitLocales = [...localeMap.keys()].sort((left, right) =>
    left.localeCompare(right),
  );
  const baseLocales = new Set(target.baseLocales);
  const explicitLocaleSet = new Set(explicitLocales);
  const missingLocales = locales.filter(
    (locale) => !explicitLocaleSet.has(locale) && !baseLocales.has(locale),
  );
  const baseOnlyLocales = locales.filter(
    (locale) => baseLocales.has(locale) && !explicitLocaleSet.has(locale),
  );

  const atomCounts = Object.fromEntries(
    [...localeMap.entries()].map(([locale, localeNode]) => [
      locale,
      countCopyAtoms(localeNode),
    ]),
  );
  const englishAtoms = localeMap.has("en")
    ? flattenCopyAtoms(localeMap.get("en"))
    : new Map();
  const englishIdenticalAtoms = {};

  if (englishAtoms.size > 0) {
    for (const [locale, localeNode] of localeMap) {
      if (locale === "en") {
        continue;
      }

      const localeAtoms = flattenCopyAtoms(localeNode);
      const identicalKeys = [];
      for (const [key, value] of localeAtoms) {
        if (englishAtoms.get(key) === value) {
          identicalKeys.push(key);
        }
      }
      englishIdenticalAtoms[locale] = identicalKeys.length;
    }
  }

  return {
    surface: target.surface,
    relativePath: target.relativePath,
    constantName,
    explicitLocales,
    baseOnlyLocales,
    missingLocales,
    atomCounts,
    englishIdenticalAtoms,
  };
}

async function readStructuredCoverage(locales) {
  const rows = [];
  const notes = [];

  for (const target of structuredCopyTargets) {
    if (target.note) {
      notes.push({
        surface: target.surface,
        relativePath: target.relativePath,
        note: target.note,
      });
    }

    if (target.constants.length === 0) {
      continue;
    }

    const sourceFile = await readSourceFile(target.relativePath);
    for (const constantName of target.constants) {
      rows.push(
        summarizeStructuredConstant({
          sourceFile,
          target,
          constantName,
          locales,
        }),
      );
    }
  }

  return { rows, notes };
}

function summarizeStructuredBySurface(rows, notes) {
  const surfaces = new Map();

  for (const row of rows) {
    if (!surfaces.has(row.surface)) {
      surfaces.set(row.surface, {
        modules: 0,
        constants: 0,
        missingConstants: 0,
        missingLocales: new Set(),
      });
    }

    const summary = surfaces.get(row.surface);
    summary.constants += 1;
    summary.missingConstants += row.missingLocales.length > 0 ? 1 : 0;
    for (const locale of row.missingLocales) {
      summary.missingLocales.add(locale);
    }
  }

  for (const note of notes) {
    if (!surfaces.has(note.surface)) {
      surfaces.set(note.surface, {
        modules: 0,
        constants: 0,
        missingConstants: 0,
        missingLocales: new Set(),
      });
    }
  }

  for (const surface of surfaces.values()) {
    surface.missingLocales = [...surface.missingLocales].sort();
  }

  return Object.fromEntries([...surfaces.entries()].sort());
}

function formatPercent(numerator, denominator) {
  if (denominator === 0) {
    return "100.0%";
  }

  return `${((numerator / denominator) * 100).toFixed(1)}%`;
}

function markdownTable(headers, rows) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.join(" | ")} |`),
  ].join("\n");
}

function buildMarkdownReport(audit) {
  const runtimeRows = audit.runtime.coverage.map((row) => [
    `\`${row.locale}\``,
    `${row.explicit}/${row.total}`,
    `${row.percent.toFixed(1)}%`,
    `${row.fallback}`,
  ]);

  const surfaceSet = new Set();
  for (const row of audit.runtime.coverage) {
    for (const surface of Object.keys(row.surfaces)) {
      surfaceSet.add(surface);
    }
  }

  const surfaceRows = [...surfaceSet].sort().flatMap((surface) =>
    audit.runtime.coverage.map((row) => {
      const counter = row.surfaces[surface] ?? makeEmptySurfaceCounter();
      return [
        surface,
        `\`${row.locale}\``,
        `${counter.explicit}/${counter.total}`,
        `${counter.fallback}`,
      ];
    }),
  );

  const structuredRows = audit.structured.rows.map((row) => [
    row.surface,
    `\`${row.constantName}\``,
    row.baseOnlyLocales.length > 0
      ? row.baseOnlyLocales.map((locale) => `\`${locale}\``).join(", ")
      : "-",
    row.explicitLocales.length > 0
      ? row.explicitLocales.map((locale) => `\`${locale}\``).join(", ")
      : "-",
    row.missingLocales.length > 0
      ? row.missingLocales.map((locale) => `\`${locale}\``).join(", ")
      : "-",
    Object.entries(row.englishIdenticalAtoms).length > 0
      ? Object.entries(row.englishIdenticalAtoms)
          .filter(([, count]) => count > 0)
          .map(([locale, count]) => `\`${locale}\`: ${count}`)
          .join(", ") || "-"
      : "-",
  ]);

  const structuredSurfaceRows = Object.entries(audit.structured.bySurface).map(
    ([surface, summary]) => [
      surface,
      `${summary.constants}`,
      `${summary.missingConstants}`,
      summary.missingLocales.length > 0
        ? summary.missingLocales.map((locale) => `\`${locale}\``).join(", ")
        : "-",
    ],
  );

  const noteRows = audit.structured.notes.map((note) => [
    note.surface,
    `\`${note.relativePath}\``,
    note.note,
  ]);

  const fallbackLocales = audit.runtime.coverage.filter((row) => row.fallback > 0);
  const fallbackIdsBySurface = new Map();
  for (const row of fallbackLocales) {
    for (const id of row.fallbackIds) {
      const surface = classifyRuntimeSurface(id);
      if (!fallbackIdsBySurface.has(surface)) {
        fallbackIdsBySurface.set(surface, new Set());
      }
      fallbackIdsBySurface.get(surface).add(id);
    }
  }
  const fallbackIdRows = [...fallbackIdsBySurface.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([surface, ids]) => [
      surface,
      [...ids].sort().map((id) => `\`${id}\``).join("<br>"),
    ]);
  const structuredGaps = audit.structured.rows.filter(
    (row) => row.missingLocales.length > 0,
  );

  const priorityLines = [];
  if (fallbackLocales.length > 0) {
    priorityLines.push(
      `- Runtime catalog still has English fallback in: ${fallbackLocales.map((row) => `\`${row.locale}\``).join(", ")}.`,
    );
  } else {
    priorityLines.push(
      "- Runtime `RuntimeMessageId` catalog has explicit entries for every shipped locale.",
    );
  }

  if (structuredGaps.length > 0) {
    priorityLines.push(
      `- Structured copy modules with missing locale records: ${structuredGaps.map((row) => `\`${row.constantName}\``).join(", ")}.`,
    );
  } else {
    priorityLines.push(
      "- Structured copy modules audited here have explicit records or documented base branches for every shipped locale.",
    );
  }

  if (audit.structured.notes.length > 0) {
    priorityLines.push(
      "- Custom JSON source cards still use an inline zh-CN/English helper and should be promoted to a structured 14-locale copy module in the translation expansion phase.",
    );
  }

  priorityLines.push(
    "- Use `de`, `ru`, `hi`, `ar`, `pt-BR`, `es-419`, and `fr` as layout stress locales for screenshot QA.",
  );

  return `# I18n Coverage Audit

Date: ${audit.date}

## Summary

- Runtime message ids: ${audit.runtime.messageIdCount}
- Runtime explicit coverage: ${formatPercent(
    audit.runtime.coverage.reduce((total, row) => total + row.explicit, 0),
    audit.runtime.coverage.reduce((total, row) => total + row.total, 0),
  )} across ${audit.locales.length} locales.
- Structured copy constants audited: ${audit.structured.rows.length}
- Protected raw evidence fields remain outside translation scope: ${audit.protectedRawEvidenceFields.length}

## Runtime Catalog By Locale

${markdownTable(["Locale", "Explicit ids", "Explicit %", "English fallback ids"], runtimeRows)}

## Runtime Catalog By Surface

${markdownTable(["Surface", "Locale", "Explicit ids", "English fallback ids"], surfaceRows)}

${fallbackIdRows.length > 0 ? `## Runtime Fallback IDs By Surface

These ids still fall back to English in at least one non-English locale.

${markdownTable(["Surface", "Fallback ids"], fallbackIdRows)}
` : ""}
## Structured Copy By Surface

${markdownTable(["Surface", "Constants audited", "Constants with missing locales", "Missing locales"], structuredSurfaceRows)}

## Structured Copy Constants

${markdownTable(["Surface", "Constant", "Base branch locales", "Explicit record locales", "Missing locales", "English-identical string atoms"], structuredRows)}

${noteRows.length > 0 ? `## Structured Copy Notes

${markdownTable(["Surface", "File", "Note"], noteRows)}
` : ""}
## Protected Raw Evidence Boundary

Do not translate these fields directly during translation expansion:

${audit.protectedRawEvidenceFields.map((field) => `- \`${field}\``).join("\n")}

## Layout Stress Locales

${audit.layoutStressLocales.map((entry) => `- \`${entry.locale}\` - ${entry.reason}`).join("\n")}

## Next Priorities

${priorityLines.join("\n")}
`;
}

async function buildAudit() {
  const metadataSource = await readSourceFile("src/shared/i18n-locale-metadata.ts");
  const locales = extractStringArray(metadataSource, "SUPPORTED_APP_LOCALES");
  const runtime = await readRuntimeCoverage(locales);
  const structured = await readStructuredCoverage(locales);

  return {
    date: new Date().toISOString().slice(0, 10),
    locales,
    runtime: {
      messageIdCount: runtime.runtimeMessageIds.length,
      coverage: runtime.coverage,
    },
    structured: {
      rows: structured.rows,
      notes: structured.notes,
      bySurface: summarizeStructuredBySurface(structured.rows, structured.notes),
    },
    protectedRawEvidenceFields,
    layoutStressLocales,
  };
}

async function writeOutput(filePath, contents) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, contents);
}

const options = parseArgs(process.argv.slice(2));
const audit = await buildAudit();
const markdown = buildMarkdownReport(audit);
const json = `${JSON.stringify(audit, null, 2)}\n`;

if (options.markdownPath) {
  await writeOutput(path.resolve(projectRoot, options.markdownPath), markdown);
}

if (options.jsonPath) {
  await writeOutput(path.resolve(projectRoot, options.jsonPath), json);
}

process.stdout.write(options.format === "json" ? json : markdown);
