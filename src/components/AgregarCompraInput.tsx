import { useState, KeyboardEvent } from "react";
import { Plus } from "lucide-react";
import { useAgregarCompra } from "@/hooks/useComprasMutations";

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
    <div className="flex items-center gap-2 px-5 pb-3">
      <input
        className="flex-1 rounded-2xl bg-neutral-900 px-4 py-3 text-base text-neutral-50 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Agregar producto..."
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        onClick={handleAgregar}
        disabled={!puedeAgregar}
        className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
          puedeAgregar ? "bg-blue-500 active:bg-blue-600" : "bg-neutral-800"
        }`}
      >
        <Plus size={24} color={puedeAgregar ? "white" : "#525252"} />
      </button>
    </div>
  );
}
