// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (c) 2026 David-Lzy (https://github.com/David-Lzy). All rights reserved.
// Source: https://github.com/David-Lzy/AI_Usage_Dashboard

import React from "react";
import ReactDOM from "react-dom/client";

import { consumePendingFullPageEntry } from "../shared/extension-surface-entry";
import { isFullPageSurfaceSearch } from "../shared/extension-surface-paths";
import { App } from "./App";
import "./theme/tokens.css";
import "./theme/material-theme.css";
import "./theme/app-shell.css";
import "./theme/buttons.css";
import "./theme/chips.css";
import "./theme/typography.css";
import "./theme/surfaces.css";
import "./theme/layout-primitives.css";
import "./theme/access-feedback.css";
import "./theme/top-app-bar.css";
import "./theme/detail-surfaces.css";
import "./theme/form-controls.css";
import "./theme/settings-navigation.css";
import "./theme/settings-source-cards.css";
import "./theme/interaction-audit.css";
import "./theme/settings-appearance.css";
import "./theme/theme-recovery.css";
import "./theme/usage-progress.css";
import "./theme/provider-card.css";
import "./theme/provider-carousel.css";

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
