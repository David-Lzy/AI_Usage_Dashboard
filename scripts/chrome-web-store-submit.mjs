#!/usr/bin/env node

import { createSign } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const CWS_SCOPE = "https://www.googleapis.com/auth/chromewebstore";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const CWS_BASE_URL = "https://chromewebstore.googleapis.com/v2";
const CWS_UPLOAD_BASE_URL = "https://chromewebstore.googleapis.com/upload/v2";

const projectRoot = process.cwd();

function parseArgs(argv) {
  const args = {
    packagePath: process.env.CWS_CHROME_PACKAGE ?? "",
    publish: false,
    statusOnly: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--package") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("--package requires a path.");
      }
      args.packagePath = value;
      index += 1;
    } else if (arg === "--publish") {
      args.publish = true;
    } else if (arg === "--status") {
      args.statusOnly = true;
    } else if (arg === "--upload-only") {
      args.publish = false;
    } else if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function printUsage() {
  console.log(`Usage:
  node scripts/chrome-web-store-submit.mjs --status
  node scripts/chrome-web-store-submit.mjs --package release/ai-usage-dashboard-<version>.zip --upload-only
  node scripts/chrome-web-store-submit.mjs --package release/ai-usage-dashboard-<version>.zip --publish

Required env:
  CWS_SERVICE_ACCOUNT_JSON or CWS_SERVICE_ACCOUNT_JSON_PATH
  CWS_PUBLISHER_ID
  CWS_EXTENSION_ID

Optional env:
  CWS_PUBLISH_TYPE=DEFAULT_PUBLISH|STAGED_PUBLISH
  CWS_DEPLOY_PERCENTAGE=0..100
  CWS_BLOCK_ON_WARNINGS=true|false
  CWS_SKIP_REVIEW=true|false
`);
}

function readRequiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function readServiceAccount() {
  const inlineJson = process.env.CWS_SERVICE_ACCOUNT_JSON;
  const jsonPath = process.env.CWS_SERVICE_ACCOUNT_JSON_PATH;
  const jsonText = inlineJson ?? (jsonPath ? await readFile(jsonPath, "utf8") : "");

  if (!jsonText) {
    throw new Error(
      "Missing CWS_SERVICE_ACCOUNT_JSON or CWS_SERVICE_ACCOUNT_JSON_PATH.",
    );
  }

  const account = JSON.parse(jsonText);
  if (account.type !== "service_account") {
    throw new Error("CWS service account JSON must have type=service_account.");
  }
  if (!account.client_email || !account.private_key) {
    throw new Error(
      "CWS service account JSON must include client_email and private_key.",
    );
  }

  return account;
}

function base64url(value) {
  return Buffer.from(value).toString("base64url");
}

