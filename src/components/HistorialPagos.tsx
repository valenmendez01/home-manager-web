import { usePagosHistorial } from "@/hooks/usePagosHistorial";
import { agruparPagosPorMes } from "@/utils/agruparPorMes";
import { agruparPorSaldo, ItemHistorial } from "@/utils/agruparPorSaldo";
import { nombreUsuario, otroUsuarioId } from "@/constants/usuarios";
import { PagoConDeuda } from "@/types/deudas";
import { useDeshacerPago } from "@/hooks/useDeshacerPago";
import { useDeshacerSaldo } from "@/hooks/useDeshacerSaldo";
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
    <div className="flex items-center justify-between border-b border-neutral-800 py-2">
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

function SaldoGroupRow({ saldoId, pagos }: { saldoId: string; pagos: PagoConDeuda[] }) {
  const userId = useAuthStore((s) => s.user?.id);
  const deshacerSaldo = useDeshacerSaldo();

  const fecha = pagos[0].pagado_at;
  const iniciadoPor = pagos[0].saldo_iniciado_por;
  const acreedor = iniciadoPor ? otroUsuarioId(iniciadoPor) : undefined;

  // Neteo: sumamos lo que debía el que inició el saldo, restamos lo que
  // le debían a él (mismo criterio que TotalesDeudasHeader).
  const total = pagos.reduce((acc, p) => {
    const signo = p.pagado_por === iniciadoPor ? 1 : -1;
    return acc + signo * Number(p.deuda.monto_debe);
  }, 0);

  const puedeDeshacer = iniciadoPor === userId && esHoy(fecha);

  const handleDeshacer = () => {
    deshacerSaldo.mutate(saldoId, {
      onSuccess: () => {
        addToast({ title: "Saldo deshecho", description: "Las deudas volvieron a quedar pendientes.", color: "success" });
      },
      onError: () => {
        addToast({ title: "No se pudo deshacer", description: "Intentá de nuevo en unos segundos.", color: "danger" });
      },
    });
  };

  return (
    <div className="mb-1 rounded-xl border border-neutral-800 bg-neutral-900/50 p-2">
      <div className="flex items-center justify-between px-1 pb-1">
        <p className="text-xs font-medium uppercase text-neutral-500">
          Saldo completo · {new Date(fecha).toLocaleDateString()}
        </p>
        {puedeDeshacer && (
          <Button
            size="sm"
            variant="light"
            isLoading={deshacerSaldo.isPending}
            onPress={handleDeshacer}
            startContent={!deshacerSaldo.isPending && <Undo2 size={14} color="#737373" />}
          >
            Deshacer saldo
          </Button>
        )}
      </div>
      {pagos.map((pago) => (
        <div key={pago.id} className="flex items-center justify-between border-b border-neutral-800 py-2 last:border-b-0">
          <div className="flex-1 pr-2">
            <p className="text-sm text-neutral-50">{pago.deuda.descripcion}</p>
            <p className="mt-0.5 text-xs text-neutral-500">Pagó {nombreUsuario(pago.pagado_por)}</p>
          </div>
          <p className="text-sm font-medium text-neutral-300">{formatMonto(pago.deuda.monto_debe)}</p>
        </div>
      ))}
      <div className="flex justify-end px-1 pt-1">
        <p className="text-xs text-neutral-500">
          {iniciadoPor && acreedor
            ? `${nombreUsuario(iniciadoPor)} pagó ${formatMonto(total)} a ${nombreUsuario(acreedor)}`
            : `Total saldado: ${formatMonto(total)}`}
        </p>
      </div>
    </div>
  );
}

function ItemRow({ item }: { item: ItemHistorial }) {
  if (item.tipo === "individual") return <PagoRow pago={item.pago} />;
  return <SaldoGroupRow saldoId={item.saldoId} pagos={item.pagos} />;
}

export default function HistorialPagos() {
  const { data: pagos, isLoading } = usePagosHistorial();

  if (isLoading || !pagos) return null;

  const { actual, pasado } = agruparPagosPorMes(pagos);

  if (actual.length === 0 && pasado.length === 0) return null;

  const itemsActual = agruparPorSaldo(actual);
  const itemsPasado = agruparPorSaldo(pasado);

  return (
    <div className="mt-6">
      <h2 className="mb-2 text-lg font-semibold text-neutral-50">Historial de pagos</h2>

      {itemsActual.length > 0 && (
        <div className="mb-4">
          <p className="mb-1 text-xs font-medium uppercase text-neutral-500">{nombreMes(0)}</p>
          {itemsActual.map((item) => (
            <ItemRow key={item.tipo === "individual" ? item.pago.id : item.saldoId} item={item} />
          ))}
        </div>
      )}

      {itemsPasado.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-medium uppercase text-neutral-500">{nombreMes(1)}</p>
          {itemsPasado.map((item) => (
            <ItemRow key={item.tipo === "individual" ? item.pago.id : item.saldoId} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}