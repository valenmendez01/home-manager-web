import { useRef, useState, KeyboardEvent, PointerEvent } from "react";
import { CheckSquare, Square } from "lucide-react";
import { Compra } from "@/types/compras";
import { useToggleCompra, useEliminarCompra, useEditarCompra } from "@/hooks/useComprasMutations";
import { nombreUsuario } from "@/constants/usuarios";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";

interface Props {
  compra: Compra;
}

// Swipe-to-delete: en RN esto lo resolvía react-native-gesture-handler +
// reanimated. En web alcanza con Pointer Events + un translateX en style.
export default function CompraItem({ compra }: Props) {
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState(compra.nombre);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef<number | null>(null);

  const toggle = useToggleCompra();
  const eliminar = useEliminarCompra();
  const editar = useEditarCompra();

  const comprado = compra.estado === "comprado";

  const guardarEdicion = () => {
    if (texto.trim() && texto.trim() !== compra.nombre) {
      editar.mutate({ id: compra.id, nombre: texto.trim() });
    }
    setEditando(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") guardarEdicion();
  };

  const onPointerDown = (e: PointerEvent) => {
    if (editando) return;
    startX.current = e.clientX;
    setDragging(true);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (startX.current === null) return;
    const delta = e.clientX - startX.current;
    if (delta < 0) setDragX(delta);
  };

  const onPointerUp = () => {
    if (dragX < -80) {
      eliminar.mutate(compra.id);
    }
    setDragX(0);
    setDragging(false);
    startX.current = null;
  };

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={dragging ? onPointerUp : undefined}
      style={{
        transform: `translateX(${dragX}px)`,
        transition: dragging ? "none" : "transform 200ms ease",
        touchAction: "pan-y",
      }}
      className="mb-2 flex items-center rounded-2xl bg-neutral-900 px-4 py-3"
    >
      <Button
        isIconOnly
        variant="light"
        onPress={() =>
          toggle.mutate({ id: compra.id, estado: comprado ? "pendiente" : "comprado" })
        }
        className="mr-3 shrink-0"
        aria-label="Marcar comprado"
      >
        {comprado ? (
          <CheckSquare size={24} color="#4ADE80" />
        ) : (
          <Square size={24} color="#737373" />
        )}
      </Button>

      <div
        role="button"
        tabIndex={0}
        className="min-w-0 flex-1 text-left"
        onDoubleClick={() => setEditando(true)}
      >
        {editando ? (
          <Input
            variant="underlined"
            value={texto}
            onValueChange={setTexto}
            onKeyDown={handleKeyDown}
            onBlur={guardarEdicion}
            autoFocus
          />
        ) : (
          <div>
            <p className={`truncate text-base ${comprado ? "text-neutral-500 line-through" : "text-neutral-50"}`}>
              {compra.nombre}
            </p>
            <p className="mt-0.5 text-xs text-neutral-600">
              Agregado por {nombreUsuario(compra.agregado_por)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
