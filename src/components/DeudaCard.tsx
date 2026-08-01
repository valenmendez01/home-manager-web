import { Deuda } from "@/types/deudas";
import { nombreUsuario } from "@/constants/usuarios";
import { useAuthStore } from "@/store/authStore";
import { usePagarDeuda } from "@/hooks/usePagarDeuda";

interface Props {
  deuda: Deuda;
}

function formatMonto(monto: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(monto);
}

export default function DeudaCard({ deuda }: Props) {
  const userId = useAuthStore((s) => s.user?.id);
  const pagarDeuda = usePagarDeuda();

  const esQuienDebe = deuda.debe === userId;
  const puedeMarcarPagada = esQuienDebe && deuda.estado === "pendiente";

  return (
    <div className="mb-3 rounded-2xl bg-neutral-900 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-2">
          <p className="text-base font-medium text-neutral-50">{deuda.descripcion}</p>
          <p className="mt-1 text-xs text-neutral-500">
            Pagó {nombreUsuario(deuda.pagado_por)} · {new Date(deuda.fecha).toLocaleDateString()}
          </p>
        </div>
        <p className="text-lg font-semibold text-neutral-50">{formatMonto(deuda.monto_debe)}</p>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            deuda.estado === "pagada" ? "bg-green-950 text-green-400" : "bg-yellow-950 text-yellow-400"
          }`}
        >
          {deuda.estado === "pagada" ? "Pagada" : "Pendiente"}
        </span>

        {puedeMarcarPagada && (
          <button
            onClick={() => pagarDeuda.mutate(deuda.id)}
            disabled={pagarDeuda.isPending}
            className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white active:bg-blue-600 disabled:opacity-50"
          >
            {pagarDeuda.isPending ? "..." : "Pagar"}
          </button>
        )}
      </div>
    </div>
  );
}
