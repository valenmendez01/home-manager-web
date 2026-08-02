import { Deuda } from "@/types/deudas";
import { nombreUsuario } from "@/constants/usuarios";
import { useAuthStore } from "@/store/authStore";
import { usePagarDeuda } from "@/hooks/usePagarDeuda";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";

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
        <Chip 
          color={deuda.estado === "pagada" ? "success" : "warning"} 
          variant="flat" 
          size="sm"
        >
            {deuda.estado === "pagada" ? "Pagada" : "Pendiente"}
        </Chip>

        {puedeMarcarPagada && (
          <Button 
            color="primary" 
            size="sm" 
            radius="lg" 
            isLoading={pagarDeuda.isPending} 
            onPress={() => pagarDeuda.mutate(deuda.id)}
          >
            Pagar
          </Button>
        )}
      </div>
    </div>
  );
}
