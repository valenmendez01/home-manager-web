import { supabase } from "@/lib/supabase";
import { Compra } from "../../types/compras";

export async function fetchCompras(): Promise<Compra[]> {
  const { data, error } = await supabase
    .from("compras")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function agregarCompra(nombre: string, usuarioId: string) {
  const { data, error } = await supabase
    .from("compras")
    .insert({ nombre, agregado_por: usuarioId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function editarCompra(id: string, nombre: string) {
  const { data, error } = await supabase
    .from("compras")
    .update({ nombre })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function toggleCompra(id: string, nuevoEstado: "pendiente" | "comprado") {
  const { data, error } = await supabase
    .from("compras")
    .update({
      estado: nuevoEstado,
      comprado_at: nuevoEstado === "comprado" ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function eliminarCompra(id: string) {
  const { error } = await supabase.from("compras").delete().eq("id", id);
  if (error) throw error;
}