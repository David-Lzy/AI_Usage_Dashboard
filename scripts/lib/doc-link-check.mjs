import { execFile } from "node:child_process";
import { stat, readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const IGNORED_TARGET_PATTERN = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

export const DOC_LINK_CHECK_SKIPPED_MARKDOWN_PATTERNS = [
];

function globPatternToRegExp(pattern) {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, "[^/]*");
  return new RegExp(`^${escaped}$`);
}

function matchesAnyPattern(relativePath, patterns) {
  return patterns.some((pattern) => globPatternToRegExp(pattern).test(relativePath));
}

function maskMarkdownCode(text) {
  return text
    .replace(/```[\s\S]*?```/g, (match) => match.replace(/[^\r\n]/g, " "))
    .replace(/~~~[\s\S]*?~~~/g, (match) => match.replace(/[^\r\n]/g, " "))
    .replace(/`[^`\n]*`/g, (match) => " ".repeat(match.length));
}

function parseMarkdownTarget(rawTarget) {
  const trimmed = rawTarget.trim();

  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("<")) {
    const endIndex = trimmed.indexOf(">");
    return endIndex === -1 ? trimmed.slice(1) : trimmed.slice(1, endIndex);
  }

  return trimmed.split(/\s+/)[0] ?? "";
}

function stripTargetSuffixes(target) {
  const suffixIndex = target.search(/[?#]/);
  const withoutQueryOrHash = suffixIndex === -1 ? target : target.slice(0, suffixIndex);
  const lineSuffixMatch = withoutQueryOrHash.match(/^(.+):\d+$/);
  return lineSuffixMatch ? lineSuffixMatch[1] : withoutQueryOrHash;
}

function decodeTargetPath(target) {
  try {
    return decodeURI(target);
  } catch {
    return target;
  }
}

export function isIgnoredMarkdownLinkTarget(rawTarget) {
  const target = parseMarkdownTarget(rawTarget);
  return (
    !target ||
    target.startsWith("#") ||
    IGNORED_TARGET_PATTERN.test(target)
  );
}

export function extractMarkdownLinkTargets({ relativePath, text }) {
  const body = maskMarkdownCode(text);
  const links = [];
  const inlineLinkPattern = /!?\[[^\]\n]*\]\(([^)\n]+)\)/g;
  const referenceLinkPattern = /^[ \t]{0,3}\[[^\]\n]+\]:[ \t]+(.+)$/gm;

  for (const match of body.matchAll(inlineLinkPattern)) {
    const rawTarget = match[1];
    links.push({
      relativePath,
      rawTarget,
      line: body.slice(0, match.index).split(/\r?\n/).length,
    });
  }

  for (const match of body.matchAll(referenceLinkPattern)) {
    const rawTarget = match[1];
    links.push({
      relativePath,
      rawTarget,
      line: body.slice(0, match.index).split(/\r?\n/).length,
    });
  }

  return links;
}

export function resolveLocalMarkdownLinkTarget({
  projectRoot,
  sourceRelativePath,
  rawTarget,
}) {
  if (isIgnoredMarkdownLinkTarget(rawTarget)) {
    return null;
  }

  const parsedTarget = parseMarkdownTarget(rawTarget);
  const targetPath = decodeTargetPath(stripTargetSuffixes(parsedTarget));

  if (!targetPath) {
    return null;
  }

  const resolvedPath = targetPath.startsWith("/")
    ? path.resolve(projectRoot, `.${targetPath}`)
    : path.resolve(projectRoot, path.dirname(sourceRelativePath), targetPath);
  const normalizedRoot = path.resolve(projectRoot);

  if (resolvedPath !== normalizedRoot && !resolvedPath.startsWith(`${normalizedRoot}${path.sep}`)) {
    return {
      targetPath,
      resolvedPath,
      issue: "points outside the repository",
    };
  }

  return {
    targetPath,
    resolvedPath,
    issue: null,
  };
}

export async function listTrackedMarkdownFiles(projectRoot) {
  const { stdout } = await execFileAsync("git", ["ls-files", "--", "*.md"], {
    cwd: projectRoot,
  });

  return stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));
}

export async function evaluateMarkdownLinkTargets({
  projectRoot,
  relativePath,
  text,
}) {
  const issues = [];
  const links = extractMarkdownLinkTargets({ relativePath, text });

  for (const link of links) {
    const resolved = resolveLocalMarkdownLinkTarget({
      projectRoot,
      sourceRelativePath: relativePath,
      rawTarget: link.rawTarget,
    });

    if (!resolved) {
      continue;
    }

    if (resolved.issue) {
      issues.push(
        `${relativePath}:${link.line} link target \`${link.rawTarget.trim()}\` ${resolved.issue}.`,
      );
      continue;
    }

    try {
      await stat(resolved.resolvedPath);
    } catch {
      issues.push(
        `${relativePath}:${link.line} link target \`${link.rawTarget.trim()}\` resolved to missing path \`${path.relative(projectRoot, resolved.resolvedPath)}\`.`,
      );
    }
  }

  return {
    relativePath,
    checkedLinkCount: links.length,
    issues,
  };
}

export async function runDocLinkCheck(projectRoot, options = {}) {
  const markdownFiles =
    options.relativeMarkdownFiles ?? (await listTrackedMarkdownFiles(projectRoot));
  const skippedPatterns =
    options.skippedPatterns ?? DOC_LINK_CHECK_SKIPPED_MARKDOWN_PATTERNS;
  const checkedMarkdownFiles = markdownFiles.filter(
    (relativePath) => !matchesAnyPattern(relativePath, skippedPatterns),
  );
  const results = [];
  const issues = [];

  for (const relativePath of checkedMarkdownFiles) {
    const text =
      options.textByRelativePath?.[relativePath] ??
      (await readFile(path.join(projectRoot, relativePath), "utf8"));
    const result = await evaluateMarkdownLinkTargets({
      projectRoot,
      relativePath,
      text,
    });

    results.push(result);
    issues.push(...result.issues);
  }

  return {
    checkedFileCount: results.length,
    skippedFileCount: markdownFiles.length - checkedMarkdownFiles.length,
    checkedLinkCount: results.reduce((total, result) => total + result.checkedLinkCount, 0),
    results,
    issues,
  };
}
