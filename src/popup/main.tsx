import React from "react";
import ReactDOM from "react-dom/client";

import { PopupApp } from "./PopupApp";
import "../sidepanel/theme/tokens.css";
import "../sidepanel/theme/material-theme.css";
import "../sidepanel/theme/app-shell.css";
import "../sidepanel/theme/buttons.css";
import "../sidepanel/theme/chips.css";
import "../sidepanel/theme/surfaces.css";
import "../sidepanel/theme/usage-progress.css";
import "./popup-theme.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PopupApp />
  </React.StrictMode>,
);
