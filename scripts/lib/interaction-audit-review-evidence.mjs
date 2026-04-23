import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

function normalizePathValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

function buildSourceLabel(source) {
  return source === "cli_override"
    ? "CLI evidence override"
    : source === "request_snapshot"
      ? "Request evidence snapshot"
      : "Request source evidence pack";
}

function toDisplayPath(projectRoot, rawPath, resolvedPath) {
  if (path.isAbsolute(rawPath)) {
    return path.relative(projectRoot, resolvedPath);
  }

  return rawPath;
}

function buildSnapshotIntegrityState({
  requestManifest,
  snapshotArtifactPath,
  rawEvidence,
}) {
  const actualSha256 = createHash("sha256").update(rawEvidence).digest("hex");
  const actualSizeBytes = Buffer.byteLength(rawEvidence, "utf8");
  const expectedSnapshot = requestManifest?.evidenceSnapshot;
  const expectedPath =
    typeof expectedSnapshot?.path === "string" ? expectedSnapshot.path.trim() : "";
  const expectedSha256 =
    typeof expectedSnapshot?.sha256 === "string"
      ? expectedSnapshot.sha256.trim()
      : "";
  const expectedSizeBytes =
    typeof expectedSnapshot?.sizeBytes === "number"
      ? expectedSnapshot.sizeBytes
      : NaN;

  if (expectedSha256.length === 0 || !Number.isFinite(expectedSizeBytes)) {
    return {
      integrityOk: false,
      integrityState: "missing_manifest_digest",
      expectedPath,
      expectedSha256,
      actualSha256,
      expectedSizeBytes: Number.isFinite(expectedSizeBytes)
        ? expectedSizeBytes
        : 0,
      actualSizeBytes,
      integrityError:
        "Review request manifest did not preserve request evidence snapshot integrity metadata.",
    };
  }

  if (expectedPath.length > 0 && expectedPath !== snapshotArtifactPath) {
    return {
      integrityOk: false,
      integrityState: "path_mismatch",
      expectedPath,
      expectedSha256,
      actualSha256,
      expectedSizeBytes,
      actualSizeBytes,
      integrityError:
        `Review request manifest expected snapshot artifact \`${expectedPath}\`, but evidence resolution used \`${snapshotArtifactPath}\`.`,
    };
  }

  if (expectedSha256 !== actualSha256 || expectedSizeBytes !== actualSizeBytes) {
    return {
      integrityOk: false,
      integrityState: "digest_mismatch",
      expectedPath: expectedPath || snapshotArtifactPath,
      expectedSha256,
      actualSha256,
      expectedSizeBytes,
      actualSizeBytes,
      integrityError:
        `Request evidence snapshot \`${snapshotArtifactPath}\` no longer matched the digest recorded in the review request manifest.`,
    };
  }

  return {
    integrityOk: true,
    integrityState: "verified",
    expectedPath: expectedPath || snapshotArtifactPath,
    expectedSha256,
    actualSha256,
    expectedSizeBytes,
    actualSizeBytes,
    integrityError: "",
  };
}

