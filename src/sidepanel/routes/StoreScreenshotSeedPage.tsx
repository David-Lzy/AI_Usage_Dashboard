import { useEffect, useState } from "react";

import {
  createRuntimeI18n,
  DEFAULT_APP_LOCALE_PREFERENCE,
  type RuntimeI18n,
} from "../../shared/i18n";
import { buildStoreWorkflowLocalizedCopy } from "../../shared/localized-copy";
import { clearAppState, readAppState, writeAppState } from "../../shared/storage";
import { writeStoreScreenshotRuntimeLock } from "../../shared/store-screenshot-runtime-lock";
import {
  clearStoreScreenshotSeedBackup,
  getStoreScreenshotSeedPresetDefinition,
  readStoreScreenshotSeedBackup,
  setStoreScreenshotSeedLockEnabled,
  type StoreScreenshotSeedPreset,
  writeStoreScreenshotSeedBackup,
} from "../store-screenshot-seed";

type SeedState =
  | { status: "running"; preset: string }
  | {
      status: "done";
      preset: StoreScreenshotSeedPreset;
      headline: string;
      detail: string;
      restoredBackup: boolean | null;
    }
  | { status: "error"; message: string };

const VALID_PRESETS: StoreScreenshotSeedPreset[] = [
  "toolbar-first-quick-glance",
  "setup-guidance",
  "honest-contract-or-policy-only",
  "settings-and-setup-depth",
  "provider-or-dashboard-depth",
  "unlock",
];

function readPresetFromLocation(): StoreScreenshotSeedPreset {
  if (typeof window === "undefined") {
    throw new Error("The screenshot seed route requires a browser context.");
  }

  const params = new URLSearchParams(window.location.search);
  const preset = params.get("preset");

  if (!preset || !VALID_PRESETS.includes(preset as StoreScreenshotSeedPreset)) {
    throw new Error(
      `Pass a supported screenshot preset through ?preset=. Supported presets: ${VALID_PRESETS.join(", ")}.`,
    );
  }

  return preset as StoreScreenshotSeedPreset;
}

type StoreScreenshotSeedPageProps = {
  i18n?: RuntimeI18n;
};

function createDefaultStoreRuntimeI18n(): RuntimeI18n {
  return createRuntimeI18n(
    DEFAULT_APP_LOCALE_PREFERENCE,
    typeof window !== "undefined" ? window : undefined,
  );
}

export function StoreScreenshotSeedPage({
  i18n = createDefaultStoreRuntimeI18n(),
}: StoreScreenshotSeedPageProps = {}) {
  const copy = buildStoreWorkflowLocalizedCopy(i18n).screenshotSeed;
  const [seedState, setSeedState] = useState<SeedState>({
    status: "running",
    preset:
      typeof window === "undefined"
        ? "unknown"
        : new URLSearchParams(window.location.search).get("preset") ?? "missing",
  });

  useEffect(() => {
    let disposed = false;

    async function applyPreset() {
      try {
        const preset = readPresetFromLocation();
        const definition = getStoreScreenshotSeedPresetDefinition(preset);

        if (preset === "unlock") {
          const backup = readStoreScreenshotSeedBackup();

          if (backup.hasBackup) {
            if (backup.appState !== null) {
              await writeAppState(backup.appState);
            } else {
              await clearAppState();
            }
            clearStoreScreenshotSeedBackup();
          }

          setStoreScreenshotSeedLockEnabled(false);
          await writeStoreScreenshotRuntimeLock(false);

          if (!disposed) {
            setSeedState({
              status: "done",
              preset,
              headline: definition.headline,
              detail: definition.detail,
              restoredBackup: backup.hasBackup,
            });
          }

          return;
        }

        const existingBackup = readStoreScreenshotSeedBackup();

        if (!existingBackup.hasBackup) {
          writeStoreScreenshotSeedBackup(await readAppState());
        }

        if (definition.appState === null) {
          throw new Error(`Screenshot preset \`${preset}\` did not provide an app state.`);
        }

        await writeStoreScreenshotRuntimeLock(true);
        await writeAppState(definition.appState);
        setStoreScreenshotSeedLockEnabled(definition.lockEnabled);

        if (!disposed) {
          setSeedState({
            status: "done",
            preset,
            headline: definition.headline,
            detail: definition.detail,
            restoredBackup: null,
          });
        }
      } catch (error) {
        clearStoreScreenshotSeedBackup();
        setStoreScreenshotSeedLockEnabled(false);
        await writeStoreScreenshotRuntimeLock(false);

        if (!disposed) {
          setSeedState({
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : copy.routeFailedFallback,
          });
        }
      }
    }

    void applyPreset();

    return () => {
      disposed = true;
    };
  }, []);

  useEffect(() => {
    if (seedState.status === "running") {
      document.title = "AI Usage Dashboard Screenshot Seed Running";
      return;
    }

    if (seedState.status === "done") {
      document.title = seedState.preset === "unlock"
        ? "AI Usage Dashboard Screenshot Seed Cleared"
        : "AI Usage Dashboard Screenshot Seed Applied";
      return;
    }

    document.title = "AI Usage Dashboard Screenshot Seed Failed";
  }, [seedState]);

  const doneHeadline =
    seedState.status === "done"
      ? copy.presetHeadline(seedState.preset, seedState.headline)
      : "";
  const doneDetail =
    seedState.status === "done" && seedState.preset === "unlock"
      ? seedState.restoredBackup
        ? copy.unlockRestoredDetail
        : copy.unlockNoBackupDetail
      : seedState.status === "done"
        ? `${copy.presetDetail(seedState.preset, seedState.detail)} ${copy.temporaryLockActiveDetail}`
        : "";
  const currentPreset =
    seedState.status === "running"
      ? seedState.preset
      : seedState.status === "done"
        ? seedState.preset
        : null;
  const submissionCaption =
    currentPreset && currentPreset !== "unlock"
      ? copy.submissionCaption(currentPreset)
      : "";

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="section-label">{copy.sectionLabel}</p>
        <h1 className="display-headline">
          {seedState.status === "running"
            ? copy.applyingTitle
            : seedState.status === "done"
              ? doneHeadline
              : copy.failedTitle}
        </h1>
        <p className="body-copy">
          {seedState.status === "running"
            ? copy.applyingDetail(seedState.preset)
            : seedState.status === "done"
              ? doneDetail
              : copy.errorDetail(seedState.message)}
        </p>
      </section>

      {submissionCaption ? (
        <section className="status-card">
          <p className="section-label">{copy.submissionCaptionLabel}</p>
          <h2 className="section-title">{submissionCaption}</h2>
          <p className="body-copy">{copy.submissionCaptionDetail}</p>
        </section>
      ) : null}

      <section className="status-card">
        <p className="section-label">{copy.routeContractLabel}</p>
        <h2 className="section-title">
          {seedState.status === "error"
            ? copy.seedRouteFailedTitle
            : copy.internalToolingOnlyTitle}
        </h2>
        <p className="body-copy">{copy.contractDetail}</p>
      </section>
    </main>
  );
}
