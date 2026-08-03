import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Realtime (WebSocket) se corta cuando la PWA pasa a segundo plano en iOS.
 * Los cambios que pasan mientras la app está afuera se pierden (no hay replay),
 * y React Query no siempre refetchea al volver por el staleTime configurado.
 * Este hook fuerza un refetch de todo al volver a primer plano, como red de
 * seguridad complementaria al realtime (que sigue sirviendo para cambios
 * en vivo mientras la app está abierta).
 */
export function useRefetchOnResume() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        queryClient.invalidateQueries();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [queryClient]);
}