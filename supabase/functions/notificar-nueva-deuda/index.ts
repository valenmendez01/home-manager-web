import { createClient } from "@supabase/supabase-js";
import webPush from "web-push";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Claves VAPID: la pública es la misma que VITE_VAPID_PUBLIC_KEY en el front,
// la privada NUNCA va al cliente, solo vive acá como secret de la función.
webPush.setVapidDetails(
  Deno.env.get("VAPID_SUBJECT")!, // ej: "mailto:vos@tudominio.com"
  Deno.env.get("VAPID_PUBLIC_KEY")!,
  Deno.env.get("VAPID_PRIVATE_KEY")!
);

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const deuda = payload.record;

    // Buscamos la suscripción push de "debe" (el que tiene que recibir el aviso)
    const { data: tokenRow, error } = await supabaseAdmin
      .from("push_tokens")
      .select("token")
      .eq("usuario_id", deuda.debe)
      .single();

    if (error || !tokenRow) {
      return new Response(
        JSON.stringify({ skipped: "sin suscripción para ese usuario" }),
        { status: 200 }
      );
    }

    // El front guarda el objeto PushSubscription completo serializado como JSON
    // en la misma columna "token" que antes tenía el Expo push token (string).
    const subscription = JSON.parse(tokenRow.token);

    const mensaje = JSON.stringify({
      title: "Nueva deuda",
      body: `${deuda.descripcion} — te toca $${deuda.monto_debe}`,
      data: { tipo: "nueva_deuda", deudaId: deuda.id },
    });

    try {
      await webPush.sendNotification(subscription, mensaje);
    } catch (pushError: any) {
      // 404/410 = la suscripción venció o el usuario desinstaló la PWA:
      // limpiamos el token guardado para no seguir intentando en vano.
      if (pushError.statusCode === 404 || pushError.statusCode === 410) {
        await supabaseAdmin
          .from("push_tokens")
          .delete()
          .eq("usuario_id", deuda.debe);
        return new Response(
          JSON.stringify({ skipped: "suscripción vencida, se eliminó" }),
          { status: 200 }
        );
      }
      throw pushError;
    }

    return new Response(JSON.stringify({ sent: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
