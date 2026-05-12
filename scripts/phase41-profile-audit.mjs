#!/usr/bin/env node

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  detectLoadedExtensionRuntime,
  listRdpBrowserCandidates,
  resolvePreferredRdpBrowserCandidate,
} from "./lib/rdp-extension-runtime-capture.mjs";

const APP_STATE_STORAGE_KEY = "ai-usage-dashboard.app-state";
const PROVIDER_SECRETS_STORAGE_KEY = "ai-usage-dashboard.provider-secrets";
const LEVELDB_BLOCK_SIZE = 32768;

function parseArgs(argv) {
  const args = {
    extensionId: "",
    profileDir: "",
    manifestPath: path.join(process.cwd(), "dist", "manifest.json"),
  };

  for (const entry of argv) {
    if (entry.startsWith("--extension-id=")) {
      args.extensionId = entry.slice("--extension-id=".length);
    } else if (entry.startsWith("--profile-dir=")) {
      args.profileDir = entry.slice("--profile-dir=".length);
    } else if (entry.startsWith("--manifest-path=")) {
      args.manifestPath = entry.slice("--manifest-path=".length);
    }
  }

  return args;
}

function buildProfileDirBrowserCandidate(profileDir) {
  const preferredBrowser = resolvePreferredRdpBrowserCandidate();
  return {
    ...preferredBrowser,
    label: "Configured profile",
    profileDir,
  };
}

async function resolveArgs(rawArgs) {
  const args = { ...rawArgs };

  if (args.extensionId.length === 0) {
    const browserCandidates =
      args.profileDir.length > 0
        ? [buildProfileDirBrowserCandidate(args.profileDir)]
        : listRdpBrowserCandidates();
    const extensionRuntime = await detectLoadedExtensionRuntime({
      projectRoot: process.cwd(),
      browserCandidates,
    });
    args.extensionId = extensionRuntime.extensionId;

    if (args.profileDir.length === 0) {
      args.profileDir = extensionRuntime.browser.profileDir;
    }
  }

  if (args.profileDir.length === 0) {
    args.profileDir = resolvePreferredRdpBrowserCandidate().profileDir;
  }

  return args;
}

function pickNestedValue(record, pathSegments, fallback = null) {
  let current = record;

  for (const segment of pathSegments) {
    if (
      current === null ||
      typeof current !== "object" ||
      !(segment in current)
    ) {
      return fallback;
    }

    current = current[segment];
  }

  return current ?? fallback;
}

async function readJson(filePath) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function readLatestLogFile(localExtensionDir) {
  const entries = await readdir(localExtensionDir, { withFileTypes: true });
  const logFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".log"))
    .map((entry) => entry.name)
    .sort();

  if (logFiles.length === 0) {
    throw new Error(`No LevelDB log files found in ${localExtensionDir}`);
  }

  return path.join(localExtensionDir, logFiles.at(-1));
}

function* iteratePhysicalRecords(buffer) {
  let offset = 0;

  while (offset + 7 <= buffer.length) {
    const blockOffset = offset % LEVELDB_BLOCK_SIZE;

    if (LEVELDB_BLOCK_SIZE - blockOffset < 7) {
      offset += LEVELDB_BLOCK_SIZE - blockOffset;
      continue;
    }

    const length = buffer.readUInt16LE(offset + 4);
    const recordType = buffer[offset + 6];
    offset += 7;

    if (length === 0 && recordType === 0) {
      continue;
    }

    const record = buffer.subarray(offset, offset + length);
    offset += length;
    yield { recordType, record };
  }
}

function assembleLogicalRecords(buffer) {
  const records = [];
  let partial = null;

  for (const { recordType, record } of iteratePhysicalRecords(buffer)) {
    if (recordType === 1) {
      records.push(record);
      partial = null;
      continue;
    }

    if (recordType === 2) {
      partial = Buffer.from(record);
      continue;
    }

    if (recordType === 3 && partial) {
      partial = Buffer.concat([partial, record]);
      continue;
    }

    if (recordType === 4 && partial) {
      records.push(Buffer.concat([partial, record]));
      partial = null;
    }
  }

  return records;
}

function readVarint32(buffer, startOffset) {
  let offset = startOffset;
  let shift = 0;
  let value = 0;

  while (offset < buffer.length) {
    const byte = buffer[offset];
    offset += 1;
    value |= (byte & 0x7f) << shift;

    if ((byte & 0x80) === 0) {
      return { value, offset };
    }

    shift += 7;
  }

  throw new Error("Unexpected end of LevelDB varint32");
}

function parseLatestLevelDbEntries(buffer) {
  const latestEntries = new Map();
  const logicalRecords = assembleLogicalRecords(buffer);

  for (const record of logicalRecords) {
    if (record.length < 12) {
      continue;
    }

    const sequence = Number(record.readBigUInt64LE(0));
    const count = record.readUInt32LE(8);
    let offset = 12;

    for (let index = 0; index < count && offset < record.length; index += 1) {
      const tag = record[offset];
      offset += 1;

      const keyInfo = readVarint32(record, offset);
      const keyLength = keyInfo.value;
      offset = keyInfo.offset;
      const key = record.subarray(offset, offset + keyLength).toString("utf8");
      offset += keyLength;

      if (tag === 0) {
        latestEntries.set(key, { sequence, value: null });
        continue;
      }

      if (tag !== 1) {
        break;
      }

      const valueInfo = readVarint32(record, offset);
      const valueLength = valueInfo.value;
      offset = valueInfo.offset;
      const value = record.subarray(offset, offset + valueLength).toString("utf8");
      offset += valueLength;

      latestEntries.set(key, { sequence, value });
    }
  }

  return latestEntries;
}

