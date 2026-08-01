import { useQuery } from "@tanstack/react-query";
import { fetchDeudas } from "@/services/supabase/deudasService";

export function useDeudas() {
  return useQuery({
    queryKey: ["deudas"],
    queryFn: fetchDeudas,
  });
}