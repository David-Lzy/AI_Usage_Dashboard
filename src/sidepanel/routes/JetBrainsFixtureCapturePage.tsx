import { useEffect, useState } from "react";

import { createJetBrainsConsoleClient } from "../../providers/jetbrains/official";
import { parseJetBrainsUsersAndLicensingHtml } from "../../providers/jetbrains/page-parse";

type CaptureState =
  | { status: "idle" }
  | { status: "running" }
  | { status: "done"; json: string }
  | { status: "error"; message: string };

const JETBRAINS_HOST_ORIGINS = [
  "https://account.jetbrains.com/*",
  "https://*.jetbrains.com/*",
];

function trimTitleSegment(value: string, limit = 80): string {
  if (value.length <= limit) {
    return value;
  }

  return `${value.slice(0, limit - 1)}...`;
}

async function ensureJetBrainsPermission(): Promise<boolean> {
  const alreadyGranted = await chrome.permissions.contains({
    origins: JETBRAINS_HOST_ORIGINS,
  });

  if (alreadyGranted) {
    return true;
  }

  return chrome.permissions.request({
    origins: JETBRAINS_HOST_ORIGINS,
  });
}

export function JetBrainsFixtureCapturePage() {
  const [captureState, setCaptureState] = useState<CaptureState>({
    status: "idle",
  });

  useEffect(() => {
    if (captureState.status === "idle") {
      document.title = "JetBrains Capture | Idle";
      return;
    }

    if (captureState.status === "running") {
      document.title = "JetBrains Capture | Running";
      return;
    }

    if (captureState.status === "error") {
      document.title =
        `JetBrains Capture | Error | ${trimTitleSegment(captureState.message)}`;
      return;
    }

    try {
      const fixture = JSON.parse(captureState.json) as {
        page?: {
          matchedUrl?: string | null;
          url?: string | null;
        };
      };
      const matchedUrl = fixture.page?.matchedUrl ?? fixture.page?.url ?? "no-route";
      document.title =
        `JetBrains Capture | OK | ${trimTitleSegment(matchedUrl, 96)}`;
    } catch {
      document.title = "JetBrains Capture | OK";
    }
  }, [captureState]);

  async function handleCapture() {
    setCaptureState({ status: "running" });

    try {
      const granted = await ensureJetBrainsPermission();

      if (!granted) {
        setCaptureState({
          status: "error",
          message:
            "JetBrains host access was not granted, so the live Users and licensing tab could not be inspected.",
        });
        return;
      }

      const client = createJetBrainsConsoleClient({
        source: "live",
      });
      const capture = await client.getUsersAndLicensingPage();

      if (capture.status !== "ok") {
        setCaptureState({
          status: "error",
          message: capture.reason,
        });
        return;
      }

      const parsed = parseJetBrainsUsersAndLicensingHtml(capture.page.html);
      const totalIncludedCredits = parsed.users.reduce(
        (sum, user) =>
          sum +
          user.licensesAndQuotas.reduce(
            (licenseSum, license) => licenseSum + license.includedCredits,
            0,
          ),
        0,
      );
      const totalUsedCredits = parsed.users.reduce(
        (sum, user) =>
          sum +
          user.licensesAndQuotas.reduce(
            (licenseSum, license) => licenseSum + license.usedCredits,
            0,
          ),
        0,
      );
      const fixture = {
        capturedAt: new Date().toISOString(),
        extractionMode: "dom",
        page: {
          url: capture.page.url ?? null,
          title: capture.page.title ?? null,
          heading: capture.page.heading ?? null,
          matchedUrl: capture.pageBinding.matchedUrl,
          matchedTitle: capture.pageBinding.matchedTitle,
        },
        cards: parsed.cards,
        totals: {
          totalIncludedCredits,
          totalUsedCredits,
          totalRemainingCredits: Math.max(totalIncludedCredits - totalUsedCredits, 0),
          userCount: parsed.users.length,
        },
        users: parsed.users,
      };
      const json = JSON.stringify(fixture, null, 2);

      await navigator.clipboard.writeText(json);
      setCaptureState({
        status: "done",
        json,
      });
    } catch (error) {
      setCaptureState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "The JetBrains live fixture capture failed unexpectedly.",
      });
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="section-label">JetBrains Debug Capture</p>
        <h1 className="display-headline">Live tab fixture capture</h1>
        <p className="body-copy">
          This page requests JetBrains host access, inspects the currently open
          logged-in Users and licensing page through the shared page-session
          framework, parses the live HTML, and copies a redacted JSON fixture to
          the system clipboard.
        </p>
        <button
          autoFocus
          className="text-button"
          type="button"
          onClick={handleCapture}
          disabled={captureState.status === "running"}
        >
          {captureState.status === "running"
            ? "Capturing..."
            : "Request access and capture"}
        </button>
      </section>

      <section className="status-card">
        <p className="section-label">Capture Status</p>
        <h2 className="section-title">
          {captureState.status === "idle"
            ? "Waiting for user gesture"
            : captureState.status === "running"
              ? "Running live tab inspection"
              : captureState.status === "done"
                ? "Capture complete"
                : "Capture failed"}
        </h2>
        <p className="body-copy">
          {captureState.status === "idle"
            ? "Click the button once. The browser may show a host-permission prompt for JetBrains domains."
            : captureState.status === "running"
              ? "The helper is inspecting matching JetBrains tabs now."
              : captureState.status === "done"
                ? "The redacted JSON fixture was copied to the clipboard."
                : captureState.message}
        </p>
        {captureState.status === "done" ? (
          <pre className="capture-pre">{captureState.json}</pre>
        ) : null}
      </section>
    </main>
  );
}
