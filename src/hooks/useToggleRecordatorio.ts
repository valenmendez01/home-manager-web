import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleRecordatorio } from "@/services/supabase/recordatoriosService";

export function useToggleRecordatorio(usuarioId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, marcado }: { id: string; marcado: boolean }) => toggleRecordatorio(id, marcado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recordatorios", usuarioId] });
    },
  });
}