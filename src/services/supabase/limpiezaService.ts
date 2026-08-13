import { supabase } from "@/lib/supabase";
import { Ambiente, Limpieza } from "../../types/limpieza";

export async function fetchAmbientes(): Promise<Ambiente[]> {
  const { data, error } = await supabase
    .from("ambientes")
    .select("*")
    .order("orden", { ascending: true });

  if (error) throw error;
  return data;
}

export async function fetchUltimasLimpiezas(): Promise<Limpieza[]> {
  // Trae la limpieza más reciente por ambiente usando distinct on
  const { data, error } = await supabase
    .from("limpiezas")
    .select("*")
    .eq("activa", true)
    .order("realizado_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function fetchHistorialAmbiente(ambienteId: string): Promise<Limpieza[]> {
  // Solo las últimas 2 activas: lo demás lo maneja el trigger en la base
  // (archiva la más vieja al agregar una 3ra, y la reactiva si se borra por error).
  const { data, error } = await supabase
    .from("limpiezas")
    .select("*")
    .eq("ambiente_id", ambienteId)
    .eq("activa", true)
    .order("realizado_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function marcarComoLimpio(ambienteId: string, usuarioId: string) {
  const { data, error } = await supabase
    .from("limpiezas")
    .insert({ ambiente_id: ambienteId, usuario_id: usuarioId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function eliminarLimpieza(id: string) {
  const { error } = await supabase.from("limpiezas").delete().eq("id", id);
  if (error) throw error;
}