async function getAccessToken(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: serviceAccount.client_email,
    scope: CWS_SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  };
  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(
    JSON.stringify(claim),
  )}`;
  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  signer.end();
  const signature = signer.sign(serviceAccount.private_key).toString("base64url");
  const assertion = `${signingInput}.${signature}`;

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  const payload = await readJsonResponse(response, "access token");
  if (!payload.access_token) {
    throw new Error("Chrome Web Store token response did not include access_token.");
  }
  return payload.access_token;
}

async function readJsonResponse(response, label) {
  const text = await response.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { raw: text.slice(0, 1000) };
  }

  if (!response.ok) {
    const message =
      payload.error?.message ??
      payload.error_description ??
      payload.raw ??
      `HTTP ${response.status}`;
    throw new Error(`${label} failed with ${response.status}: ${message}`);
  }

  return payload;
}

function itemName({ publisherId, extensionId }) {
  return `publishers/${encodeURIComponent(publisherId)}/items/${encodeURIComponent(
    extensionId,
  )}`;
}

async function fetchStatus({ token, publisherId, extensionId }) {
  const response = await fetch(`${CWS_BASE_URL}/${itemName({ publisherId, extensionId })}:fetchStatus`, {
    headers: { authorization: `Bearer ${token}` },
  });
  return readJsonResponse(response, "Chrome Web Store fetchStatus");
}

async function uploadPackage({ token, publisherId, extensionId, packagePath }) {
  const absolutePackagePath = path.resolve(projectRoot, packagePath);
  if (!existsSync(absolutePackagePath)) {
    throw new Error(`Chrome package does not exist: ${absolutePackagePath}`);
  }
  if (!absolutePackagePath.endsWith(".zip")) {
    throw new Error(`Chrome package must be a zip file: ${absolutePackagePath}`);
  }

  const packageBytes = await readFile(absolutePackagePath);
  const response = await fetch(`${CWS_UPLOAD_BASE_URL}/${itemName({ publisherId, extensionId })}:upload`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/zip",
      "content-length": String(packageBytes.byteLength),
    },
    body: packageBytes,
  });
  return readJsonResponse(response, "Chrome Web Store upload");
}

function parseBooleanEnv(name, defaultValue) {
  const rawValue = process.env[name];
  if (rawValue === undefined || rawValue === "") {
    return defaultValue;
  }
  return /^(1|true|yes|on)$/i.test(rawValue);
}

function buildPublishBody() {
  const publishType = process.env.CWS_PUBLISH_TYPE?.trim() || "DEFAULT_PUBLISH";
  const body = {
    publishType,
    blockOnWarnings: parseBooleanEnv("CWS_BLOCK_ON_WARNINGS", true),
  };

  const deployPercentage = process.env.CWS_DEPLOY_PERCENTAGE?.trim();
  if (deployPercentage) {
    const parsedDeployPercentage = Number(deployPercentage);
    if (
      !Number.isInteger(parsedDeployPercentage) ||
      parsedDeployPercentage < 0 ||
      parsedDeployPercentage > 100
    ) {
      throw new Error("CWS_DEPLOY_PERCENTAGE must be an integer from 0 to 100.");
    }
    body.deployInfos = [{ deployPercentage: parsedDeployPercentage }];
  }

  if (parseBooleanEnv("CWS_SKIP_REVIEW", false)) {
    body.skipReview = true;
  }

  return body;
}

async function publishItem({ token, publisherId, extensionId }) {
  const response = await fetch(`${CWS_BASE_URL}/${itemName({ publisherId, extensionId })}:publish`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(buildPublishBody()),
  });
  return readJsonResponse(response, "Chrome Web Store publish");
}

function compactRevisionStatus(status) {
  if (!status) {
    return undefined;
  }
  return {
    state: status.state,
    channels: status.distributionChannels?.map((channel) => ({
      crxVersion: channel.crxVersion,
      deployPercentage: channel.deployPercentage,
    })),
  };
}

function printStatus(label, payload) {
  console.log(
    JSON.stringify(
      {
        label,
        itemId: payload.itemId,
        uploadState: payload.uploadState,
        crxVersion: payload.crxVersion,
        state: payload.state,
        warnings: payload.warningInfo?.warnings?.map((warning) => ({
          reason: warning.reason,
          description: warning.description,
        })),
        published: compactRevisionStatus(payload.publishedItemRevisionStatus),
        submitted: compactRevisionStatus(payload.submittedItemRevisionStatus),
      },
      null,
      2,
    ),
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const publisherId = readRequiredEnv("CWS_PUBLISHER_ID");
  const extensionId = readRequiredEnv("CWS_EXTENSION_ID");
  const serviceAccount = await readServiceAccount();
  const token = await getAccessToken(serviceAccount);

  const beforeStatus = await fetchStatus({ token, publisherId, extensionId });
  printStatus("before", beforeStatus);

  if (args.statusOnly) {
    return;
  }

  const packagePath =
    args.packagePath || `release/ai-usage-dashboard-${process.env.npm_package_version}.zip`;
  if (!packagePath) {
    throw new Error("Missing Chrome package path. Use --package or CWS_CHROME_PACKAGE.");
  }

  const uploadResult = await uploadPackage({
    token,
    publisherId,
    extensionId,
    packagePath,
  });
  printStatus("upload", uploadResult);

  if (args.publish) {
    const publishResult = await publishItem({ token, publisherId, extensionId });
    printStatus("publish", publishResult);
  }

  const afterStatus = await fetchStatus({ token, publisherId, extensionId });
  printStatus("after", afterStatus);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
