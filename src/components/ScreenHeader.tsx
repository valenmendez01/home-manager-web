import { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface Props {
  title: string;
  subtitle?: string;
  rightElement?: ReactNode;
}

export default function ScreenHeader({ title, subtitle, rightElement }: Props) {
  const signOut = useAuthStore((s) => s.signOut);

  const confirmarLogout = () => {
    if (window.confirm("¿Seguro que querés salir?")) {
      signOut();
    }
  };

  return (
    <div className="flex items-center justify-between px-5 pb-3 pt-2">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-50">{title}</h1>
        {subtitle && <p className="mt-0.5 text-xs text-neutral-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        {rightElement}
        <button
          onClick={confirmarLogout}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 active:bg-neutral-800"
          aria-label="Cerrar sesión"
        >
          <LogOut size={18} color="#A3A3A3" />
        </button>
      </div>
    </div>
  );
}
