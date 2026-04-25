import { useEffect, useState } from "react";

import { sendAppMessage } from "../../shared/app-client";
import {
  createRuntimeI18n,
  DEFAULT_APP_LOCALE_PREFERENCE,
  type RuntimeI18n,
} from "../../shared/i18n";
import { buildStoreWorkflowLocalizedCopy } from "../../shared/localized-copy";

type ProbeState =
  | { status: "opening" }
  | { status: "done" }
  | { status: "error"; message: string };

const PROBE_TITLE = "AI Usage Dashboard Native Popup Probe";

type StoreScreenshotNativePopupProbePageProps = {
  i18n?: RuntimeI18n;
};

function createDefaultStoreRuntimeI18n(): RuntimeI18n {
  return createRuntimeI18n(
    DEFAULT_APP_LOCALE_PREFERENCE,
    typeof window !== "undefined" ? window : undefined,
  );
}

export function StoreScreenshotNativePopupProbePage({
  i18n = createDefaultStoreRuntimeI18n(),
}: StoreScreenshotNativePopupProbePageProps = {}) {
  const copy = buildStoreWorkflowLocalizedCopy(i18n).nativePopupProbe;
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
        <p className="section-label">{copy.sectionLabel}</p>
        <h1 className="display-headline">
          {probeState.status === "opening"
            ? copy.openingTitle
            : probeState.status === "done"
              ? copy.requestedTitle
              : copy.failedTitle}
        </h1>
        <p className="body-copy">
          {probeState.status === "opening"
            ? copy.openingDetail
            : probeState.status === "done"
              ? copy.acceptedMessage
              : probeState.message}
        </p>
      </section>

      <section className="status-card">
        <p className="section-label">{copy.routeContractLabel}</p>
        <h2 className="section-title">
          {probeState.status === "error"
            ? copy.didNotOpenTitle
            : copy.internalToolingOnlyTitle}
        </h2>
        <p className="body-copy">{copy.contractDetail}</p>
      </section>
    </main>
  );
}
