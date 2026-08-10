import { useState } from "react";
import { Deuda } from "@/types/deudas";
import { useAuthStore } from "@/store/authStore";
import { nombreUsuario, otroUsuarioId } from "@/constants/usuarios";
import { formatMonto } from "@/utils/formatMonto";
import { useSaldarDeudas } from "@/hooks/useSaldarDeudas";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";

interface Props {
  deudas: Deuda[];
}

export default function TotalesDeudasHeader({ deudas }: Props) {
  const userId = useAuthStore((s) => s.user?.id);
  const otroId = userId ? otroUsuarioId(userId) : undefined;
  const saldarDeudas = useSaldarDeudas();
  const [confirmando, setConfirmando] = useState(false);

  const pendientes = deudas.filter((d) => d.estado === "pendiente");

  // cuánto le deben al usuario logeado (deudas donde él puso la plata)
  const meDeben = pendientes
    .filter((d) => d.pagado_por === userId)
    .reduce((acc, d) => acc + Number(d.monto_debe), 0);

  // cuánto debe el usuario logeado (deudas donde el otro puso la plata)
  const yoDebo = pendientes
    .filter((d) => d.pagado_por === otroId)
    .reduce((acc, d) => acc + Number(d.monto_debe), 0);

  // neteo: si soy acreedor neto, no debo nada y el otro me debe la diferencia (y viceversa)
  const balance = meDeben - yoDebo;
  const miDeuda = balance < 0 ? Math.abs(balance) : 0;
  const suDeuda = balance > 0 ? balance : 0;

  const handleSaldar = () => {
    if (!userId || !otroId) return;
    saldarDeudas.mutate(
      { deudorId: userId, acreedorId: otroId },
      {
        onSuccess: () => {
          setConfirmando(false);
          addToast({
            title: "Deuda saldada",
            description: "Se marcaron todas las deudas pendientes como pagadas.",
            color: "success",
          });
        },
        onError: () => {
          addToast({
            title: "No se pudo saldar",
            description: "Intentá de nuevo en unos segundos.",
            color: "danger",
          });
        },
      }
    );
  };

  return (
    <div className="px-5 pb-4 pt-2">
      <div className="flex gap-3">
        <div className="flex-1 rounded-2xl bg-neutral-900 p-4">
          <p className="text-xs text-neutral-500">Debés</p>
          <p className="mt-1 text-xl font-semibold text-red-400">{formatMonto(miDeuda)}</p>
        </div>
        <div className="flex-1 rounded-2xl bg-neutral-900 p-4">
          <p className="text-xs text-neutral-500">
            {otroId ? nombreUsuario(otroId) : "El otro"} te debe
          </p>
          <p className="mt-1 text-xl font-semibold text-green-400">{formatMonto(suDeuda)}</p>
        </div>
      </div>

      {miDeuda > 0 && (
        <div className="mt-3">
          {!confirmando ? (
            <Button color="primary" variant="flat" size="sm" fullWidth onPress={() => setConfirmando(true)}>
              Saldar deuda
            </Button>
          ) : (
            <div className="flex items-center gap-2 rounded-2xl bg-neutral-900 p-3">
              <p className="flex-1 text-xs text-neutral-400">
                ¿Confirmás que le transferiste {formatMonto(miDeuda)} a{" "}
                {otroId ? nombreUsuario(otroId) : "el otro"}?
              </p>
              <Button size="sm" variant="light" onPress={() => setConfirmando(false)}>
                Cancelar
              </Button>
              <Button size="sm" color="primary" isLoading={saldarDeudas.isPending} onPress={handleSaldar}>
                Confirmar
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}