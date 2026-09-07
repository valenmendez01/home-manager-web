import { useState } from "react";
import { Deuda } from "@/types/deudas";
import { useAuthStore } from "@/store/authStore";
import { nombreUsuario, otroUsuarioId } from "@/constants/usuarios";
import { formatMonto } from "@/utils/formatMonto";
import { useSaldarDeudas } from "@/hooks/useSaldarDeudas";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import { ArrowDownLeft, ArrowUpRight, CheckCheck } from "lucide-react";

interface Props {
  deudas: Deuda[];
}

export default function TotalesDeudasHeader({ deudas }: Props) {
  const userId = useAuthStore((s) => s.user?.id);
  const otroId = userId ? otroUsuarioId(userId) : undefined;
  const saldarDeudas = useSaldarDeudas();

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
      <div className="rounded-2xl bg-neutral-900 p-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <p className="flex items-center gap-1 text-xs text-neutral-500">
              <ArrowUpRight size={16} />
              Debés
            </p>
            <p className="mt-1 text-xl font-semibold text-red-400">{formatMonto(miDeuda)}</p>
          </div>
          <div className="flex-1">
            <p className="flex items-center gap-1 text-xs text-neutral-500">
              <ArrowDownLeft size={16} />
              {otroId ? nombreUsuario(otroId) : "El otro"} te debe
            </p>
            <p className="mt-1 text-xl font-semibold text-green-400">{formatMonto(suDeuda)}</p>
          </div>
        </div>

        <div className="mt-2 pt-3">
          
          <Button
            color="primary"
            size="md"
            fullWidth
            isDisabled={pendientes.length <= 1}
            isLoading={saldarDeudas.isPending}
            onPress={handleSaldar}
          >
            <CheckCheck size={16} className="inline" />
            Saldar deuda total
          </Button>
        </div>
      </div>
    </div>
  );
}