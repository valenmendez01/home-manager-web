import { useState } from "react";
import { usePagosHistorial } from "@/hooks/usePagosHistorial";
import { agruparPagosPorMes } from "@/utils/agruparPorMes";
import { agruparPorSaldo, ItemHistorial } from "@/utils/agruparPorSaldo";
import { nombreUsuario, otroUsuarioId } from "@/constants/usuarios";
import { PagoConDeuda } from "@/types/deudas";
import { useDeshacerPago } from "@/hooks/useDeshacerPago";
import { useDeshacerSaldo } from "@/hooks/useDeshacerSaldo";
import { useAuthStore } from "@/store/authStore";
import { addToast } from "@heroui/toast";
import { Tabs, Tab } from "@heroui/tabs";
import { Button } from "@heroui/button";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { Avatar } from "@heroui/avatar";
import { Undo2 } from "lucide-react";
import { formatMonto } from "@/utils/formatMonto";
import { motion } from "framer-motion";

function nombreMes(offset: number) {
  const fecha = new Date();
  fecha.setMonth(fecha.getMonth() - offset);
  const mes = fecha.toLocaleDateString("es-AR", { month: "long" });
  return mes.charAt(0).toUpperCase() + mes.slice(1);
}

function esHoy(fechaIso: string) {
  return new Date(fechaIso).toDateString() === new Date().toDateString();
}

function idsIndividuales(items: ItemHistorial[]) {
  return new Set(items.filter((i) => i.tipo === "individual").map((i) => i.pago.id));
}

function makeSelectionHandler(
  setExpanded: React.Dispatch<React.SetStateAction<Set<string>>>,
  noExpandIds: Set<string>
) {
  return (keys: "all" | Set<React.Key>) => {
    if (keys === "all") return; // no debería pasar con selectionMode="multiple" sin selectAll
    const filtered = new Set(Array.from(keys).map(String).filter((k) => !noExpandIds.has(k)));
    setExpanded(filtered);
  };
}

// Props que necesitan los hooks (se resuelven UNA vez en HistorialPagos y se
// pasan hacia abajo, para no tener componentes wrapper entre <Accordion> y
// <AccordionItem>).
interface AccionesHistorial {
  userId: string | undefined;
  deshacerPago: ReturnType<typeof useDeshacerPago>;
  deshacerSaldo: ReturnType<typeof useDeshacerSaldo>;
}

