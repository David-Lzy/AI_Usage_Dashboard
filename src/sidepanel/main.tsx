import React from "react";
import ReactDOM from "react-dom/client";

import { isFullPageSurfaceSearch } from "../shared/extension-surface-paths";
import { App } from "./App";
import "./theme/tokens.css";
import "./theme/material-theme.css";

const rootElement = document.getElementById("root")!;

if (isFullPageSurfaceSearch(window.location.search)) {
  document.documentElement.classList.add("full-page-shell");
  document.body.classList.add("full-page-shell");
  rootElement.classList.add("full-page-shell-root");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
