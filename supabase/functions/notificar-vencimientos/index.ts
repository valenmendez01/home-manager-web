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

// Dado un "día del mes" (1-31) devuelve la próxima fecha real en que cae,
// tomando como hoy la fecha pasada. Si el día ya pasó este mes, usa el
// mes siguiente. Si el mes no tiene ese día (ej. 31 en febrero), lo
// clampea al último día del mes.
function proximoVencimiento(diaVencimiento: number, hoy: Date): Date {
  const clamp = (anio: number, mes: number) => {
    const ultimoDiaDelMes = new Date(Date.UTC(anio, mes + 1, 0)).getUTCDate();
    const dia = Math.min(diaVencimiento, ultimoDiaDelMes);
    return new Date(Date.UTC(anio, mes, dia));
  };

  const anio = hoy.getUTCFullYear();
  const mes = hoy.getUTCMonth();

  let candidato = clamp(anio, mes);
  if (candidato < hoy) {
    candidato = clamp(anio, mes + 1);
  }
  return candidato;
}

Deno.serve(async () => {
  try {
    const ahora = new Date();
    const hoy = new Date(Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), ahora.getUTCDate()));
    const en24hs = new Date(hoy.getTime() + 24 * 60 * 60 * 1000);

    const { data: candidatos, error } = await supabaseAdmin
      .from("recordatorios_pago")
      .select("id, usuario_id, nombre, dia_vencimiento")
      .eq("marcado", false)
      .eq("notificado", false)
      .not("dia_vencimiento", "is", null);

    if (error) throw error;

    const recordatorios = (candidatos ?? []).filter((r) => {
      const vencimiento = proximoVencimiento(r.dia_vencimiento, hoy);
      return vencimiento >= hoy && vencimiento <= en24hs;
    });

    if (recordatorios.length === 0) {
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
        body: `Vence el día ${r.dia_vencimiento} de este mes`,
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