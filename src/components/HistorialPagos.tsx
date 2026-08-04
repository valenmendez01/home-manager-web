import { usePagosHistorial } from "@/hooks/usePagosHistorial";
import { agruparPagosPorMes } from "@/utils/agruparPorMes";
import { nombreUsuario } from "@/constants/usuarios";
import { PagoConDeuda } from "@/types/deudas";
import { useDeshacerPago } from "@/hooks/useDeshacerPago";
import { useAuthStore } from "@/store/authStore";
import { addToast } from "@heroui/toast";
import { Button } from "@heroui/button";
import { Undo2 } from "lucide-react";
import { formatMonto } from "@/utils/formatMonto";

function nombreMes(offset: number) {
  const fecha = new Date();
  fecha.setMonth(fecha.getMonth() - offset);
  return fecha.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
}

function esHoy(fechaIso: string) {
  return new Date(fechaIso).toDateString() === new Date().toDateString();
}

function PagoRow({ pago }: { pago: PagoConDeuda }) {

  const userId = useAuthStore((s) => s.user?.id);
  const deshacerPago = useDeshacerPago();

  const puedeDeshacer = pago.pagado_por === userId && esHoy(pago.pagado_at);

  const handleDeshacer = () => {
    deshacerPago.mutate(pago.id, {
      onSuccess: () => {
        addToast({ title: "Pago deshecho", description: "La deuda volvió a quedar pendiente.", color: "success" });
      },
      onError: () => {
        addToast({ title: "No se pudo deshacer", description: "Intentá de nuevo en unos segundos.", color: "danger" });
      },
    });
  };

  return (
    <div className="flex items-center justify-between border-b border-neutral-800 py-2 mb-10">
      <div className="flex-1 pr-2">
        <p className="text-sm text-neutral-50">{pago.deuda.descripcion}</p>
        <p className="mt-0.5 text-xs text-neutral-500">
          Pagó {nombreUsuario(pago.pagado_por)} · {new Date(pago.pagado_at).toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-neutral-300">{formatMonto(pago.deuda.monto_debe)}</p>
        {puedeDeshacer && (
          <Button
            isIconOnly
            size="sm"
            variant="light"
            isLoading={deshacerPago.isPending}
            onPress={handleDeshacer}
            aria-label="Deshacer pago"
          >
            {!deshacerPago.isPending && <Undo2 size={16} color="#737373" />}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function HistorialPagos() {
  const { data: pagos, isLoading } = usePagosHistorial();

  if (isLoading || !pagos) return null;

  const { actual, pasado } = agruparPagosPorMes(pagos);

  if (actual.length === 0 && pasado.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="mb-2 text-lg font-semibold text-neutral-50">Historial de pagos</h2>

      {actual.length > 0 && (
        <div className="mb-4">
          <p className="mb-1 text-xs font-medium uppercase text-neutral-500">{nombreMes(0)}</p>
          {actual.map((pago) => (
            <PagoRow key={pago.id} pago={pago} />
          ))}
        </div>
      )}

      {pasado.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-medium uppercase text-neutral-500">{nombreMes(1)}</p>
          {pasado.map((pago) => (
            <PagoRow key={pago.id} pago={pago} />
          ))}
        </div>
      )}
    </div>
  );
}
