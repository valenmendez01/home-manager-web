import { useMutation, useQueryClient } from "@tanstack/react-query";
import { crearRecordatorio } from "@/services/supabase/recordatoriosService";

export function useCrearRecordatorio(usuarioId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ nombre, orden }: { nombre: string; orden: number }) =>
      crearRecordatorio(usuarioId!, nombre, orden),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recordatorios", usuarioId] });
    },
  });
}