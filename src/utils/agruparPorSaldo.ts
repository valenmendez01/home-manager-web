import { PagoConDeuda } from "@/types/deudas";

export type ItemHistorial =
  | { tipo: "individual"; pago: PagoConDeuda }
  | { tipo: "saldo"; saldoId: string; pagos: PagoConDeuda[] };

export function agruparPorSaldo(pagos: PagoConDeuda[]): ItemHistorial[] {
  const items: ItemHistorial[] = [];
  const gruposVistos = new Set<string>();

  for (const pago of pagos) {
    if (!pago.saldo_id) {
      items.push({ tipo: "individual", pago });
      continue;
    }
    if (gruposVistos.has(pago.saldo_id)) continue;
    gruposVistos.add(pago.saldo_id);
    const pagosDelGrupo = pagos.filter((p) => p.saldo_id === pago.saldo_id);
    items.push({ tipo: "saldo", saldoId: pago.saldo_id, pagos: pagosDelGrupo });
  }

  return items;
}