export interface Compra {
  id: string;
  nombre: string;
  agregado_por: string;
  estado: "pendiente" | "comprado";
  created_at: string;
  comprado_at: string | null;
}