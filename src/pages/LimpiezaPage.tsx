import { useState } from "react";
import { useAmbientesConEstado } from "@/hooks/useAmbientesConEstado";
import PlanoAmbientes from "@/components/PlanoAmbientes";
import ProgresoHeader from "@/components/ProgresoHeader";
import AmbienteDetailSheet from "@/components/AmbienteDetailSheet";
import { AmbienteConEstado } from "@/types/limpieza";
import { useRealtimeLimpieza } from "@/hooks/useRealtimeLimpieza";
import ScreenHeader from "@/components/ScreenHeader";

export default function LimpiezaPage() {
  const { data: ambientes, isLoading } = useAmbientesConEstado();
  useRealtimeLimpieza();
  const [seleccionado, setSeleccionado] = useState<AmbienteConEstado | null>(null);

  if (isLoading || !ambientes) {
    return (
      <div className="flex h-full items-center justify-center bg-neutral-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-700 border-t-blue-500" />
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
