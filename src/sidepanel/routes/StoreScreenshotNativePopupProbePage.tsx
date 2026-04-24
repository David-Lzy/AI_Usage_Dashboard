import { useEffect, useState } from "react";

import { sendAppMessage } from "../../shared/app-client";

type ProbeState =
  | { status: "opening" }
  | { status: "done"; message: string }
  | { status: "error"; message: string };

const PROBE_TITLE = "AI Usage Dashboard Native Popup Probe";

export function StoreScreenshotNativePopupProbePage() {
  const [probeState, setProbeState] = useState<ProbeState>({
    status: "opening",
  });

  useEffect(() => {
    let disposed = false;

    async function openPopup() {
      if (typeof chrome.action?.openPopup === "function") {
        try {
          await chrome.action.openPopup();

          if (!disposed) {
            setProbeState({
              status: "done",
              message:
                "Chrome accepted the native toolbar action-popup request. Keep this probe window open only long enough for the RDP helper to detect and capture the popup.",
            });
          }
          return;
        } catch {
          // Fall through to the background path below.
        }
      }

      const response = await sendAppMessage({ type: "app:open-action-popup" });

      if (disposed) {
        return;
      }

      if (!response.ok) {
        setProbeState({
          status: "error",
          message: response.error,
        });
        return;
      }

      setProbeState({
        status: "done",
        message:
          "Chrome accepted the native toolbar action-popup request. Keep this probe window open only long enough for the RDP helper to detect and capture the popup.",
      });
    }

    void openPopup();

    return () => {
      disposed = true;
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.title = PROBE_TITLE;
  }, []);

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="section-label">Store Screenshot Debug Route</p>
        <h1 className="display-headline">
          {probeState.status === "opening"
            ? "Opening native toolbar popup"
            : probeState.status === "done"
              ? "Native popup requested"
              : "Native popup probe failed"}
        </h1>
        <p className="body-copy">
          {probeState.status === "opening"
            ? "This helper page asks the background service worker to call chrome.action.openPopup so RDP Chrome can expose the real toolbar bubble instead of the popup app-window smoke helper."
            : probeState.message}
        </p>
      </section>

      <section className="status-card">
        <p className="section-label">Route Contract</p>
        <h2 className="section-title">
          {probeState.status === "error"
            ? "Native popup did not open"
            : "Internal tooling only"}
        </h2>
        <p className="body-copy">
          This page exists only for truthful RDP Chrome popup probing. It is not
          itself a store-facing screenshot surface and should be closed once the
          native toolbar bubble is captured or rejected.
        </p>
      </section>
    </main>
  );
}
