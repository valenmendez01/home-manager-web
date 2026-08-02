import { useState } from "react";
import { useAmbientesConEstado } from "@/hooks/useAmbientesConEstado";
import PlanoAmbientes from "@/components/PlanoAmbientes";
import ProgresoHeader from "@/components/ProgresoHeader";
import AmbienteDetailSheet from "@/components/AmbienteDetailSheet";
import { AmbienteConEstado } from "@/types/limpieza";
import { useRealtimeLimpieza } from "@/hooks/useRealtimeLimpieza";
import ScreenHeader from "@/components/ScreenHeader";
import { Spinner } from "@heroui/spinner";

export default function LimpiezaPage() {
  const { data: ambientes, isLoading } = useAmbientesConEstado();
  useRealtimeLimpieza();
  const [seleccionado, setSeleccionado] = useState<AmbienteConEstado | null>(null);

  if (isLoading || !ambientes) {
    return (
      <div className="flex h-full items-center justify-center bg-neutral-950">
        <Spinner color="primary" size="lg" />
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
