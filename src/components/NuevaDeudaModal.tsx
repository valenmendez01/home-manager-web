import { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { useAuthStore } from "@/store/authStore";
import { useCrearDeuda } from "@/hooks/useCrearDeuda";
import { otroUsuarioId, nombreUsuario } from "@/constants/usuarios";
import { Input } from "@heroui/input";
import { motion, useDragControls } from "framer-motion";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function NuevaDeudaModal({ visible, onClose }: Props) {
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const userId = useAuthStore((s) => s.user?.id);
  const crearDeuda = useCrearDeuda();
  const dragControls = useDragControls();
  const [expanded, setExpanded] = useState(false);

  // vuelve a colapsado la próxima vez que se abra
  useEffect(() => {
    if (!visible) setExpanded(false);
  }, [visible]);

  const handleGuardar = async () => {
    if (!userId || !descripcion.trim() || !monto) return;

    const montoTotal = parseFloat(monto.replace(",", "."));
    if (isNaN(montoTotal) || montoTotal <= 0) return;

    const debe = otroUsuarioId(userId);
    const montoDebe = montoTotal / 2;

    await crearDeuda.mutateAsync({
      descripcion: descripcion.trim(),
      montoTotal,
      pagadoPor: userId,
      debe,
      montoDebe,
      fecha: new Date().toISOString().slice(0, 10),
    });

    setDescripcion("");
    setMonto("");
    onClose();
  };

  return (
    <Modal
      isOpen={visible}
      onOpenChange={(open) => !open && onClose()}
      placement="bottom"
      scrollBehavior="inside"
      hideCloseButton
      classNames={{
        wrapper: "items-end !p-0",
        base: `m-0 w-full max-w-full ${
          expanded ? "h-[100dvh] max-h-[100dvh] safe-top" : ""
        } rounded-t-3xl rounded-b-none bg-neutral-900 safe-bottom transition-[height] duration-300`,
        body: "px-5 pb-2 pt-1",
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
            className="cursor-grab pb-0 pt-0 active:cursor-grabbing"
          >
            <span className="text-xl font-semibold text-neutral-50">Nueva deuda</span>
          </ModalHeader>

          <ModalBody>
            <div className="mt-2 flex flex-col gap-3">
              <Input
                variant="bordered"
                placeholder="Descripción"
                value={descripcion}
                onValueChange={setDescripcion}
              />

              <Input
                variant="bordered"
                placeholder="Monto total"
                inputMode="decimal"
                value={monto}
                onValueChange={setMonto}
              />

              {userId && (
                <p className="text-xs text-neutral-500">
                  Se dividirá entre vos y {nombreUsuario(otroUsuarioId(userId))}
                </p>
              )}
            </div>
          </ModalBody>

          <ModalFooter className="pt-2">
            <Button variant="flat" fullWidth radius="lg" size="lg" onPress={onClose}>
              Cancelar
            </Button>
            <Button
              color="primary"
              fullWidth
              radius="lg"
              size="lg"
              isLoading={crearDeuda.isPending}
              onPress={handleGuardar}
            >
              {crearDeuda.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </ModalFooter>
        </motion.div>
      </ModalContent>
    </Modal>
  );
}