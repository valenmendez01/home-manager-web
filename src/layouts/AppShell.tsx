import { NavLink } from "react-router-dom";
import { Home, Wallet, ShoppingCart } from "lucide-react";
import { ReactNode } from "react";

const TABS = [
  { to: "/limpieza", label: "Limpieza", icon: Home },
  { to: "/deudas", label: "Deudas", icon: Wallet },
  { to: "/compras", label: "Compras", icon: ShoppingCart },
];

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full flex-col bg-neutral-950">
      <main className="flex-1 overflow-y-auto safe-top">{children}</main>

      <nav className="flex border-t border-neutral-800 bg-black">
        {TABS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2.5 text-xs ${
                isActive ? "text-blue-400" : "text-neutral-500"
              }`
            }
          >
            <Icon size={22} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
