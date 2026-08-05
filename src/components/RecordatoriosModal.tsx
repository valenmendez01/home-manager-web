import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { CheckSquare, Square } from "lucide-react";
import { useRecordatorios } from "@/hooks/useRecordatorios";
import { useToggleRecordatorio } from "@/hooks/useToggleRecordatorio";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  usuarioId?: string;
}

export default function RecordatoriosModal({ isOpen, onClose, usuarioId }: Props) {
  const { data: recordatorios = [] } = useRecordatorios(usuarioId);
  const toggle = useToggleRecordatorio(usuarioId);

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && onClose()} placement="bottom">
      <ModalContent className="bg-neutral-900">
        <ModalHeader className="text-neutral-50">Recordatorios de pago</ModalHeader>
        <ModalBody className="pb-8">
          {recordatorios.map((r) => (
            <div
              key={r.id}
              role="button"
              tabIndex={0}
              onClick={() => toggle.mutate({ id: r.id, marcado: !r.marcado })}
              className="flex items-center gap-3 border-b border-neutral-800 py-3 last:border-b-0"
            >
              {r.marcado ? <CheckSquare size={22} color="#4ADE80" /> : <Square size={22} color="#737373" />}
              <p className={`text-base ${r.marcado ? "text-neutral-500 line-through" : "text-neutral-50"}`}>
                {r.nombre}
              </p>
            </div>
          ))}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}