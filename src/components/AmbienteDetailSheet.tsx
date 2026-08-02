import { Trash2 } from "lucide-react";
import { Button } from "@heroui/button";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { addToast } from "@heroui/toast";
import { useEffect, useState } from "react";
import { AmbienteConEstado, Limpieza } from "@/types/limpieza";
import { useMarcarLimpio } from "@/hooks/useMarcarLimpio";
import { useHistorialAmbiente } from "@/hooks/useHistorialAmbiente";
import { nombreUsuario } from "@/constants/usuarios";
import { useAuthStore } from "@/store/authStore";
import { useEliminarLimpieza } from "@/hooks/useEliminarLimpieza";
import { motion, useDragControls } from "framer-motion";

interface Props {
  ambiente: AmbienteConEstado | null;
  onClose: () => void;
}

export default function AmbienteDetailSheet({ ambiente, onClose }: Props) {
  const marcarLimpio = useMarcarLimpio();
  const { data: historial, isLoading } = useHistorialAmbiente(ambiente?.id);

  const dragControls = useDragControls();
  const [expanded, setExpanded] = useState(false);

  // vuelve a colapsado la próxima vez que se abra
  useEffect(() => {
    if (!ambiente) setExpanded(false);
  }, [ambiente]);

  const userId = useAuthStore((s) => s.user?.id);
  const eliminarLimpieza = useEliminarLimpieza();

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [aBorrar, setABorrar] = useState<Limpieza | null>(null);

  const handleMarcarLimpio = () => {
    if (!ambiente) return;
    marcarLimpio.mutate(ambiente.id, {
      onSuccess: () => {
        addToast({
          title: "¡Listo!",
          description: `${ambiente.nombre} quedó marcado como limpio.`,
          color: "success",
        });
      },
      onError: () => {
        addToast({
          title: "No se pudo guardar",
          description: "Intentá de nuevo en unos segundos.",
          color: "danger",
        });
      },
    });
  };

  const pedirConfirmacionBorrado = (item: Limpieza) => {
    setABorrar(item);
    onOpen();
  };

  const confirmarBorrado = () => {
    if (!aBorrar) return;
    eliminarLimpieza.mutate(aBorrar.id, {
      onSuccess: () => {
        addToast({ title: "Registro eliminado", color: "success" });
      },
      onError: () => {
        addToast({
          title: "No se pudo eliminar",
          description: "Intentá de nuevo en unos segundos.",
          color: "danger",
        });
      },
    });
    setABorrar(null);
  };

  return (
    <>
      <Modal
        isOpen={!!ambiente}
        onOpenChange={(open) => !open && onClose()}
        placement="bottom"
        scrollBehavior="inside"
        classNames={{
          wrapper: "items-end !p-0",
          base: `m-0 w-full max-w-full ${
            expanded ? "h-[100dvh] max-h-[100dvh] safe-top" : "max-h-[85vh]"
          } rounded-t-3xl rounded-b-none bg-neutral-900 safe-bottom transition-[height] duration-300`,
          body: "px-5 pb-6 pt-1",
          closeButton: "text-neutral-400 hover:bg-neutral-800",
        }}
      >
        <ModalContent>
          <motion.div
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 400 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            dragSnapToOrigin
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                onClose();
              } else if (info.offset.y < -60 || info.velocity.y < -500) {
                setExpanded(true);
              }
            }}
          >
            {ambiente && (
              <>
                <div
                  onPointerDown={(e) => dragControls.start(e)}
                  style={{ touchAction: "none" }}
                  className="cursor-grab pb-2 pt-3 active:cursor-grabbing"
                >
                  <div className="mx-auto h-1.5 w-10 rounded-full bg-neutral-600" />
                </div>

                <ModalHeader
                  onPointerDown={(e) => dragControls.start(e)}
                  style={{ touchAction: "none" }}
                  className="flex cursor-grab flex-col items-start gap-1 pb-0 pt-0 active:cursor-grabbing"
                >
                  <span className="text-xl font-semibold text-neutral-50">{ambiente.nombre}</span>
                  <p className="text-sm font-normal text-neutral-400">
                    {ambiente.diasTranscurridos === null
                      ? "Nunca se registró una limpieza"
                      : `Última limpieza hecha por ${nombreUsuario(
                          ambiente.ultimaLimpieza!.usuario_id
                        )} hace ${ambiente.diasTranscurridos} día(s)`}
                  </p>
                </ModalHeader>

                <ModalBody>
                  <Button
                    className="mt-4"
                    color="primary"
                    fullWidth
                    radius="lg"
                    size="lg"
                    isLoading={marcarLimpio.isPending}
                    onPress={handleMarcarLimpio}
                  >
                    {marcarLimpio.isPending ? "Guardando..." : "Marcar como limpio"}
                  </Button>

                  <p className="mb-2 mt-6 text-sm font-medium text-neutral-300">Historial</p>
                  {isLoading && <p className="text-sm text-neutral-300">Cargando...</p>}
                  {!isLoading && (historial ?? []).length === 0 && (
                    <p className="text-sm text-neutral-300">Sin registros todavía</p>
                  )}

                  {(historial ?? []).map((item: Limpieza, index: number) => {
                    const esElMasReciente = index === 0;
                    const esMio = item.usuario_id === userId;
                    const puedeBorrar = esElMasReciente && esMio;
                    const borrandoEste =
                      eliminarLimpieza.isPending && eliminarLimpieza.variables === item.id;

                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between border-b border-neutral-800 py-2"
                      >
                        <div className="flex flex-1 items-center">
                          <span className="text-sm font-medium text-neutral-50">
                            {nombreUsuario(item.usuario_id)}
                          </span>
                          <span className="text-sm text-neutral-500">
                            {" · "}
                            {new Date(item.realizado_at).toLocaleDateString()}
                            {" · "}
                            {new Date(item.realizado_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        {puedeBorrar && (
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="pl-3"
                            isLoading={borrandoEste}
                            onPress={() => pedirConfirmacionBorrado(item)}
                            aria-label="Eliminar registro"
                          >
                            {!borrandoEste && <Trash2 size={18} color="#737373" />}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </ModalBody>
              </>
            )}
          </motion.div>
        </ModalContent>
      </Modal>

      {/* Confirmación antes de borrar un registro del historial */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
        <ModalContent>
          {(closeModal) => (
            <>
              <ModalHeader>Eliminar registro</ModalHeader>
              <ModalBody>
                <p className="text-sm text-neutral-400">
                  ¿Seguro que querés eliminar este registro de limpieza? Esta acción no se puede
                  deshacer.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={closeModal}>
                  Cancelar
                </Button>
                <Button
                  color="danger"
                  onPress={() => {
                    confirmarBorrado();
                    closeModal();
                  }}
                >
                  Eliminar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}