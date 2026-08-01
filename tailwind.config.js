/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
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
  plugins: [],
};
