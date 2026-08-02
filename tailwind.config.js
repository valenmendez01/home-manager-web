import { heroui } from "@heroui/theme";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    // con paquetes individuales solo hace falta escanear los estilos de los
    // componentes que realmente instalamos
    "./node_modules/@heroui/theme/dist/components/tabs.js",
    "./node_modules/@heroui/theme/dist/components/button.js",
    "./node_modules/@heroui/theme/dist/components/modal.js",
    "./node_modules/@heroui/theme/dist/components/toast.js",
    "./node_modules/@heroui/theme/dist/components/spinner.js",
    "./node_modules/@heroui/theme/dist/components/input.js",
    "./node_modules/@heroui/theme/dist/components/chip.js",
    "./node_modules/@heroui/theme/dist/components/skeleton.js",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // mismos tokens que src/constants/colors.ts de la app original
        app: {
          bg: "#0A0A0A",
          surface: "#171717",
          border: "#262626",
        },
      },
    },
  },
  plugins: [
    heroui({
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
    }),
  ],
};