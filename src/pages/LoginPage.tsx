import { useState, FormEvent } from "react";
import { useAuthStore } from "@/store/authStore";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";

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

        <Input
          variant="bordered"
          placeholder="Email"
          type="email"
          autoCapitalize="none"
          autoComplete="email"
          value={email}
          onValueChange={setEmail}
        />

        <Input
          variant="bordered"
          placeholder="Contraseña"
          type="password"
          autoComplete="current-password"
          value={password}
          onValueChange={setPassword}
        />

        {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

        <Button type="submit" color="primary" fullWidth radius="lg" size="lg" isLoading={isLoading}>
          Ingresar
        </Button>
      </form>
    </div>
  );
}
