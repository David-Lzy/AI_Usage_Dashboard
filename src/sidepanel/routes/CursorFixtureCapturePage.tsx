import { useEffect, useState } from "react";

import { captureCursorPersonalLiveFixture } from "../../providers/cursor/personal-page-capture";

type CaptureState =
  | { status: "idle" }
  | { status: "running" }
  | { status: "done"; json: string }
  | { status: "error"; message: string };

const CURSOR_HOST_ORIGINS = ["https://cursor.com/*"];

function trimTitleSegment(value: string, limit = 80): string {
  if (value.length <= limit) {
    return value;
  }

  return `${value.slice(0, limit - 1)}...`;
}

async function ensureCursorPermission(): Promise<boolean> {
  const alreadyGranted = await chrome.permissions.contains({
    origins: CURSOR_HOST_ORIGINS,
  });

  if (alreadyGranted) {
    return true;
  }

  return chrome.permissions.request({
    origins: CURSOR_HOST_ORIGINS,
  });
}

export function CursorFixtureCapturePage() {
  const [captureState, setCaptureState] = useState<CaptureState>({
    status: "idle",
  });

  useEffect(() => {
    if (captureState.status === "idle") {
      document.title = "Cursor Capture | Idle";
      return;
    }

    if (captureState.status === "running") {
      document.title = "Cursor Capture | Running";
      return;
    }

    if (captureState.status === "error") {
      document.title = `Cursor Capture | Error | ${trimTitleSegment(captureState.message)}`;
      return;
    }

    try {
      const fixture = JSON.parse(captureState.json) as {
        decision?: {
          chosenRoute?: string | null;
          chosenSurface?: string | null;
        };
      };
      const chosenRoute = fixture.decision?.chosenRoute ?? "no-route";
      const chosenSurface = fixture.decision?.chosenSurface ?? "unknown-surface";
      document.title =
        `Cursor Capture | OK | ${trimTitleSegment(chosenSurface, 24)} | ` +
        trimTitleSegment(chosenRoute, 72);
    } catch {
      document.title = "Cursor Capture | OK";
    }
  }, [captureState]);

  async function handleCapture() {
    setCaptureState({ status: "running" });

    try {
      const granted = await ensureCursorPermission();

      if (!granted) {
        setCaptureState({
          status: "error",
          message:
            "Cursor host access was not granted, so the live Cursor usage tab could not be inspected.",
        });
        return;
      }

      const fixture = await captureCursorPersonalLiveFixture();
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
            : "The Cursor live fixture capture failed unexpectedly.",
      });
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="section-label">Cursor Debug Capture</p>
        <h1 className="display-headline">Live tab fixture capture</h1>
        <p className="body-copy">
          This page requests Cursor host access, inspects the currently open
          logged-in Cursor usage tabs through the shared page-session framework,
          and copies a redacted JSON fixture to the system clipboard.
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
            ? "Click the button once. The browser may show a host-permission prompt for cursor.com."
            : captureState.status === "running"
              ? "The helper is inspecting matching Cursor tabs now."
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
