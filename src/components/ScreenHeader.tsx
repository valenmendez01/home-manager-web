import { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@heroui/button";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { useAuthStore } from "@/store/authStore";

interface Props {
  title: string;
  subtitle?: string;
  rightElement?: ReactNode;
}

export default function ScreenHeader({ title, subtitle, rightElement }: Props) {
  const signOut = useAuthStore((s) => s.signOut);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <div className="flex items-center justify-between px-5 pb-3 pt-2">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-50">{title}</h1>
        {subtitle && <p className="mt-0.5 text-xs text-neutral-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        {rightElement}
        <Button
          isIconOnly
          radius="full"
          variant="flat"
          className="h-9 w-9 bg-neutral-900"
          onPress={onOpen}
          aria-label="Cerrar sesión"
        >
          <LogOut size={18} color="#A3A3A3" />
        </Button>
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
        <ModalContent>
          {(closeModal) => (
            <>
              <ModalHeader>Cerrar sesión</ModalHeader>
              <ModalBody>
                <p className="text-sm text-neutral-400">¿Seguro que querés salir?</p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={closeModal}>
                  Cancelar
                </Button>
                <Button
                  color="danger"
                  onPress={() => {
                    signOut();
                    closeModal();
                  }}
                >
                  Cerrar sesión
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}