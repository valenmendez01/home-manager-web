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
import { Spinner } from "@heroui/spinner";
import { Button } from "@heroui/button";

export default function DeudasPage() {
  const { data: deudas, isLoading } = useDeudas();
  const [modalVisible, setModalVisible] = useState(false);
  useRealtimeDeudas();

  if (isLoading || !deudas) {
    return (
      <div className="flex h-full items-center justify-center bg-neutral-950">
        <Spinner color="primary" size="lg" />
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
        {deudas.length === 0 && (
          <p className="mt-8 text-center text-sm text-neutral-500">No hay deudas registradas todavía</p>
        )}
        {deudas.map((item: Deuda) => (
          <DeudaCard key={item.id} deuda={item} />
        ))}
        <HistorialPagos />
      </div>

      <NuevaDeudaModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </div>
  );
}
