import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  buildInteractionAuditReviewArchiveRecord,
} from "./lib/interaction-audit-review-archive.mjs";
import {
  buildInteractionAuditReviewRequestRecord,
} from "./lib/interaction-audit-review-request.mjs";
import {
  buildThemeRecoveryReviewArchiveRecord,
} from "./lib/theme-recovery-review-archive.mjs";
import {
  buildThemeRecoveryReviewRequestRecord,
} from "./lib/theme-recovery-review-request.mjs";

const projectRoot = process.cwd();

async function readJson(absolutePath) {
  return JSON.parse(await readFile(absolutePath, "utf8"));
}

async function listSubdirectories(relativeDir) {
  const absoluteDir = path.join(projectRoot, relativeDir);
  const entries = await readdir(absoluteDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .map((entry) => ({
      name: entry,
      absoluteDir: path.join(absoluteDir, entry),
      relativeDir: `${relativeDir}/${entry}`,
    }));
}

async function refreshInteractionAuditRequestReadmes() {
  const directories = await listSubdirectories("Doc/testing/operator_review_requests");
  let refreshedCount = 0;

  for (const directory of directories) {
    const manifest = await readJson(
      path.join(directory.absoluteDir, "review-request.json"),
    );
    const signoffTemplate = await readJson(
      path.join(
        directory.absoluteDir,
        manifest.artifacts?.signoffTemplate ?? "interaction-audit-signoff-template.json",
      ),
    );
    const record = buildInteractionAuditReviewRequestRecord({
      requestId: manifest.requestId,
      createdAt: manifest.createdAt,
      signoffTemplate,
      sourceTemplate: manifest.sourceTemplate,
      sourceEvidencePack: manifest.sourceEvidencePack,
      evidenceSnapshot: manifest.evidenceSnapshot ?? null,
      status: manifest.status,
      fulfillment: manifest.fulfillment ?? null,
      supersededBy: manifest.supersededBy ?? null,
    });

    await writeFile(path.join(directory.absoluteDir, "README.md"), record.readme, "utf8");
    refreshedCount += 1;
  }

  return refreshedCount;
}

async function refreshThemeRecoveryRequestReadmes() {
  const directories = await listSubdirectories(
    "Doc/testing/theme_recovery_review_requests",
  );
  let refreshedCount = 0;

  for (const directory of directories) {
    const manifest = await readJson(
      path.join(directory.absoluteDir, "review-request.json"),
    );
    const reviewTemplate =
      manifest.reviewTemplate ??
      (await readJson(
        path.join(
          directory.absoluteDir,
          manifest.artifacts?.reviewTemplate ?? "theme-recovery-review-template.json",
        ),
      ));
    const seedReferenceExport = await readJson(
      path.join(projectRoot, manifest.sourceSeedReviewExport),
    );
    const record = buildThemeRecoveryReviewRequestRecord({
      requestId: manifest.requestId,
      createdAt: manifest.createdAt,
      status: manifest.status,
      reviewTemplate,
      sourceTemplate: manifest.sourceTemplate,
      seedReferenceExport,
      sourceSeedArchiveReadme: manifest.sourceSeedArchiveReadme,
      sourceSeedReviewExport: manifest.sourceSeedReviewExport,
      fulfillment: manifest.fulfillment ?? null,
    });

    await writeFile(path.join(directory.absoluteDir, "README.md"), record.readme, "utf8");
    refreshedCount += 1;
  }

  return refreshedCount;
}

async function refreshInteractionAuditArchiveReadmes() {
  const directories = await listSubdirectories("Doc/testing/operator_reviews");
  let refreshedCount = 0;

  for (const directory of directories) {
    const manifest = await readJson(
      path.join(directory.absoluteDir, "review-archive.json"),
    );
    const signoffExport = await readJson(
      path.join(
        directory.absoluteDir,
        manifest.artifacts?.signoffExport ?? "interaction-audit-signoff-export.json",
      ),
    );
    const record = buildInteractionAuditReviewArchiveRecord({
      signoffExport,
      evidenceReport: null,
      sourceSignoffExport: manifest.sourceSignoffExport,
      sourceEvidencePack: manifest.sourceEvidencePack,
      evidenceContext: manifest.evidenceContext ?? null,
      sourceRequest: manifest.sourceRequest ?? null,
      archiveId: manifest.archiveId,
      archivedAt: manifest.archivedAt,
    });

    await writeFile(path.join(directory.absoluteDir, "README.md"), record.readme, "utf8");
    refreshedCount += 1;
  }

  return refreshedCount;
}

async function refreshThemeRecoveryArchiveReadmes() {
  const directories = await listSubdirectories("Doc/testing/theme_recovery_reviews");
  let refreshedCount = 0;

  for (const directory of directories) {
    const manifest = await readJson(
      path.join(directory.absoluteDir, "review-archive.json"),
    );
    const reviewExport = await readJson(
      path.join(
        directory.absoluteDir,
        manifest.artifacts?.reviewExport ?? "theme-recovery-review-export.json",
      ),
    );
    const record = buildThemeRecoveryReviewArchiveRecord({
      reviewExport,
      sourceReviewExport: manifest.sourceReviewExport,
      archiveId: manifest.archiveId,
      archivedAt: manifest.archivedAt,
      seeded: Boolean(manifest.seeded),
      sourceRequest: manifest.sourceRequest ?? null,
    });

    await writeFile(path.join(directory.absoluteDir, "README.md"), record.readme, "utf8");
    refreshedCount += 1;
  }

  return refreshedCount;
}

const counts = {
  interactionAuditRequestReadmes: await refreshInteractionAuditRequestReadmes(),
  interactionAuditArchiveReadmes: await refreshInteractionAuditArchiveReadmes(),
  themeRecoveryRequestReadmes: await refreshThemeRecoveryRequestReadmes(),
  themeRecoveryArchiveReadmes: await refreshThemeRecoveryArchiveReadmes(),
};

console.log(
  `refreshed ${counts.interactionAuditRequestReadmes} interaction-audit request README(s), ${counts.interactionAuditArchiveReadmes} interaction-audit archive README(s), ${counts.themeRecoveryRequestReadmes} theme-recovery request README(s), and ${counts.themeRecoveryArchiveReadmes} theme-recovery archive README(s)`,
);
