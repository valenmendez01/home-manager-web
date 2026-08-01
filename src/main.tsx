import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import "./index.css";
import App from "./App";

// Registra el service worker (cache offline + listener de Web Push).
// skipWaiting/clientsClaim ya están seteados dentro de src/sw.ts.
registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
