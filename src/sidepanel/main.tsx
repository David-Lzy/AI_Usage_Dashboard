import React from "react";
import ReactDOM from "react-dom/client";

import { consumePendingFullPageEntry } from "../shared/extension-surface-entry";
import { isFullPageSurfaceSearch } from "../shared/extension-surface-paths";
import { App } from "./App";
import "./theme/tokens.css";
import "./theme/material-theme.css";
import "./theme/provider-card.css";

const rootElement = document.getElementById("root")!;

if (isFullPageSurfaceSearch(window.location.search)) {
  document.documentElement.classList.add("full-page-shell");
  document.body.classList.add("full-page-shell");
  rootElement.classList.add("full-page-shell-root");

  const fullPageEntry = consumePendingFullPageEntry(
    window.location.hash,
    window.localStorage,
  );

  if (fullPageEntry) {
    document.documentElement.dataset.fullPageEntry = fullPageEntry;
    document.body.dataset.fullPageEntry = fullPageEntry;
    rootElement.dataset.fullPageEntry = fullPageEntry;
  }
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
