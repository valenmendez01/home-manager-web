import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pagarDeuda } from "@/services/supabase/deudasService";
import { useAuthStore } from "@/store/authStore";

export function usePagarDeuda() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: (deudaId: string) => {
      if (!userId) throw new Error("No hay usuario autenticado");
      return pagarDeuda(deudaId, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deudas"] });
    },
  });
}