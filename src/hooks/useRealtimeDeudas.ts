import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useRealtimeDeudas() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("deudas-y-pagos-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "deudas" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["deudas"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pagos" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["pagos-historial"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}