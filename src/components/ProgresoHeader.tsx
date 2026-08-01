import { AmbienteConEstado } from "@/types/limpieza";

interface Props {
  ambientes: AmbienteConEstado[];
}

export default function ProgresoHeader({ ambientes }: Props) {
  const total = ambientes.length;
  const limpios = ambientes.filter((a) => a.estado === "verde").length;
  const progreso = total > 0 ? limpios / total : 0;

  const ultimaGlobal = ambientes
    .map((a) => a.ultimaLimpieza?.realizado_at)
    .filter(Boolean)
    .sort()
    .reverse()[0];

  return (
    <div className="flex flex-col gap-2 px-5 pb-4 pt-2">
      <div className="flex items-baseline justify-between">
        <p className="text-sm text-neutral-400">
          {limpios}/{total} al día
        </p>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-neutral-800">
        <div style={{ width: `${progreso * 100}%` }} className="h-full rounded-full bg-green-500" />
      </div>

      {ultimaGlobal && (
        <p className="text-xs text-neutral-500">
          Última limpieza: {new Date(ultimaGlobal).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
