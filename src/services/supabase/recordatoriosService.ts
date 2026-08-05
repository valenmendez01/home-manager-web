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