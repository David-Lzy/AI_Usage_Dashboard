import { createHash } from "node:crypto";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { resolveInteractionAuditReviewEvidence } from "./interaction-audit-review-evidence.mjs";

describe("interaction audit review evidence helpers", () => {
  it("prefers a request-package evidence snapshot by default", async () => {
    const projectRoot = await mkdtemp(
      path.join(tmpdir(), "interaction-audit-review-evidence-"),
    );
    const evidencePath = path.join(projectRoot, "tmp", "request-evidence.json");
    const requestDir = path.join(
      projectRoot,
      "Doc",
      "testing",
      "operator_review_requests",
      "request-a",
    );
    const snapshotPath = path.join(
      requestDir,
      "interaction-audit-evidence-pack.json",
    );

    const snapshotEvidence = {
      evidenceItems: [
        {
          surfaceTitle: "Dashboard",
          label: "Synthetic baseline",
          expectation: "Synthetic expectation",
          screenshot: "dashboard.png",
          auditStatus: { message: "Prepared" },
        },
      ],
    };
    const serializedSnapshot = JSON.stringify(snapshotEvidence, null, 2);

    await mkdir(path.dirname(evidencePath), { recursive: true });
    await mkdir(requestDir, { recursive: true });
    await writeFile(
      evidencePath,
      JSON.stringify({ evidenceItems: [] }, null, 2),
      "utf8",
    );
    await writeFile(
      snapshotPath,
      serializedSnapshot,
      "utf8",
    );

    const resolution = await resolveInteractionAuditReviewEvidence({
      projectRoot,
      requestDir,
      requestManifest: {
        sourceEvidencePack: path.relative(projectRoot, evidencePath),
        artifacts: {
          evidencePack: "interaction-audit-evidence-pack.json",
        },
        evidenceSnapshot: {
          path: "interaction-audit-evidence-pack.json",
          sha256: createHash("sha256").update(serializedSnapshot).digest("hex"),
          sizeBytes: Buffer.byteLength(serializedSnapshot, "utf8"),
        },
      },
    });

    expect(resolution.ok).toBe(true);
    expect(resolution.source).toBe("request_snapshot");
    expect(resolution.requestPath).toBe("tmp/request-evidence.json");
    expect(resolution.selectedPath).toBe(
      "Doc/testing/operator_review_requests/request-a/interaction-audit-evidence-pack.json",
    );
    expect(resolution.evidenceItemCount).toBe(1);
    expect(resolution.integrityOk).toBe(true);
    expect(resolution.integrityState).toBe("verified");
  });

  it("falls back to the legacy request-manifest evidence path when no snapshot exists", async () => {
    const projectRoot = await mkdtemp(
      path.join(tmpdir(), "interaction-audit-review-evidence-"),
    );
    const requestEvidencePath = path.join(projectRoot, "tmp", "request-evidence.json");

    await mkdir(path.dirname(requestEvidencePath), { recursive: true });
    await writeFile(
      requestEvidencePath,
      JSON.stringify(
        {
          evidenceItems: [
            {
              surfaceTitle: "Popup",
              label: "Override evidence",
              expectation: "Override expectation",
              screenshot: "popup.png",
              auditStatus: { message: "Prepared" },
            },
          ],
        },
        null,
        2,
      ),
      "utf8",
    );

    const resolution = await resolveInteractionAuditReviewEvidence({
      projectRoot,
      requestManifest: {
        sourceEvidencePack: path.relative(projectRoot, requestEvidencePath),
      },
    });

    expect(resolution.ok).toBe(true);
    expect(resolution.source).toBe("request_manifest");
    expect(resolution.selectedPath).toBe("tmp/request-evidence.json");
    expect(resolution.evidenceItemCount).toBe(1);
  });

  it("lets a cli override replace the request snapshot", async () => {
    const projectRoot = await mkdtemp(
      path.join(tmpdir(), "interaction-audit-review-evidence-"),
    );
    const requestEvidencePath = path.join(projectRoot, "tmp", "request-evidence.json");
    const overrideEvidencePath = path.join(
      projectRoot,
      "tmp",
      "override-evidence.json",
    );
    const requestDir = path.join(
      projectRoot,
      "Doc",
      "testing",
      "operator_review_requests",
      "request-b",
    );
    const snapshotPath = path.join(
      requestDir,
      "interaction-audit-evidence-pack.json",
    );

    await mkdir(path.dirname(requestEvidencePath), { recursive: true });
    await mkdir(requestDir, { recursive: true });
    await writeFile(
      requestEvidencePath,
      JSON.stringify({ evidenceItems: [] }, null, 2),
      "utf8",
    );
    await writeFile(
      snapshotPath,
      JSON.stringify({ evidenceItems: [] }, null, 2),
      "utf8",
    );
    await writeFile(
      overrideEvidencePath,
      JSON.stringify(
        {
          evidenceItems: [
            {
              surfaceTitle: "Popup",
              label: "Override evidence",
              expectation: "Override expectation",
              screenshot: "popup.png",
              auditStatus: { message: "Prepared" },
            },
          ],
        },
        null,
        2,
      ),
      "utf8",
    );

    const resolution = await resolveInteractionAuditReviewEvidence({
      projectRoot,
      requestDir,
      requestManifest: {
        sourceEvidencePack: path.relative(projectRoot, requestEvidencePath),
        artifacts: {
          evidencePack: "interaction-audit-evidence-pack.json",
        },
      },
      evidence: path.relative(projectRoot, overrideEvidencePath),
    });

    expect(resolution.ok).toBe(true);
    expect(resolution.source).toBe("cli_override");
    expect(resolution.requestPath).toBe("tmp/request-evidence.json");
    expect(resolution.snapshotPath).toBe(
      "Doc/testing/operator_review_requests/request-b/interaction-audit-evidence-pack.json",
    );
    expect(resolution.selectedPath).toBe("tmp/override-evidence.json");
    expect(resolution.evidenceItemCount).toBe(1);
    expect(resolution.integrityState).toBe("not_applicable");
  });

  it("reports a digest mismatch when the request snapshot was modified after packaging", async () => {
    const projectRoot = await mkdtemp(
      path.join(tmpdir(), "interaction-audit-review-evidence-"),
    );
    const requestDir = path.join(
      projectRoot,
      "Doc",
      "testing",
      "operator_review_requests",
      "request-c",
    );
    const snapshotPath = path.join(
      requestDir,
      "interaction-audit-evidence-pack.json",
    );
    const originalSnapshot = JSON.stringify(
      {
        evidenceItems: [
          {
            surfaceTitle: "Dashboard",
            label: "Original evidence",
            expectation: "Original expectation",
            screenshot: "dashboard.png",
            auditStatus: { message: "Prepared" },
          },
        ],
      },
      null,
      2,
    );
    const tamperedSnapshot = JSON.stringify(
      {
        evidenceItems: [
          {
            surfaceTitle: "Dashboard",
            label: "Tampered evidence",
            expectation: "Tampered expectation",
            screenshot: "dashboard.png",
            auditStatus: { message: "Changed" },
          },
        ],
      },
      null,
      2,
    );

    await mkdir(requestDir, { recursive: true });
    await writeFile(snapshotPath, tamperedSnapshot, "utf8");

    const resolution = await resolveInteractionAuditReviewEvidence({
      projectRoot,
      requestDir,
      requestManifest: {
        artifacts: {
          evidencePack: "interaction-audit-evidence-pack.json",
        },
        evidenceSnapshot: {
          path: "interaction-audit-evidence-pack.json",
          sha256: createHash("sha256").update(originalSnapshot).digest("hex"),
          sizeBytes: Buffer.byteLength(originalSnapshot, "utf8"),
        },
      },
    });

    expect(resolution.ok).toBe(true);
    expect(resolution.source).toBe("request_snapshot");
    expect(resolution.integrityOk).toBe(false);
    expect(resolution.integrityState).toBe("digest_mismatch");
    expect(resolution.integrityError).toContain("no longer matched");
  });
});
