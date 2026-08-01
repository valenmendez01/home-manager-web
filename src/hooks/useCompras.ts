import { useQuery } from "@tanstack/react-query";
import { fetchCompras } from "@/services/supabase/comprasService";

export function useCompras() {
  return useQuery({
    queryKey: ["compras"],
    queryFn: fetchCompras,
  });
}