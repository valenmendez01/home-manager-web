import { Deuda } from "@/types/deudas";

interface Props {
  deudas: Deuda[];
}

function formatMonto(monto: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(monto);
}

export default function TotalesDeudasHeader({ deudas }: Props) {
  const pendiente = deudas
    .filter((d) => d.estado === "pendiente")
    .reduce((acc, d) => acc + Number(d.monto_debe), 0);

  const pagado = deudas
    .filter((d) => d.estado === "pagada")
    .reduce((acc, d) => acc + Number(d.monto_debe), 0);

  return (
    <div className="flex gap-3 px-5 pb-4 pt-2">
      <div className="flex-1 rounded-2xl bg-neutral-900 p-4">
        <p className="text-xs text-neutral-500">Pendiente</p>
        <p className="mt-1 text-xl font-semibold text-red-400">{formatMonto(pendiente)}</p>
      </div>
      <div className="flex-1 rounded-2xl bg-neutral-900 p-4">
        <p className="text-xs text-neutral-500">Pagado</p>
        <p className="mt-1 text-xl font-semibold text-green-400">{formatMonto(pagado)}</p>
      </div>
    </div>
  );
}
