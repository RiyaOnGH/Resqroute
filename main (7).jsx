import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { AppProvider } from "./context/AppContext";
import "./styles/design-tokens.css";
import "./styles/main.css";

// Register Service Worker for offline PWA functionality
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("[ResQRoute PWA] Service worker registered successfully:", reg.scope);
      })
      .catch((err) => {
        console.warn("[ResQRoute PWA] Service worker registration failed:", err);
      });
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
