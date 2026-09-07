import { Deuda } from "@/types/deudas";
import { nombreUsuario } from "@/constants/usuarios";
import { Avatar } from "@heroui/avatar";
import { useAuthStore } from "@/store/authStore";
import { usePagarDeuda } from "@/hooks/usePagarDeuda";
import { Button } from "@heroui/button";
import { CheckCircle2, Trash2 } from "lucide-react";
import { useEliminarDeuda } from "@/hooks/useEliminarDeuda";
import { formatMonto } from "@/utils/formatMonto";

interface Props {
  deuda: Deuda;
}

export default function DeudaCard({ deuda }: Props) {
  const userId = useAuthStore((s) => s.user?.id);
  const pagarDeuda = usePagarDeuda();

  const esQuienDebe = deuda.debe === userId;
  const puedeMarcarPagada = esQuienDebe && deuda.estado === "pendiente";

  const eliminarDeuda = useEliminarDeuda();
  const esCreador = deuda.pagado_por === userId; // quien pagó = quien la cargó

  return (
    <div className="mb-3 rounded-2xl bg-neutral-900 p-4">
      <div className="flex items-start gap-3">
        <Avatar name={nombreUsuario(deuda.pagado_por)} size="md" className="shrink-0" />

        <div className="min-w-0 flex-1">
          <p className="wrap-break-word text-base font-medium text-neutral-50">
            {deuda.descripcion}
          </p>
          <p className="mt-0.5 text-xs text-neutral-500">
            {esCreador ? "Pagaste vos" : `Pagó ${nombreUsuario(deuda.pagado_por)}`} ·{" "}
            {new Date(deuda.fecha).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-50">
            Total: <span className="font-semibold">{formatMonto(deuda.monto_total)}</span>
          </p>
          {esQuienDebe && (
            <p className="text-md font-semibold text-rose-400">
              Tu parte: -{formatMonto(deuda.monto_debe)}
            </p>
          )}
          {esCreador && (
            <p className="text-md font-semibold text-emerald-400">
              Te debe: +{formatMonto(deuda.monto_debe)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          {puedeMarcarPagada && (
            <Button
              color="primary"
              variant="flat"
              size="sm"
              radius="lg"
              startContent={!pagarDeuda.isPending && <CheckCircle2 size={16} />}
              isLoading={pagarDeuda.isPending}
              onPress={() => pagarDeuda.mutate(deuda.id)}
            >
              Saldar
            </Button>
          )}
          {esCreador && (
            <Button
              isIconOnly
              variant="light"
              size="sm"
              isLoading={eliminarDeuda.isPending}
              onPress={() => eliminarDeuda.mutate(deuda.id)}
              aria-label="Eliminar deuda"
            >
              {!eliminarDeuda.isPending && <Trash2 size={18} color="#737373" />}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}