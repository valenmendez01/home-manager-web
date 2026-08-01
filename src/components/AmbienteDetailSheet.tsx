import { Drawer } from "vaul";
import { Trash2 } from "lucide-react";
import { AmbienteConEstado, Limpieza } from "@/types/limpieza";
import { useMarcarLimpio } from "@/hooks/useMarcarLimpio";
import { useHistorialAmbiente } from "@/hooks/useHistorialAmbiente";
import { nombreUsuario } from "@/constants/usuarios";
import { useAuthStore } from "@/store/authStore";
import { useEliminarLimpieza } from "@/hooks/useEliminarLimpieza";

interface Props {
  ambiente: AmbienteConEstado | null;
  onClose: () => void;
}

// Equivalente web de @gorhom/bottom-sheet: vaul da el mismo comportamiento
// (arrastrar para cerrar, snap points) usando gestos táctiles del navegador.
export default function AmbienteDetailSheet({ ambiente, onClose }: Props) {
  const marcarLimpio = useMarcarLimpio();
  const { data: historial, isLoading } = useHistorialAmbiente(ambiente?.id);

  const userId = useAuthStore((s) => s.user?.id);
  const eliminarLimpieza = useEliminarLimpieza();

  return (
    <Drawer.Root
      open={!!ambiente}
      onOpenChange={(open) => !open && onClose()}
      snapPoints={[0.5, 0.85]}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-3xl bg-neutral-900">
          <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-neutral-600" />

          {ambiente && (
            <div className="overflow-y-auto px-5 pb-6 pt-4 safe-bottom">
              <Drawer.Title className="text-xl font-semibold text-neutral-50">
                {ambiente.nombre}
              </Drawer.Title>
              <p className="mt-1 text-sm text-neutral-400">
                {ambiente.diasTranscurridos === null
                  ? "Nunca se registró una limpieza"
                  : `Última limpieza hecha por ${nombreUsuario(
                      ambiente.ultimaLimpieza!.usuario_id
                    )} hace ${ambiente.diasTranscurridos} día(s)`}
              </p>

              <button
                onClick={() => marcarLimpio.mutate(ambiente.id)}
                disabled={marcarLimpio.isPending}
                className="mt-4 w-full rounded-2xl bg-blue-500 py-3 text-center font-medium text-white active:bg-blue-600 disabled:opacity-50"
              >
                {marcarLimpio.isPending ? "Guardando..." : "Marcar como limpio"}
              </button>

              <p className="mb-2 mt-6 text-sm font-medium text-neutral-300">Historial</p>
              {isLoading && <p className="text-sm text-neutral-300">Cargando...</p>}
              {!isLoading && (historial ?? []).length === 0 && (
                <p className="text-sm text-neutral-300">Sin registros todavía</p>
              )}

              {(historial ?? []).map((item: Limpieza, index: number) => {
                const esElMasReciente = index === 0;
                const esMio = item.usuario_id === userId;
                const puedeBorrar = esElMasReciente && esMio;

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b border-neutral-800 py-2"
                  >
                    <div className="flex flex-1 items-center">
                      <span className="text-sm font-medium text-neutral-50">
                        {nombreUsuario(item.usuario_id)}
                      </span>
                      <span className="text-sm text-neutral-500">
                        {" · "}
                        {new Date(item.realizado_at).toLocaleDateString()}
                        {" · "}
                        {new Date(item.realizado_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {puedeBorrar && (
                      <button
                        onClick={() => eliminarLimpieza.mutate(item.id)}
                        disabled={eliminarLimpieza.isPending}
                        className="pl-3"
                        aria-label="Eliminar registro"
                      >
                        <Trash2 size={18} color="#737373" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
