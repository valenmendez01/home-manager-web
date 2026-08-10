export interface Deuda {
  id: string;
  descripcion: string;
  monto_total: number;
  pagado_por: string;
  debe: string;
  monto_debe: number;
  fecha: string;
  estado: "pendiente" | "pagada";
  created_at: string;
}

export interface Pago {
  id: string;
  deuda_id: string;
  pagado_por: string;
  pagado_at: string;
  saldo_id: string | null;
}

export interface NuevaDeudaInput {
  descripcion: string;
  montoTotal: number;
  pagadoPor: string;
  debe: string;
  montoDebe: number;
  fecha: string;
}

export interface PagoConDeuda extends Pago {
  deuda: {
    descripcion: string;
    monto_debe: number;
  };
}