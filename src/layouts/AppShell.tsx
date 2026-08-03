import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, Tab } from "@heroui/tabs";
import { Home, Wallet, ShoppingCart } from "lucide-react";
import { Key, ReactNode } from "react";

const TABS = [
  { key: "/limpieza", label: "Limpieza", icon: Home },
  { key: "/deudas", label: "Deudas", icon: Wallet },
  { key: "/compras", label: "Compras", icon: ShoppingCart },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  // App.tsx redirige "/" a "/limpieza", así que si no matchea ningún tab
  // (ej: estamos en "/"), dejamos ese como seleccionado por defecto.
  const activeKey =
    TABS.find((tab) => tab.key === location.pathname)?.key ?? "/limpieza";

  return (
    <div className="h-full bg-neutral-950">
      {/* paddingBottom reserva el espacio del navbar fijo para que el contenido
          nunca quede tapado; suma además el home-indicator de iOS */}
      <main
        className="h-full overflow-y-auto safe-top"
        style={{ paddingBottom: "56px" }}
      >
        {children}
      </main>

      <div
        className="fixed inset-x-4 z-50 overflow-hidden rounded-2xl border border-neutral-800 bg-black/95 shadow-lg shadow-black/40 backdrop-blur-md [transform:translateZ(0)] [will-change:transform]"
        style={{ bottom: 0 }}
      >
        <Tabs
          aria-label="Navegación principal"
          selectedKey={activeKey}
          onSelectionChange={(key: Key) => navigate(key as string)}
          variant="light"
          color="primary"
          fullWidth
          radius="full"
          disableCursorAnimation
          classNames={{
            base: "w-full",
            tabList: "w-full gap-0 bg-transparent p-0",
            cursor: "hidden",
            tab: "h-12 min-w-0 flex-1 rounded-none px-1 data-[hover-unselected=true]:opacity-100 border-none",
            tabContent:
              "flex items-center justify-center text-neutral-500 group-data-[selected=true]:text-blue-400",
          }}
        >
          {TABS.map(({ key, label, icon: Icon }) => (
            <Tab key={key} aria-label={label} title={<Icon size={22} strokeWidth={2} />} />
          ))}
        </Tabs>
      </div>
    </div>
  );
}