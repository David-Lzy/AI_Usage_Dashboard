import { copyFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

function sanitizeSegment(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function normalizeDate(value, fallbackIsoString) {
  const candidate =
    typeof value === "string" && value.trim().length >= 10
      ? value.trim().slice(0, 10)
      : fallbackIsoString.slice(0, 10);

  return /^\d{4}-\d{2}-\d{2}$/.test(candidate)
    ? candidate
    : fallbackIsoString.slice(0, 10);
}

function buildArchiveMarkdown(manifest) {
  return `# Store Screenshot Capture Archive - ${manifest.archiveId}

Date: ${manifest.archivedAt.slice(0, 10)}

Process rule:

- follow [Development_Guardrails.md](../../../Development_Guardrails.md)

Document class:

- closed evidence

Freshness model:

- frozen snapshot

Status note:

- this package README records one archived screenshot capture set and should not be silently edited after archival except to correct factual mistakes
- the screenshots listed below are the durable archived evidence for this capture pass

## Archive Scope

- archive id:
  - \`${manifest.archiveId}\`
- archived at:
  - \`${manifest.archivedAt}\`
- source request:
  - \`${manifest.sourceRequest.requestId}\`
- runtime source:
  - \`${manifest.runtimeSource}\`
- preferred size:
  - \`${manifest.preferredSize}\`
- fallback size:
  - \`${manifest.fallbackSize}\`

## Source References

- request README:
  - \`${manifest.sourceRequest.requestReadmePath}\`
- request manifest:
  - \`${manifest.sourceRequest.requestManifestPath}\`
- source capture dir:
  - \`${manifest.sourceCaptureDir}\`
- storyboard:
  - \`${manifest.storyboardPath}\`
- baseline pack README:
  - \`${manifest.baselinePackReadme}\`
- baseline pack plan:
  - \`${manifest.baselinePackPlan}\`

## Archived Screenshots

${manifest.screenshots
  .map(
    (item) =>
      `- \`${item.filename}\`\n  - archive path: \`${item.archivePath}\`\n  - source path: \`${item.sourcePath}\``,
  )
  .join("\n")}

## Truth Note

- this archive preserves one real screenshot-capture set exactly as provided to the completion command
- it does not claim store submission, localization completeness, or broader provider support beyond what the screenshots actually show
`;
}

export function buildStoreScreenshotCaptureArchiveId({ requestId, archiveId }) {
  if (typeof archiveId === "string" && archiveId.trim().length > 0) {
    return sanitizeSegment(archiveId);
  }

  return sanitizeSegment(`${requestId}-archive`);
}

export async function writeStoreScreenshotCaptureArchive({
  projectRoot,
  archiveRoot,
  archiveId,
  archivedAt,
  requestManifest,
  requestDir,
  capturesDir,
  captureFiles,
}) {
  const archiveDir = path.join(archiveRoot, archiveId);
  const screenshotsDir = path.join(archiveDir, "screenshots");
  const sourceRequest = {
    requestId: requestManifest.requestId,
    requestReadmePath: path.relative(projectRoot, path.join(requestDir, "README.md")),
    requestManifestPath: path.relative(
      projectRoot,
      path.join(requestDir, "capture-request.json"),
    ),
  };

  await mkdir(screenshotsDir, { recursive: true });

  const screenshots = [];

  for (const filename of captureFiles) {
    const sourcePath = path.join(capturesDir, filename);
    const archivePath = path.join(screenshotsDir, filename);
    await copyFile(sourcePath, archivePath);
    screenshots.push({
      filename,
      sourcePath: path.relative(projectRoot, sourcePath),
      archivePath: path.relative(projectRoot, archivePath),
    });
  }

  const manifest = {
    archiveId,
    archivedAt,
    sourceRequest,
    sourceCaptureDir: path.relative(projectRoot, capturesDir),
    requestCreatedAt: requestManifest.createdAt,
    runtimeSource: requestManifest.runtimeSource,
    preferredSize: requestManifest.preferredSize,
    fallbackSize: requestManifest.fallbackSize,
    storyboardPath: requestManifest.storyboardPath,
    baselinePackReadme: requestManifest.baselinePackReadme,
    baselinePackPlan: requestManifest.baselinePackPlan,
    requiredScreenshotFilenames: requestManifest.requiredScreenshotFilenames,
    screenshots,
    screenshotCount: screenshots.length,
    captureDate: normalizeDate(archivedAt, archivedAt),
  };

  await writeFile(
    path.join(archiveDir, "capture-archive.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
  await writeFile(path.join(archiveDir, "README.md"), `${buildArchiveMarkdown(manifest)}\n`, "utf8");

  return {
    archiveDir,
    archiveDirRelative: path.relative(projectRoot, archiveDir),
    manifest,
  };
}
