import { supabase } from "@/lib/supabase";

// El Push API del navegador pide la VAPID public key en formato Uint8Array,
// no en base64. Este helper hace esa conversión.
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

/**
 * Equivalente web de registerPushToken.ts (Expo).
 * En vez de un Expo push token, generamos una PushSubscription del navegador
 * (endpoint + claves p256dh/auth) y la guardamos en `push_tokens.token` como JSON.
 * La Edge Function del lado del servidor tiene que actualizarse para mandar
 * Web Push (con las mismas claves VAPID) en lugar de pegarle a exp.host.
 */
export async function registerPushToken(usuarioId: string) {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.log("Este navegador no soporta notificaciones push");
    return;
  }

  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    console.log("Falta VITE_VAPID_PUBLIC_KEY: no se puede suscribir a push");
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    console.log("Permiso de notificaciones denegado");
    return;
  }

  const registration = await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
    });
  }

  await supabase.from("push_tokens").upsert({
    usuario_id: usuarioId,
    token: JSON.stringify(subscription),
    updated_at: new Date().toISOString(),
  });
}
