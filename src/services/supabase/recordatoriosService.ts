import { supabase } from "@/lib/supabase";
import { RecordatorioPago } from "@/types/recordatorios";

export async function fetchRecordatorios(usuarioId: string): Promise<RecordatorioPago[]> {
  const { data, error } = await supabase
    .from("recordatorios_pago")
    .select("*")
    .eq("usuario_id", usuarioId)
    .order("orden");
  if (error) throw error;
  return data;
}

export async function toggleRecordatorio(id: string, marcado: boolean) {
  const { error } = await supabase.from("recordatorios_pago").update({ marcado }).eq("id", id);
  if (error) throw error;
}

export async function crearRecordatorio(usuarioId: string, nombre: string, orden: number) {
  const { error } = await supabase
    .from("recordatorios_pago")
    .insert({ usuario_id: usuarioId, nombre, orden });
  if (error) throw error;
}

export async function eliminarRecordatorio(id: string) {
  const { error } = await supabase.from("recordatorios_pago").delete().eq("id", id);
  if (error) throw error;
}