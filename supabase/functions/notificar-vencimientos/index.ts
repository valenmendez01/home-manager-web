import { createClient } from "@supabase/supabase-js";
import webPush from "web-push";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

webPush.setVapidDetails(
  Deno.env.get("VAPID_SUBJECT")!,
  Deno.env.get("VAPID_PUBLIC_KEY")!,
  Deno.env.get("VAPID_PRIVATE_KEY")!
);

Deno.serve(async () => {
  try {
    const ahora = new Date();
    const en24hs = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);

    const { data: recordatorios, error } = await supabaseAdmin
      .from("recordatorios_pago")
      .select("id, usuario_id, nombre, fecha_vencimiento")
      .eq("marcado", false)
      .eq("notificado", false)
      .not("fecha_vencimiento", "is", null)
      .lte("fecha_vencimiento", en24hs.toISOString().slice(0, 10))
      .gte("fecha_vencimiento", ahora.toISOString().slice(0, 10));

    if (error) throw error;
    if (!recordatorios || recordatorios.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
    }

    let enviados = 0;

    for (const r of recordatorios) {
      const { data: tokenRow } = await supabaseAdmin
        .from("push_tokens")
        .select("token")
        .eq("usuario_id", r.usuario_id)
        .single();

      if (!tokenRow) continue;

      const subscription = JSON.parse(tokenRow.token);
      const mensaje = JSON.stringify({
        title: `ALERTA - Pagar ${r.nombre}`,
        body: `Vence el ${r.fecha_vencimiento}`,
        data: { tipo: "vencimiento_recordatorio", recordatorioId: r.id },
      });

      try {
        await webPush.sendNotification(subscription, mensaje);
        enviados++;
      } catch (pushError: any) {
        if (pushError.statusCode === 404 || pushError.statusCode === 410) {
          await supabaseAdmin.from("push_tokens").delete().eq("usuario_id", r.usuario_id);
          continue;
        }
        throw pushError;
      }

      await supabaseAdmin
        .from("recordatorios_pago")
        .update({ notificado: true })
        .eq("id", r.id);
    }

    return new Response(JSON.stringify({ sent: enviados }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});