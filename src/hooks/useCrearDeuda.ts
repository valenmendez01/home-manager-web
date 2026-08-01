import { useMutation, useQueryClient } from "@tanstack/react-query";
import { crearDeuda } from "@/services/supabase/deudasService";
import { NuevaDeudaInput } from "@/types/deudas";

export function useCrearDeuda() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: NuevaDeudaInput) => crearDeuda(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deudas"] });
    },
  });
}