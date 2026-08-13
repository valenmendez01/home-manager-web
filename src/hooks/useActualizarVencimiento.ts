import { useMutation, useQueryClient } from "@tanstack/react-query";
import { actualizarVencimiento } from "@/services/supabase/recordatoriosService";

export function useActualizarVencimiento(usuarioId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, fecha }: { id: string; fecha: string | null }) =>
      actualizarVencimiento(id, fecha),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recordatorios", usuarioId] });
    },
  });
}