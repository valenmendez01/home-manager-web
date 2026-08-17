import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Mismos 2 usuarios que ya viven hardcodeados en el front
// (src/constants/usuarios.ts). Si alguna vez cambian los UUIDs,
// hay que actualizarlos ahí y acá.
const USUARIOS_VALIDOS = [
  "e0f6fad5-c137-4d34-81d0-fd2630a97cf5", // Valentín
  "16a7b308-a718-49f8-9845-20354176169f", // Joaquín
];

function otroUsuarioId(usuarioActualId: string): string {
  return USUARIOS_VALIDOS.find((id) => id !== usuarioActualId)!;
}

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Método no permitido" }), { status: 405 });
    }

    // Autenticación por secreto compartido: el Shortcut no maneja login
    // de Supabase, así que en vez de un JWT de usuario, validamos un
    // secreto fijo que vos generás y guardás como secret de la función.
    const secretRecibido = req.headers.get("x-shortcut-secret");
    const secretEsperado = Deno.env.get("SHORTCUT_SECRET");
    if (!secretEsperado || secretRecibido !== secretEsperado) {
      return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
    }

    const body = await req.json();
    const descripcion = String(body.descripcion ?? "").trim();
    const usuarioId = String(body.usuario_id ?? "");
    const montoTotal = Number(body.monto);

    if (!descripcion) {
      return new Response(JSON.stringify({ error: "Falta descripción" }), { status: 400 });
    }
    if (!USUARIOS_VALIDOS.includes(usuarioId)) {
      return new Response(JSON.stringify({ error: "usuario_id inválido" }), { status: 400 });
    }
    if (!Number.isFinite(montoTotal) || montoTotal <= 0) {
      return new Response(JSON.stringify({ error: "Monto inválido" }), { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("deudas")
      .insert({
        descripcion,
        monto_total: montoTotal,
        pagado_por: usuarioId,
        debe: otroUsuarioId(usuarioId),
        monto_debe: montoTotal / 2,
        fecha: new Date().toISOString().slice(0, 10),
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, deuda: data }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});