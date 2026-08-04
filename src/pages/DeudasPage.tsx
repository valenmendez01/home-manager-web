import { useState } from "react";
import { Plus } from "lucide-react";
import { useDeudas } from "@/hooks/useDeudas";
import { useRealtimeDeudas } from "@/hooks/useRealtimeDeudas";
import TotalesDeudasHeader from "@/components/TotalesDeudasHeader";
import DeudaCard from "@/components/DeudaCard";
import NuevaDeudaModal from "@/components/NuevaDeudaModal";
import { Deuda } from "@/types/deudas";
import ScreenHeader from "@/components/ScreenHeader";
import HistorialPagos from "@/components/HistorialPagos";
import { Skeleton } from "@heroui/skeleton";
import { Button } from "@heroui/button";

export default function DeudasPage() {
  const { data: deudas, isLoading } = useDeudas();
  const pendientes = deudas?.filter((d) => d.estado === "pendiente") ?? [];
  const [modalVisible, setModalVisible] = useState(false);
  useRealtimeDeudas();

  if (isLoading || !deudas) {
    return (
      <div className="flex flex-col gap-3 bg-neutral-950 p-5">
        <Skeleton className="h-24 w-full rounded-2xl" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-neutral-950">
      <ScreenHeader
        title="Deudas"
        rightElement={
          <Button isIconOnly color="primary" radius="full" size="sm" aria-label="Nueva deuda" onPress={() => setModalVisible(true)}>
            <Plus size={20} />
          </Button>
        }
      />

      <TotalesDeudasHeader deudas={deudas} />

      <div className="px-5 pb-6">
        {pendientes.length === 0 && (
          <p className="mt-8 text-center text-sm text-neutral-500">No hay deudas pendientes</p>
        )}
        {pendientes.map((item: Deuda) => (
          <DeudaCard key={item.id} deuda={item} />
        ))}
        <div className="mb-10">
          <HistorialPagos />
        </div>
      </div>

      <NuevaDeudaModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </div>
  );
}
