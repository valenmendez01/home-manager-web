import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Link } from "@heroui/link";
import { CheckSquare, Square, Trash2, Plus, Pencil, CircleAlert } from "lucide-react";
import { useRecordatorios } from "@/hooks/useRecordatorios";
import { useToggleRecordatorio } from "@/hooks/useToggleRecordatorio";
import { useCrearRecordatorio } from "@/hooks/useCrearRecordatorio";
import { useEliminarRecordatorio } from "@/hooks/useEliminarRecordatorio";
import { useActualizarVencimiento } from "@/hooks/useActualizarVencimiento";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  usuarioId?: string;
}

// Próxima fecha real en la que cae un día del mes (ej. día 31 en febrero
// cae el 28/29). Se usa solo para saber si ya venció este ciclo.
function proximoVencimiento(diaVencimiento: number, hoy: Date): Date {
  const clamp = (anio: number, mes: number) => {
    const ultimoDiaDelMes = new Date(anio, mes + 1, 0).getDate();
    return new Date(anio, mes, Math.min(diaVencimiento, ultimoDiaDelMes));
  };
  const candidato = clamp(hoy.getFullYear(), hoy.getMonth());
  return candidato < hoy ? clamp(hoy.getFullYear(), hoy.getMonth() + 1) : candidato;
}

export default function RecordatoriosModal({ isOpen, onClose, usuarioId }: Props) {
  const { data: recordatorios = [] } = useRecordatorios(usuarioId);
  const toggle = useToggleRecordatorio(usuarioId);
  const crear = useCrearRecordatorio(usuarioId);
  const eliminar = useEliminarRecordatorio(usuarioId);

  const [nombreNuevo, setNombreNuevo] = useState("");
  const [editando, setEditando] = useState(false);

  const actualizarVencimiento = useActualizarVencimiento(usuarioId);

  const handleAgregar = () => {
    const nombre = nombreNuevo.trim();
    if (!nombre) return;
    const siguienteOrden = recordatorios.length > 0 ? Math.max(...recordatorios.map((r) => r.orden)) + 1 : 1;
    crear.mutate(
      { nombre, orden: siguienteOrden },
      { onSuccess: () => setNombreNuevo("") }
    );
  };

  const handleCambiarDia = (id: string, valor: string) => {
    if (valor === "") {
      actualizarVencimiento.mutate({ id, dia: null });
      return;
    }
    const dia = Number(valor);
    if (!Number.isInteger(dia) || dia < 1 || dia > 31) return;
    actualizarVencimiento.mutate({ id, dia });
  };

  return (
    <Modal 
      isOpen={isOpen}
      hideCloseButton
      onOpenChange={(open) => {
        if (!open) {
          setEditando(false);
          onClose();
        }
      }} 
      placement="bottom"
    >
      <ModalContent className="bg-neutral-900">
        <ModalHeader className="flex items-center justify-between text-neutral-50">
          <span>Recordatorios de pago</span>
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onPress={() => setEditando((prev) => !prev)}
            aria-label="Editar recordatorios"
          >
            <Pencil size={18} color={editando ? "#4ADE80" : "#737373"} />
          </Button>
        </ModalHeader>
        <ModalBody className="pb-8">
          <Card className="mb-3 border border-yellow-500/30 bg-yellow-500/10 shadow-none">
            <CardBody className="flex-row items-center gap-3 py-3">
              <CircleAlert size={18} color="#EAB308" className="shrink-0" />
              <span className="text-sm text-yellow-500">
                Subir los comprobantes al{" "}
                <Link
                  size="sm"
                  isExternal
                  showAnchorIcon
                  href="https://drive.google.com/drive/folders/1cq2iE7nGMhxkiLEUEcWfo66YBuo8mqcz?usp=sharing"
                  className="text-inherit"
                  underline="always"
                >
                  Drive
                </Link>
              </span>
            </CardBody>
          </Card>
          {editando && (
            <div className="flex items-center gap-2 pb-2">
              <Input
                size="sm"
                placeholder="Nuevo recordatorio"
                value={nombreNuevo}
                onValueChange={setNombreNuevo}
                onKeyDown={(e) => e.key === "Enter" && handleAgregar()}
              />
              <Button
                isIconOnly
                color="primary"
                size="sm"
                isLoading={crear.isPending}
                onPress={handleAgregar}
                aria-label="Agregar recordatorio"
              >
                {!crear.isPending && <Plus size={18} />}
              </Button>
            </div>
          )}

          {recordatorios.map((r) => {
            const hoy = new Date();
            const vencida =
              r.dia_vencimiento != null &&
              !r.marcado &&
              proximoVencimiento(r.dia_vencimiento, hoy).toDateString() === hoy.toDateString();

            return (
              <div key={r.id} className="flex items-center gap-3 border-b border-neutral-800 py-3 last:border-b-0">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggle.mutate({ id: r.id, marcado: !r.marcado })}
                  className="flex flex-1 items-center gap-3"
                >
                  {r.marcado ? <CheckSquare size={22} color="#4ADE80" /> : <Square size={22} color="#737373" />}
                  <div>
                    <p className={`text-base ${r.marcado ? "text-neutral-500 line-through" : "text-neutral-50"}`}>
                      {r.nombre}
                    </p>
                    <p className={`text-xs ${vencida ? "text-red-400" : "text-neutral-500"}`}>
                      {r.dia_vencimiento != null ? `Vence el día ${r.dia_vencimiento} de cada mes` : "Sin vencimiento"}
                    </p>
                  </div>
                </div>

                {editando && (
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      size="sm"
                      className="w-20"
                      min={1}
                      max={31}
                      placeholder="Día"
                      aria-label={`Día de vencimiento de ${r.nombre}`}
                      value={r.dia_vencimiento != null ? String(r.dia_vencimiento) : ""}
                      onValueChange={(valor) => handleCambiarDia(r.id, valor)}
                    />
                    <Button
                      isIconOnly
                      variant="light"
                      size="sm"
                      isLoading={eliminar.isPending}
                      onPress={() => eliminar.mutate(r.id)}
                      aria-label="Eliminar recordatorio"
                    >
                      {!eliminar.isPending && <Trash2 size={18} color="#737373" />}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}