function renderPagoItem(pago: PagoConDeuda, acciones: AccionesHistorial) {
  const { userId, deshacerPago } = acciones;
  const puedeDeshacer = pago.pagado_por === userId && esHoy(pago.pagado_at);

  const handleDeshacer = () => {
    deshacerPago.mutate(pago.id, {
      onSuccess: () => {
        addToast({ title: "Pago deshecho", description: "La deuda volvió a quedar pendiente.", color: "success" });
      },
      onError: () => {
        addToast({ title: "No se pudo deshacer", description: "Intentá de nuevo en unos segundos.", color: "danger" });
      },
    });
  };

  return (
    <AccordionItem
      key={pago.id}
      aria-label={pago.deuda.descripcion}
      hideIndicator
      title={
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex flex-1 items-center gap-3 pr-2">
            <Avatar
              name={nombreUsuario(pago.pagado_por)}
              size="sm"
              className="shrink-0"
              classNames={{ name: "text-xs" }}
            />
            <div>
              <p className="text-sm text-neutral-50">{pago.deuda.descripcion}</p>
              <p className="mt-0.5 text-xs text-neutral-500">
                {new Date(pago.pagado_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-green-400">
              +{formatMonto(pago.deuda.monto_debe)}
            </p>
            {puedeDeshacer && (
              <Button
                isIconOnly
                size="sm"
                variant="light"
                isLoading={deshacerPago.isPending}
                onClick={(e) => e.stopPropagation()}
                onPress={handleDeshacer}
                aria-label="Deshacer pago"
              >
                {!deshacerPago.isPending && <Undo2 size={16} color="#737373" />}
              </Button>
            )}
          </div>
        </div>
      }
    />
  );
}

function renderSaldoItem(saldoId: string, pagos: PagoConDeuda[], acciones: AccionesHistorial) {
  const { userId, deshacerSaldo } = acciones;

  const fecha = pagos[0].pagado_at;
  const iniciadoPor = pagos[0].saldo_iniciado_por;
  const acreedor = iniciadoPor ? otroUsuarioId(iniciadoPor) : undefined;

  // Neteo: sumamos lo que debía el que inició el saldo, restamos lo que
  // le debían a él (mismo criterio que TotalesDeudasHeader).
  const total = pagos.reduce((acc, p) => {
    const signo = p.pagado_por === iniciadoPor ? 1 : -1;
    return acc + signo * Number(p.deuda.monto_debe);
  }, 0);

  const puedeDeshacer = iniciadoPor === userId && esHoy(fecha);

  const handleDeshacer = () => {
    deshacerSaldo.mutate(saldoId, {
      onSuccess: () => {
        addToast({ title: "Saldo deshecho", description: "Las deudas volvieron a quedar pendientes.", color: "success" });
      },
      onError: () => {
        addToast({ title: "No se pudo deshacer", description: "Intentá de nuevo en unos segundos.", color: "danger" });
      },
    });
  };

  return (
    <AccordionItem
      key={saldoId}
      aria-label="Liquidación total"
      title={
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            {iniciadoPor && (
              <Avatar
                name={nombreUsuario(iniciadoPor)}
                size="sm"
                className="shrink-0"
                classNames={{ name: "text-xs" }}
              />
            )}
            <div>
              <p className="text-sm text-neutral-50">
                {iniciadoPor && acreedor ? (
                  <>
                    {iniciadoPor === userId ? "Le pagaste" : "Te pagó"}{" "}
                    <span
                      className={`font-semibold ${
                        iniciadoPor === userId ? "text-red-400" : "text-green-400"
                      }`}
                    >
                      {formatMonto(total)}
                    </span>
                  </>
                ) : (
                  <>
                    Total saldado: <span className="font-semibold">{formatMonto(total)}</span>
                  </>
                )}
              </p>
              <p className="mt-0.5 text-xs text-neutral-500">
                {new Date(fecha).toLocaleDateString()}
              </p>
            </div>
          </div>

          {puedeDeshacer && (
            <Button
              isIconOnly
              variant="light"
              size="sm"
              isLoading={deshacerSaldo.isPending}
              onClick={(e) => e.stopPropagation()}
              onPress={handleDeshacer}
              aria-label="Deshacer saldo"
            >
              {!deshacerSaldo.isPending && <Undo2 size={18} color="#737373" />}
            </Button>
          )}
        </div>
      }
    >
      <div className="-mt-2">
        {pagos.map((pago) => {
          const esIniciador = pago.pagado_por === iniciadoPor;
          return (
            <div
              key={pago.id}
              className="flex items-center justify-between  py-2 my-1 last:border-b-0"
            >
                
              <p className="text-sm text-neutral-50">{pago.deuda.descripcion}</p>
              <p className={`text-sm font-medium ${esIniciador ? "text-green-400" : "text-red-400"}`}>
                {esIniciador ? "+" : "-"}
                {formatMonto(pago.deuda.monto_debe)}
              </p>
            </div>
          );
        })}
      </div>
    </AccordionItem>
  );
}

function renderItem(item: ItemHistorial, acciones: AccionesHistorial) {
  if (item.tipo === "individual") return renderPagoItem(item.pago, acciones);
  return renderSaldoItem(item.saldoId, item.pagos, acciones);
}

export default function HistorialPagos() {
  const { data: pagos, isLoading } = usePagosHistorial();
  const userId = useAuthStore((s) => s.user?.id);
  const deshacerPago = useDeshacerPago();
  const deshacerSaldo = useDeshacerSaldo();

  const [expandedActual, setExpandedActual] = useState<Set<string>>(new Set());
  const [expandedPasado, setExpandedPasado] = useState<Set<string>>(new Set());

  if (isLoading || !pagos) return null;

  const { actual, pasado } = agruparPagosPorMes(pagos);

  if (actual.length === 0 && pasado.length === 0) return null;

  const itemsActual = agruparPorSaldo(actual);
  const itemsPasado = agruparPorSaldo(pasado);

  const acciones: AccionesHistorial = { userId, deshacerPago, deshacerSaldo };

  return (
    <div className="mt-6">
      <h2 className="mb-2 text-lg font-semibold text-neutral-50">Historial de pagos</h2>

      <Tabs
        aria-label="Historial por mes"
        defaultSelectedKey="actual"
        variant="underlined"
        classNames={{
          tabList: "gap-4",
        }}
      >
        <Tab key="actual" title={nombreMes(0)}>
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {itemsActual.length > 0 ? (
              <Accordion
                variant="light"
                selectionMode="single"
                selectedKeys={expandedActual}
                onSelectionChange={makeSelectionHandler(setExpandedActual, idsIndividuales(itemsActual))}
                motionProps={{
                  variants: {
                    enter: {
                      y: 0,
                      opacity: 1,
                      height: "auto",
                      overflowY: "unset",
                      transition: {
                        height: {
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                          duration: 1,
                        },
                        opacity: {
                          easings: "ease",
                          duration: 1,
                        },
                      },
                    },
                    exit: {
                      y: -10,
                      opacity: 0,
                      height: 0,
                      overflowY: "hidden",
                      transition: {
                        height: {
                          easings: "ease",
                          duration: 0.25,
                        },
                        opacity: {
                          easings: "ease",
                          duration: 0.3,
                        },
                      },
                    },
                  },
                }}
              >
                {itemsActual.map((item) => renderItem(item, acciones))}
              </Accordion>
            ) : (
              <p className="py-4 text-sm text-neutral-500">Sin movimientos este mes.</p>
            )}
          </motion.div>
        </Tab>
        <Tab key="pasado" title={nombreMes(1)}>
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {itemsPasado.length > 0 ? (
              <Accordion
                variant="light"
                selectionMode="single"
                selectedKeys={expandedPasado}
                onSelectionChange={makeSelectionHandler(setExpandedPasado, idsIndividuales(itemsPasado))}
                motionProps={{
                  variants: {
                    enter: {
                      y: 0,
                      opacity: 1,
                      height: "auto",
                      overflowY: "unset",
                      transition: {
                        height: {
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                          duration: 1,
                        },
                        opacity: {
                          easings: "ease",
                          duration: 1,
                        },
                      },
                    },
                    exit: {
                      y: -10,
                      opacity: 0,
                      height: 0,
                      overflowY: "hidden",
                      transition: {
                        height: {
                          easings: "ease",
                          duration: 0.25,
                        },
                        opacity: {
                          easings: "ease",
                          duration: 0.3,
                        },
                      },
                    },
                  },
                }}
              >
                {itemsPasado.map((item) => renderItem(item, acciones))}
              </Accordion>
            ) : (
              <p className="py-4 text-sm text-neutral-500">Sin movimientos este mes.</p>
            )}
          </motion.div>
        </Tab>
      </Tabs>
    </div>
  );
}