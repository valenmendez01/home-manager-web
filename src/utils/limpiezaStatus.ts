import { EstadoLimpieza } from "../types/limpieza";

export function calcularEstado(realizadoAt: string | null): EstadoLimpieza {
  if (!realizadoAt) return "rojo"; // nunca limpiado

  const dias = calcularDiasTranscurridos(realizadoAt);

  if (dias < 6) return "verde";
  if (dias <= 7) return "amarillo";
  return "rojo";
}

export function calcularDiasTranscurridos(fecha: string): number {
  const ahora = new Date();
  const entonces = new Date(fecha);
  const diffMs = ahora.getTime() - entonces.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export const ESTADO_COLORS: Record<EstadoLimpieza, { bg: string; text: string }> = {
  verde: { bg: "#14532D", text: "#4ADE80" },
  amarillo: { bg: "#713F12", text: "#FACC15" },
  rojo: { bg: "#7F1D1D", text: "#F87171" },
};