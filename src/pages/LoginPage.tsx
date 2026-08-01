import { useState, FormEvent } from "react";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const signIn = useAuthStore((s) => s.signIn);
  const isLoading = useAuthStore((s) => s.isLoading);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const { error } = await signIn(email.trim(), password);
    if (error) setErrorMsg("Email o contraseña incorrectos");
  };

  return (
    <div className="flex h-full flex-col justify-center bg-neutral-950 px-6">
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <h1 className="mb-2 text-3xl font-semibold text-neutral-50">Home Manager</h1>

        <input
          className="rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-base text-neutral-50 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Email"
          type="email"
          autoCapitalize="none"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-base text-neutral-50 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Contraseña"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="rounded-2xl bg-blue-500 py-4 text-center font-medium text-white transition-colors active:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
