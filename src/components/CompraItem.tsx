import { useState, KeyboardEvent } from "react";
import { ChevronLeft } from "lucide-react";
import { motion, PanInfo } from "framer-motion";
import { Avatar } from "@heroui/avatar";
import { Compra } from "@/types/compras";
import { useEliminarCompra, useEditarCompra } from "@/hooks/useComprasMutations";
import { nombreUsuario } from "@/constants/usuarios";
import { Input } from "@heroui/input";

interface Props {
  compra: Compra;
}

// Swipe-to-delete: en RN esto lo resolvía react-native-gesture-handler +
// reanimated. En web alcanza con Pointer Events + un translateX en style.
export default function CompraItem({ compra }: Props) {
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState(compra.nombre);
  const [eliminando, setEliminando] = useState(false);

  const eliminar = useEliminarCompra();
  const editar = useEditarCompra();

  const guardarEdicion = () => {
    if (texto.trim() && texto.trim() !== compra.nombre) {
      editar.mutate({ id: compra.id, nombre: texto.trim() });
    }
    setEditando(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") guardarEdicion();
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -100 || info.velocity.x < -500) {
      setEliminando(true);
      eliminar.mutate(compra.id);
    }
  };

  return (
    <motion.div
      layout
      drag={eliminando ? false : "x"}
      dragConstraints={{ left: -120, right: 0 }}
      dragElastic={{ left: 0.15, right: 0 }}
      onDragEnd={onDragEnd}
      initial={{ opacity: 0 }}
      animate={eliminando ? { opacity: 0, x: -400 } : { opacity: 1, x: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 500, damping: 40 }}
      style={{ touchAction: "pan-y" }}
      className="mb-2 flex items-center overflow-hidden rounded-2xl bg-neutral-900 px-4 py-3"
    >
      <Avatar
        name={nombreUsuario(compra.agregado_por)}
        size="sm"
        className="mr-3 shrink-0"
        classNames={{ name: "text-xs" }}
      />

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
          <p className="text-base text-neutral-50">{compra.nombre}</p>
        )}
      </div>

      <ChevronLeft size={18} className="ml-2 shrink-0 text-neutral-700" />
    </motion.div>
  );
}