function parseJsonValue(entry, fallback = null) {
  if (!entry?.value) {
    return fallback;
  }

  try {
    return JSON.parse(entry.value);
  } catch {
    return fallback;
  }
}

function summarizeProviderSettings(providerSettings) {
  if (!Array.isArray(providerSettings)) {
    return [];
  }

  return providerSettings.map((provider) => ({
    id: provider.id,
    enabled: provider.enabled,
    status: provider.status,
    credentialStatus: provider.credentialStatus ?? null,
    sourcePreference: provider.sourcePreference ?? null,
    hasPageBindingField: Object.hasOwn(provider, "pageBinding"),
    pageBindingStatus:
      provider.pageBinding && typeof provider.pageBinding === "object"
        ? provider.pageBinding.status ?? null
        : null,
    hostOrigins: Array.isArray(provider.hostOrigins) ? provider.hostOrigins : [],
  }));
}

function summarizeProviderSnapshots(providers) {
  if (!Array.isArray(providers)) {
    return [];
  }

  return providers.map((provider) => ({
    providerId: provider.providerId,
    syncSource: provider.syncSource,
    syncStatus: provider.syncStatus,
    syncedAt: provider.syncedAt,
    planName: provider.planName,
    warningReason: provider.warningReason ?? null,
    sourceSelectionReason: provider.sourceSelectionReason ?? null,
    sourceFallbackReason: provider.sourceFallbackReason ?? null,
  }));
}

function buildSchemaWarnings(providerSettings) {
  if (!Array.isArray(providerSettings)) {
    return [];
  }

  const warnings = [];

  for (const provider of providerSettings) {
    if (!Object.hasOwn(provider, "sourcePreference")) {
      warnings.push(
        `${provider.id}: stored provider setting is missing sourcePreference`,
      );
    }

    if (!Object.hasOwn(provider, "pageBinding")) {
      warnings.push(`${provider.id}: stored provider setting is missing pageBinding`);
    }
  }

  return warnings;
}

async function main() {
  const args = await resolveArgs(parseArgs(process.argv.slice(2)));
  const preferencesPath = path.join(args.profileDir, "Preferences");
  const localExtensionDir = path.join(
    args.profileDir,
    "Local Extension Settings",
    args.extensionId,
  );

  const [preferences, distManifest] = await Promise.all([
    readJson(preferencesPath),
    readJson(args.manifestPath),
  ]);

  const extensionSettings = pickNestedValue(preferences, [
    "extensions",
    "settings",
    args.extensionId,
  ]);

  if (!extensionSettings) {
    throw new Error(
      `Extension ${args.extensionId} is not present in ${preferencesPath}`,
    );
  }

  const latestLogPath = await readLatestLogFile(localExtensionDir);
  const latestLogBuffer = await readFile(latestLogPath);
  const latestEntries = parseLatestLevelDbEntries(latestLogBuffer);
  const appStateEntry = latestEntries.get(APP_STATE_STORAGE_KEY) ?? null;
  const secretsEntry = latestEntries.get(PROVIDER_SECRETS_STORAGE_KEY) ?? null;
  const appState = parseJsonValue(appStateEntry, null);
  const providerSecrets = parseJsonValue(secretsEntry, null);
  const providerSettings = appState?.providerSettings ?? [];
  const providerSnapshots = appState?.providers ?? [];

  const report = {
    generatedAt: new Date().toISOString(),
    inputs: {
      extensionId: args.extensionId,
      profileDir: args.profileDir,
      preferencesPath,
      manifestPath: args.manifestPath,
      levelDbLogPath: latestLogPath,
    },
    distManifest: {
      version: distManifest.version ?? null,
      versionName: distManifest.version_name ?? null,
      optionalHostPermissions: Array.isArray(distManifest.optional_host_permissions)
        ? distManifest.optional_host_permissions
        : [],
    },
    installedExtension: {
      path: extensionSettings.path ?? null,
      location: extensionSettings.location ?? null,
      serviceWorkerVersion: pickNestedValue(extensionSettings, [
        "service_worker_registration_info",
        "version",
      ]),
      openSidePanelOnIconClick:
        extensionSettings.open_side_panel_on_icon_click ?? null,
      activeHosts:
        pickNestedValue(extensionSettings, [
          "active_permissions",
          "explicit_host",
        ], []) ?? [],
      grantedHosts:
        pickNestedValue(extensionSettings, [
          "granted_permissions",
          "explicit_host",
        ], []) ?? [],
      runtimeGrantedHosts:
        pickNestedValue(extensionSettings, [
          "runtime_granted_permissions",
          "explicit_host",
        ], []) ?? [],
    },
    appState: {
      sequence: appStateEntry?.sequence ?? null,
      settings: appState?.settings ?? null,
      schemaWarnings: buildSchemaWarnings(providerSettings),
      providerSettings: summarizeProviderSettings(providerSettings),
      providerSnapshots: summarizeProviderSnapshots(providerSnapshots),
    },
    providerSecrets: providerSecrets
      ? {
          cursorAdminApiKeyConfigured: Boolean(
            providerSecrets.cursor?.adminApiKey,
          ),
          claudeAdminApiKeyConfigured: Boolean(
            providerSecrets["claude-code"]?.adminApiKey,
          ),
          codexAnalyticsApiKeyConfigured: Boolean(
            providerSecrets.codex?.analyticsApiKey,
          ),
          codexWorkspaceIdConfigured: Boolean(providerSecrets.codex?.workspaceId),
        }
      : null,
  };

  console.log(JSON.stringify(report, null, 2));
}

await main();
