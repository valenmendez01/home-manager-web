import { useState } from "react";
import { useAmbientesConEstado } from "@/hooks/useAmbientesConEstado";
import PlanoAmbientes from "@/components/PlanoAmbientes";
import AmbienteDetailSheet from "@/components/AmbienteDetailSheet";
import { AmbienteConEstado } from "@/types/limpieza";
import { useRealtimeLimpieza } from "@/hooks/useRealtimeLimpieza";
import ScreenHeader from "@/components/ScreenHeader";
import { Skeleton } from "@heroui/skeleton";
import PageFadeIn from "@/components/PageFadeIn";

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
    <PageFadeIn
      className="grid bg-neutral-950"
      style={{
        gridTemplateRows: "auto 1fr",
        minHeight:
          "calc(100dvh - 64px - env(safe-area-inset-bottom) - env(safe-area-inset-top))",
      }}
    >
      <ScreenHeader title="Limpieza" />

      <div className="flex items-center justify-center px-5">
        <PlanoAmbientes ambientes={ambientes} onSelect={setSeleccionado} />
      </div>

      <AmbienteDetailSheet ambiente={seleccionado} onClose={() => setSeleccionado(null)} />
    </PageFadeIn>
  );
}
