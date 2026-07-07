// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (c) 2026 David-Lzy (https://github.com/David-Lzy). All rights reserved.
// Source: https://github.com/David-Lzy/AI_Usage_Dashboard

import React from "react";
import ReactDOM from "react-dom/client";

import { installPerformanceDebugCounters } from "../shared/perf-debug";
import { PopupApp } from "./PopupApp";
import "../sidepanel/theme/tokens.css";
import "../sidepanel/theme/material-theme.css";
import "../sidepanel/theme/app-shell.css";
import "../sidepanel/theme/buttons.css";
import "../sidepanel/theme/chips.css";
import "../sidepanel/theme/typography.css";
import "../sidepanel/theme/surfaces.css";
import "../sidepanel/theme/layout-primitives.css";
import "../sidepanel/theme/usage-progress.css";
import "./popup-theme.css";

installPerformanceDebugCounters();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PopupApp />
  </React.StrictMode>,
);
