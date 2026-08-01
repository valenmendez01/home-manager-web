export const USUARIOS: Record<string, string> = {
  // UUID de los usuarios
  "e0f6fad5-c137-4d34-81d0-fd2630a97cf5": "Valentín",
  "16a7b308-a718-49f8-9845-20354176169f": "Joaquín",
};

export function nombreUsuario(usuarioId: string): string {
  return USUARIOS[usuarioId] ?? "Usuario desconocido";
}

// Esto nos permite auto-calcular "para quién es la deuda" sin pedirlo en el formulario, ya que solo hay 2 personas posibles.
export function otroUsuarioId(usuarioActualId: string): string {
  const ids = Object.keys(USUARIOS);
  return ids.find((id) => id !== usuarioActualId)!;
}