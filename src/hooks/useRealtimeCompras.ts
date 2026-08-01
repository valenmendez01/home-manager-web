import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useRealtimeCompras() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("compras-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "compras" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["compras"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}