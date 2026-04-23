import React from "react";
import ReactDOM from "react-dom/client";

import { PopupApp } from "./PopupApp";
import "../sidepanel/theme/tokens.css";
import "../sidepanel/theme/material-theme.css";

const rootElement = document.getElementById("root");

document.documentElement.classList.add("popup-page");
document.body.classList.add("popup-page");
rootElement?.classList.add("popup-page-root");

ReactDOM.createRoot(rootElement!).render(
  <React.StrictMode>
    <PopupApp />
  </React.StrictMode>,
);
