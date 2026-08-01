export interface Ambiente {
  id: string;
  nombre: string;
  orden: number;
}

export interface Limpieza {
  id: string;
  ambiente_id: string;
  usuario_id: string;
  realizado_at: string;
}

export type EstadoLimpieza = "verde" | "amarillo" | "rojo";

export interface AmbienteConEstado extends Ambiente {
  ultimaLimpieza: Limpieza | null;
  estado: EstadoLimpieza;
  diasTranscurridos: number | null;
}