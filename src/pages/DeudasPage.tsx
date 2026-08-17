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
import { Bell } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useRecordatorios } from "@/hooks/useRecordatorios";
import RecordatoriosModal from "@/components/RecordatoriosModal";
import PageFadeIn from "@/components/PageFadeIn";

export default function DeudasPage() {
  const { data: deudas, isLoading } = useDeudas();
  const pendientes = deudas?.filter((d) => d.estado === "pendiente") ?? [];
  const [modalVisible, setModalVisible] = useState(false);
  const [recordatoriosVisible, setRecordatoriosVisible] = useState(false);
  const userId = useAuthStore((s) => s.user?.id);
  const { data: recordatorios = [] } = useRecordatorios(userId);
  const pendientesRecordatorios = recordatorios.filter((r) => !r.marcado).length;
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
    <PageFadeIn className="bg-neutral-950">
      <ScreenHeader
        title="Deudas"
        rightElement={
          <div className="flex items-center gap-3">
            <div className="relative">
              <Button isIconOnly variant="light" size="sm" aria-label="Recordatorios" onPress={() => setRecordatoriosVisible(true)}>
                <Bell size={22} className="text-neutral-400" />
              </Button>
              {pendientesRecordatorios > 0 && (
                <span className="pointer-events-none absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
                  {pendientesRecordatorios}
                </span>
              )}
            </div>
            <Button isIconOnly color="primary" radius="full" size="sm" aria-label="Nueva deuda" onPress={() => setModalVisible(true)}>
              <Plus size={20} />
            </Button>
          </div>
        }
      />

      <TotalesDeudasHeader deudas={deudas} />

      <div className="px-5 pb-6">
        {pendientes.length === 0 && (
          <p className="my-8 text-center text-sm text-neutral-500">No hay deudas pendientes</p>
        )}
        {pendientes.map((item: Deuda) => (
          <DeudaCard key={item.id} deuda={item} />
        ))}
        <div className="mb-10">
          <HistorialPagos />
        </div>
      </div>

      <NuevaDeudaModal visible={modalVisible} onClose={() => setModalVisible(false)} />
      <RecordatoriosModal
        isOpen={recordatoriosVisible}
        onClose={() => setRecordatoriosVisible(false)}
        usuarioId={userId}
      />
    </PageFadeIn>
  );
}
