import { useQuery } from "@tanstack/react-query";
import { fetchRecordatorios } from "@/services/supabase/recordatoriosService";

export function useRecordatorios(usuarioId?: string) {
  return useQuery({
    queryKey: ["recordatorios", usuarioId],
    queryFn: () => fetchRecordatorios(usuarioId!),
    enabled: !!usuarioId,
  });
}