import { useMutation, useQueryClient } from "@tanstack/react-query";
import { marcarComoLimpio } from "@/services/supabase/limpiezaService";
import { useAuthStore } from "@/store/authStore";

export function useMarcarLimpio() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: async (ambienteId: string) => {
      if (!userId) throw new Error("No hay usuario autenticado");
      return marcarComoLimpio(ambienteId, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ambientes-con-estado"] });
      queryClient.invalidateQueries({ queryKey: ["historial-ambiente"] });
    },
  });
}