import { heroui } from "@heroui/theme";

export default heroui({
  // la app es siempre oscura, así que solo definimos (y usamos) el tema "dark"
  defaultTheme: "dark",
  themes: {
    dark: {
      colors: {
        background: "#0A0A0A",
        content1: "#171717", // superficies (cards, navbar, etc.)
        divider: "#262626",
        primary: {
          DEFAULT: "#3B82F6", // el mismo azul que ya usaba el bottom nav
          foreground: "#FFFFFF",
        },
      },
    },
  },
});