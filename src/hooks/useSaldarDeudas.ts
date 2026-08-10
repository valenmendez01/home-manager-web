import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saldarDeudas } from "@/services/supabase/deudasService";

export function useSaldarDeudas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ deudorId, acreedorId }: { deudorId: string; acreedorId: string }) =>
      saldarDeudas(deudorId, acreedorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deudas"] });
      queryClient.invalidateQueries({ queryKey: ["pagos-historial"] });
    },
  });
}