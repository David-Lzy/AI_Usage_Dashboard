import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

export const PROVIDER_UPSTREAM_CLASSIFICATIONS = new Set([
  "concept-only",
  "copied",
  "translated/derived",
  "protocol lead",
  "bridge",
  "rejected",
]);

export const PROVIDER_FIXTURE_MAX_BYTES = 128 * 1024;

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isPinnedCommit(value) {
  return typeof value === "string" && /^[a-f0-9]{40}$/i.test(value);
}

function requireString(record, field, errors) {
  if (!isNonEmptyString(record[field])) {
    errors.push(`${record.id ?? "unknown adoption"}: missing ${field}`);
  }
}

export function validateProviderUpstreamProvenance({
  ledger,
  notices,
  readLocalFile,
}) {
  const errors = [];
  if (ledger?.schemaVersion !== 1 || !Array.isArray(ledger?.adoptions)) {
    return ["provider provenance ledger must use schemaVersion 1 and adoptions[]"];
  }

  const ids = new Set();
  for (const record of ledger.adoptions) {
    if (!isNonEmptyString(record.id)) {
      errors.push("provider provenance record is missing id");
      continue;
    }
    if (ids.has(record.id)) {
      errors.push(`${record.id}: duplicate provenance id`);
    }
    ids.add(record.id);

    if (!PROVIDER_UPSTREAM_CLASSIFICATIONS.has(record.classification)) {
      errors.push(`${record.id}: unsupported classification ${record.classification}`);
    }
    requireString(record, "repositoryUrl", errors);
    if (
      isNonEmptyString(record.repositoryUrl) &&
      !/^https:\/\/github\.com\//i.test(record.repositoryUrl)
    ) {
      errors.push(`${record.id}: repositoryUrl must be a GitHub HTTPS URL`);
    }
    if (!isPinnedCommit(record.pinnedCommit)) {
      errors.push(`${record.id}: pinnedCommit must be a full 40-character hash`);
    }
    requireString(record, "localDestination", errors);
    requireString(record, "modificationSummary", errors);
    requireString(record, "maintenanceOwner", errors);

    if (
      record.classification === "protocol lead" &&
      !isNonEmptyString(record.independentVerification)
    ) {
      errors.push(`${record.id}: protocol leads require independentVerification`);
    }

    if (
      record.classification !== "copied" &&
      record.classification !== "translated/derived"
    ) {
      continue;
    }

    for (const field of [
      "upstreamFilePath",
      "copyrightHolder",
      "license",
      "noticeId",
    ]) {
      requireString(record, field, errors);
    }

    if (!isNonEmptyString(record.localDestination)) {
      continue;
    }

    let localSource = "";
    try {
      localSource = readLocalFile(record.localDestination);
    } catch {
      errors.push(`${record.id}: localDestination does not exist`);
      continue;
    }

    if (
      isNonEmptyString(record.noticeId) &&
      !localSource.includes(`Upstream-Notice: ${record.noticeId}`)
    ) {
      errors.push(`${record.id}: local source is missing its Upstream-Notice header`);
    }
    if (
      isNonEmptyString(record.noticeId) &&
      !notices.includes(`Notice ID: ${record.noticeId}`)
    ) {
      errors.push(`${record.id}: THIRD_PARTY_NOTICES is missing the notice ID`);
    }
    for (const noticeValue of [record.copyrightHolder, record.license]) {
      if (isNonEmptyString(noticeValue) && !notices.includes(noticeValue)) {
        errors.push(`${record.id}: THIRD_PARTY_NOTICES is missing ${noticeValue}`);
      }
    }
  }

  return errors;
}

function collectFixtureFiles(directory) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFixtureFiles(path));
    } else if (entry.isFile()) {
      files.push(path);
    }
  }
  return files;
}

export function validateProviderFixtureSizes(fixturesRoot, maxBytes = PROVIDER_FIXTURE_MAX_BYTES) {
  const errors = [];
  for (const file of collectFixtureFiles(fixturesRoot)) {
    const size = statSync(file).size;
    if (size > maxBytes) {
      errors.push(
        `${relative(fixturesRoot, file)} exceeds the ${maxBytes}-byte provider fixture limit`,
      );
    }
  }
  return errors;
}
