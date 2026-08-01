import { useCompras } from "@/hooks/useCompras";
import { useRealtimeCompras } from "@/hooks/useRealtimeCompras";
import CompraItem from "@/components/CompraItem";
import AgregarCompraInput from "@/components/AgregarCompraInput";
import { Compra } from "@/types/compras";
import ScreenHeader from "@/components/ScreenHeader";

export default function ComprasPage() {
  const { data: compras, isLoading } = useCompras();
  useRealtimeCompras();

  if (isLoading || !compras) {
    return (
      <div className="flex h-full items-center justify-center bg-neutral-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-blue-500" />
      </div>
    );
  }

  const pendientes = compras.filter((c) => c.estado === "pendiente").length;

  return (
    <div className="bg-neutral-950">
      <ScreenHeader title="Compras" subtitle={`${pendientes} pendiente${pendientes !== 1 ? "s" : ""}`} />

      <AgregarCompraInput />

      <div className="px-5 pb-6">
        {compras.length === 0 && (
          <p className="mt-8 text-center text-sm text-neutral-500">No hay productos en la lista</p>
        )}
        {compras.map((item: Compra) => (
          <CompraItem key={item.id} compra={item} />
        ))}
      </div>
    </div>
  );
}
