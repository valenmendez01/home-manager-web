import { useMutation, useQueryClient } from "@tanstack/react-query";
import { actualizarVencimiento } from "@/services/supabase/recordatoriosService";

export function useActualizarVencimiento(usuarioId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dia }: { id: string; dia: number | null }) =>
      actualizarVencimiento(id, dia),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recordatorios", usuarioId] });
    },
  });
}