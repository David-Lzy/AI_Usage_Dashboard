import { execFile } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";

import { buildInteractionAuditHandoffSummaryFromExport } from "./lib/interaction-audit-handoff-bundle.mjs";

const execFileAsync = promisify(execFile);
const projectRoot = process.cwd();
const artifactDir = path.join(
  projectRoot,
  "tmp",
  "phase87-interaction-audit-request-completion-preflight-review",
);
const testingRoot = path.join(artifactDir, "Doc", "testing");
const requestRoot = path.join(testingRoot, "operator_review_requests");
const archiveRoot = path.join(testingRoot, "operator_reviews");
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
const validExportPath = path.join(artifactDir, "exports", "valid-signoff-export.json");
const bindingFailureExportPath = path.join(
  artifactDir,
  "exports",
  "binding-failure-signoff-export.json",
);
const validPreflightPath = path.join(artifactDir, "valid-preflight.json");
const bindingFailurePreflightPath = path.join(
  artifactDir,
  "binding-failure-preflight.json",
);
const driftFailurePreflightPath = path.join(
  artifactDir,
  "drift-failure-preflight.json",
);
const requestId = "2026-04-24-preflight-review-request";

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

function buildCompletedSignoffExport(template) {
  const signoffExport = structuredClone(template);

  signoffExport.metadata.reviewerName = "Operator Example";
  signoffExport.metadata.sessionLabel = "preflight compact pass";
  signoffExport.metadata.reviewedAt = "2026-04-24T14:00:00.000Z";

  for (const surface of signoffExport.surfaces) {
    surface.signoffStatus = "pass";
    surface.manualChecks = surface.manualChecks.map((check) => ({
      ...check,
      completed: true,
    }));
  }

  const summary = buildInteractionAuditHandoffSummaryFromExport(signoffExport);

  signoffExport.summary.reviewedSurfaceCount = summary.reviewedSurfaceCount;
  signoffExport.summary.passSurfaceCount = summary.passSurfaceCount;
  signoffExport.summary.followUpSurfaceCount = summary.followUpSurfaceCount;
  signoffExport.summary.completedManualCheckCount =
    summary.completedManualCheckCount;
  signoffExport.summary.totalManualCheckCount = summary.totalManualCheckCount;

  return signoffExport;
}

async function runPreflight(inputPath, outputPath) {
  return execFileAsync(
    process.execPath,
    [
      "./scripts/preflight-interaction-audit-review-request.mjs",
      "--request-id",
      requestId,
      "--input",
      path.relative(projectRoot, inputPath),
      "--request-root",
      path.relative(projectRoot, requestRoot),
      "--output",
      path.relative(projectRoot, outputPath),
    ],
    { cwd: projectRoot },
  );
}

