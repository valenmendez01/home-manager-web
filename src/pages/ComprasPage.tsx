import { useCompras } from "@/hooks/useCompras";
import { useRealtimeCompras } from "@/hooks/useRealtimeCompras";
import CompraItem from "@/components/CompraItem";
import AgregarCompraInput from "@/components/AgregarCompraInput";
import { Compra } from "@/types/compras";
import ScreenHeader from "@/components/ScreenHeader";
import { Spinner } from "@heroui/spinner";

export default function ComprasPage() {
  const { data: compras, isLoading } = useCompras();
  useRealtimeCompras();

  if (isLoading || !compras) {
    return (
      <div className="flex h-full items-center justify-center bg-neutral-950">
        <Spinner color="primary" size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-neutral-950">
      <ScreenHeader title="Compras" />

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