export async function resolveInteractionAuditReviewEvidence({
  projectRoot,
  requestManifest,
  requestDir = "",
  evidence = "",
}) {
  const overridePath = normalizePathValue(evidence);
  const requestPath = normalizePathValue(requestManifest?.sourceEvidencePack);
  const snapshotArtifactPath = normalizePathValue(
    requestManifest?.artifacts?.evidencePack,
  );
  const snapshotInputPath =
    requestDir.trim().length > 0 && snapshotArtifactPath.length > 0
      ? path.join(requestDir, snapshotArtifactPath)
      : "";
  const snapshotDisplayPath =
    snapshotInputPath.length > 0
      ? toDisplayPath(
          projectRoot,
          snapshotInputPath,
          path.resolve(projectRoot, snapshotInputPath),
        )
      : "";
  const source =
    overridePath.length > 0
      ? "cli_override"
      : snapshotInputPath.length > 0
        ? "request_snapshot"
        : "request_manifest";
  const sourceLabel = buildSourceLabel(source);
  const selectedInputPath =
    overridePath.length > 0
      ? overridePath
      : snapshotInputPath.length > 0
        ? snapshotInputPath
        : requestPath;

  if (selectedInputPath.length === 0) {
    return {
      ok: false,
      source,
      sourceLabel,
      requestPath,
      snapshotPath: snapshotDisplayPath,
      selectedPath: "",
      resolvedPath: "",
      evidenceItemCount: 0,
      evidenceReport: null,
      integrityOk: source === "request_snapshot" ? false : true,
      integrityState:
        source === "request_snapshot" ? "missing_request_snapshot" : "not_applicable",
      expectedPath: snapshotArtifactPath,
      expectedSha256: "",
      actualSha256: "",
      expectedSizeBytes: 0,
      actualSizeBytes: 0,
      integrityError: "",
      error:
        source === "cli_override"
          ? "Pass `--evidence <path-to-evidence-pack.json>`."
          : "Review request manifest did not preserve a source evidence pack path.",
    };
  }

  const resolvedPath = path.resolve(projectRoot, selectedInputPath);
  const selectedPath = toDisplayPath(projectRoot, selectedInputPath, resolvedPath);

  try {
    const rawEvidence = await readFile(resolvedPath, "utf8");
    const parsedEvidence = JSON.parse(rawEvidence);
    const snapshotIntegrity =
      source === "request_snapshot"
        ? buildSnapshotIntegrityState({
            requestManifest,
            snapshotArtifactPath,
            rawEvidence,
          })
        : {
            integrityOk: true,
            integrityState: "not_applicable",
            expectedPath: snapshotArtifactPath,
            expectedSha256: "",
            actualSha256: "",
            expectedSizeBytes: 0,
            actualSizeBytes: 0,
            integrityError: "",
          };

    if (!Array.isArray(parsedEvidence?.evidenceItems)) {
      return {
        ok: false,
        source,
        sourceLabel,
        requestPath,
        snapshotPath: snapshotDisplayPath,
        selectedPath,
        resolvedPath,
        evidenceItemCount: 0,
        evidenceReport: null,
        integrityOk: snapshotIntegrity.integrityOk,
        integrityState: snapshotIntegrity.integrityState,
        expectedPath: snapshotIntegrity.expectedPath,
        expectedSha256: snapshotIntegrity.expectedSha256,
        actualSha256: snapshotIntegrity.actualSha256,
        expectedSizeBytes: snapshotIntegrity.expectedSizeBytes,
        actualSizeBytes: snapshotIntegrity.actualSizeBytes,
        integrityError: snapshotIntegrity.integrityError,
        error: `${sourceLabel} \`${selectedPath}\` did not contain a valid \`evidenceItems\` array.`,
      };
    }

    return {
      ok: true,
      source,
      sourceLabel,
      requestPath,
      snapshotPath: snapshotDisplayPath,
      selectedPath,
      resolvedPath,
      evidenceItemCount: parsedEvidence.evidenceItems.length,
      evidenceReport: parsedEvidence,
      integrityOk: snapshotIntegrity.integrityOk,
      integrityState: snapshotIntegrity.integrityState,
      expectedPath: snapshotIntegrity.expectedPath,
      expectedSha256: snapshotIntegrity.expectedSha256,
      actualSha256: snapshotIntegrity.actualSha256,
      expectedSizeBytes: snapshotIntegrity.expectedSizeBytes,
      actualSizeBytes: snapshotIntegrity.actualSizeBytes,
      integrityError: snapshotIntegrity.integrityError,
      error: "",
    };
  } catch (error) {
    return {
      ok: false,
      source,
      sourceLabel,
      requestPath,
      snapshotPath: snapshotDisplayPath,
      selectedPath,
      resolvedPath,
      evidenceItemCount: 0,
      evidenceReport: null,
      integrityOk: source === "request_snapshot" ? false : true,
      integrityState:
        source === "request_snapshot" ? "unreadable_request_snapshot" : "not_applicable",
      expectedPath: snapshotArtifactPath,
      expectedSha256: "",
      actualSha256: "",
      expectedSizeBytes: 0,
      actualSizeBytes: 0,
      integrityError: "",
      error:
        error instanceof SyntaxError
          ? `${sourceLabel} \`${selectedPath}\` was not valid JSON.`
          : `${sourceLabel} \`${selectedPath}\` could not be read.`,
    };
  }
}
