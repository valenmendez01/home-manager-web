import { useQuery } from "@tanstack/react-query";
import { fetchHistorialAmbiente } from "@/services/supabase/limpiezaService";

export function useHistorialAmbiente(ambienteId?: string) {
  return useQuery({
    queryKey: ["historial-ambiente", ambienteId],
    queryFn: () => fetchHistorialAmbiente(ambienteId!),
    enabled: !!ambienteId,
  });
}