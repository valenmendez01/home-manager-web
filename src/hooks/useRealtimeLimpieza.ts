import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useRealtimeLimpieza() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("limpiezas-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "limpiezas" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["ambientes-con-estado"] });
          queryClient.invalidateQueries({ queryKey: ["historial-ambiente"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}