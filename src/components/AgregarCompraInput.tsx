import { useState, KeyboardEvent } from "react";
import { Plus } from "lucide-react";
import { useAgregarCompra } from "@/hooks/useComprasMutations";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";

export default function AgregarCompraInput() {
  const [texto, setTexto] = useState("");
  const agregar = useAgregarCompra();

  const puedeAgregar = texto.trim().length > 0;

  const handleAgregar = () => {
    const nombre = texto.trim();
    if (!nombre) return;
    agregar.mutate(nombre);
    setTexto("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAgregar();
  };

  return (
    <div className="flex items-center gap-2 px-5 pb-3 mt-2">
      <Input
        variant="flat"
        placeholder="Agregar producto..."
        value={texto}
        onValueChange={setTexto}
        onKeyDown={handleKeyDown}
      />
      <Button isIconOnly color={puedeAgregar ? "primary" : "default"} isDisabled={!puedeAgregar} radius="lg" onPress={handleAgregar}>
        <Plus size={24} />
      </Button>
    </div>
  );
}
