/// <reference lib="webworker" />
import { precacheAndRoute } from "workbox-precaching";

declare let self: ServiceWorkerGlobalScope;

// Inyectado por vite-plugin-pwa (build) con la lista de assets a cachear.
precacheAndRoute(self.__WB_MANIFEST);

self.skipWaiting();

// --- Web Push: reemplaza al manejador de expo-notifications ---
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const payload = event.data.json() as {
    title?: string;
    body?: string;
    data?: Record<string, unknown>;
  };

  event.waitUntil(
    self.registration.showNotification(payload.title ?? "Home Manager", {
      body: payload.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: payload.data,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientsArr) => {
      const client = clientsArr[0];
      if (client) return client.focus();
      return self.clients.openWindow("/");
    })
  );
});
