import { PagoConDeuda } from "../types/deudas";

export function agruparPagosPorMes(pagos: PagoConDeuda[]) {
  const ahora = new Date();
  const mesActual = ahora.getMonth();
  const anioActual = ahora.getFullYear();

  const mesPasadoDate = new Date(anioActual, mesActual - 1, 1);
  const mesPasado = mesPasadoDate.getMonth();
  const anioMesPasado = mesPasadoDate.getFullYear();

  const actual: PagoConDeuda[] = [];
  const pasado: PagoConDeuda[] = [];

  for (const pago of pagos) {
    const fecha = new Date(pago.pagado_at);
    if (fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual) {
      actual.push(pago);
    } else if (
      fecha.getMonth() === mesPasado &&
      fecha.getFullYear() === anioMesPasado
    ) {
      pasado.push(pago);
    }
    // más viejo que eso no debería llegar nunca, porque el cron lo borra
  }

  return { actual, pasado };
}