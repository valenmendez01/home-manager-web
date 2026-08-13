export interface RecordatorioPago {
  id: string;
  usuario_id: string;
  nombre: string;
  orden: number;
  marcado: boolean;
  fecha_vencimiento: string | null;
}