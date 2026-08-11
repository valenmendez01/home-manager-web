import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eliminarRecordatorio } from "@/services/supabase/recordatoriosService";

export function useEliminarRecordatorio(usuarioId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eliminarRecordatorio(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recordatorios", usuarioId] });
    },
  });
}