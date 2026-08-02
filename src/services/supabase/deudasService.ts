import { supabase } from "@/lib/supabase";
import { Deuda, NuevaDeudaInput, PagoConDeuda } from "../../types/deudas";

export async function fetchDeudas(): Promise<Deuda[]> {
  const { data, error } = await supabase
    .from("deudas")
    .select("*")
    .order("fecha", { ascending: false });

  if (error) throw error;
  return data;
}

export async function crearDeuda(input: NuevaDeudaInput) {
  const { data, error } = await supabase
    .from("deudas")
    .insert({
      descripcion: input.descripcion,
      monto_total: input.montoTotal,
      pagado_por: input.pagadoPor,
      debe: input.debe,
      monto_debe: input.montoDebe,
      fecha: input.fecha,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function pagarDeuda(deudaId: string, usuarioId: string) {
  const { error: updateError } = await supabase
    .from("deudas")
    .update({ estado: "pagada" })
    .eq("id", deudaId);

  if (updateError) throw updateError;

  const { error: pagoError } = await supabase
    .from("pagos")
    .insert({ deuda_id: deudaId, pagado_por: usuarioId });

  if (pagoError) throw pagoError;
}

export async function fetchPagosHistorial(): Promise<PagoConDeuda[]> {
  const { data, error } = await supabase
    .from("pagos")
    .select("*, deuda:deudas(descripcion, monto_debe)")
    .order("pagado_at", { ascending: false });

  if (error) throw error;
  return data as unknown as PagoConDeuda[];
}

export async function eliminarDeuda(id: string) {
  const { error } = await supabase.from("deudas").delete().eq("id", id);
  if (error) throw error;
}