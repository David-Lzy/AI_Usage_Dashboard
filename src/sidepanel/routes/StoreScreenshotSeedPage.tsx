import { useEffect, useState } from "react";

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
  | { status: "done"; headline: string; detail: string }
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

export function StoreScreenshotSeedPage() {
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
              headline: definition.headline,
              detail: backup.hasBackup
                ? "The screenshot seed lock was cleared and the previous extension runtime state was restored."
                : `${definition.detail} No stored pre-seed runtime state was available to restore, so only the temporary lock was cleared.`,
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
            headline: definition.headline,
            detail: `${definition.detail} The temporary side-panel seed lock is active until the unlock preset runs.`,
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
                : "The screenshot seed route failed unexpectedly.",
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
      document.title = seedState.headline.includes("cleared")
        ? "AI Usage Dashboard Screenshot Seed Cleared"
        : "AI Usage Dashboard Screenshot Seed Applied";
      return;
    }

    document.title = "AI Usage Dashboard Screenshot Seed Failed";
  }, [seedState]);

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="section-label">Store Screenshot Debug Route</p>
        <h1 className="display-headline">
          {seedState.status === "running"
            ? "Applying screenshot preset"
            : seedState.status === "done"
              ? seedState.headline
              : "Screenshot preset failed"}
        </h1>
        <p className="body-copy">
          {seedState.status === "running"
            ? `The extension is applying the request-bound screenshot preset \`${seedState.preset}\` to real runtime storage now.`
            : seedState.status === "done"
              ? seedState.detail
              : seedState.message}
        </p>
      </section>

      <section className="status-card">
        <p className="section-label">Route Contract</p>
        <h2 className="section-title">
          {seedState.status === "error"
            ? "Seed route failed"
            : "Internal tooling only"}
        </h2>
        <p className="body-copy">
          This page exists only to seed truthful extension-mode runtime states
          before capturing popup or side-panel screenshots. It is not itself a
          store-facing screenshot surface.
        </p>
      </section>
    </main>
  );
}
