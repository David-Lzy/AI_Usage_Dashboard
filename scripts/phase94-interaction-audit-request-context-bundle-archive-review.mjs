import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";

import { writeInteractionAuditReviewArchive } from "./lib/interaction-audit-review-archive.mjs";

const execFileAsync = promisify(execFile);
const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase94-interaction-audit-request-context-bundle-archive-review",
);
const inputPath = path.join(artifactDir, "request-bound-signoff-export.json");
const evidencePath = path.join(
  projectRoot,
  "tmp",
  "phase69-interaction-audit-evidence-pack",
  "phase69-results.json",
);
const outputDir = path.join(artifactDir, "generated-bundle");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function readJson(filePath, label) {
  const raw = await readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);

  assert(parsed && typeof parsed === "object", `${label} was not a JSON object.`);

  return parsed;
}

async function runReview() {
  await mkdir(artifactDir, { recursive: true });

  const signoffExport = {
    metadata: {
      reviewerName: "Operator Example",
      sessionLabel: "Request Context Bundle Pass",
      reviewedAt: "2026-04-24T11:30:00.000Z",
    },
    requestContext: {
      requestId: "2026-04-24-traceable-operator-review-request",
      requestCreatedAt: "2026-04-24T11:00:00.000Z",
      requestRevisionSha256:
        "4e93b89e9e93b89e9e93b89e9e93b89e9e93b89e9e93b89e9e93b89e9e93b89e",
    },
    surfaces: [
      {
        id: "dashboard-360",
        title: "Dashboard",
        description: "Compact dashboard frame.",
        signoffStatus: "pass",
        operatorNotes: "Looks stable.",
        manualChecks: [
          { label: "Confirm focus visibility.", completed: true },
          { label: "Confirm density.", completed: false },
        ],
      },
      {
        id: "settings-420",
        title: "Settings",
        description: "Compact settings frame.",
        signoffStatus: "follow_up",
        operatorNotes: "Need one more compact-width pass.",
        manualChecks: [
          { label: "Confirm diagnostics readability.", completed: true },
          { label: "Confirm select emphasis.", completed: false },
        ],
      },
    ],
  };

  await writeFile(inputPath, JSON.stringify(signoffExport, null, 2), "utf8");

  await execFileAsync(
    process.execPath,
    [
      "./scripts/build-interaction-audit-handoff-bundle.mjs",
      "--input",
      path.relative(projectRoot, inputPath),
      "--output-dir",
      path.relative(projectRoot, outputDir),
    ],
    {
      cwd: projectRoot,
    },
  );

  const bundleJsonPath = path.join(outputDir, "interaction-audit-handoff-bundle.json");
  const bundleMarkdownPath = path.join(
    outputDir,
    "interaction-audit-handoff-bundle.md",
  );
  const bundleJson = await readJson(bundleJsonPath, "Handoff bundle JSON");
  const bundleMarkdown = await readFile(bundleMarkdownPath, "utf8");

  assert(
    bundleJson.requestContext?.requestId ===
      "2026-04-24-traceable-operator-review-request",
    "Bundle JSON did not preserve the bound request id.",
  );
  assert(
    bundleJson.requestContext?.requestRevisionSha256 ===
      "4e93b89e9e93b89e9e93b89e9e93b89e9e93b89e9e93b89e9e93b89e9e93b89e",
    "Bundle JSON did not preserve the bound request revision.",
  );
  assert(
    bundleMarkdown.includes(
      "- Request binding: 2026-04-24-traceable-operator-review-request @ 2026-04-24T11:00:00.000Z",
    ),
    "Bundle markdown did not preserve the request binding.",
  );
  assert(
    bundleMarkdown.includes(
      "- Request revision: sha256:4e93b89e9e93b89e9e93b89e9e93b89e9e93b89e9e93b89e9e93b89e9e93b89e",
    ),
    "Bundle markdown did not preserve the request revision.",
  );

  const evidenceReport = await readJson(evidencePath, "Evidence report");
  const archiveRoot = path.join(artifactDir, "archives");
  const archivedAt = "2026-04-24T12:00:00.000Z";
  const archiveId = "2026-04-24-request-context-bundle-archive-pass";
  const archiveResult = await writeInteractionAuditReviewArchive({
    projectRoot,
    signoffExport,
    evidenceReport,
    sourceSignoffExport: path.relative(projectRoot, inputPath),
    sourceEvidencePack: path.relative(projectRoot, evidencePath),
    sourceRequest: {
      requestId: "2026-04-24-traceable-operator-review-request",
      requestReadmePath:
        "Doc/testing/operator_review_requests/2026-04-24-traceable-operator-review-request/README.md",
      requestManifestPath:
        "Doc/testing/operator_review_requests/2026-04-24-traceable-operator-review-request/review-request.json",
    },
    archiveRoot,
    archiveId,
    archivedAt,
  });

  const archiveManifestPath = path.join(archiveResult.archiveDir, "review-archive.json");
  const archiveReadmePath = path.join(archiveResult.archiveDir, "README.md");
  const archiveManifest = await readJson(archiveManifestPath, "Archive manifest");
  const archiveReadme = await readFile(archiveReadmePath, "utf8");

  assert(
    archiveManifest.requestContext?.requestRevisionSha256 ===
      "4e93b89e9e93b89e9e93b89e9e93b89e9e93b89e9e93b89e9e93b89e9e93b89e",
    "Archive manifest did not preserve the request revision.",
  );
  assert(
    archiveReadme.includes(
      "- Request binding: 2026-04-24-traceable-operator-review-request @ 2026-04-24T11:00:00.000Z",
    ),
    "Archive README did not preserve the request binding.",
  );
  assert(
    archiveReadme.includes(
      "- Request revision: sha256:4e93b89e9e93b89e9e93b89e9e93b89e9e93b89e9e93b89e9e93b89e9e93b89e",
    ),
    "Archive README did not preserve the request revision.",
  );

  const report = {
    requestId: signoffExport.requestContext.requestId,
    requestRevisionSha256: signoffExport.requestContext.requestRevisionSha256,
    bundleJson: path.relative(projectRoot, bundleJsonPath),
    bundleMarkdown: path.relative(projectRoot, bundleMarkdownPath),
    archiveManifest: path.relative(projectRoot, archiveManifestPath),
    archiveReadme: path.relative(projectRoot, archiveReadmePath),
  };
  const reportPath = path.join(artifactDir, "phase94-results.json");

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log(`phase94: saved artifacts under ${artifactDir}`);
  console.log(`phase94: saved machine-readable results to ${reportPath}`);
  console.log(
    `phase94: request=${signoffExport.requestContext.requestId} revision=${signoffExport.requestContext.requestRevisionSha256}`,
  );
}

void runReview().catch((error) => {
  console.error(
    "phase94: interaction audit request-context bundle/archive review failed",
  );
  console.error(error);
  process.exitCode = 1;
});
