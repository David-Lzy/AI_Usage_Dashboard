import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

export const FORBIDDEN_QA_ARTIFACT_KEY_PATTERNS = [
  /bodyText/i,
  /innerText/i,
  /outerHTML/i,
  /pageBody/i,
  /rawEvidence/i,
  /screenshot/i,
  /imageData/i,
  /dataUrl/i,
  /cookie/i,
  /auth(orization)?Header/i,
  /apiKey/i,
  /secret/i,
  /token/i,
];

export const FORBIDDEN_QA_ARTIFACT_STRING_PATTERNS = [
  /data:image\//i,
  /authorization\s*:\s*bearer/i,
  /cookie\s*[:=]/i,
  /api[_-]?key\s*[:=]/i,
  /auth[_-]?header\s*[:=]/i,
  /provider page body/i,
  /raw private evidence/i,
];

function formatPath(pathSegments) {
  return pathSegments.length > 0 ? pathSegments.join(".") : "$";
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function findForbiddenKeyIssue(key, pathSegments) {
  const matchedPattern = FORBIDDEN_QA_ARTIFACT_KEY_PATTERNS.find((pattern) =>
    pattern.test(key),
  );

  return matchedPattern
    ? {
        path: formatPath([...pathSegments, key]),
        reason: `Forbidden QA artifact key matched ${matchedPattern}.`,
      }
    : null;
}

function findForbiddenStringIssue(value, pathSegments) {
  const matchedPattern = FORBIDDEN_QA_ARTIFACT_STRING_PATTERNS.find((pattern) =>
    pattern.test(value),
  );

  return matchedPattern
    ? {
        path: formatPath(pathSegments),
        reason: `Forbidden QA artifact string matched ${matchedPattern}.`,
      }
    : null;
}

export function scanQaArtifactValue(value, pathSegments = []) {
  if (typeof value === "string") {
    const issue = findForbiddenStringIssue(value, pathSegments);
    return issue ? [issue] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry, index) =>
      scanQaArtifactValue(entry, [...pathSegments, String(index)]),
    );
  }

  if (!isPlainObject(value)) {
    return [];
  }

  return Object.entries(value).flatMap(([key, entry]) => {
    const keyIssue = findForbiddenKeyIssue(key, pathSegments);
    return [
      ...(keyIssue ? [keyIssue] : []),
      ...scanQaArtifactValue(entry, [...pathSegments, key]),
    ];
  });
}

export function scanQaArtifactJsonText(jsonText) {
  let parsed;

  try {
    parsed = JSON.parse(jsonText);
  } catch (error) {
    return [
      {
        path: "$",
        reason: `Invalid JSON artifact: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
    ];
  }

  return scanQaArtifactValue(parsed);
}

async function collectJsonFiles(dirPath, rootDir = dirPath) {
  const dirStat = await stat(dirPath).catch(() => null);

  if (!dirStat?.isDirectory()) {
    return [];
  }

  const entries = await readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      const relativePath = path.relative(rootDir, entryPath);

      if (rootDir === dirPath && !entry.name.startsWith("phase")) {
        continue;
      }

      files.push(...(await collectJsonFiles(entryPath, rootDir)));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".json")) {
      files.push(entryPath);
    }
  }

  return files.sort();
}

export async function scanQaArtifactFiles(rootDir) {
  const files = await collectJsonFiles(rootDir);
  const results = [];

  for (const filePath of files) {
    const issues = scanQaArtifactJsonText(await readFile(filePath, "utf8"));

    if (issues.length > 0) {
      results.push({
        filePath,
        issues,
      });
    }
  }

  return {
    checkedFileCount: files.length,
    results,
  };
}
