import { useQuery } from "@tanstack/react-query";
import { fetchPagosHistorial } from "@/services/supabase/deudasService";

export function usePagosHistorial() {
  return useQuery({
    queryKey: ["pagos-historial"],
    queryFn: fetchPagosHistorial,
  });
}