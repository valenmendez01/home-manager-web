import { useState } from "react";
import { useAmbientesConEstado } from "@/hooks/useAmbientesConEstado";
import PlanoAmbientes from "@/components/PlanoAmbientes";
import ProgresoHeader from "@/components/ProgresoHeader";
import AmbienteDetailSheet from "@/components/AmbienteDetailSheet";
import { AmbienteConEstado } from "@/types/limpieza";
import { useRealtimeLimpieza } from "@/hooks/useRealtimeLimpieza";
import ScreenHeader from "@/components/ScreenHeader";
import { Skeleton } from "@heroui/skeleton";

export default function LimpiezaPage() {
  const { data: ambientes, isLoading } = useAmbientesConEstado();
  useRealtimeLimpieza();
  const [seleccionado, setSeleccionado] = useState<AmbienteConEstado | null>(null);

  if (isLoading || !ambientes) {
    return (
      <div className="flex min-h-full flex-col gap-4 bg-neutral-950 p-5">
        <Skeleton className="h-8 w-40 rounded-lg" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-neutral-950">
      <ScreenHeader title="Limpieza" />
      <ProgresoHeader ambientes={ambientes} />

      <div className="px-5">
        <PlanoAmbientes ambientes={ambientes} onSelect={setSeleccionado} />
      </div>

      <AmbienteDetailSheet ambiente={seleccionado} onClose={() => setSeleccionado(null)} />
    </div>
  );
}
