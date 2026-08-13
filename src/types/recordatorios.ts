export interface RecordatorioPago {
  id: string;
  usuario_id: string;
  nombre: string;
  orden: number;
  marcado: boolean;
  dia_vencimiento: number | null;
}