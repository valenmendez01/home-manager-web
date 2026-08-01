import { useQuery } from "@tanstack/react-query";
import { fetchAmbientes, fetchUltimasLimpiezas } from "@/services/supabase/limpiezaService";
import { calcularEstado, calcularDiasTranscurridos } from "@/utils/limpiezaStatus";
import { AmbienteConEstado } from "@/types/limpieza";

export function useAmbientesConEstado() {
  return useQuery({
    queryKey: ["ambientes-con-estado"],
    queryFn: async (): Promise<AmbienteConEstado[]> => {
      const [ambientes, limpiezas] = await Promise.all([
        fetchAmbientes(),
        fetchUltimasLimpiezas(),
      ]);

      return ambientes.map((ambiente) => {
        const ultimaLimpieza =
          limpiezas.find((l) => l.ambiente_id === ambiente.id) ?? null;

        return {
          ...ambiente,
          ultimaLimpieza,
          estado: calcularEstado(ultimaLimpieza?.realizado_at ?? null),
          diasTranscurridos: ultimaLimpieza
            ? calcularDiasTranscurridos(ultimaLimpieza.realizado_at)
            : null,
        };
      });
    },
  });
}