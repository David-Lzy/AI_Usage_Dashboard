import { useEffect, useState } from "react";

import { captureCodexPersonalLiveFixture } from "../../providers/codex/personal-page-capture";

type CaptureState =
  | { status: "idle" }
  | { status: "running" }
  | { status: "done"; json: string }
  | { status: "error"; message: string };

const CHATGPT_HOST_ORIGINS = ["https://chatgpt.com/*"];

function trimTitleSegment(value: string, limit = 80): string {
  if (value.length <= limit) {
    return value;
  }

  return `${value.slice(0, limit - 1)}...`;
}

async function ensureChatGptPermission(): Promise<boolean> {
  const alreadyGranted = await chrome.permissions.contains({
    origins: CHATGPT_HOST_ORIGINS,
  });

  if (alreadyGranted) {
    return true;
  }

  return chrome.permissions.request({
    origins: CHATGPT_HOST_ORIGINS,
  });
}

export function CodexFixtureCapturePage() {
  const [captureState, setCaptureState] = useState<CaptureState>({
    status: "idle",
  });

  useEffect(() => {
    if (captureState.status === "idle") {
      document.title = "Codex Capture | Idle";
      return;
    }

    if (captureState.status === "running") {
      document.title = "Codex Capture | Running";
      return;
    }

    if (captureState.status === "error") {
      document.title = `Codex Capture | Error | ${trimTitleSegment(captureState.message)}`;
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
        `Codex Capture | OK | ${trimTitleSegment(chosenSurface, 24)} | ` +
        trimTitleSegment(chosenRoute, 72);
    } catch {
      document.title = "Codex Capture | OK";
    }
  }, [captureState]);

  async function handleCapture() {
    setCaptureState({ status: "running" });

    try {
      const granted = await ensureChatGptPermission();

      if (!granted) {
        setCaptureState({
          status: "error",
          message:
            "ChatGPT host access was not granted, so the live Codex tab could not be inspected.",
        });
        return;
      }

      const fixture = await captureCodexPersonalLiveFixture();
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
            : "The Codex live fixture capture failed unexpectedly.",
      });
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="section-label">Codex Debug Capture</p>
        <h1 className="display-headline">Live tab fixture capture</h1>
        <p className="body-copy">
          This page requests ChatGPT host access, inspects the currently open
          logged-in Codex tabs through the shared page-session framework, and
          copies a redacted JSON fixture to the system clipboard.
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
            ? "Click the button once. The browser may show a host-permission prompt for chatgpt.com."
            : captureState.status === "running"
              ? "The helper is inspecting matching Codex tabs now."
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
