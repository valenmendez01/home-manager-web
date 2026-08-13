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
import { DatePicker } from "@heroui/date-picker";
import { parseDate, CalendarDate, getLocalTimeZone, today } from "@internationalized/date";
import { useActualizarVencimiento } from "@/hooks/useActualizarVencimiento";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  usuarioId?: string;
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
            const vencida = r.fecha_vencimiento && !r.marcado && new Date(r.fecha_vencimiento) < today(getLocalTimeZone()).toDate(getLocalTimeZone());
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
                      {r.fecha_vencimiento
                        ? new Date(r.fecha_vencimiento).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })
                        : "Sin vencimiento"}
                    </p>
                  </div>
                </div>

                {editando && (
                  <div className="flex items-center gap-1">
                    <DatePicker
                      size="sm"
                      className="w-36"
                      aria-label={`Vencimiento de ${r.nombre}`}
                      value={r.fecha_vencimiento ? parseDate(r.fecha_vencimiento) : null}
                      onChange={(fecha: CalendarDate | null) =>
                        actualizarVencimiento.mutate({ id: r.id, fecha: fecha ? fecha.toString() : null })
                      }
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