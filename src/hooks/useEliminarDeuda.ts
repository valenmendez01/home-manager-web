import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eliminarDeuda } from "@/services/supabase/deudasService";

export function useEliminarDeuda() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => eliminarDeuda(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deudas"] });
    },
  });
}