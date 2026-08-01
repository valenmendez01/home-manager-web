import { useState } from "react";
import { Drawer } from "vaul";
import { useAuthStore } from "@/store/authStore";
import { useCrearDeuda } from "@/hooks/useCrearDeuda";
import { otroUsuarioId, nombreUsuario } from "@/constants/usuarios";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function NuevaDeudaModal({ visible, onClose }: Props) {
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const userId = useAuthStore((s) => s.user?.id);
  const crearDeuda = useCrearDeuda();

  const handleGuardar = async () => {
    if (!userId || !descripcion.trim() || !monto) return;

    const montoTotal = parseFloat(monto.replace(",", "."));
    if (isNaN(montoTotal) || montoTotal <= 0) return;

    const debe = otroUsuarioId(userId);
    const montoDebe = montoTotal / 2;

    await crearDeuda.mutateAsync({
      descripcion: descripcion.trim(),
      montoTotal,
      pagadoPor: userId,
      debe,
      montoDebe,
      fecha: new Date().toISOString().slice(0, 10),
    });

    setDescripcion("");
    setMonto("");
    onClose();
  };

  return (
    <Drawer.Root open={visible} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex flex-col gap-3 rounded-t-3xl bg-neutral-900 p-5 safe-bottom">
          <Drawer.Title className="mb-2 text-xl font-semibold text-neutral-50">
            Nueva deuda
          </Drawer.Title>

          <input
            className="rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-base text-neutral-50 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />

          <input
            className="rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-base text-neutral-50 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Monto total"
            inputMode="decimal"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
          />

          {userId && (
            <p className="text-xs text-neutral-500">
              Se dividirá entre vos y {nombreUsuario(otroUsuarioId(userId))}
            </p>
          )}

          <div className="mt-2 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-2xl bg-neutral-800 py-3 text-center font-medium text-neutral-300 active:bg-neutral-700"
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              disabled={crearDeuda.isPending}
              className="flex-1 rounded-2xl bg-blue-500 py-3 text-center font-medium text-white active:bg-blue-600 disabled:opacity-50"
            >
              {crearDeuda.isPending ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
