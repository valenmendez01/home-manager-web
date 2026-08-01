import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  agregarCompra,
  editarCompra,
  toggleCompra,
  eliminarCompra,
} from "@/services/supabase/comprasService";
import { useAuthStore } from "@/store/authStore";

export function useAgregarCompra() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: (nombre: string) => {
      if (!userId) throw new Error("No hay usuario autenticado");
      return agregarCompra(nombre, userId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["compras"] }),
  });
}

export function useEditarCompra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, nombre }: { id: string; nombre: string }) =>
      editarCompra(id, nombre),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["compras"] }),
  });
}

export function useToggleCompra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: "pendiente" | "comprado" }) =>
      toggleCompra(id, estado),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["compras"] }),
  });
}

export function useEliminarCompra() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => eliminarCompra(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["compras"] }),
  });
}