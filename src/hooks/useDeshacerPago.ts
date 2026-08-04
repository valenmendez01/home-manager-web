import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deshacerPago } from "@/services/supabase/deudasService";

export function useDeshacerPago() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pagoId: string) => deshacerPago(pagoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deudas"] });
      queryClient.invalidateQueries({ queryKey: ["pagos-historial"] });
    },
  });
}