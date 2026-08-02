import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { queryClient } from "@/services/queryClient";
import { useAuthStore } from "@/store/authStore";
import { useAuthListener } from "@/hooks/useAuthListener";
import LoginPage from "@/pages/LoginPage";
import AppShell from "@/layouts/AppShell";
import LimpiezaPage from "@/pages/LimpiezaPage";
import DeudasPage from "@/pages/DeudasPage";
import ComprasPage from "@/pages/ComprasPage";
import { Spinner } from "@heroui/spinner";

function Root() {
  useAuthListener();

  const session = useAuthStore((s) => s.session);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  if (!isInitialized) {
    return (
      <div className="flex h-full items-center justify-center bg-neutral-950">
        <Spinner color="primary" size="lg" />
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/limpieza" replace />} />
        <Route path="/limpieza" element={<LimpiezaPage />} />
        <Route path="/deudas" element={<DeudasPage />} />
        <Route path="/compras" element={<ComprasPage />} />
        <Route path="*" element={<Navigate to="/limpieza" replace />} />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Root />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
