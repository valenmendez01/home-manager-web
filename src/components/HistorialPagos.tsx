import { usePagosHistorial } from "@/hooks/usePagosHistorial";
import { agruparPagosPorMes } from "@/utils/agruparPorMes";
import { nombreUsuario } from "@/constants/usuarios";
import { PagoConDeuda } from "@/types/deudas";

function formatMonto(monto: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(monto);
}

function nombreMes(offset: number) {
  const fecha = new Date();
  fecha.setMonth(fecha.getMonth() - offset);
  return fecha.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
}

function PagoRow({ pago }: { pago: PagoConDeuda }) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-800 py-2">
      <div className="flex-1 pr-2">
        <p className="text-sm text-neutral-50">{pago.deuda.descripcion}</p>
        <p className="mt-0.5 text-xs text-neutral-500">
          Pagó {nombreUsuario(pago.pagado_por)} · {new Date(pago.pagado_at).toLocaleDateString()}
        </p>
      </div>
      <p className="text-sm font-medium text-neutral-300">{formatMonto(pago.deuda.monto_debe)}</p>
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