async function runReview() {
  await rm(artifactDir, { recursive: true, force: true });
  await mkdir(path.dirname(validExportPath), { recursive: true });

  await execFileAsync(
    process.execPath,
    [
      "./scripts/create-interaction-audit-review-request.mjs",
      "--request-id",
      requestId,
      "--request-root",
      path.relative(projectRoot, requestRoot),
      "--evidence",
      path.relative(projectRoot, evidencePath),
    ],
    { cwd: projectRoot },
  );

  const requestManifestPath = path.join(requestRoot, requestId, "review-request.json");
  const requestManifest = await readJson(
    requestManifestPath,
    "Pending request manifest",
  );
  const template = await readJson(templatePath, "Review request template");
  const originalSourceTemplateRaw = await readFile(
    path.join(projectRoot, requestManifest.sourceTemplate),
    "utf8",
  );
  const validExport = buildCompletedSignoffExport(template);
  const bindingFailureExport = structuredClone(validExport);

  validExport.requestContext = {
    requestId,
    requestCreatedAt: requestManifest.createdAt,
    requestRevisionSha256: requestManifest.requestRevisionSha256,
  };
  bindingFailureExport.requestContext = {
    requestId: "2026-04-24-wrong-request",
    requestCreatedAt: requestManifest.createdAt,
    requestRevisionSha256: requestManifest.requestRevisionSha256,
  };

  await writeFile(validExportPath, JSON.stringify(validExport, null, 2), "utf8");
  await writeFile(
    bindingFailureExportPath,
    JSON.stringify(bindingFailureExport, null, 2),
    "utf8",
  );

  try {
    const validPreflight = await runPreflight(validExportPath, validPreflightPath);
    const validReport = await readJson(validPreflightPath, "Valid preflight report");

    assert(validPreflight.stdout.includes("eligible=yes"), "Valid preflight did not pass.");
    assert(
      validReport.ok === true,
      "Valid preflight report did not mark the export as eligible.",
    );

    let bindingFailure = false;

    try {
      await runPreflight(bindingFailureExportPath, bindingFailurePreflightPath);
    } catch {
      bindingFailure = true;
    }

    const bindingFailureReport = await readJson(
      bindingFailurePreflightPath,
      "Binding-failure preflight report",
    );

    assert(
      bindingFailure,
      "Binding-failure preflight did not fail.",
    );
    assert(
      bindingFailureReport.ok === false &&
        bindingFailureReport.checks.some(
          (check) => check.id === "request-binding" && check.ok === false,
        ),
      "Binding-failure preflight report did not preserve the request-binding failure.",
    );

    const driftedTemplate = structuredClone(template);
    driftedTemplate.surfaces[0].manualChecks[0].label =
      "Confirm refreshed focus visibility.";
    await writeFile(
      path.join(projectRoot, requestManifest.sourceTemplate),
      JSON.stringify(driftedTemplate, null, 2),
      "utf8",
    );

    let driftFailure = false;

    try {
      await runPreflight(validExportPath, driftFailurePreflightPath);
    } catch {
      driftFailure = true;
    }

    const driftFailureReport = await readJson(
      driftFailurePreflightPath,
      "Drift-failure preflight report",
    );
    const requestManifestAfterPreflight = await readJson(
      requestManifestPath,
      "Request manifest after preflight",
    );
    const requestIndexMarkdown = await readFile(
      path.join(testingRoot, "Interaction_Audit_Review_Requests.md"),
      "utf8",
    );
    const requestIndex = await readJson(
      path.join(requestRoot, "index.json"),
      "Generated request index",
    );

    assert(
      driftFailure,
      "Drift-failure preflight did not fail.",
    );
    assert(
      driftFailureReport.ok === false &&
        driftFailureReport.checks.some(
          (check) => check.id === "template-drift" && check.ok === false,
        ),
      "Drift-failure preflight report did not preserve the template-drift failure.",
    );
    assert(
      requestManifestAfterPreflight.status === "pending_operator_review",
      "Preflight mutated the pending request manifest.",
    );
    assert(
      Array.isArray(requestIndex.records) &&
        requestIndex.records.length === 1 &&
        requestIndex.records[0].status === "pending_operator_review",
      "Preflight mutated the generated request index.",
    );
    assert(
      requestIndexMarkdown.includes(
        "npm run interaction-audit:preflight-review-request -- --request-id 2026-04-23-first-real-operator-review-request --input tmp/operator-signoff-export.json",
      ),
      "Generated request index did not expose the preflight command.",
    );
    assert(
      (await readFile(path.join(archiveRoot, "index.json"), "utf8").catch(() => null)) ===
        null,
      "Preflight unexpectedly wrote archive output.",
    );

    const report = {
      requestId,
      validEligible: validReport.ok,
      bindingFailureEligible: bindingFailureReport.ok,
      driftFailureEligible: driftFailureReport.ok,
      requestStatusAfterPreflight: requestManifestAfterPreflight.status,
      pendingRequestCount: requestIndex.pendingRequestCount,
      fulfilledRequestCount: requestIndex.fulfilledRequestCount,
    };
    const reportPath = path.join(artifactDir, "phase87-results.json");

    await writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

    console.log(
      `phase87: preflight passed for ${requestId}, then rejected binding and drift failures without mutating the pending request`,
    );
    console.log(`phase87: saved machine-readable results to ${reportPath}`);
    console.log(
      `phase87: valid=${validReport.ok ? "eligible" : "blocked"} binding=${bindingFailureReport.ok ? "eligible" : "blocked"} drift=${driftFailureReport.ok ? "eligible" : "blocked"}`,
    );
  } finally {
    await writeFile(
      path.join(projectRoot, requestManifest.sourceTemplate),
      originalSourceTemplateRaw,
      "utf8",
    );
  }
}

void runReview().catch((error) => {
  console.error("phase87: interaction audit request completion preflight review failed");
  console.error(error);
  process.exitCode = 1;
});
