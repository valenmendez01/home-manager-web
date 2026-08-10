import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deshacerSaldo } from "@/services/supabase/deudasService";

export function useDeshacerSaldo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (saldoId: string) => deshacerSaldo(saldoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deudas"] });
      queryClient.invalidateQueries({ queryKey: ["pagos-historial"] });
    },
  });
}