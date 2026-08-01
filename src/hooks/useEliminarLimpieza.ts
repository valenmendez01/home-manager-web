import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eliminarLimpieza } from "@/services/supabase/limpiezaService";

export function useEliminarLimpieza() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => eliminarLimpieza(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ambientes-con-estado"] });
      queryClient.invalidateQueries({ queryKey: ["historial-ambiente"] });
    },
  });
}