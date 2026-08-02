import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HeroUIProvider } from "@heroui/system";
import { ToastProvider } from "@heroui/toast";
import { registerSW } from "virtual:pwa-register";
import "./index.css";
import App from "./App";

// Registra el service worker (cache offline + listener de Web Push).
// skipWaiting/clientsClaim ya están seteados dentro de src/sw.ts.
registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HeroUIProvider>
      {/* placement="top-center": en mobile abajo choca con el navbar fijo */}
      <ToastProvider placement="top-center" toastOffset={8} />
      <App />
    </HeroUIProvider>
  </StrictMode>
);