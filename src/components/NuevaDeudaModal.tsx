import { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { useAuthStore } from "@/store/authStore";
import { useCrearDeuda } from "@/hooks/useCrearDeuda";
import { otroUsuarioId, nombreUsuario } from "@/constants/usuarios";
import { Input } from "@heroui/input";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function NuevaDeudaModal({ visible, onClose }: Props) {
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const userId = useAuthStore((s) => s.user?.id);
  const crearDeuda = useCrearDeuda();

  const handleGuardar = async () => {
    if (!userId || !descripcion.trim() || !monto) return;

    const montoTotal = parseFloat(monto);
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
        base: `m-0 w-full max-w-full "max-h-[85vh]" rounded-t-3xl rounded-b-none bg-neutral-900 safe-bottom transition-[height] duration-300`,
        body: "px-5 pb-6 pt-1",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col items-start gap-1 mt-2">
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
              inputMode="numeric"
              value={monto}
              onValueChange={(value) => setMonto(value.replace(/\D/g, ""))}
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
      </ModalContent>
    </Modal>
  );
}