import { useCompras } from "@/hooks/useCompras";
import { useRealtimeCompras } from "@/hooks/useRealtimeCompras";
import CompraItem from "@/components/CompraItem";
import AgregarCompraInput from "@/components/AgregarCompraInput";
import { Compra } from "@/types/compras";
import ScreenHeader from "@/components/ScreenHeader";
import { Skeleton } from "@heroui/skeleton";

export default function ComprasPage() {
  const { data: compras, isLoading } = useCompras();
  useRealtimeCompras();

  if (isLoading || !compras) {
    return (
      <div className="flex flex-col gap-2 bg-neutral-950 p-5">
        <Skeleton className="h-8 w-40 rounded-lg" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-neutral-950">
      <ScreenHeader title="Compras" />

      <AgregarCompraInput />

      <div className="px-5 pb-6 mb-10">
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
