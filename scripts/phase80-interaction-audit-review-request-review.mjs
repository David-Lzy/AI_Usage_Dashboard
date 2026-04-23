import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  buildInteractionAuditReviewRequestBoundTemplate,
  writeInteractionAuditReviewRequest,
} from "./lib/interaction-audit-review-request.mjs";

const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase80-interaction-audit-review-request-review",
);
const templatePath = path.join(
  projectRoot,
  "fixtures",
  "interaction-audit",
  "operator-review-request-template.fixture.json",
);
const evidencePath = path.join(
  projectRoot,
  "tmp",
  "phase69-interaction-audit-evidence-pack",
  "phase69-results.json",
);

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

  const signoffTemplate = await readJson(templatePath, "Review request template");
  const evidenceReport = await readJson(evidencePath, "Evidence report");
  const requestRoot = path.join(artifactDir, "requests");
  const result = await writeInteractionAuditReviewRequest({
    projectRoot,
    requestRoot,
    requestId: "2026-04-24-first-real-operator-review-request",
    createdAt: "2026-04-24T10:00:00.000Z",
    signoffTemplate,
    sourceTemplate: path.relative(projectRoot, templatePath),
    sourceEvidencePack: path.relative(projectRoot, evidencePath),
    evidenceReport,
  });

  const manifest = await readJson(
    path.join(result.requestDir, "review-request.json"),
    "Review request manifest",
  );
  const requestReadme = await readFile(
    path.join(result.requestDir, "README.md"),
    "utf8",
  );
  const copiedTemplate = await readJson(
    path.join(result.requestDir, "interaction-audit-signoff-template.json"),
    "Copied review request template",
  );
  const copiedEvidence = await readJson(
    path.join(result.requestDir, "interaction-audit-evidence-pack.json"),
    "Copied review request evidence snapshot",
  );

  assert(
    manifest.status === "pending_operator_review",
    "Review request manifest did not preserve pending status.",
  );
  assert(
    manifest.sourceEvidencePack ===
      "tmp/phase69-interaction-audit-evidence-pack/phase69-results.json",
    "Review request manifest lost the evidence-pack path.",
  );
  assert(
    manifest.artifacts?.evidencePack === "interaction-audit-evidence-pack.json",
    "Review request manifest did not preserve the evidence snapshot artifact path.",
  );
  assert(
    typeof manifest.evidenceSnapshot?.sha256 === "string" &&
      manifest.evidenceSnapshot.sha256.length > 0,
    "Review request manifest did not preserve evidence snapshot digest metadata.",
  );
  assert(
    typeof manifest.requestRevisionSha256 === "string" &&
      manifest.requestRevisionSha256.length > 0,
    "Review request manifest did not preserve request revision metadata.",
  );
  assert(
    requestReadme.includes("Import signoff JSON"),
    "Review request README did not describe the import step.",
  );
  assert(
    requestReadme.includes(
      "Request evidence snapshot: `interaction-audit-evidence-pack.json`",
    ),
    "Review request README did not describe the request evidence snapshot.",
  );
  assert(
    requestReadme.includes("Request evidence snapshot integrity: `sha256:"),
    "Review request README did not describe the request evidence snapshot integrity.",
  );
  assert(
    requestReadme.includes("Request revision: `sha256:"),
    "Review request README did not describe the request revision.",
  );
  assert(
    requestReadme.includes(
      "npm run interaction-audit:preflight-review-request -- --request-id 2026-04-24-first-real-operator-review-request --input tmp/operator-signoff-export.json",
    ),
    "Review request README did not include the preflight command.",
  );
  assert(
    requestReadme.includes(
      "npm run interaction-audit:complete-review-request -- --request-id 2026-04-24-first-real-operator-review-request --input tmp/operator-signoff-export.json",
    ),
    "Review request README did not include the completion command.",
  );
  assert(
    requestReadme.includes("does not claim that a human review has already happened"),
    "Review request README did not preserve the honesty note.",
  );
  assert(
    requestReadme.includes(
      "completion command will reject exported workspace state whose request binding or workspace shape does not match this request package",
    ),
    "Review request README did not preserve the integrity note.",
  );
  assert(
    requestReadme.includes(
      "completion command will also reject this request if the current source template has drifted away from the request package and the request needs regeneration first",
    ),
    "Review request README did not preserve the drift-recovery note.",
  );
  assert(
    requestReadme.includes(
      "That completion command now uses this request package's `Request evidence snapshot` by default. Only pass `--evidence ...` when you intentionally want the archived review to preserve a different evidence report path.",
    ),
    "Review request README did not preserve the evidence-default note.",
  );
  assert(
    requestReadme.includes(
      "npm run interaction-audit:regenerate-review-request -- --request-id 2026-04-24-first-real-operator-review-request",
    ),
    "Review request README did not expose the regeneration command.",
  );
  assert(
    requestReadme.includes(
      "Request binding: 2026-04-24-first-real-operator-review-request @ 2026-04-24T10:00:00.000Z",
    ),
    "Review request README did not expose the bound request context.",
  );
  assert(
    JSON.stringify(copiedTemplate) ===
      JSON.stringify(
        buildInteractionAuditReviewRequestBoundTemplate({
          signoffTemplate,
          requestId: "2026-04-24-first-real-operator-review-request",
          createdAt: "2026-04-24T10:00:00.000Z",
          requestRevisionSha256: manifest.requestRevisionSha256,
        }),
      ),
    "Copied review request template did not preserve the request-bound template shape.",
  );
  assert(
    JSON.stringify(copiedEvidence) === JSON.stringify(evidenceReport),
    "Copied review request evidence snapshot did not preserve the evidence report.",
  );
  assert(
    Array.isArray(evidenceReport.evidenceItems) && evidenceReport.evidenceItems.length > 0,
    "Phase 69 evidence pack was not available for the request review.",
  );

  const report = {
    requestDir: path.relative(projectRoot, result.requestDir),
    requestId: manifest.requestId,
    status: manifest.status,
    sourceTemplate: manifest.sourceTemplate,
    sourceEvidencePack: manifest.sourceEvidencePack,
    requestRevisionSha256: manifest.requestRevisionSha256,
    evidenceSnapshotSha256: manifest.evidenceSnapshot.sha256,
  };
  const reportPath = path.join(artifactDir, "phase80-results.json");

  await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log(`phase80: review request written to ${result.requestDirRelative}`);
  console.log(`phase80: saved machine-readable results to ${reportPath}`);
  console.log(`phase80: status=${manifest.status} request_id=${manifest.requestId}`);
}

void runReview().catch((error) => {
  console.error("phase80: interaction audit review request review failed");
  console.error(error);
  process.exitCode = 1;
});
